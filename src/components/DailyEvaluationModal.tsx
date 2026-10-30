import React, { useEffect } from 'react';
import { DayResult, CityIndicators } from '../types/game';
import { Earthy } from './Earthy';
import { ArrowRight, Trophy, TrendingUp, TrendingDown, Coins, Star, Sparkles } from 'lucide-react';
import { gameAudio } from '../utils/audio';

interface DailyEvaluationModalProps {
  dayResult: DayResult;
  indicators: CityIndicators;
  totalCredits: number;
  onContinue: () => void;
  isLastDay: boolean;
}

export const DailyEvaluationModal: React.FC<DailyEvaluationModalProps> = ({
  dayResult,
  indicators,
  totalCredits,
  onContinue,
  isLastDay,
}) => {
  const { score, title, bonusCC, earthyComment, totalSpentToday } = dayResult;

  useEffect(() => {
    gameAudio.playCelebration();
    gameAudio.speak(earthyComment);
    return () => gameAudio.stopSpeaking();
  }, [earthyComment]);

  const earthyMood = score >= 80 ? 'cheering' : score >= 60 ? 'happy' : 'worried';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none">
      <div className="bg-slate-900 border-4 border-amber-400 rounded-3xl max-w-xl w-full p-4 sm:p-6 shadow-2xl flex flex-col max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-200 text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-slate-800 mb-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-arcade text-amber-400 tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>DAY {dayResult.day} MISSION COMPLETE!</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-arcade text-white mt-1">
              DAILY REPORT CARD
            </h3>
          </div>

          {/* Environmental Score Stamp */}
          <div className="px-3.5 py-2 bg-gradient-to-br from-amber-400 to-yellow-500 border-2 border-yellow-200 border-b-4 border-amber-700 rounded-2xl text-center shadow-lg text-slate-950">
            <span className="text-[10px] font-black uppercase block leading-none">SCORE</span>
            <span className="text-xl font-arcade text-slate-950 font-black">{score}/100</span>
          </div>
        </div>

        {/* Rank Badge + Earthy Speech */}
        <div className="mb-4">
          <div className="inline-block px-3.5 py-1 rounded-xl bg-emerald-500/20 border-2 border-emerald-400 text-emerald-300 text-xs font-arcade uppercase mb-3">
            ⭐ RANK: {title}
          </div>
          <Earthy
            mood={earthyMood}
            dialogue={earthyComment}
            size="md"
            showSpeechBubble={true}
          />
        </div>

        {/* Financial Recap & Bonus CC Reward (Arcade Coin Chest Style) */}
        <div className="p-3 bg-slate-800 border-2 border-amber-400/40 rounded-2xl mb-4 flex items-center justify-between text-xs sm:text-sm">
          <div>
            <span className="text-slate-400 text-[11px] block font-semibold">Coins Spent:</span>
            <strong className="text-rose-400 font-arcade">-{totalSpentToday} CC</strong>
          </div>

          <div className="text-center px-2 py-1 bg-amber-400/20 rounded-xl border border-amber-400/40">
            <span className="text-[10px] text-amber-300 font-black uppercase block">Mayor Bonus:</span>
            <strong className="text-amber-300 text-base font-arcade">+{bonusCC} CC 🪙</strong>
          </div>

          <div className="text-right">
            <span className="text-slate-400 text-[11px] block font-semibold">City Vault:</span>
            <strong className="text-emerald-400 font-arcade text-sm sm:text-base">{totalCredits} CC</strong>
          </div>
        </div>

        {/* 5 City Status Readouts */}
        <div className="grid grid-cols-5 gap-1.5 text-center text-xs mb-5">
          <div className="p-1.5 bg-slate-800/90 border border-slate-700 rounded-xl">
            <span className="text-[10px] text-rose-300 block font-bold">❤️ Health</span>
            <strong className="text-white font-arcade text-xs">{indicators.citizenSafety}%</strong>
          </div>
          <div className="p-1.5 bg-slate-800/90 border border-slate-700 rounded-xl">
            <span className="text-[10px] text-amber-300 block font-bold">⚡ Grid</span>
            <strong className="text-white font-arcade text-xs">{indicators.energyStability}%</strong>
          </div>
          <div className="p-1.5 bg-slate-800/90 border border-slate-700 rounded-xl">
            <span className="text-[10px] text-cyan-300 block font-bold">🍃 Air</span>
            <strong className="text-white font-arcade text-xs">{indicators.airQuality}%</strong>
          </div>
          <div className="p-1.5 bg-slate-800/90 border border-slate-700 rounded-xl">
            <span className="text-[10px] text-emerald-300 block font-bold">🌳 Nature</span>
            <strong className="text-white font-arcade text-xs">{indicators.environmentalHealth}%</strong>
          </div>
          <div className="p-1.5 bg-slate-800/90 border border-slate-700 rounded-xl">
            <span className="text-[10px] text-violet-300 block font-bold">😊 Joy</span>
            <strong className="text-white font-arcade text-xs">{indicators.publicWellbeing}%</strong>
          </div>
        </div>

        {/* Big 3D Continue Button */}
        <button
          onClick={() => {
            gameAudio.playClick();
            onContinue();
          }}
          className="w-full py-3.5 game-btn game-btn-green text-sm sm:text-base font-arcade tracking-wider gap-2 shadow-xl hover:scale-102"
        >
          <span>{isLastDay ? 'SEE FINAL VERDICT 🏆' : `ADVANCE TO DAY ${dayResult.day + 1} ▶`}</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
