/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { RotateCcw, Home, Trophy, Building2, AlertTriangle, ArrowRight } from 'lucide-react';
import { soundManager } from '../audio/soundManager';
import { TokenType } from '../types/ecoHero';

interface GameOverScreenProps {
  distance: number;
  coins: number;
  score: number;
  tokens: Record<TokenType, number>;
  isNewHigh: boolean;
  onRestart: () => void;
  onOpenCityCommand: () => void;
  onBackToTitle: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({
  distance,
  coins,
  score,
  tokens,
  isNewHigh,
  onRestart,
  onOpenCityCommand,
  onBackToTitle,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 select-none font-game animate-fadeIn overflow-y-auto">
      <div className="w-full max-w-md bg-white border-4 border-rose-500 rounded-3xl p-6 shadow-2xl text-center text-slate-900 animate-in zoom-in-95 max-h-[92vh] overflow-y-auto my-auto">
        {/* Monster Icon Header */}
        <div className="w-16 h-16 mx-auto mb-2 rounded-2xl bg-rose-100 border-2 border-rose-400 flex items-center justify-center text-3xl shadow">
          👹
        </div>

        {isNewHigh && (
          <div className="mb-2 inline-block px-3 py-1 rounded-full bg-amber-100 border border-amber-400 text-amber-800 font-arcade text-xs font-black animate-pulse">
            ★ NEW HIGH SCORE RECORD! ★
          </div>
        )}

        <h2 className="text-2xl sm:text-3xl font-black font-arcade text-rose-600 tracking-tight leading-none mb-1">
          ALL 5 LIVES LOST!
        </h2>
        <p className="text-xs text-slate-500 font-bold mb-4">
          The Smog Monster caught up with you before reaching the city gates.
        </p>

        {/* Score Breakdown Card */}
        <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 mb-5 space-y-2.5 text-left">
          <div className="flex justify-between items-center">
            <span className="text-[11px] text-slate-500 font-black font-arcade uppercase">TOTAL SCORE</span>
            <span className="text-xl font-black font-arcade text-emerald-600">
              {score.toLocaleString()} PTS
            </span>
          </div>

          <div className="h-px bg-slate-200" />

          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[9px] text-slate-400 font-black font-arcade uppercase block">DISTANCE ESCAPED</span>
              <span className="text-base font-black font-arcade text-sky-600">{distance} M / 1000 M</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-400 font-black font-arcade uppercase block">COINS HARVESTED</span>
              <span className="text-base font-black font-arcade text-amber-600">+{coins} 🪙</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={() => {
              soundManager.playSuccess();
              onRestart();
            }}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 border-b-4 border-emerald-800 font-black font-arcade text-base text-white shadow-xl hover:brightness-105 active:translate-y-1 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
            <span>PLAY AGAIN (RESTART ESCAPE)</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onOpenCityCommand();
            }}
            className="w-full py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 border-2 border-slate-300 font-black font-arcade text-xs text-emerald-800 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <Building2 className="w-4 h-4 text-emerald-600" />
            <span>ENTER ECO-CITY COMMAND DIRECTLY</span>
          </button>

          <button
            onClick={onBackToTitle}
            className="w-full py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
          >
            Return to Title Screen
          </button>
        </div>
      </div>
    </div>
  );
};
