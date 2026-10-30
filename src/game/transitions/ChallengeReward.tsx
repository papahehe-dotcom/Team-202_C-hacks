/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Award, ArrowRight, Home, CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import { TokenType } from '../../types/ecoHero';
import { soundManager } from '../../audio/soundManager';

interface ChallengeRewardProps {
  success: boolean;
  rewardCoins: number;
  rewardToken: TokenType;
  statsText: string;
  onResume: () => void;
  onGoToCity: () => void;
}

export const ChallengeReward: React.FC<ChallengeRewardProps> = ({
  success,
  rewardCoins,
  rewardToken,
  statsText,
  onResume,
  onGoToCity,
}) => {
  return (
    <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fadeIn">
      <div className="w-full max-w-lg bg-slate-900 border-4 border-emerald-500 rounded-3xl p-6 shadow-2xl shadow-emerald-500/30 text-white text-center">
        {/* Header Icon */}
        <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/40 animate-bounce">
          {success ? (
            <Sparkles className="w-12 h-12 text-white" />
          ) : (
            <XCircle className="w-12 h-12 text-white" />
          )}
        </div>

        <h2 className="text-3xl font-black font-arcade tracking-wide mb-1 text-white">
          {success ? 'MISSION ACCOMPLISHED!' : 'SECTOR OVERRUN!'}
        </h2>
        <p className="text-sm font-bold text-emerald-400 mb-6">
          {success
            ? 'Environmental crisis averted! Citizens and wildlife protected.'
            : 'City infrastructure sustained damage. Re-attempt on your next run.'}
        </p>

        {/* Stats Callout */}
        <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 mb-6 space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            OUTCOME SUMMARY
          </div>
          <div className="text-lg font-black font-arcade text-white">{statsText}</div>

          {success && (
            <div className="pt-2 border-t border-slate-700/60 flex items-center justify-around">
              <div>
                <div className="text-xs text-slate-400 font-bold uppercase">Coins Banked</div>
                <div className="text-2xl font-black font-arcade text-yellow-400">+{rewardCoins}</div>
              </div>
              <div className="h-8 w-px bg-slate-700" />
              <div>
                <div className="text-xs text-slate-400 font-bold uppercase">Token Earned</div>
                <div className="text-2xl font-black font-arcade text-emerald-400">+1 {rewardToken.toUpperCase()}</div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => {
              soundManager.playBuild();
              onGoToCity();
            }}
            className="py-3.5 rounded-2xl bg-slate-800 border-2 border-slate-600 border-b-4 border-slate-950 font-black font-arcade text-sm text-slate-200 hover:bg-slate-700 active:translate-y-1 active:border-b-2 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4 text-emerald-400" />
            CITY BUILDER
          </button>
          <button
            onClick={() => {
              soundManager.playJump();
              onResume();
            }}
            className="py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 border-2 border-emerald-300 border-b-4 border-emerald-950 font-black font-arcade text-sm text-white hover:brightness-110 active:translate-y-1 active:border-b-2 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>RESUME RUN</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
