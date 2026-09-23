import { UserProfile, MemoryItem, DailyReminder, StickyNote, ChatMessage } from '../types';

const STORAGE_KEYS = {
  PROFILE: 'jordan_user_profile_v2',
  MEMORIES: 'jordan_memories_v2',
  REMINDERS: 'jordan_reminders_v2',
  NOTES: 'jordan_sticky_notes_v2',
  CHAT_MESSAGES: 'jordan_chat_messages_v2',
  WATER_COUNT: 'jordan_water_count_v2',
  VOICE_ENABLED: 'jordan_voice_enabled_v2',
};

export const defaultProfile: UserProfile = {
  name: 'Taylor',
  preferredNickname: 'babe',
  husbandNickname: 'Jordan',
  birthday: 'October 14',
  anniversaryDate: 'June 20 (We were married 4 years; parted ways warmly last spring)',
  toneStyle: 'Warm, deeply supportive, with affectionate familiar comfort and gentle teasing',
  avatarStyle: 'cozy',
};

export const defaultMemories: MemoryItem[] = [
  {
    id: 'mem-1',
    category: 'date',
    title: "Your Birthday",
    details: "October 14. You dislike super sweet frosting; prefer dark chocolate or fruit tarts. Always get nostalgic around this week.",
    date: 'October 14',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'mem-2',
    category: 'interest',
    title: 'Morning Fuel & Coffee Order',
    details: 'Oat milk latte with a sprinkle of cinnamon, extra hot. You rarely answer texts before the first sip kicks in.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'mem-3',
    category: 'shared_history',
    title: 'The Great Big Sur Roadtrip',
    details: 'When the rental car tire popped on Highway 1 and we sat on the hood eating cold cherries watching the ocean fog roll in.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'mem-4',
    category: 'fact',
    title: 'Stress Tells & Habits',
    details: 'When you are anxious, you tense your neck and shoulders, clench your jaw, and convince yourself you do not need water or lunch.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'mem-5',
    category: 'current_life',
    title: 'Recent Project Sprint',
    details: 'Putting in long hours on the quarterly launch. Jordan promised to remind you to log off before midnight.',
    createdAt: new Date().toISOString(),
  },
];

export const defaultReminders: DailyReminder[] = [
  {
    id: 'rem-1',
    title: 'Morning Hydration & Stretch',
    time: '8:30 AM',
    category: 'hydration',
    jordanNote: "Drink a tall glass of water before you touch your coffee, babe. You know how dehydrated you get.",
    completed: false,
  },
  {
    id: 'rem-2',
    title: 'Eat a Real Lunch',
    time: '12:30 PM',
    category: 'health',
    jordanNote: "No, a granola bar and an iced tea do not count as a meal. Step away from your desk for at least 20 minutes.",
    completed: false,
  },
  {
    id: 'rem-3',
    title: 'Midday Shoulder Drop & Deep Breath',
    time: '3:30 PM',
    category: 'mindfulness',
    jordanNote: "Unclench your jaw. Drop your shoulders away from your ears. Take four slow deep breaths right now.",
    completed: false,
  },
  {
    id: 'rem-4',
    title: 'Nighttime Screen Cutoff',
    time: '10:30 PM',
    category: 'rest',
    jordanNote: "Put the phone face down. You need actual rest tonight, not endless doomscrolling.",
    completed: false,
  },
];

export const defaultNotes: StickyNote[] = [
  {
    id: 'note-1',
    title: 'Morning Coffee Check ☕',
    note: "Hey. Just wanted to remind you that you're capable of handling whatever today throws at you. Drink your water, don't let anyone get on your nerves, and text me if you need to vent. - Jordan",
    emoji: '☕',
    color: 'yellow',
    fromJordan: true,
    timestamp: 'Today at 7:45 AM',
  },
  {
    id: 'note-2',
    title: 'Always In Your Corner 💛',
    note: "Even if we didn't work out as a couple, you're still one of my favorite humans on this earth. Never doubt yourself. - J",
    emoji: '✨',
    color: 'amber',
    fromJordan: true,
    timestamp: 'Yesterday',
  },
];

export const defaultInitialMessages: ChatMessage[] = [
  {
    id: 'init-1',
    role: 'model',
    content: "Hey stranger. Just thought of you and wanted to check in. How's your day treating you so far? Did you remember to eat something real today, or are you surviving on caffeine again?",
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  },
];

// Helper functions for localStorage
export function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item) as T;
  } catch (e) {
    console.error('Storage read error:', e);
    return fallback;
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Storage write error:', e);
  }
}

export { STORAGE_KEYS };
