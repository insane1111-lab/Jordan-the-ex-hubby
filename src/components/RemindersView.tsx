import React, { useState } from 'react';
import { 
  Bell, 
  Droplets, 
  Plus, 
  Sparkles, 
  CheckCircle2, 
  Circle, 
  Trash2, 
  Clock, 
  Heart, 
  Utensils, 
  Pill, 
  Moon, 
  RefreshCw 
} from 'lucide-react';
import { DailyReminder, UserProfile, MemoryItem } from '../types';

interface RemindersViewProps {
  reminders: DailyReminder[];
  onToggleReminder: (id: string) => void;
  onAddReminder: (reminder: Omit<DailyReminder, 'id'>) => void;
  onDeleteReminder: (id: string) => void;
  waterCount: number;
  onUpdateWater: (count: number) => void;
  userProfile: UserProfile;
  memories: MemoryItem[];
}

export const RemindersView: React.FC<RemindersViewProps> = ({
  reminders,
  onToggleReminder,
  onAddReminder,
  onDeleteReminder,
  waterCount,
  onUpdateWater,
  userProfile,
  memories,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newCategory, setNewCategory] = useState<'hydration' | 'health' | 'mindfulness' | 'rest' | 'custom'>('custom');
  const [newNote, setNewNote] = useState('');

  const completedCount = reminders.filter((r) => r.completed).length;

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddReminder({
      title: newTitle.trim(),
      time: newTime.trim() || 'Today',
      category: newCategory,
      jordanNote: newNote.trim() || `Remember to do this, ${userProfile.preferredNickname || 'babe'}. I'm keeping an eye on you!`,
      completed: false,
    });

    setNewTitle('');
    setNewTime('');
    setNewNote('');
    setIsAdding(false);
  };

  const handleFetchAiSuggestions = async () => {
    setIsSuggesting(true);
    try {
      const res = await fetch('/api/suggest-reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userProfile,
          memories,
          currentReminders: reminders,
        }),
      });
      const data = await res.json();
      if (data.suggestions && Array.isArray(data.suggestions)) {
        data.suggestions.forEach((sug: any) => {
          onAddReminder({
            title: sug.title,
            time: sug.time || 'Today',
            category: sug.category || 'custom',
            jordanNote: sug.jordanNote || "Jordan added this because he cares about you.",
            completed: false,
          });
        });
      }
    } catch (e) {
      console.error('Error fetching suggestions:', e);
    } finally {
      setIsSuggesting(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'hydration':
        return <Droplets className="w-4 h-4 text-cyan-400" />;
      case 'health':
        return <Utensils className="w-4 h-4 text-emerald-400" />;
      case 'mindfulness':
        return <Heart className="w-4 h-4 text-rose-400" />;
      case 'rest':
        return <Moon className="w-4 h-4 text-indigo-400" />;
      default:
        return <Bell className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Care Header */}
      <div className="bg-stone-900/90 border border-stone-800 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-stone-100 flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-400" />
              Jordan's Daily Care Check-Ins
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 font-semibold border border-emerald-500/20">
              {completedCount} / {reminders.length} Done
            </span>
          </div>
          <p className="text-sm text-stone-400 mt-1 max-w-xl">
            He still knows your tendency to overwork, skip lunch, or put yourself last. Here are the reminders Jordan is keeping track of for you today.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleFetchAiSuggestions}
            disabled={isSuggesting}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer"
            title="Ask Jordan to suggest care habits based on your memories"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isSuggesting ? 'animate-spin' : ''}`} />
            <span>{isSuggesting ? 'Thinking...' : 'Jordan, Suggest More'}</span>
          </button>

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-semibold transition-all shadow cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Reminder</span>
          </button>
        </div>
      </div>

      {/* Hydration Tracker Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-stone-900 to-stone-900 border border-cyan-800/40 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-cyan-500/20 text-cyan-300">
            <Droplets className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-stone-100 flex items-center gap-2">
              Hydration Check from Jordan
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              "You know you get afternoon headaches when you forget to drink water, {userProfile.preferredNickname || 'babe'}."
            </p>
          </div>
        </div>

        {/* Glasses Tracker */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((cup) => (
              <button
                key={cup}
                onClick={() => onUpdateWater(cup <= waterCount && cup === waterCount ? cup - 1 : cup)}
                title={`Glass ${cup}`}
                className={`w-7 h-9 rounded-md border flex items-end justify-center pb-1 transition-all cursor-pointer ${
                  cup <= waterCount
                    ? 'bg-cyan-500 border-cyan-400 text-cyan-950 shadow-md scale-105'
                    : 'bg-stone-800/80 border-stone-700 text-stone-500 hover:border-cyan-500/50'
                }`}
              >
                <span className="text-[10px] font-bold">{cup}</span>
              </button>
            ))}
          </div>

          <div className="text-right pl-2 border-l border-stone-800">
            <div className="text-sm font-bold text-cyan-300">{waterCount} / 8</div>
            <div className="text-[10px] text-stone-500">glasses</div>
          </div>
        </div>
      </div>

      {/* Add Custom Reminder Form */}
      {isAdding && (
        <form onSubmit={handleAddCustom} className="p-5 rounded-2xl bg-stone-900 border border-amber-500/40 space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-stone-800 pb-2">
            <h3 className="text-sm font-semibold text-amber-300">New Daily Reminder</h3>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-xs text-stone-400 hover:text-stone-200"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-stone-300 mb-1">Reminder Name</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Take daily allergy pill, Call dentist, Stretch"
                className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1">Time</label>
              <input
                type="text"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                placeholder="e.g. 2:00 PM or Tonight"
                className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1">Jordan's Caring Note (Optional)</label>
            <input
              type="text"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="e.g. Don't put it off, you'll feel so much better once it's done."
              className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 rounded-xl text-xs text-stone-400 hover:text-stone-200 hover:bg-stone-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-xs shadow cursor-pointer"
            >
              Save Reminder
            </button>
          </div>
        </form>
      )}

      {/* Reminders List */}
      <div className="space-y-3">
        {reminders.map((rem) => (
          <div
            key={rem.id}
            className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-3 group ${
              rem.completed
                ? 'bg-stone-900/40 border-stone-800/60 opacity-75'
                : 'bg-stone-900 border-stone-800 hover:border-stone-700 shadow-sm'
            }`}
          >
            <div className="flex items-start gap-3 flex-1">
              <button
                onClick={() => onToggleReminder(rem.id)}
                title={rem.completed ? 'Mark pending' : 'Mark completed'}
                className="mt-0.5 text-stone-400 hover:text-amber-400 transition-colors cursor-pointer shrink-0"
              >
                {rem.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Circle className="w-5 h-5 text-stone-500 hover:text-amber-400" />
                )}
              </button>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${rem.completed ? 'line-through text-stone-400' : 'text-stone-100'}`}>
                    {rem.title}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-stone-400 bg-stone-800 px-2 py-0.5 rounded-md">
                    <Clock className="w-3 h-3" />
                    <span>{rem.time}</span>
                  </div>
                </div>

                {rem.jordanNote && (
                  <p className="text-xs text-amber-200/80 mt-1 italic flex items-center gap-1.5">
                    <Heart className="w-3 h-3 text-amber-400 shrink-0" />
                    <span>"{rem.jordanNote}"</span>
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => onDeleteReminder(rem.id)}
              title="Delete reminder"
              className="p-1 rounded text-stone-500 hover:text-rose-400 hover:bg-stone-800 opacity-60 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity cursor-pointer shrink-0"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
