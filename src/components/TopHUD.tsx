import React from 'react';
import { CityIndicators, DayScenario } from '../types/game';
import { ShieldCheck, Zap, Wind, Trees, Smile, Volume2, VolumeX, BookOpen, History, BarChart3, RotateCcw } from 'lucide-react';
import { gameAudio } from '../utils/audio';

interface TopHUDProps {
  day: DayScenario;
  cityCredits: number;
  indicators: CityIndicators;
  onOpenTutorial: () => void;
  onOpenHistory: () => void;
  onOpenStatus: () => void;
  onRestart: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const TopHUD: React.FC<TopHUDProps> = ({
  day,
  cityCredits,
  indicators,
  onOpenTutorial,
  onOpenHistory,
  onOpenStatus,
  onRestart,
  isMuted,
  onToggleMute,
}) => {
  const {
    citizenSafety,
    energyStability,
    airQuality,
    environmentalHealth,
    publicWellbeing,
  } = indicators;

  // Simple kid-friendly arcade health tags
  const getSafetyTag = (v: number) => (v >= 75 ? 'SUPER SAFE' : v >= 45 ? 'HEAT ALERT' : 'CRISIS!');
  const getEnergyTag = (v: number) => (v >= 65 ? 'POWER OK' : v >= 35 ? 'HEAVY LOAD' : 'BLACKOUT!');
  const getAirTag = (v: number) => (v >= 70 ? 'CLEAN AIR' : v >= 45 ? 'HAZY' : 'SMOGGY!');
  const getGreenTag = (v: number) => (v >= 70 ? 'COOL & LUSH' : v >= 40 ? 'SOME SHADE' : 'NEEDS TREES');
  const getHappyTag = (v: number) => (v >= 70 ? 'SUPER HAPPY' : v >= 45 ? 'CHILL' : 'UNHAPPY');

  return (
    <header className="bg-gradient-to-b from-slate-900 to-slate-800 text-white px-3 md:px-5 py-2.5 shadow-2xl border-b-4 border-slate-950 sticky top-0 z-40 select-none">
      <div className="max-w-7xl mx-auto flex flex-col gap-2">
        {/* Top Tier: Level Ribbon, City Coins Chest, and Console Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          {/* Level / Day Badge */}
          <div className="flex items-center gap-2.5">
            <div className="game-btn game-btn-yellow px-3.5 py-1.5 text-xs tracking-wider uppercase font-black flex items-center gap-2 shadow-md">
              <span className="text-base animate-bounce" style={{ animationDuration: '1.8s' }}>☀️</span>
              <span className="text-amber-950 font-arcade">DAY {day.dayNumber}/8</span>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs md:text-sm font-black text-amber-300 drop-shadow-sm">
                  {day.title}
                </span>
                <span className="text-[10px] bg-emerald-500/30 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-400/30">
                  {day.ambientTempC}°C HEAT
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium hidden sm:block line-clamp-1">
                {day.subtitle}
              </p>
            </div>
          </div>

          {/* Right Console: Golden Coins Chest + 3D Game Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* 3D Golden City Credits Chest */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 rounded-2xl border-2 border-yellow-200 border-b-4 border-amber-700 shadow-lg">
              <span className="text-xl animate-wobble">🪙</span>
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider block text-amber-950 leading-none">
                  COINS
                </span>
                <span className="text-sm font-black font-arcade text-amber-950 leading-tight">
                  {cityCredits.toLocaleString()} CC
                </span>
              </div>
            </div>

            {/* Game Quick Action Buttons */}
            <div className="flex items-center gap-1.5 bg-slate-800/90 p-1 rounded-2xl border-2 border-slate-700 shadow-inner">
              <button
                onClick={() => {
                  gameAudio.playClick();
                  onOpenTutorial();
                }}
                className="game-btn game-btn-blue px-2.5 py-1 text-xs gap-1"
                title="How to Play"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span className="hidden md:inline font-bold">RULES</span>
              </button>

              <button
                onClick={() => {
                  gameAudio.playClick();
                  onOpenHistory();
                }}
                title="History Log"
                className="game-btn bg-slate-700 hover:bg-slate-600 text-slate-200 p-1.5 border border-slate-600 border-b-3 border-slate-900"
              >
                <History className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  gameAudio.playClick();
                  onOpenStatus();
                }}
                title="City Indicators"
                className="game-btn bg-slate-700 hover:bg-slate-600 text-slate-200 p-1.5 border border-slate-600 border-b-3 border-slate-900"
              >
                <BarChart3 className="w-4 h-4" />
              </button>

              <button
                onClick={onToggleMute}
                title={isMuted ? 'Turn Sound ON' : 'Turn Sound OFF'}
                className="game-btn bg-slate-700 hover:bg-slate-600 text-slate-200 p-1.5 border border-slate-600 border-b-3 border-slate-900"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-amber-300 animate-pulse" />}
              </button>

              <button
                onClick={() => {
                  gameAudio.playClick();
                  onRestart();
                }}
                title="Restart Mission"
                className="game-btn bg-rose-700 hover:bg-rose-600 text-white p-1.5 border border-rose-500 border-b-3 border-rose-950"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 5 Candy Health / Energy Meters (Juicy Arcade Vibe) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {/* 1. Citizen Health */}
          <div className="p-2 rounded-2xl bg-slate-800/90 border-2 border-slate-700/80 shadow-md">
            <div className="flex items-center justify-between text-xs font-black mb-1">
              <span className="flex items-center gap-1.5 text-rose-300">
                <span className="text-sm">❤️</span>
                <span>Health</span>
              </span>
              <span className="font-arcade text-white text-[11px]">{citizenSafety}%</span>
            </div>
            <div className="candy-bar-track h-2.5 bg-slate-950 border-slate-800">
              <div
                className={`candy-bar-fill transition-all duration-300 ${
                  citizenSafety < 40 ? 'bg-gradient-to-r from-red-600 to-rose-500' : citizenSafety < 70 ? 'bg-gradient-to-r from-amber-500 to-yellow-400' : 'bg-gradient-to-r from-emerald-500 to-green-400'
                }`}
                style={{ width: `${citizenSafety}%` }}
              />
            </div>
            <span className="text-[9px] font-black text-rose-200 block mt-1 tracking-wider uppercase truncate">
              {getSafetyTag(citizenSafety)}
            </span>
          </div>

          {/* 2. Power Grid */}
          <div className={`p-2 rounded-2xl border-2 shadow-md ${
            energyStability < 30 ? 'bg-rose-950/60 border-rose-500 animate-pulse' : 'bg-slate-800/90 border-slate-700/80'
          }`}>
            <div className="flex items-center justify-between text-xs font-black mb-1">
              <span className="flex items-center gap-1.5 text-amber-300">
                <span className="text-sm">⚡</span>
                <span>Power Grid</span>
              </span>
              <span className="font-arcade text-white text-[11px]">{energyStability}%</span>
            </div>
            <div className="candy-bar-track h-2.5 bg-slate-950 border-slate-800">
              <div
                className={`candy-bar-fill transition-all duration-300 ${
                  energyStability < 35 ? 'bg-gradient-to-r from-rose-600 to-red-500' : energyStability < 65 ? 'bg-gradient-to-r from-amber-500 to-yellow-400' : 'bg-gradient-to-r from-sky-400 to-blue-500'
                }`}
                style={{ width: `${energyStability}%` }}
              />
            </div>
            <span className={`text-[9px] font-black block mt-1 tracking-wider uppercase truncate ${energyStability < 35 ? 'text-rose-300 animate-bounce' : 'text-amber-200'}`}>
              {getEnergyTag(energyStability)}
            </span>
          </div>

          {/* 3. Fresh Air */}
          <div className="p-2 rounded-2xl bg-slate-800/90 border-2 border-slate-700/80 shadow-md">
            <div className="flex items-center justify-between text-xs font-black mb-1">
              <span className="flex items-center gap-1.5 text-cyan-300">
                <span className="text-sm">🍃</span>
                <span>Fresh Air</span>
              </span>
              <span className="font-arcade text-white text-[11px]">{airQuality}%</span>
            </div>
            <div className="candy-bar-track h-2.5 bg-slate-950 border-slate-800">
              <div
                className={`candy-bar-fill transition-all duration-300 ${
                  airQuality < 45 ? 'bg-gradient-to-r from-orange-600 to-amber-500' : airQuality < 70 ? 'bg-gradient-to-r from-yellow-400 to-lime-400' : 'bg-gradient-to-r from-teal-400 to-emerald-400'
                }`}
                style={{ width: `${airQuality}%` }}
              />
            </div>
            <span className="text-[9px] font-black text-cyan-200 block mt-1 tracking-wider uppercase truncate">
              {getAirTag(airQuality)}
            </span>
          </div>

          {/* 4. Nature & Trees */}
          <div className="p-2 rounded-2xl bg-slate-800/90 border-2 border-slate-700/80 shadow-md">
            <div className="flex items-center justify-between text-xs font-black mb-1">
              <span className="flex items-center gap-1.5 text-emerald-300">
                <span className="text-sm">🌳</span>
                <span>Nature</span>
              </span>
              <span className="font-arcade text-white text-[11px]">{environmentalHealth}%</span>
            </div>
            <div className="candy-bar-track h-2.5 bg-slate-950 border-slate-800">
              <div
                className={`candy-bar-fill transition-all duration-300 ${
                  environmentalHealth < 40 ? 'bg-gradient-to-r from-amber-600 to-yellow-500' : 'bg-gradient-to-r from-lime-400 to-emerald-400'
                }`}
                style={{ width: `${environmentalHealth}%` }}
              />
            </div>
            <span className="text-[9px] font-black text-emerald-200 block mt-1 tracking-wider uppercase truncate">
              {getGreenTag(environmentalHealth)}
            </span>
          </div>

          {/* 5. City Happiness */}
          <div className="p-2 rounded-2xl bg-slate-800/90 border-2 border-slate-700/80 shadow-md col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-xs font-black mb-1">
              <span className="flex items-center gap-1.5 text-violet-300">
                <span className="text-sm">😊</span>
                <span>Happiness</span>
              </span>
              <span className="font-arcade text-white text-[11px]">{publicWellbeing}%</span>
            </div>
            <div className="candy-bar-track h-2.5 bg-slate-950 border-slate-800">
              <div
                className={`candy-bar-fill transition-all duration-300 ${
                  publicWellbeing < 45 ? 'bg-gradient-to-r from-rose-500 to-pink-500' : 'bg-gradient-to-r from-violet-400 to-fuchsia-400'
                }`}
                style={{ width: `${publicWellbeing}%` }}
              />
            </div>
            <span className="text-[9px] font-black text-violet-200 block mt-1 tracking-wider uppercase truncate">
              {getHappyTag(publicWellbeing)}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
