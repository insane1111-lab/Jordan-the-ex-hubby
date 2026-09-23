import React from 'react';
import { 
  Heart, 
  Brain, 
  Bell, 
  StickyNote as NoteIcon, 
  Smile, 
  Settings, 
  Volume2, 
  VolumeX, 
  CloudRain, 
  Sparkles 
} from 'lucide-react';
import { TabType, UserProfile } from '../types';

interface HeaderProps {
  currentTab: TabType;
  setCurrentTab: (tab: TabType) => void;
  userProfile: UserProfile;
  onOpenSettings: () => void;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  ambientPlaying: boolean;
  onToggleAmbient: () => void;
  newMemoryCount: number;
  jordanStatus: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  userProfile,
  onOpenSettings,
  voiceEnabled,
  onToggleVoice,
  ambientPlaying,
  onToggleAmbient,
  newMemoryCount,
  jordanStatus,
}) => {
  const tabs = [
    { id: 'chat' as TabType, label: 'Chat', icon: Heart },
    { id: 'memories' as TabType, label: 'Memory Vault', icon: Brain, badge: newMemoryCount },
    { id: 'reminders' as TabType, label: 'Daily Care', icon: Bell },
    { id: 'notes' as TabType, label: 'Notes', icon: NoteIcon },
    { id: 'comfort' as TabType, label: 'Comfort Hub', icon: Smile },
  ];

  return (
    <header className="sticky top-0 z-40 bg-stone-900/90 backdrop-blur-md border-b border-stone-800 text-stone-100">
      {/* Top Bar with Jordan Persona & Actions */}
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* Jordan Identity */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-amber-600 via-orange-500 to-rose-500 p-[2px] shadow-md">
              <div className="w-full h-full rounded-full bg-stone-900 flex items-center justify-center text-amber-300 font-semibold text-lg">
                J
              </div>
            </div>
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-stone-900 ring-1 ring-emerald-400/50 animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-semibold text-stone-100 text-base sm:text-lg tracking-tight flex items-center gap-1.5">
                {userProfile.husbandNickname || 'Jordan'}
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-medium">
                  Ex-Husband
                </span>
              </h1>
            </div>
            <p className="text-xs text-stone-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block"></span>
              {jordanStatus}
            </p>
          </div>
        </div>

        {/* Action Controls: Audio & Settings */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Ambient Rain Noise */}
          <button
            onClick={onToggleAmbient}
            title={ambientPlaying ? 'Stop ambient rain sound' : 'Play cozy ambient rain'}
            className={`p-2 rounded-xl text-xs flex items-center gap-1.5 transition-all ${
              ambientPlaying 
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-inner' 
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
            }`}
          >
            <CloudRain className={`w-4 h-4 ${ambientPlaying ? 'animate-bounce' : ''}`} />
            <span className="hidden md:inline text-[11px]">
              {ambientPlaying ? 'Rain On' : 'Cozy Rain'}
            </span>
          </button>

          {/* Voice Speech Toggle */}
          <button
            onClick={onToggleVoice}
            title={voiceEnabled ? 'Voice playback enabled' : 'Voice playback muted'}
            className={`p-2 rounded-xl text-xs flex items-center gap-1.5 transition-all ${
              voiceEnabled 
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' 
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
            }`}
          >
            {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden md:inline text-[11px]">
              {voiceEnabled ? 'Voice On' : 'Voice Off'}
            </span>
          </button>

          {/* Settings / Customize Profile & History */}
          <button
            onClick={onOpenSettings}
            title="Our History & Settings"
            className="p-2 rounded-xl text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-all"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation Tab Bar */}
      <div className="max-w-5xl mx-auto px-2 overflow-x-auto scrollbar-none flex gap-1 border-t border-stone-800/80">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                isActive
                  ? 'border-amber-500 text-amber-300 bg-amber-500/10'
                  : 'border-transparent text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-stone-400'}`} />
              <span>{tab.label}</span>
              {Boolean(tab.badge && tab.badge > 0) && (
                <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-amber-500 text-stone-950 font-bold">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
