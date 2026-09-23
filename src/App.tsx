import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ChatView } from './components/ChatView';
import { MemoriesView } from './components/MemoriesView';
import { RemindersView } from './components/RemindersView';
import { StickyNotesView } from './components/StickyNotesView';
import { ComfortHub } from './components/ComfortHub';
import { SettingsModal } from './components/SettingsModal';
import { 
  TabType, 
  UserProfile, 
  MemoryItem, 
  DailyReminder, 
  StickyNote, 
  ChatMessage 
} from './types';
import { 
  STORAGE_KEYS, 
  defaultProfile, 
  defaultMemories, 
  defaultReminders, 
  defaultNotes, 
  defaultInitialMessages, 
  loadFromStorage, 
  saveToStorage 
} from './utils/storage';
import { speechService } from './utils/speech';
import { ambientAudioService } from './utils/ambientAudio';
import { Sparkles, X } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('chat');
  const [userProfile, setUserProfile] = useState<UserProfile>(() =>
    loadFromStorage(STORAGE_KEYS.PROFILE, defaultProfile)
  );
  const [memories, setMemories] = useState<MemoryItem[]>(() =>
    loadFromStorage(STORAGE_KEYS.MEMORIES, defaultMemories)
  );
  const [reminders, setReminders] = useState<DailyReminder[]>(() =>
    loadFromStorage(STORAGE_KEYS.REMINDERS, defaultReminders)
  );
  const [notes, setNotes] = useState<StickyNote[]>(() =>
    loadFromStorage(STORAGE_KEYS.NOTES, defaultNotes)
  );
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    loadFromStorage(STORAGE_KEYS.CHAT_MESSAGES, defaultInitialMessages)
  );
  const [waterCount, setWaterCount] = useState<number>(() =>
    loadFromStorage(STORAGE_KEYS.WATER_COUNT, 3)
  );
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(() =>
    loadFromStorage(STORAGE_KEYS.VOICE_ENABLED, true)
  );

  const [ambientPlaying, setAmbientPlaying] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Status updates for Jordan to feel authentically present
  const jordanStatuses = [
    'Online • Thinking of you',
    'Just made coffee • Checking in',
    'At his desk • Always in your corner',
    'Online • Ready to listen',
  ];
  const [jordanStatus, setJordanStatus] = useState(jordanStatuses[0]);

  useEffect(() => {
    const statusInterval = setInterval(() => {
      const randomStatus = jordanStatuses[Math.floor(Math.random() * jordanStatuses.length)];
      setJordanStatus(randomStatus);
    }, 45000);
    return () => clearInterval(statusInterval);
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.PROFILE, userProfile);
  }, [userProfile]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.MEMORIES, memories);
  }, [memories]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.REMINDERS, reminders);
  }, [reminders]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.NOTES, notes);
  }, [notes]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.CHAT_MESSAGES, messages);
  }, [messages]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.WATER_COUNT, waterCount);
  }, [waterCount]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.VOICE_ENABLED, voiceEnabled);
  }, [voiceEnabled]);

  // Voice toggle
  const handleToggleVoice = () => {
    const next = !voiceEnabled;
    setVoiceEnabled(next);
    if (!next) {
      speechService.stop();
    }
  };

  // Ambient sound toggle
  const handleToggleAmbient = () => {
    const playing = ambientAudioService.toggle();
    setAmbientPlaying(playing);
  };

  // Show quick toast notification
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 4000);
  };

  // Chat message submission
  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const now = new Date();
      const timeContext = `${now.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          userProfile,
          memories,
          timeContext,
          activeReminders: reminders,
        }),
      });

      const data = await res.json();
      const replyText = data.reply || data.fallbackReply || "Hey babe, I'm here. Tell me what's on your mind.";

      const jordanMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'model',
        content: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        extractedMemories: data.extractedMemories || [],
      };

      setMessages((prev) => [...prev, jordanMsg]);

      // Speak if voice enabled
      if (voiceEnabled) {
        speechService.speak(replyText);
      }

      // If Jordan auto-extracted new memories, add them to the vault!
      if (data.extractedMemories && Array.isArray(data.extractedMemories) && data.extractedMemories.length > 0) {
        const addedMemories: MemoryItem[] = data.extractedMemories.map((em: any) => ({
          id: `mem-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          category: em.category || 'fact',
          title: em.title,
          details: em.details,
          date: em.date || undefined,
          createdAt: new Date().toISOString(),
        }));

        setMemories((prev) => [...prev, ...addedMemories]);
        triggerToast(`✨ Jordan remembered: "${data.extractedMemories[0].title}"`);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'model',
        content: "Hey, my signal dropped for a second, but I didn't go anywhere. Tell me again, what happened?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Add memory manually
  const handleAddMemory = (newMem: Omit<MemoryItem, 'id' | 'createdAt'>) => {
    const item: MemoryItem = {
      ...newMem,
      id: `mem-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setMemories((prev) => [item, ...prev]);
    triggerToast(`✨ Added to Jordan's Memory Vault: "${newMem.title}"`);
  };

  // Update memory
  const handleUpdateMemory = (id: string, updated: Partial<MemoryItem>) => {
    setMemories((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updated } : m))
    );
    triggerToast('Memory updated.');
  };

  // Delete memory
  const handleDeleteMemory = (id: string) => {
    setMemories((prev) => prev.filter((m) => m.id !== id));
    triggerToast('Memory removed from Jordan\'s vault.');
  };

  // Bring memory up in chat
  const handleAskJordanAbout = (prompt: string) => {
    setCurrentTab('chat');
    handleSendMessage(prompt);
  };

  // Reminders handlers
  const handleToggleReminder = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const next = !r.completed;
          if (next) {
            triggerToast(`Great job! Jordan is proud of you for checking this off.`);
          }
          return { ...r, completed: next };
        }
        return r;
      })
    );
  };

  const handleAddReminder = (newRem: Omit<DailyReminder, 'id'>) => {
    const item: DailyReminder = {
      ...newRem,
      id: `rem-${Date.now()}`,
    };
    setReminders((prev) => [...prev, item]);
    triggerToast(`Added daily care reminder: "${newRem.title}"`);
  };

  const handleDeleteReminder = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  // Sticky notes handlers
  const handleAddNote = (newNote: StickyNote) => {
    setNotes((prev) => [newNote, ...prev]);
    triggerToast(`Added note to the fridge board: "${newNote.title}"`);
  };

  const handleDeleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  // Reset defaults
  const handleResetData = () => {
    setUserProfile(defaultProfile);
    setMemories(defaultMemories);
    setReminders(defaultReminders);
    setNotes(defaultNotes);
    setMessages(defaultInitialMessages);
    setWaterCount(3);
    triggerToast('Reset to default profile & memories.');
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col selection:bg-amber-500 selection:text-stone-950 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 text-stone-950 font-semibold text-xs shadow-2xl animate-in slide-in-from-top-3 duration-200">
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 hover:opacity-70 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        userProfile={userProfile}
        onOpenSettings={() => setIsSettingsOpen(true)}
        voiceEnabled={voiceEnabled}
        onToggleVoice={handleToggleVoice}
        ambientPlaying={ambientPlaying}
        onToggleAmbient={handleToggleAmbient}
        newMemoryCount={memories.length}
        jordanStatus={jordanStatus}
      />

      {/* Body Views */}
      <main className="flex-1 pb-6">
        {currentTab === 'chat' && (
          <ChatView
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            userProfile={userProfile}
            memories={memories}
            onNavigateToMemories={() => setCurrentTab('memories')}
            onClearHistory={() => setMessages(defaultInitialMessages)}
          />
        )}

        {currentTab === 'memories' && (
          <MemoriesView
            memories={memories}
            userProfile={userProfile}
            onAddMemory={handleAddMemory}
            onUpdateMemory={handleUpdateMemory}
            onDeleteMemory={handleDeleteMemory}
            onAskJordanAbout={handleAskJordanAbout}
          />
        )}

        {currentTab === 'reminders' && (
          <RemindersView
            reminders={reminders}
            onToggleReminder={handleToggleReminder}
            onAddReminder={handleAddReminder}
            onDeleteReminder={handleDeleteReminder}
            waterCount={waterCount}
            onUpdateWater={setWaterCount}
            userProfile={userProfile}
            memories={memories}
          />
        )}

        {currentTab === 'notes' && (
          <StickyNotesView
            notes={notes}
            onAddNote={handleAddNote}
            onDeleteNote={handleDeleteNote}
            userProfile={userProfile}
            memories={memories}
          />
        )}

        {currentTab === 'comfort' && (
          <ComfortHub
            userProfile={userProfile}
            memories={memories}
          />
        )}
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        profile={userProfile}
        onSaveProfile={setUserProfile}
        onResetData={handleResetData}
      />
    </div>
  );
}
