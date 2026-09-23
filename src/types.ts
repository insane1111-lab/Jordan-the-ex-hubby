export type MemoryCategory = 'date' | 'interest' | 'shared_history' | 'current_life' | 'fact';

export interface MemoryItem {
  id: string;
  category: MemoryCategory;
  title: string;
  details: string;
  date?: string; // e.g. "1994-11-14" or "May 18"
  createdAt: string;
}

export interface UserProfile {
  name: string;
  preferredNickname: string; // what Jordan calls you (e.g. "babe", "kiddo", "sweetheart")
  husbandNickname: string; // what you call him (e.g. "Jordan", "Jay", "J")
  birthday: string;
  anniversaryDate: string; // wedding or split date
  toneStyle: string; // "Warm & deeply supportive", "Playful & bantering", "Protective & gentle"
  avatarStyle: string; // e.g. "cozy", "classic"
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  extractedMemories?: Array<{
    category: MemoryCategory;
    title: string;
    details: string;
    date?: string;
  }>;
}

export interface DailyReminder {
  id: string;
  title: string;
  time: string;
  category: 'hydration' | 'health' | 'mindfulness' | 'rest' | 'custom';
  jordanNote: string;
  completed: boolean;
}

export interface StickyNote {
  id: string;
  title: string;
  note: string;
  emoji: string;
  color: 'yellow' | 'rose' | 'amber' | 'blue' | 'emerald';
  fromJordan: boolean;
  timestamp: string;
}

export type TabType = 'chat' | 'memories' | 'reminders' | 'notes' | 'comfort';
