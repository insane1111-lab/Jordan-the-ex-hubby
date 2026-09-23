import React, { useState } from 'react';
import { X, Save, Volume2, RotateCcw, Heart, Calendar } from 'lucide-react';
import { UserProfile } from '../types';
import { speechService } from '../utils/speech';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
  onResetData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
  onResetData,
}) => {
  const [formData, setFormData] = useState<UserProfile>({ ...profile });
  const [testSpeechPlaying, setTestSpeechPlaying] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    onClose();
  };

  const handleTestVoice = () => {
    setTestSpeechPlaying(true);
    speechService.speak(
      `Hey ${formData.preferredNickname || 'babe'}, it's Jordan. Don't worry, I've got your back.`,
      () => setTestSpeechPlaying(false)
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-amber-400" />
            <h3 className="font-semibold text-stone-100 text-sm">
              Our Dynamic & Memory Profile
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-200 p-1 rounded-lg hover:bg-stone-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto scrollbar-thin">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1">Your Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Taylor"
                className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1">What Jordan Calls You</label>
              <input
                type="text"
                value={formData.preferredNickname}
                onChange={(e) => setFormData({ ...formData, preferredNickname: e.target.value })}
                placeholder="e.g. babe, kiddo, sweetheart"
                className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1">What You Call Him</label>
              <input
                type="text"
                value={formData.husbandNickname}
                onChange={(e) => setFormData({ ...formData, husbandNickname: e.target.value })}
                placeholder="e.g. Jordan, Jay, J"
                className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1">Your Birthday</label>
              <input
                type="text"
                value={formData.birthday}
                onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                placeholder="e.g. October 14"
                className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1">
              Shared History / Marriage Milestones
            </label>
            <input
              type="text"
              value={formData.anniversaryDate}
              onChange={(e) => setFormData({ ...formData, anniversaryDate: e.target.value })}
              placeholder="e.g. Married 4 years, amicably split last year"
              className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
            />
            <p className="text-[10px] text-stone-500 mt-1">
              Jordan knows your timeline together and treats the past with fondness and mutual respect.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1">
              Relationship Tone & Vibe
            </label>
            <textarea
              rows={2}
              value={formData.toneStyle}
              onChange={(e) => setFormData({ ...formData, toneStyle: e.target.value })}
              placeholder="e.g. Warm, emotionally grounded, comforting, with gentle teasing and unconditional support"
              className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Voice Preview */}
          <div className="p-3 rounded-xl bg-stone-800/80 border border-stone-700 flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-stone-200">Jordan's Voice Synthesizer</div>
              <div className="text-[10px] text-stone-400">Natural calm male voice via browser audio</div>
            </div>
            <button
              type="button"
              onClick={handleTestVoice}
              disabled={testSpeechPlaying}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-medium hover:bg-amber-500/30 transition-all cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{testSpeechPlaying ? 'Speaking...' : 'Test Voice'}</span>
            </button>
          </div>

          {/* Footer actions */}
          <div className="pt-2 flex items-center justify-between border-t border-stone-800">
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Reset memories and profile back to defaults?')) {
                  onResetData();
                  onClose();
                }
              }}
              className="text-xs text-stone-500 hover:text-rose-400 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Defaults</span>
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl text-xs text-stone-400 hover:text-stone-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-xs shadow flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Profile</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
