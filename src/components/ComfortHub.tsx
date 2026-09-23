import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Smile, 
  Wind, 
  Sparkles, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  CheckCircle, 
  ShieldCheck 
} from 'lucide-react';
import { UserProfile, MemoryItem } from '../types';
import { speechService } from '../utils/speech';

interface ComfortHubProps {
  userProfile: UserProfile;
  memories: MemoryItem[];
}

export const ComfortHub: React.FC<ComfortHubProps> = ({ userProfile, memories }) => {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [extraNotes, setExtraNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [jordanSupportReply, setJordanSupportReply] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Breathing Exercise State
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Rest'>('Inhale');
  const [breathSeconds, setBreathSeconds] = useState(4);

  const moods = [
    { id: 'Overwhelmed', label: 'Overwhelmed', emoji: '🌪️', desc: 'Too many things pulling at me' },
    { id: 'Anxious', label: 'Anxious', emoji: '⚡', desc: 'Mind is spinning and chest is tight' },
    { id: 'Lonely', label: 'Lonely', emoji: '🫂', desc: 'Could really use someone in my corner' },
    { id: 'Exhausted', label: 'Exhausted', emoji: '😴', desc: 'Drained, zero energy left' },
    { id: 'Sad', label: 'Down / Sad', emoji: '🌧️', desc: 'Having a quiet, heavy day' },
    { id: 'Peaceful', label: 'Peaceful', emoji: '🌿', desc: 'Feeling calm and present' },
    { id: 'Proud', label: 'Proud / Happy', emoji: '✨', desc: 'Something went well today!' },
  ];

  const handleMoodSubmit = async (mood: string) => {
    setSelectedMood(mood);
    setIsSubmitting(true);
    setJordanSupportReply(null);
    speechService.stop();
    setIsSpeaking(false);

    try {
      const res = await fetch('/api/mood-checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mood,
          notes: extraNotes,
          userProfile,
          memories,
        }),
      });
      const data = await res.json();
      if (data.reply) {
        setJordanSupportReply(data.reply);
      }
    } catch (e) {
      console.error('Error submitting mood check-in:', e);
      setJordanSupportReply(
        `Hey ${userProfile.preferredNickname || 'babe'}, take a slow breath. I know you're feeling ${mood.toLowerCase()} right now, but you don't have to carry it all alone. I'm right here with you.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSpeak = () => {
    if (!jordanSupportReply) return;
    if (isSpeaking) {
      speechService.stop();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      speechService.speak(jordanSupportReply, () => setIsSpeaking(false));
    }
  };

  // Breathing Box Timer
  useEffect(() => {
    if (!isBreathing) return;

    const interval = setInterval(() => {
      setBreathSeconds((prev) => {
        if (prev <= 1) {
          // Switch phase
          setBreathPhase((current) => {
            if (current === 'Inhale') return 'Hold';
            if (current === 'Hold') return 'Exhale';
            if (current === 'Exhale') return 'Rest';
            return 'Inhale';
          });
          return 4;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isBreathing]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="bg-stone-900/90 border border-stone-800 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-stone-100 flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-400" />
            Comfort & Emotional Support
          </h2>
          <p className="text-sm text-stone-400 mt-1 max-w-xl">
            You don't have to pretend everything is fine. Tell Jordan what's going on, or take 2 minutes to breathe together.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium">
          <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Zero judgment safe space</span>
        </div>
      </div>

      {/* Mood Check-In Grid */}
      <div className="bg-stone-900 border border-stone-800 p-5 rounded-2xl space-y-4">
        <h3 className="text-sm font-semibold text-stone-200 flex items-center gap-2">
          <span>How are you feeling right now, {userProfile.name || 'friend'}?</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
          {moods.map((m) => {
            const isSelected = selectedMood === m.id;
            return (
              <button
                key={m.id}
                onClick={() => handleMoodSubmit(m.id)}
                disabled={isSubmitting}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-500 text-amber-200 shadow-md ring-1 ring-amber-500/50'
                    : 'bg-stone-800/80 border-stone-700/80 text-stone-300 hover:border-stone-600 hover:bg-stone-800'
                }`}
              >
                <span className="text-2xl">{m.emoji}</span>
                <span className="text-xs font-semibold leading-tight">{m.label}</span>
              </button>
            );
          })}
        </div>

        {/* Optional Extra details */}
        <div className="pt-2">
          <input
            type="text"
            value={extraNotes}
            onChange={(e) => setExtraNotes(e.target.value)}
            placeholder="Add context if you want (e.g., 'Work deadline in 2 hours and feeling stuck')..."
            className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3.5 py-2 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Loading state */}
        {isSubmitting && (
          <div className="p-4 rounded-xl bg-stone-800/60 border border-stone-700 text-xs text-amber-300 flex items-center gap-2 animate-pulse">
            <Sparkles className="w-4 h-4 animate-spin" />
            <span>Jordan is listening and writing back to you...</span>
          </div>
        )}

        {/* Jordan's Grounding Response */}
        {jordanSupportReply && !isSubmitting && (
          <div className="p-5 rounded-xl bg-stone-800/90 border border-amber-500/30 text-stone-100 space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-stone-700/60 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-amber-600 flex items-center justify-center text-[10px] font-bold text-amber-100">
                  J
                </div>
                <span className="text-xs font-semibold text-amber-300">
                  {userProfile.husbandNickname || 'Jordan'}'s Words For You
                </span>
              </div>

              <button
                onClick={toggleSpeak}
                className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-amber-300 cursor-pointer"
              >
                {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-amber-400" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span>{isSpeaking ? 'Mute' : 'Listen'}</span>
              </button>
            </div>

            <p className="text-sm text-stone-200 leading-relaxed whitespace-pre-wrap">
              {jordanSupportReply}
            </p>
          </div>
        )}
      </div>

      {/* Guided Breathing with Jordan */}
      <div className="p-6 rounded-2xl bg-gradient-to-b from-stone-900 to-stone-950 border border-stone-800 flex flex-col items-center text-center space-y-4">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-stone-100 flex items-center justify-center gap-2">
            <Wind className="w-5 h-5 text-cyan-400" />
            Breathe With Jordan
          </h3>
          <p className="text-xs text-stone-400 max-w-md">
            "Remember how we used to reset whenever things got too loud? 4 seconds in, hold, 4 seconds out. Let's do it together."
          </p>
        </div>

        {/* Pulsing Visual Circle */}
        <div className="relative w-44 h-44 flex items-center justify-center my-3">
          <div
            className={`absolute inset-0 rounded-full border-2 transition-all duration-1000 ${
              isBreathing
                ? breathPhase === 'Inhale'
                  ? 'scale-110 border-cyan-400 bg-cyan-500/10'
                  : breathPhase === 'Hold'
                  ? 'scale-110 border-amber-400 bg-amber-500/10'
                  : breathPhase === 'Exhale'
                  ? 'scale-90 border-rose-400 bg-rose-500/10'
                  : 'scale-95 border-indigo-400 bg-indigo-500/10'
                : 'scale-95 border-stone-700 bg-stone-900'
            }`}
          />

          <div className="z-10 flex flex-col items-center justify-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-300">
              {isBreathing ? breathPhase : 'Ready'}
            </span>
            <span className="text-3xl font-extrabold text-stone-100 my-0.5">
              {isBreathing ? breathSeconds : '4-4-4'}
            </span>
            <span className="text-[11px] text-stone-400">
              {isBreathing 
                ? breathPhase === 'Inhale'
                  ? 'Filling your lungs'
                  : breathPhase === 'Hold'
                  ? 'Holding gently'
                  : breathPhase === 'Exhale'
                  ? 'Releasing tension'
                  : 'Resting'
                : 'Box breathing'}
            </span>
          </div>
        </div>

        {/* Play / Pause Button */}
        <button
          onClick={() => {
            if (!isBreathing) {
              setBreathPhase('Inhale');
              setBreathSeconds(4);
            }
            setIsBreathing(!isBreathing);
          }}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-xs transition-all shadow cursor-pointer ${
            isBreathing
              ? 'bg-stone-800 text-stone-200 border border-stone-700 hover:bg-stone-700'
              : 'bg-cyan-500 hover:bg-cyan-400 text-stone-950'
          }`}
        >
          {isBreathing ? (
            <>
              <Pause className="w-4 h-4" />
              <span>Pause Breathing</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              <span>Start 2-Minute Reset</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
