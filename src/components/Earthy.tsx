import React from 'react';
import { EarthyMood } from '../types/game';
import { Volume2, Sparkles } from 'lucide-react';
import { gameAudio } from '../utils/audio';

interface EarthyProps {
  mood?: EarthyMood;
  dialogue: string;
  voiceText?: string;
  size?: 'sm' | 'md' | 'lg';
  showSpeechBubble?: boolean;
}

export const Earthy: React.FC<EarthyProps> = ({
  mood = 'happy',
  dialogue,
  voiceText,
  size = 'md',
  showSpeechBubble = true,
}) => {
  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    gameAudio.playClick();
    gameAudio.speak(voiceText || dialogue);
  };

  const dimensions = 
    size === 'sm' ? 'w-12 h-12' : 
    size === 'lg' ? 'w-20 h-20' : 'w-16 h-16';

  return (
    <div className="flex items-center gap-2.5 select-none">
      {/* Earthy Planet Mascot Body */}
      <div 
        onClick={handleSpeak}
        title="Tap Earthy to speak!"
        className={`relative ${dimensions} shrink-0 animate-bounce cursor-pointer hover:scale-110 transition-transform`} 
        style={{ animationDuration: '2.5s' }}
      >
        {/* Glow */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-sky-400 via-emerald-400 to-amber-300 blur-sm opacity-80" />

        {/* Planet sphere */}
        <div className="relative w-full h-full rounded-full bg-gradient-to-tr from-sky-500 via-sky-400 to-emerald-400 border-3 border-white shadow-xl overflow-hidden flex items-center justify-center">
          {/* Continents (Green shapes) */}
          <div className="absolute -top-1 -left-2 w-7 h-7 rounded-full bg-emerald-500/80 transform rotate-12" />
          <div className="absolute bottom-0 right-0 w-8 h-6 rounded-tl-2xl bg-emerald-500/80" />
          <div className="absolute top-2 right-1 w-4 h-4 rounded-full bg-emerald-600/70" />

          {/* Earthy Face Features */}
          <div className="relative z-10 flex flex-col items-center justify-center">
            {/* Eyes */}
            <div className="flex items-center gap-2 mb-0.5">
              {mood === 'worried' ? (
                <>
                  <div className="w-2.5 h-3 rounded-full bg-slate-900 relative">
                    <div className="w-1 h-1 rounded-full bg-white absolute top-0.5 right-0.5" />
                  </div>
                  <div className="w-2.5 h-3 rounded-full bg-slate-900 relative">
                    <div className="w-1 h-1 rounded-full bg-white absolute top-0.5 right-0.5" />
                  </div>
                </>
              ) : mood === 'cheering' ? (
                <>
                  <div className="w-3 h-1.5 border-t-2 border-slate-900 rounded-t-full transform -rotate-12" />
                  <div className="w-3 h-1.5 border-t-2 border-slate-900 rounded-t-full transform rotate-12" />
                </>
              ) : (
                <>
                  <div className="w-2.5 h-3 rounded-full bg-slate-900 relative">
                    <div className="w-1 h-1 rounded-full bg-white absolute top-0.5 right-0.5" />
                    <div className="w-0.5 h-0.5 rounded-full bg-white absolute bottom-0.5 left-0.5" />
                  </div>
                  <div className="w-2.5 h-3 rounded-full bg-slate-900 relative">
                    <div className="w-1 h-1 rounded-full bg-white absolute top-0.5 right-0.5" />
                    <div className="w-0.5 h-0.5 rounded-full bg-white absolute bottom-0.5 left-0.5" />
                  </div>
                </>
              )}
            </div>

            {/* Rosy Cheeks */}
            <div className="flex items-center justify-between w-6 -mt-1 mb-0.5">
              <div className="w-1.5 h-1 rounded-full bg-rose-400" />
              <div className="w-1.5 h-1 rounded-full bg-rose-400" />
            </div>

            {/* Mouth */}
            {mood === 'cheering' ? (
              <div className="w-3 h-2 bg-slate-900 rounded-b-full flex items-center justify-center overflow-hidden">
                <div className="w-1.5 h-1 bg-rose-400 rounded-full mt-0.5" />
              </div>
            ) : mood === 'worried' ? (
              <div className="w-2.5 h-1 border-t-2 border-slate-900 rounded-t-full" />
            ) : mood === 'thinking' ? (
              <div className="w-1.5 h-1.5 rounded-full bg-slate-900 -mr-1.5" />
            ) : (
              <div className="w-3 h-1.5 border-b-2 border-slate-900 rounded-b-full" />
            )}
          </div>

          {/* Little green leaf sprout on top */}
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-emerald-400 rounded-tr-full rounded-bl-full rotate-45 border-2 border-white" />
        </div>
      </div>

      {/* Comic Speech Bubble */}
      {showSpeechBubble && dialogue && (
        <div className="relative flex-1 bg-amber-50/95 border-3 border-amber-900/25 rounded-2xl p-2.5 sm:p-3 shadow-lg max-w-xl transition-all">
          {/* Speech bubble pointer */}
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-3 h-3 bg-amber-50 border-l-3 border-b-3 border-amber-900/25 transform rotate-45" />

          <div className="flex items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-black tracking-wider uppercase text-emerald-800 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500 inline" />
                <span>EARTHY'S MISSION TIP:</span>
              </span>
              <p className="text-xs sm:text-sm text-slate-900 font-bold leading-snug">
                "{dialogue}"
              </p>
            </div>

            {/* Read Aloud Button */}
            <button
              onClick={handleSpeak}
              title="Hear Earthy Speak"
              aria-label="Hear Earthy Speak"
              className="game-btn game-btn-yellow p-1.5 rounded-xl shrink-0"
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
