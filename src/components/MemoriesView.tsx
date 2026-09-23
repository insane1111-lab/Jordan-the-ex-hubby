import React, { useState } from 'react';
import { 
  Brain, 
  Calendar, 
  Heart, 
  Coffee, 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  MessageSquare, 
  Clock, 
  Sparkles, 
  Tag 
} from 'lucide-react';
import { MemoryItem, MemoryCategory, UserProfile } from '../types';

interface MemoriesViewProps {
  memories: MemoryItem[];
  userProfile: UserProfile;
  onAddMemory: (memory: Omit<MemoryItem, 'id' | 'createdAt'>) => void;
  onUpdateMemory: (id: string, memory: Partial<MemoryItem>) => void;
  onDeleteMemory: (id: string) => void;
  onAskJordanAbout: (prompt: string) => void;
}

export const MemoriesView: React.FC<MemoriesViewProps> = ({
  memories,
  userProfile,
  onAddMemory,
  onUpdateMemory,
  onDeleteMemory,
  onAskJordanAbout,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formCategory, setFormCategory] = useState<MemoryCategory>('interest');
  const [formTitle, setFormTitle] = useState('');
  const [formDetails, setFormDetails] = useState('');
  const [formDate, setFormDate] = useState('');

  const resetForm = () => {
    setFormTitle('');
    setFormDetails('');
    setFormDate('');
    setFormCategory('interest');
    setIsAdding(false);
    setEditingId(null);
  };

  const handleStartEdit = (mem: MemoryItem) => {
    setEditingId(mem.id);
    setFormCategory(mem.category);
    setFormTitle(mem.title);
    setFormDetails(mem.details);
    setFormDate(mem.date || '');
    setIsAdding(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDetails.trim()) return;

    if (editingId) {
      onUpdateMemory(editingId, {
        category: formCategory,
        title: formTitle.trim(),
        details: formDetails.trim(),
        date: formDate.trim() || undefined,
      });
    } else {
      onAddMemory({
        category: formCategory,
        title: formTitle.trim(),
        details: formDetails.trim(),
        date: formDate.trim() || undefined,
      });
    }
    resetForm();
  };

  const categories = [
    { id: 'all', label: 'All Memories', icon: Brain },
    { id: 'date', label: 'Important Dates', icon: Calendar },
    { id: 'interest', label: 'Interests & Habits', icon: Coffee },
    { id: 'shared_history', label: 'Shared History', icon: Heart },
    { id: 'current_life', label: 'Current Life', icon: Clock },
    { id: 'fact', label: 'Key Facts', icon: Tag },
  ];

  const filteredMemories = memories.filter((mem) => {
    const matchesCategory = activeCategory === 'all' || mem.category === activeCategory;
    const matchesSearch = 
      mem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mem.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (mem.date && mem.date.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getCategoryBadge = (cat: MemoryCategory) => {
    switch (cat) {
      case 'date':
        return { label: 'Important Date', color: 'bg-rose-950/60 text-rose-300 border-rose-500/30' };
      case 'interest':
        return { label: 'Interest & Habits', color: 'bg-amber-950/60 text-amber-300 border-amber-500/30' };
      case 'shared_history':
        return { label: 'Shared History', color: 'bg-purple-950/60 text-purple-300 border-purple-500/30' };
      case 'current_life':
        return { label: 'Current Life', color: 'bg-blue-950/60 text-blue-300 border-blue-500/30' };
      default:
        return { label: 'Personal Fact', color: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30' };
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Intro Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stone-900/90 border border-stone-800 p-5 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-stone-100 flex items-center gap-2">
              <Brain className="w-5 h-5 text-amber-400" />
              What Jordan Remembers
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 font-semibold border border-amber-500/20">
              {memories.length} Stored
            </span>
          </div>
          <p className="text-sm text-stone-400 mt-1 max-w-xl">
            Jordan holds your important dates, shared marriage history, coffee quirks, and current life updates. He references these naturally in conversation and daily check-ins.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setIsAdding(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-sm transition-all shadow shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Memory</span>
        </button>
      </div>

      {/* Quick Overview Cards: Birthday & Shared Anniversary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-gradient-to-br from-rose-950/40 to-stone-900 border border-rose-900/40 flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-rose-500/20 text-rose-300 shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-rose-400 tracking-wider uppercase">Your Birthday</span>
            <h3 className="text-base font-bold text-stone-100 mt-0.5">{userProfile.birthday || 'October 14'}</h3>
            <p className="text-xs text-stone-400 mt-1">
              Jordan knows your birthday by heart and knows how you like to celebrate it.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-br from-amber-950/40 to-stone-900 border border-amber-900/40 flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-amber-500/20 text-amber-300 shrink-0">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-amber-400 tracking-wider uppercase">Our Shared Past</span>
            <h3 className="text-base font-bold text-stone-100 mt-0.5">
              {userProfile.anniversaryDate || 'June 20 (Parted warmly last year)'}
            </h3>
            <p className="text-xs text-stone-400 mt-1">
              Years of shared life together. No bitterness, just deep mutual respect and loyalty.
            </p>
          </div>
        </div>
      </div>

      {/* Add / Edit Form Modal / Inline Box */}
      {isAdding && (
        <form onSubmit={handleSave} className="p-5 rounded-2xl bg-stone-900 border border-amber-500/40 shadow-xl space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <h3 className="text-sm font-semibold text-amber-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              {editingId ? 'Edit Memory for Jordan' : 'Tell Jordan Something to Remember'}
            </h3>
            <button
              type="button"
              onClick={resetForm}
              className="text-xs text-stone-400 hover:text-stone-200 cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1">Category</label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as MemoryCategory)}
                className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
              >
                <option value="date">Important Date</option>
                <option value="interest">Interest & Habit</option>
                <option value="shared_history">Shared Marriage History</option>
                <option value="current_life">Current Life & Goals</option>
                <option value="fact">Personal Fact</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-stone-300 mb-1">Title / Key Topic</label>
              <input
                type="text"
                required
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g. Sister's wedding, Matcha latte order, Exam day"
                className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {formCategory === 'date' && (
            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1">Date / Month</label>
              <input
                type="text"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                placeholder="e.g. November 12, Next Friday, Every Sunday"
                className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1">What Jordan Should Remember</label>
            <textarea
              required
              rows={3}
              value={formDetails}
              onChange={(e) => setFormDetails(e.target.value)}
              placeholder="e.g. You always get super anxious two days before big presentations, so you need him to remind you to breathe and sleep."
              className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 rounded-xl text-xs text-stone-400 hover:text-stone-200 hover:bg-stone-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-xs shadow transition-all cursor-pointer"
            >
              {editingId ? 'Save Changes' : 'Commit to Jordan\'s Memory'}
            </button>
          </div>
        </form>
      )}

      {/* Category Pills & Search Bar */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search memories, dates, coffee quirks..."
            className="w-full bg-stone-900 border border-stone-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500/60"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-1">
          {categories.map((c) => {
            const Icon = c.icon;
            const count = c.id === 'all' 
              ? memories.length 
              : memories.filter((m) => m.category === c.id).length;
            const isActive = activeCategory === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-stone-950 font-semibold shadow'
                    : 'bg-stone-900 text-stone-400 hover:text-stone-200 hover:bg-stone-800 border border-stone-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{c.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-stone-950/20 text-stone-950' : 'bg-stone-800 text-stone-400'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Memory Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredMemories.length === 0 ? (
          <div className="col-span-full py-12 text-center text-stone-500 border border-dashed border-stone-800 rounded-2xl">
            <Brain className="w-8 h-8 mx-auto text-stone-600 mb-2" />
            <p className="text-sm font-medium">No memories found in this category.</p>
            <p className="text-xs mt-1">Chat with Jordan or click "Add Memory" above to add one.</p>
          </div>
        ) : (
          filteredMemories.map((mem) => {
            const badge = getCategoryBadge(mem.category);
            return (
              <div
                key={mem.id}
                className="group p-4 rounded-xl bg-stone-900/90 border border-stone-800 hover:border-stone-700 transition-all flex flex-col justify-between shadow-sm"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md border ${badge.color}`}>
                      {badge.label}
                    </span>

                    <div className="flex items-center gap-1 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleStartEdit(mem)}
                        title="Edit memory"
                        className="p-1 rounded text-stone-400 hover:text-stone-200 hover:bg-stone-800 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteMemory(mem.id)}
                        title="Forget memory"
                        className="p-1 rounded text-stone-400 hover:text-rose-400 hover:bg-stone-800 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h4 className="text-sm font-semibold text-stone-100 flex items-center gap-1.5">
                    {mem.title}
                  </h4>

                  {mem.date && (
                    <div className="text-[11px] text-rose-400 font-medium mt-0.5 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{mem.date}</span>
                    </div>
                  )}

                  <p className="text-xs text-stone-300 mt-2 leading-relaxed whitespace-pre-wrap">
                    {mem.details}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-stone-500">Recalled by Jordan</span>

                  <button
                    onClick={() => onAskJordanAbout(`Hey Jordan, do you remember: ${mem.title}?`)}
                    className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-medium cursor-pointer"
                    title="Bring this up in chat with Jordan"
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>Bring up in chat</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
