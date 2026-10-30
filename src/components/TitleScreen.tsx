/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Play, Building2, Trophy, HelpCircle, Volume2, VolumeX, 
  Music, Shield, Sparkles, AlertTriangle, ArrowRight, CheckCircle2 
} from 'lucide-react';
import { GameSaveData } from '../types/ecoHero';
import { soundManager } from '../audio/soundManager';

interface TitleScreenProps {
  saveData: GameSaveData;
  onStartEscape: () => void;
  onOpenCityCommand: () => void;
  onOpenCityBuilder: () => void;
  onToggleSound: () => void;
  onToggleMusic: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  saveData,
  onStartEscape,
  onOpenCityCommand,
  onOpenCityBuilder,
  onToggleSound,
  onToggleMusic,
}) => {
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-b from-sky-300 via-teal-100 to-emerald-200 text-slate-800 overflow-y-auto flex flex-col justify-between p-4 sm:p-6 select-none font-game">
      {/* Background Floating Cartoon Clouds and Sun */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-amber-300/50 blur-3xl" />
        <div className="absolute top-6 right-10 w-24 h-24 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-200 border-4 border-white shadow-xl flex items-center justify-center animate-spin" style={{ animationDuration: '30s' }}>
          <span className="text-4xl">☀️</span>
        </div>

        {/* Floating clouds */}
        <div className="absolute top-12 left-10 w-44 h-12 bg-white/80 rounded-full blur-[0.5px] shadow-sm" />
        <div className="absolute top-28 left-1/3 w-64 h-14 bg-white/70 rounded-full blur-[0.5px] shadow-sm" />
        <div className="absolute top-20 right-1/4 w-40 h-10 bg-white/75 rounded-full blur-[0.5px] shadow-sm" />

        {/* Bottom Rolling Green Hills */}
        <div className="absolute -bottom-28 -left-10 w-[120%] h-80 bg-gradient-to-t from-emerald-600 via-emerald-500 to-emerald-400 rounded-[100%] shadow-2xl opacity-90" />
        <div className="absolute -bottom-36 -right-10 w-[120%] h-84 bg-gradient-to-t from-teal-700 via-teal-600 to-teal-500 rounded-[100%] opacity-80" />
      </div>

      {/* Top Arcade Status Bar */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between z-20">
        <div className="flex items-center gap-2.5">
          <div className="bg-white/95 border-2 border-emerald-400 rounded-2xl px-3.5 py-1.5 shadow-md flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span className="text-[10px] text-slate-500 font-bold uppercase font-arcade">BEST:</span>
            <span className="text-sm font-black font-arcade text-amber-600">
              {saveData.stats.highScore.toLocaleString()} PTS
            </span>
          </div>

          <div className="bg-white/95 border-2 border-amber-400 rounded-2xl px-3.5 py-1.5 shadow-md flex items-center gap-2">
            <span className="text-base">🪙</span>
            <span className="text-sm font-black font-arcade text-slate-800">
              {saveData.ecoCoins} CC
            </span>
          </div>
        </div>

        {/* Audio Toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleSound}
            className={`w-10 h-10 rounded-2xl border-2 flex items-center justify-center cursor-pointer transition-all shadow-sm ${
              saveData.soundEnabled
                ? 'bg-white border-emerald-500 text-emerald-600'
                : 'bg-white border-slate-300 text-slate-400'
            }`}
            title="Toggle Sound Effects"
          >
            {saveData.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button
            onClick={onToggleMusic}
            className={`w-10 h-10 rounded-2xl border-2 flex items-center justify-center cursor-pointer transition-all shadow-sm ${
              saveData.musicEnabled
                ? 'bg-white border-cyan-500 text-cyan-600'
                : 'bg-white border-slate-300 text-slate-400'
            }`}
            title="Toggle Music"
          >
            <Music className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Central Hero Arcade Lockup */}
      <div className="relative z-20 my-auto flex flex-col items-center text-center max-w-xl mx-auto">
        {/* Animated Mascot / Hero Badge */}
        <div className="inline-block mb-3 px-4 py-1.5 rounded-full bg-white/90 border-2 border-emerald-400 text-emerald-800 text-xs font-black font-arcade tracking-wider shadow-md">
          <span className="mr-1.5">🌍</span>
          <span>UN SUSTAINABLE CITIES SIMULATOR</span>
          <span className="ml-1.5">⚡</span>
        </div>

        {/* Main 3D Title */}
        <h1 className="text-5xl sm:text-7xl font-black font-arcade tracking-tight text-emerald-950 drop-shadow-[0_4px_0_#34d399] drop-shadow-[0_8px_0_#065f46]">
          ECO HERO
        </h1>
        <div className="text-lg sm:text-2xl font-black font-arcade tracking-widest text-emerald-950 mt-1 uppercase drop-shadow-sm">
          ESCAPE THE MONSTER • SAVE THE CITY
        </div>

        <p className="max-w-md text-xs sm:text-sm text-slate-700 font-bold mt-3 leading-relaxed bg-white/90 p-3 rounded-2xl border-2 border-emerald-200 shadow-sm">
          Phase 1: Escape the chasing Smog Monster across 2,500m to reach the city gates alive! <br />
          Phase 2: Take command of the emergency crisis center and resolve 6 critical environmental challenges to restore Verdantia!
        </p>

        {/* Big Juicy Start Buttons */}
        <div className="mt-6 flex flex-col items-center gap-3 w-full max-w-md">
          {/* Main Escape Sprint Button */}
          <button
            onClick={() => {
              soundManager.playSuccess();
              onStartEscape();
            }}
            className="w-full py-4.5 rounded-3xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 border-3 border-white border-b-6 border-emerald-800 font-black font-arcade text-xl text-white shadow-2xl hover:brightness-105 active:translate-y-1.5 active:border-b-2 transition-all flex items-center justify-center gap-3 cursor-pointer group"
          >
            <Play className="w-6 h-6 fill-white group-hover:scale-110 transition-transform" />
            <span>PHASE 1: ESCAPE RUNNER (5 LIVES)</span>
          </button>

          {/* Sub Menu Buttons */}
          <div className="grid grid-cols-2 gap-2.5 w-full">
            <button
              onClick={() => {
                soundManager.playClick();
                onOpenCityCommand();
              }}
              className="py-3 rounded-2xl bg-white border-2 border-emerald-400 border-b-4 border-emerald-700 hover:bg-emerald-50 font-black font-arcade text-xs text-emerald-900 flex items-center justify-center gap-2 cursor-pointer transition-all active:translate-y-1 active:border-b-2 shadow-md"
            >
              <span>🏛️</span>
              <span>ECO-CITY COMMAND</span>
            </button>

            <button
              onClick={() => {
                soundManager.playBuild();
                onOpenCityBuilder();
              }}
              className="py-3 rounded-2xl bg-white border-2 border-teal-400 border-b-4 border-teal-700 hover:bg-teal-50 font-black font-arcade text-xs text-teal-900 flex items-center justify-center gap-2 cursor-pointer transition-all active:translate-y-1 active:border-b-2 shadow-md"
            >
              <span>🏙️</span>
              <span>3D METROPOLIS</span>
            </button>
          </div>

          <button
            onClick={() => {
              soundManager.playFootstep();
              setShowHowToPlay(true);
            }}
            className="text-xs font-black font-arcade text-emerald-900 hover:underline flex items-center gap-1.5 mt-1 cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-emerald-700" />
            <span>HOW TO PLAY (RULES & SDGS)</span>
          </button>
        </div>
      </div>

      {/* Bottom Summary Bar */}
      <div className="w-full max-w-2xl mx-auto z-20 flex items-center justify-around bg-white/90 border-2 border-emerald-300 rounded-2xl p-2.5 text-xs font-black font-arcade text-slate-700 shadow-md">
        <div className="flex items-center gap-1 text-emerald-700">
          <span>💧 SDG 6</span>
          <span className="hidden sm:inline">WATER</span>
        </div>
        <div className="flex items-center gap-1 text-amber-700">
          <span>⚡ SDG 7</span>
          <span className="hidden sm:inline">ENERGY</span>
        </div>
        <div className="flex items-center gap-1 text-teal-700">
          <span>🏙️ SDG 11</span>
          <span className="hidden sm:inline">CITIES</span>
        </div>
        <div className="flex items-center gap-1 text-purple-700">
          <span>♻️ SDG 12</span>
          <span className="hidden sm:inline">CIRCULAR</span>
        </div>
        <div className="flex items-center gap-1 text-sky-700">
          <span>🌍 SDG 13</span>
          <span className="hidden sm:inline">CLIMATE</span>
        </div>
      </div>

      {/* How to Play Modal */}
      {showHowToPlay && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border-4 border-emerald-500 rounded-3xl p-6 text-slate-900 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-black font-arcade text-emerald-700 mb-4 flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-emerald-600" />
              GAME RULES & 3 PHASES
            </h2>

            <div className="space-y-3.5 text-xs text-slate-700 font-medium mb-6">
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
                <span className="font-black font-arcade text-emerald-800 text-sm block mb-1">
                  PHASE 1 — THE ESCAPE (3D RUNNER)
                </span>
                <p>
                  A towering Smog Monster is chasing you! Sprint through 3 lanes (A/D or Arrows), jump (W / Space), and slide (S / Down). You have <strong>5 lives</strong>. If you hit obstacles, the monster surges closer. If it catches you, it bites and takes 1 life! Reach the <strong>1,000m City Gates</strong> alive to enter the city!
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200">
                <span className="font-black font-arcade text-amber-800 text-sm block mb-1">
                  PHASE 2 — THE CRISIS DASHBOARD
                </span>
                <p>
                  Inside the gates, you discover the city is collapsing under extreme floods, power blackouts, drought, and toxic smog! Manage your 12:00 timer, prioritize limited disaster resources, and pick which of the 6 environmental crises to deploy into.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-sky-50 border border-sky-200">
                <span className="font-black font-arcade text-sky-800 text-sm block mb-1">
                  PHASE 3 — TACTILE ARENAS & RESTORATION
                </span>
                <p>
                  Each mission has a unique tactile interactive arena (drag flood barriers, unclog drains, repair high-pressure pipelines, route power lines, and plant native Miyawaki forests). Every decision has a strategic trade-off that permanently transforms the 3D metropolis!
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                soundManager.playFootstep();
                setShowHowToPlay(false);
              }}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 font-black font-arcade text-sm text-white cursor-pointer hover:bg-emerald-500 shadow-md"
            >
              GOT IT! LET'S PLAY
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
