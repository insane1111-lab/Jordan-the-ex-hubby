import React, { useState } from 'react';
import { 
  StickyNote as NoteIcon, 
  Sparkles, 
  Plus, 
  Trash2, 
  Send, 
  Coffee, 
  Sun, 
  Moon, 
  Heart, 
  Smile 
} from 'lucide-react';
import { StickyNote, UserProfile, MemoryItem } from '../types';

interface StickyNotesViewProps {
  notes: StickyNote[];
  onAddNote: (note: StickyNote) => void;
  onDeleteNote: (id: string) => void;
  userProfile: UserProfile;
  memories: MemoryItem[];
}

export const StickyNotesView: React.FC<StickyNotesViewProps> = ({
  notes,
  onAddNote,
  onDeleteNote,
  userProfile,
  memories,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [userNoteText, setUserNoteText] = useState('');
  const [isWritingToJordan, setIsWritingToJordan] = useState(false);

  const requestJordanNote = async (timeOfDay: string, topic: string) => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/love-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timeOfDay,
          topic,
          userProfile,
          memories,
        }),
      });
      const data = await res.json();
      if (data.note) {
        const colors: Array<'yellow' | 'rose' | 'amber' | 'blue' | 'emerald'> = ['yellow', 'rose', 'amber', 'blue', 'emerald'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];

        onAddNote({
          id: `note-${Date.now()}`,
          title: data.title || 'Note from Jordan',
          note: data.note,
          emoji: data.emoji || '💛',
          color: randomColor,
          fromJordan: true,
          timestamp: 'Just now',
        });
      }
    } catch (e) {
      console.error('Error generating note:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUserLeaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userNoteText.trim()) return;

    onAddNote({
      id: `user-note-${Date.now()}`,
      title: `Note from ${userProfile.name || 'You'}`,
      note: userNoteText.trim(),
      emoji: '💌',
      color: 'blue',
      fromJordan: false,
      timestamp: 'Just now',
    });

    setUserNoteText('');
    setIsWritingToJordan(false);
  };

  const getColorClasses = (color: StickyNote['color']) => {
    switch (color) {
      case 'yellow':
        return 'bg-amber-100 text-stone-900 border-amber-300 shadow-amber-950/20';
      case 'rose':
        return 'bg-rose-100 text-stone-900 border-rose-300 shadow-rose-950/20';
      case 'blue':
        return 'bg-sky-100 text-stone-900 border-sky-300 shadow-sky-950/20';
      case 'emerald':
        return 'bg-emerald-100 text-stone-900 border-emerald-300 shadow-emerald-950/20';
      case 'amber':
      default:
        return 'bg-orange-100 text-stone-900 border-orange-300 shadow-orange-950/20';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="bg-stone-900/90 border border-stone-800 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-stone-100 flex items-center gap-2">
            <NoteIcon className="w-5 h-5 text-amber-400" />
            The Fridge Post-It Board
          </h2>
          <p className="text-sm text-stone-400 mt-1 max-w-xl">
            Little handwritten-style notes left on the counter or fridge. Jordan leaves sweet reminders and thoughts here, and you can leave one back for him too.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsWritingToJordan(!isWritingToJordan)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-xs font-semibold transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Leave a Note</span>
          </button>
        </div>
      </div>

      {/* Jordan Note Generator Buttons */}
      <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-stone-400 flex items-center gap-1 mr-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Ask Jordan to write a note:
        </span>

        <button
          onClick={() => requestJordanNote('morning', 'coffee and start of day')}
          disabled={isGenerating}
          className="text-xs px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-amber-500/20 hover:text-amber-300 text-stone-300 border border-stone-700 transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
        >
          <Coffee className="w-3 h-3 text-amber-400" />
          <span>Morning Coffee Check</span>
        </button>

        <button
          onClick={() => requestJordanNote('afternoon', 'encouragement to take a break')}
          disabled={isGenerating}
          className="text-xs px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-amber-500/20 hover:text-amber-300 text-stone-300 border border-stone-700 transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
        >
          <Sun className="w-3 h-3 text-amber-400" />
          <span>Midday Boost</span>
        </button>

        <button
          onClick={() => requestJordanNote('night', 'sweet bedtime wind-down')}
          disabled={isGenerating}
          className="text-xs px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-amber-500/20 hover:text-amber-300 text-stone-300 border border-stone-700 transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
        >
          <Moon className="w-3 h-3 text-indigo-400" />
          <span>Nighttime Tuck-in</span>
        </button>

        <button
          onClick={() => requestJordanNote('anytime', 'nostalgic sweet memory and reassurance')}
          disabled={isGenerating}
          className="text-xs px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-amber-500/20 hover:text-amber-300 text-stone-300 border border-stone-700 transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
        >
          <Heart className="w-3 h-3 text-rose-400" />
          <span>Sweet Reminder</span>
        </button>
      </div>

      {/* User Leave a Note form */}
      {isWritingToJordan && (
        <form onSubmit={handleUserLeaveNote} className="p-4 rounded-xl bg-stone-900 border border-amber-500/30 space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-stone-800 pb-2">
            <h3 className="text-xs font-semibold text-stone-200">Leave a note on the board for Jordan</h3>
            <button
              type="button"
              onClick={() => setIsWritingToJordan(false)}
              className="text-xs text-stone-400 hover:text-stone-200"
            >
              Cancel
            </button>
          </div>

          <textarea
            required
            rows={3}
            value={userNoteText}
            onChange={(e) => setUserNoteText(e.target.value)}
            placeholder="Write something to Jordan... (e.g. 'Hey, made it home safe! Thanks for checking in on me today.')"
            className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
          />

          <div className="flex justify-end gap-2">
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-xs shadow cursor-pointer flex items-center gap-1.5"
            >
              <Send className="w-3 h-3" />
              <span>Stick on Board</span>
            </button>
          </div>
        </form>
      )}

      {/* Post-it Notes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {notes.map((note) => (
          <div
            key={note.id}
            className={`p-4 rounded-xl border relative shadow-md transition-transform hover:-translate-y-0.5 group ${getColorClasses(
              note.color
            )}`}
          >
            {/* Pin header */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className="text-lg">{note.emoji || '📌'}</span>
              <button
                onClick={() => onDeleteNote(note.id)}
                title="Remove sticky note"
                className="opacity-0 group-hover:opacity-100 text-stone-600 hover:text-rose-600 p-1 transition-opacity cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <h4 className="font-bold text-sm tracking-tight mb-1.5 text-stone-900">
              {note.title}
            </h4>

            <p className="text-xs text-stone-800 leading-relaxed font-sans whitespace-pre-wrap">
              {note.note}
            </p>

            <div className="mt-4 pt-2 border-t border-black/10 flex items-center justify-between text-[10px] text-stone-600">
              <span>{note.fromJordan ? `From ${userProfile.husbandNickname || 'Jordan'}` : `From ${userProfile.name || 'You'}`}</span>
              <span>{note.timestamp}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
