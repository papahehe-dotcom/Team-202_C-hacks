import React from 'react';
import { Play, BookOpen, Volume2, Sparkles, Trophy, ShieldCheck, Zap, Wind } from 'lucide-react';
import { gameAudio } from '../utils/audio';

interface StartScreenProps {
  onPlayGame: () => void;
  onHowToPlay: () => void;
  onSoundSettings: () => void;
  onAbout: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  onPlayGame,
  onHowToPlay,
  onSoundSettings,
  onAbout,
}) => {
  return (
    <div className="relative min-h-screen w-full bg-gradient-to-b from-sky-400 via-teal-300 to-emerald-200 text-slate-800 flex flex-col justify-between p-4 sm:p-6 overflow-hidden select-none">
      {/* Background clouds & summer heat sun */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Animated Sun */}
        <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-yellow-300/60 blur-3xl animate-pulse" />
        <div className="absolute top-8 right-12 w-28 h-28 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 border-4 border-yellow-200 shadow-2xl flex items-center justify-center animate-spin" style={{ animationDuration: '24s' }}>
          <span className="text-4xl">☀️</span>
        </div>

        {/* Floating Cartoon Clouds */}
        <div className="absolute top-16 left-8 w-44 h-14 bg-white/90 rounded-full blur-[0.5px] shadow-sm animate-pulse" />
        <div className="absolute top-32 left-1/3 w-60 h-16 bg-white/80 rounded-full blur-[0.5px] shadow-sm" />
        <div className="absolute top-24 right-1/4 w-40 h-12 bg-white/70 rounded-full blur-[0.5px] shadow-sm" />
        
        {/* Rolling Cartoon Hills at bottom */}
        <div className="absolute -bottom-24 -left-12 w-[120%] h-80 bg-gradient-to-t from-emerald-600 via-emerald-500 to-emerald-400 rounded-[100%] shadow-2xl" />
        <div className="absolute -bottom-32 -right-12 w-[120%] h-84 bg-gradient-to-t from-teal-700 via-teal-600 to-teal-500 rounded-[100%] opacity-90" />
      </div>

      {/* Top Banner with Game Emblem */}
      <header className="relative z-10 flex items-center justify-between max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-4 py-1.5 rounded-full border-2 border-emerald-400/60 shadow-lg text-xs font-black text-emerald-300 tracking-wider">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span>CITY CRISIS RESCUE MISSION</span>
        </div>

        <button
          onClick={() => {
            gameAudio.playClick();
            onSoundSettings();
          }}
          className="game-btn bg-slate-900/80 hover:bg-slate-900 text-amber-300 px-3.5 py-1.5 rounded-full border-2 border-amber-300/40 text-xs font-bold gap-1.5 shadow-md"
        >
          <Volume2 className="w-4 h-4 text-amber-400" />
          <span>AUDIO</span>
        </button>
      </header>

      {/* Center Hero Arcade Lockup */}
      <main className="relative z-10 max-w-xl mx-auto text-center my-auto py-6">
        {/* Animated Earthy Character Mascot */}
        <div className="relative inline-block mb-4">
          <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-sky-400 via-emerald-400 to-amber-300 border-4 border-white shadow-2xl mx-auto flex items-center justify-center animate-bounce cursor-pointer hover:scale-110 transition-transform" style={{ animationDuration: '2.5s' }}>
            <div className="text-5xl">🌍</div>
          </div>
          {/* Mascot Tag */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-amber-400 text-amber-950 font-arcade text-[10px] tracking-wider border-2 border-white shadow-md">
            MEET EARTHY!
          </div>
        </div>

        {/* 3D Game Title */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-arcade tracking-tight text-white drop-shadow-[0_6px_0_#064e3b] mb-1">
          EARTH SAVERS
        </h1>
        <div className="inline-block px-5 py-1.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-300 text-amber-950 font-arcade text-sm sm:text-base tracking-wider uppercase shadow-xl border-2 border-amber-200 border-b-4 border-amber-600 mb-4">
          🔥 THE LAST 8 DAYS 🔥
        </div>

        <p className="text-base sm:text-lg font-black text-slate-900 drop-shadow-sm mb-6 max-w-md mx-auto">
          Can you protect citizens from extreme heat, fix power cuts, and save Verdantia before time runs out?
        </p>

        {/* 3 Main Indicators in Little Game Badges */}
        <div className="grid grid-cols-3 gap-2.5 max-w-sm mx-auto mb-7">
          <div className="p-2 bg-white/90 rounded-2xl border-2 border-rose-300 shadow-md">
            <span className="text-xl block">❤️</span>
            <span className="text-[11px] font-black text-slate-800">Save Lives</span>
          </div>
          <div className="p-2 bg-white/90 rounded-2xl border-2 border-amber-300 shadow-md">
            <span className="text-xl block">⚡</span>
            <span className="text-[11px] font-black text-slate-800">Stop Blackouts</span>
          </div>
          <div className="p-2 bg-white/90 rounded-2xl border-2 border-teal-300 shadow-md">
            <span className="text-xl block">🍃</span>
            <span className="text-[11px] font-black text-slate-800">Clean the Air</span>
          </div>
        </div>

        {/* Big Juicy Play Button */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto mb-5">
          <button
            onClick={() => {
              gameAudio.playSuccess();
              onPlayGame();
            }}
            className="w-full sm:w-auto px-10 py-4 game-btn game-btn-green text-base sm:text-lg font-arcade tracking-wider gap-3 shadow-2xl hover:scale-105"
          >
            <Play className="w-6 h-6 fill-white text-white" />
            <span>START MISSION!</span>
          </button>

          <button
            onClick={() => {
              gameAudio.playClick();
              onHowToPlay();
            }}
            className="w-full sm:w-auto px-6 py-4 game-btn game-btn-yellow text-sm font-arcade tracking-wider gap-2 shadow-xl"
          >
            <BookOpen className="w-5 h-5" />
            <span>HOW TO PLAY</span>
          </button>
        </div>

        {/* SDG Badges & Quick Info */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <span className="text-[11px] font-black bg-emerald-900/80 text-emerald-200 px-3 py-1 rounded-full border border-emerald-400/40">
            🏙️ SDG 11 Sustainable Cities
          </span>
          <span className="text-[11px] font-black bg-emerald-900/80 text-emerald-200 px-3 py-1 rounded-full border border-emerald-400/40">
            🌍 SDG 13 Climate Action
          </span>
          <span className="text-[11px] font-black bg-emerald-900/80 text-emerald-200 px-3 py-1 rounded-full border border-emerald-400/40">
            ⚖️ SDG 12 Smart Choices
          </span>
        </div>
      </main>

      {/* Bottom Footer Ribbon */}
      <footer className="relative z-10 flex items-center justify-between max-w-5xl mx-auto w-full text-xs font-black text-emerald-950">
        <span>🪙 Starting Budget: 1,500 City Credits</span>
        <button 
          onClick={onAbout}
          className="hover:underline cursor-pointer bg-white/60 px-3 py-1 rounded-full"
        >
          Game Info & Rules
        </button>
      </footer>
    </div>
  );
};
