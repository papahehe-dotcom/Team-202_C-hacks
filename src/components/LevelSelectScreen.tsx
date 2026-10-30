import React from 'react';
import { DayScenario } from '../types/game';
import { CAMPAIGN_SCENARIOS } from '../data/campaign';
import { Lock, CheckCircle2, Play, ArrowLeft, Star, Sparkles } from 'lucide-react';
import { gameAudio } from '../utils/audio';

interface LevelSelectScreenProps {
  unlockedDay: number;
  currentDay: number;
  onSelectDay: (dayNumber: number) => void;
  onBackToTitle: () => void;
  dailyScores: Record<number, number>;
}

export const LevelSelectScreen: React.FC<LevelSelectScreenProps> = ({
  unlockedDay,
  currentDay,
  onSelectDay,
  onBackToTitle,
  dailyScores,
}) => {
  const getCrisisEmoji = (theme: string) => {
    switch (theme) {
      case 'heat': return '🔥';
      case 'blackout': return '⚡';
      case 'pollution': return '🌫️';
      case 'shade': return '🌳';
      case 'energy_dilemma': return '💡';
      case 'vulnerable': return '🏥';
      case 'extreme': return '🚨';
      case 'final': return '🌍';
      default: return '🏙️';
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-sky-400 via-teal-300 to-emerald-300 p-4 md:p-6 text-slate-900 flex flex-col justify-between font-game select-none">
      {/* Top Header */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between pb-3">
        <button
          onClick={() => {
            gameAudio.playClick();
            onBackToTitle();
          }}
          className="game-btn game-btn-yellow px-3.5 py-1.5 text-xs font-arcade gap-1.5 shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>BACK TO TITLE</span>
        </button>

        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-arcade text-white drop-shadow-[0_4px_0_#0f766e]">
            MISSION ROADMAP
          </h2>
          <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
            Select a Day to Play & Save Verdantia
          </span>
        </div>

        <div className="w-24 hidden sm:block" />
      </div>

      {/* 8-Day Level Grid on a Road Path */}
      <main className="max-w-4xl mx-auto w-full my-auto py-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {CAMPAIGN_SCENARIOS.map((scenario) => {
            const isUnlocked = scenario.dayNumber <= unlockedDay;
            const isCompleted = scenario.dayNumber < unlockedDay || dailyScores[scenario.dayNumber] !== undefined;
            const isCurrent = scenario.dayNumber === currentDay;
            const score = dailyScores[scenario.dayNumber];

            return (
              <div
                key={scenario.dayNumber}
                onClick={() => {
                  if (isUnlocked) {
                    gameAudio.playClick();
                    onSelectDay(scenario.dayNumber);
                  } else {
                    gameAudio.playWarning();
                  }
                }}
                className={`p-3.5 rounded-3xl border-3 border-b-6 transition-all flex flex-col justify-between relative ${
                  isUnlocked
                    ? 'bg-white border-amber-300 border-b-amber-500 hover:-translate-y-1 hover:shadow-2xl cursor-pointer'
                    : 'bg-slate-200/80 border-slate-300 border-b-slate-400 opacity-60 cursor-not-allowed'
                } ${isCurrent ? 'ring-4 ring-yellow-400 scale-102 shadow-xl' : ''}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2.5 py-1 rounded-xl text-xs font-arcade uppercase ${
                      isUnlocked ? 'bg-amber-400 text-amber-950' : 'bg-slate-300 text-slate-600'
                    }`}>
                      DAY {scenario.dayNumber}
                    </span>

                    {isCompleted ? (
                      <span className="flex items-center gap-1 text-xs font-arcade text-emerald-600">
                        <CheckCircle2 className="w-4 h-4" />
                        {score && <span>{score} pts</span>}
                      </span>
                    ) : isUnlocked ? (
                      <span className="text-[10px] font-black uppercase text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                        Unlocked
                      </span>
                    ) : (
                      <Lock className="w-4 h-4 text-slate-400" />
                    )}
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-3xl p-1.5 bg-amber-50 rounded-2xl border border-amber-200">
                      {getCrisisEmoji(scenario.crisisTheme)}
                    </span>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 leading-tight">
                        {scenario.title}
                      </h4>
                      <span className="text-[11px] font-bold text-emerald-800">
                        {scenario.ambientTempC}°C Heatwave
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 font-medium leading-relaxed mb-3 line-clamp-2">
                    {scenario.subtitle}
                  </p>
                </div>

                {isUnlocked ? (
                  <button
                    className={`w-full py-2 game-btn text-xs font-arcade tracking-wider gap-1.5 ${
                      isCurrent ? 'game-btn-green' : 'game-btn-yellow'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{isCompleted ? 'REPLAY DAY' : 'START DAY'}</span>
                  </button>
                ) : (
                  <div className="w-full py-2 bg-slate-200 text-slate-400 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1">
                    <Lock className="w-3 h-3" />
                    <span>LOCKED</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>

      {/* Footer Info */}
      <div className="max-w-4xl mx-auto w-full text-center text-xs font-black text-emerald-950">
        <span>Complete each day's crisis to advance the story and save the city!</span>
      </div>
    </div>
  );
};
