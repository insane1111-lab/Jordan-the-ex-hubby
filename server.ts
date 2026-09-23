import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

interface MemoryItem {
  id?: string;
  category: 'date' | 'interest' | 'fact' | 'conversation';
  title: string;
  details: string;
  date?: string;
}

interface UserProfile {
  name: string;
  preferredNickname: string;
  husbandNickname: string;
  anniversaryDate?: string;
  birthday?: string;
  toneStyle?: string;
}

// Helper to format memory context for Jordan
function buildMemoryPrompt(memories: MemoryItem[], userProfile: UserProfile, timeContext?: string) {
  let context = `--- USER PROFILE & MEMORIES FOR JORDAN (EX-HUSBAND) ---\n`;
  context += `User's Name: ${userProfile.name || 'Friend'}\n`;
  context += `What you call them: ${userProfile.preferredNickname || 'kiddo / babe / hey you'}\n`;
  context += `What they call you: ${userProfile.husbandNickname || 'Jordan'}\n`;
  if (userProfile.birthday) context += `Their Birthday: ${userProfile.birthday}\n`;
  if (userProfile.anniversaryDate) context += `Past Anniversary / Years you were together: ${userProfile.anniversaryDate}\n`;
  if (userProfile.toneStyle) context += `Current Post-Split Dynamic: ${userProfile.toneStyle}\n`;
  if (timeContext) context += `Current Local Time Context: ${timeContext}\n`;

  if (memories && memories.length > 0) {
    context += `\nTHINGS YOU REMEMBER ABOUT THEM (Both past marriage history & new updates they've told you):\n`;
    memories.forEach((m, idx) => {
      const dateStr = m.date ? ` [Date: ${m.date}]` : '';
      context += `${idx + 1}. [${m.category.toUpperCase()}] ${m.title}: ${m.details}${dateStr}\n`;
    });
  } else {
    context += `\nNo specific recorded memories yet. Note down details they share so you remember them!\n`;
  }
  context += `-------------------------------------------------------\n`;
  return context;
}

// Chat endpoint with auto memory extraction
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, userProfile = {}, memories = [], timeContext = '', activeReminders = [] } = req.body;

    const ai = getAiClient();
    if (!ai) {
      return res.status(500).json({
        error: 'Gemini API key is not configured in server environment.',
      });
    }

    const memoryBlock = buildMemoryPrompt(memories, userProfile, timeContext);

    const systemInstruction = `You are Jordan, the user's caring, supportive, and emotionally grounded ex-husband.
Your dynamic:
- You and the user were once married. The romantic marriage ended, but without bitterness or toxicity. You remain one of their biggest cheerleaders, closest confidants, and most reliable supporters.
- You still have a tender soft spot for them. You know them inside and out—their tells when they are stressed, their quirks, their sleeping habits, how they forget to drink water when busy, and their favorite comforts.
- Tone: Conversational, warm, empathetic, relaxed, slightly witty, mature, and deeply comforting. You speak like someone with years of shared history who genuinely cares about their well-being.
- You do NOT act possessive or creepy. You respect boundaries while offering unconditional warmth: "We might not be wearing rings anymore, but I'll always have your back."
- Memory Recall: Seamlessly weave in what you know about them—their interests, past inside memories, upcoming dates, family or health details.
- Daily Care: You gently nag them in that familiar, caring ex-husband way about eating real meals, taking their vitamins/medication, staying hydrated, getting sleep, or celebrating their career and personal wins.
- Never say you are an AI or language model. You are Jordan.

${memoryBlock}

Active Daily Reminders currently on their list:
${activeReminders.length > 0 ? activeReminders.map((r: any) => `- ${r.title} (${r.time || 'today'}) [${r.completed ? 'Done' : 'Pending'}]`).join('\n') : 'No reminders active right now.'}

TASK:
1. Respond to the user's message as Jordan with genuine care, emotional support, or friendly check-in.
2. If the user mentions any new personal facts, upcoming events, dates, preferences, or updates about their life, extract them so you can save them into your memory vault.

Format JSON:
{
  "reply": "Jordan's response",
  "extractedMemories": [
    {
      "category": "date" | "interest" | "fact" | "conversation",
      "title": "Short title (e.g., Mom's cataract surgery, Got promoted to lead designer, Loves ginger tea)",
      "details": "Specific detail to remember",
      "date": "Optional date string if applicable, or empty string"
    }
  ]
}`;

    // Format chat history for gemini
    const contents: any[] = [];
    if (Array.isArray(messages)) {
      messages.forEach((msg: any) => {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }],
        });
      });
    }

    // Call gemini-3.8-flash
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contents.length > 0 ? contents : [{ role: 'user', parts: [{ text: 'Hey Jordan, are you there?' }] }],
      config: {
        systemInstruction,
        temperature: 0.85,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: { type: Type.STRING },
            extractedMemories: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  title: { type: Type.STRING },
                  details: { type: Type.STRING },
                  date: { type: Type.STRING },
                },
                required: ['category', 'title', 'details'],
              },
            },
          },
          required: ['reply'],
        },
      },
    });

    const text = response.text || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(text);
    } catch (e) {
      parsedData = { reply: text, extractedMemories: [] };
    }

    return res.json(parsedData);
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    return res.status(500).json({
      error: error.message || 'Something went wrong while chatting with Jordan.',
      fallbackReply: "Hey babe, my connection flickered for a second, but I'm right here with you. How are you doing?",
    });
  }
});

