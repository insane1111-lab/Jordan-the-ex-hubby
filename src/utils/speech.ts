// Web Speech API wrapper for Jordan's voice

class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private voice: SpeechSynthesisVoice | null = null;
  private isSpeakingState = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.initVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.initVoices();
      }
    }
  }

  private initVoices() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    // Look for a calm, natural male English voice
    const preferredVoices = [
      'Google UK English Male',
      'Daniel',
      'Alex',
      'Aaron',
      'Arthur',
      'Microsoft Ryan Online (Natural)',
      'en-US-Standard-B',
    ];

    for (const name of preferredVoices) {
      const match = voices.find((v) => v.name.includes(name) || v.voiceURI.includes(name));
      if (match) {
        this.voice = match;
        return;
      }
    }

    // Fallback: any English male or neutral voice
    const englishVoice = voices.find((v) => v.lang.startsWith('en') && (v.name.toLowerCase().includes('male') || !v.name.toLowerCase().includes('female')));
    this.voice = englishVoice || voices.find((v) => v.lang.startsWith('en')) || voices[0] || null;
  }

  public speak(text: string, onEnd?: () => void): boolean {
    if (!this.synth) return false;
    this.stop();

    // Clean text of emojis and special markdown for speech
    const cleanText = text
      .replace(/[*_#`~[\]]/g, '')
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
      .trim();

    if (!cleanText) return false;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    if (this.voice) {
      utterance.voice = this.voice;
    }
    utterance.pitch = 0.95; // Slightly deeper, comforting tone
    utterance.rate = 0.92; // Relaxed conversational pace

    utterance.onstart = () => {
      this.isSpeakingState = true;
    };

    utterance.onend = () => {
      this.isSpeakingState = false;
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      console.warn('Speech error:', e);
      this.isSpeakingState = false;
      if (onEnd) onEnd();
    };

    this.synth.speak(utterance);
    return true;
  }

  public stop(): void {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeakingState = false;
    }
  }

  public isSpeaking(): boolean {
    return this.synth ? this.synth.speaking : false;
  }

  public isSupported(): boolean {
    return !!this.synth;
  }
}

export const speechService = new SpeechService();
