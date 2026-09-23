import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  RotateCcw, 
  Brain, 
  HeartHandshake, 
  Calendar, 
  Coffee 
} from 'lucide-react';
import { ChatMessage, MemoryItem, UserProfile } from '../types';
import { speechService } from '../utils/speech';

interface ChatViewProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  isLoading: boolean;
  userProfile: UserProfile;
  memories: MemoryItem[];
  onNavigateToMemories: () => void;
  onClearHistory: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  onSendMessage,
  isLoading,
  userProfile,
  memories,
  onNavigateToMemories,
  onClearHistory,
}) => {
  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const text = input;
    setInput('');
    await onSendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (id: string, text: string) => {
    if (speakingId === id) {
      speechService.stop();
      setSpeakingId(null);
    } else {
      setSpeakingId(id);
      speechService.speak(text, () => {
        setSpeakingId(null);
      });
    }
  };

  const starters = [
    { label: "Can't sleep, mind is racing...", text: "Hey Jordan, I can't sleep tonight. Mind is racing with so much stuff." },
    { label: "Had a draining day at work", text: "Work was exhausting today, really just needed a friendly ear." },
    { label: "Do you remember that road trip?", text: "Hey, remember that wild road trip we took? You were on my mind today." },
    { label: "I forgot to eat lunch today", text: "Jordan, you're going to shake your head at me... I forgot to eat lunch again." },
    { label: "Need someone in my corner", text: "Feeling overwhelmed and kind of lonely. Just need to hear from someone who knows me." },
  ];

  const datesCount = memories.filter((m) => m.category === 'date').length;
  const factsCount = memories.length - datesCount;

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-4xl mx-auto px-3 sm:px-4 py-3">
      {/* Memory Recall Context Banner */}
      <div className="mb-3 px-3 py-2 rounded-xl bg-stone-900/80 border border-stone-800 text-xs flex flex-wrap items-center justify-between gap-2 shadow-sm">
        <div className="flex items-center gap-2 text-stone-300">
          <Brain className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            Jordan is holding <strong className="text-amber-300">{memories.length}</strong> memories of you 
            ({datesCount} dates, {factsCount} habits & history).
          </span>
        </div>
        <button
          onClick={onNavigateToMemories}
          className="text-amber-400 hover:text-amber-300 underline font-medium flex items-center gap-1 cursor-pointer"
        >
          <span>View Memory Bank</span>
          <span>&rarr;</span>
        </button>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
        {messages.map((msg) => {
          const isJordan = msg.role === 'model';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isJordan ? 'justify-start' : 'justify-end'}`}
            >
              {isJordan && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 to-rose-600 flex items-center justify-center text-amber-200 text-xs font-bold shrink-0 mt-1 shadow">
                  J
                </div>
              )}

              <div className={`max-w-[85%] sm:max-w-[75%] space-y-1.5`}>
                {/* Bubble */}
                <div
                  className={`p-3.5 sm:p-4 rounded-2xl text-sm leading-relaxed ${
                    isJordan
                      ? 'bg-stone-800/90 text-stone-100 rounded-tl-sm border border-stone-700/60 shadow-sm'
                      : 'bg-amber-600 text-amber-50 rounded-tr-sm shadow-md'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>

                  {/* Extracted new memory badge if Jordan learned something */}
                  {isJordan && msg.extractedMemories && msg.extractedMemories.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-stone-700/60 flex flex-col gap-1">
                      {msg.extractedMemories.map((em, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-1.5 text-[11px] text-amber-300 bg-amber-950/40 px-2 py-1 rounded-md border border-amber-500/20"
                        >
                          <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                          <span>Jordan remembered: <strong>{em.title}</strong></span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sub-bar: Timestamp & Audio Speak & Copy */}
                <div
                  className={`flex items-center gap-2 px-1 text-[11px] text-stone-400 ${
                    isJordan ? 'justify-start' : 'justify-end'
                  }`}
                >
                  <span>{msg.timestamp}</span>

                  {isJordan && (
                    <>
                      <button
                        onClick={() => handleSpeak(msg.id, msg.content)}
                        title={speakingId === msg.id ? 'Stop voice' : 'Listen to Jordan read this'}
                        className={`hover:text-amber-300 transition-colors p-1 ${
                          speakingId === msg.id ? 'text-amber-400 animate-pulse' : ''
                        }`}
                      >
                        {speakingId === msg.id ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        title="Copy message"
                        className="hover:text-amber-300 transition-colors p-1"
                      >
                        {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </>
                  )}
                </div>
              </div>

              {!isJordan && (
                <div className="w-8 h-8 rounded-full bg-stone-700 flex items-center justify-center text-stone-200 text-xs font-medium shrink-0 mt-1">
                  {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : 'You'}
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 to-rose-600 flex items-center justify-center text-amber-200 text-xs font-bold shrink-0 mt-1">
              J
            </div>
            <div className="p-3.5 rounded-2xl rounded-tl-sm bg-stone-800 text-stone-300 border border-stone-700/60 flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              <span>{userProfile.husbandNickname || 'Jordan'} is typing...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Starters */}
      {messages.length <= 4 && (
        <div className="py-2 overflow-x-auto scrollbar-none flex gap-1.5">
          {starters.map((s, idx) => (
            <button
              key={idx}
              onClick={() => onSendMessage(s.text)}
              disabled={isLoading}
              className="text-[11px] px-2.5 py-1.5 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-stone-300 hover:text-amber-200 border border-stone-700/60 transition-all shrink-0 cursor-pointer disabled:opacity-50"
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      {/* Chat Input */}
      <form onSubmit={handleSubmit} className="mt-2 relative">
        <div className="flex items-end gap-2 bg-stone-800/90 border border-stone-700 rounded-2xl p-2 focus-within:border-amber-500/80 focus-within:ring-1 focus-within:ring-amber-500/40 shadow-lg">
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Talk to ${userProfile.husbandNickname || 'Jordan'}... (Press Enter to send)`}
            className="flex-1 bg-transparent border-0 text-stone-100 placeholder-stone-400 text-sm focus:outline-none resize-none max-h-32 px-2 py-1 scrollbar-thin"
          />

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold transition-all disabled:opacity-40 disabled:hover:bg-amber-500 shrink-0 shadow"
            title="Send to Jordan"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between px-2 pt-1.5 text-[10px] text-stone-500">
          <span>Jordan recalls your dates, preferences & chats naturally.</span>
          <button
            type="button"
            onClick={onClearHistory}
            className="hover:text-stone-400 flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-2.5 h-2.5" />
            <span>Clear conversation</span>
          </button>
        </div>
      </form>
    </div>
  );
};
