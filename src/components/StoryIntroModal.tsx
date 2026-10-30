import React, { useEffect } from 'react';
import { Earthy } from './Earthy';
import { ArrowRight, SkipForward, AlertTriangle, Sparkles } from 'lucide-react';
import { gameAudio } from '../utils/audio';

interface StoryIntroModalProps {
  onContinue: () => void;
  onSkip: () => void;
}

export const StoryIntroModal: React.FC<StoryIntroModalProps> = ({
  onContinue,
  onSkip,
}) => {
  const narrationText = "Welcome to Verdantia! Once a thriving, green city, our home is now facing an extreme climate heatwave! Temperatures are soaring to 43°C, toxic factory smog is rising, and our power grid is on the verge of a total blackout. The citizens need a smart Mayor! You have 8 days and 1,500 City Credits to make tough decisions. Can you save Verdantia before time runs out?";

  useEffect(() => {
    gameAudio.speak(narrationText);
    return () => gameAudio.stopSpeaking();
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 font-game select-none">
      <div className="bg-slate-900 border-4 border-amber-400 rounded-3xl max-w-xl w-full p-4 sm:p-6 shadow-2xl flex flex-col animate-in zoom-in-95 duration-200 text-white">
        <div className="flex items-center justify-between pb-3 border-b-2 border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🚨</span>
            <span className="text-xs font-arcade text-amber-400 tracking-wider">
              VERDANTIA CRISIS BRIEFING
            </span>
          </div>

          <button
            onClick={() => {
              gameAudio.playClick();
              onSkip();
            }}
            className="flex items-center gap-1 text-xs font-arcade text-slate-400 hover:text-white cursor-pointer"
          >
            <span>SKIP STORY</span>
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Earthy Character Stage */}
        <div className="my-2">
          <Earthy
            mood="worried"
            dialogue={narrationText}
            voiceText={narrationText}
            size="lg"
            showSpeechBubble={true}
          />
        </div>

        {/* 3 Main Crisis Highlights */}
        <div className="my-4 grid grid-cols-3 gap-2 text-center text-xs font-black">
          <div className="p-2.5 bg-rose-950/80 border-2 border-rose-500 rounded-2xl">
            <span className="text-2xl block mb-1">🔥</span>
            <span className="text-rose-300">43°C Heatwave</span>
          </div>
          <div className="p-2.5 bg-slate-800 border-2 border-slate-600 rounded-2xl">
            <span className="text-2xl block mb-1">🌫️</span>
            <span className="text-cyan-300">Toxic Smog</span>
          </div>
          <div className="p-2.5 bg-amber-950/80 border-2 border-amber-500 rounded-2xl">
            <span className="text-2xl block mb-1">⚡</span>
            <span className="text-amber-300">Blackout Risk</span>
          </div>
        </div>

        {/* Continue Button */}
        <div className="pt-2 flex items-center justify-end">
          <button
            onClick={() => {
              gameAudio.playClick();
              onContinue();
            }}
            className="w-full sm:w-auto px-8 py-3.5 game-btn game-btn-green text-sm sm:text-base font-arcade tracking-wider gap-2 shadow-xl hover:scale-102"
          >
            <span>HOW TO PLAY & SAVE THE CITY ▶</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