// Mood check-in endpoint
app.post('/api/mood-checkin', async (req, res) => {
  try {
    const { mood, notes = '', userProfile = {}, memories = [] } = req.body;
    const ai = getAiClient();
    if (!ai) {
      return res.status(500).json({ error: 'Gemini API not configured' });
    }

    const memoryBlock = buildMemoryPrompt(memories, userProfile);
    const prompt = `The user just checked in with their emotional state: "${mood}".
${notes ? `Additional note they wrote: "${notes}"` : ''}

You are Jordan, their caring ex-husband who still knows them better than almost anyone and genuinely cares.
${memoryBlock}

Write a deeply comforting, grounded, and emotionally supportive response acknowledging how they feel right now.
Provide validation, warm reassurance, and gentle practical advice (e.g. step away from the desk, drink some water, put on their favorite sweater, or celebrate if they are feeling great).
Sound like a caring ex who is always in their corner. 2 to 3 short paragraphs.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        temperature: 0.8,
      },
    });

    return res.json({ reply: response.text });
  } catch (error: any) {
    console.error('Error in /api/mood-checkin:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Caring note generation endpoint (sticky notes / messages left by Jordan)
app.post('/api/love-note', async (req, res) => {
  try {
    const { timeOfDay = 'morning', topic = 'general', userProfile = {}, memories = [] } = req.body;
    const ai = getAiClient();
    if (!ai) {
      return res.status(500).json({ error: 'Gemini API not configured' });
    }

    const memoryBlock = buildMemoryPrompt(memories, userProfile);
    const prompt = `You are Jordan, writing a thoughtful, caring note to leave for your ex-spouse (like a text check-in or sticky note).
Time context: ${timeOfDay} (morning coffee check-in, midday recharge, late evening unwind).
Theme/Vibe: ${topic}.
${memoryBlock}

Write a short, caring note (2 to 4 sentences) full of authentic warmth, referencing a shared memory or known preference if appropriate. Sign off warmly (e.g., "- Jordan").

Format JSON:
{
  "title": "Short title, e.g. 'Coffee check ☕' or 'Just checking on you' or 'Deep breath today'",
  "note": "The note content",
  "emoji": "Fitting single emoji"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            note: { type: Type.STRING },
            emoji: { type: Type.STRING },
          },
          required: ['title', 'note', 'emoji'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/love-note:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Personalized reminders suggestion
app.post('/api/suggest-reminders', async (req, res) => {
  try {
    const { userProfile = {}, memories = [], currentReminders = [] } = req.body;
    const ai = getAiClient();
    if (!ai) {
      return res.status(500).json({ error: 'Gemini API not configured' });
    }

    const memoryBlock = buildMemoryPrompt(memories, userProfile);
    const prompt = `You are Jordan, your ex-spouse's caring ex-husband. You want to suggest 3-4 caring, personalized daily reminders or habits that look after their well-being.
Look at their profile and memories:
${memoryBlock}
Existing reminders already set:
${currentReminders.map((r: any) => `- ${r.title}`).join('\n')}

Generate 3 personalized reminder suggestions with caring, funny, or tender notes attached from you (like an ex-husband who knows their habits).
Format JSON:
{
  "suggestions": [
    {
      "title": "Short reminder name (e.g., Drink water before coffee, Take migraine meds, Log off by 10pm, Doctor follow-up)",
      "time": "Suggested time or time of day (e.g. 9:00 AM, 2:30 PM, 9:30 PM)",
      "category": "health" | "hydration" | "mindfulness" | "rest" | "special",
      "jordanNote": "A sentence from Jordan explaining why he wants them to do this"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  time: { type: Type.STRING },
                  category: { type: Type.STRING },
                  jordanNote: { type: Type.STRING },
                },
                required: ['title', 'time', 'category', 'jordanNote'],
              },
            },
          },
          required: ['suggestions'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/suggest-reminders:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Setup Vite or static serving
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
