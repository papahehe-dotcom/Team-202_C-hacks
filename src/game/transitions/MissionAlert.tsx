/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { AlertOctagon, ShieldAlert, Award, ArrowRight, Zap } from 'lucide-react';
import { ActiveMission } from '../../types/ecoHero';
import { soundManager } from '../../audio/soundManager';

interface MissionAlertProps {
  mission: ActiveMission;
  onDeploy: () => void;
}

export const MissionAlert: React.FC<MissionAlertProps> = ({ mission, onDeploy }) => {
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    soundManager.playSiren();
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fadeIn">
      {/* Flashing Hazard Stripes Frame */}
      <div className="relative w-full max-w-xl bg-slate-900 border-4 border-red-500 rounded-3xl p-6 shadow-2xl shadow-red-500/30 overflow-hidden">
        {/* Animated Scanlines */}
        <div
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, #ff0000 0px, #ff0000 2px, transparent 2px, transparent 8px)',
          }}
        />

        {/* Top Warning Banner */}
        <div className="flex items-center justify-between border-b-2 border-red-500/50 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center text-white animate-bounce shadow-lg shadow-red-600/50">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-red-500 text-white font-black font-arcade text-xs px-2 py-0.5 rounded uppercase">
                  {mission.threatLevel}
                </span>
                <span className="text-xs text-red-300 font-bold">{mission.location}</span>
              </div>
              <h2 className="text-2xl font-black font-arcade text-white tracking-wide mt-0.5">
                {mission.title}
              </h2>
            </div>
          </div>
        </div>

        {/* SDG Target & Description */}
        <div className="space-y-4 mb-6">
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold text-slate-300">
              <span className="text-emerald-400 font-arcade block">{mission.sdgTarget}</span>
              Metropolitan emergency intervention protocol
            </div>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed bg-black/40 p-4 rounded-xl border border-slate-800">
            {mission.description}
          </p>

          {/* Rewards Callout */}
          <div className="flex items-center justify-between bg-gradient-to-r from-amber-500/10 to-emerald-500/10 border border-amber-500/30 rounded-xl p-3">
            <span className="text-xs font-bold text-amber-300 uppercase font-arcade">SUCCESS REWARD:</span>
            <div className="flex items-center gap-4 text-sm font-black font-arcade">
              <span className="text-yellow-400">🪙 +{mission.rewardCoins} Eco Coins</span>
              <span className="text-emerald-400">🌿 +1 Action Token</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => {
            soundManager.playSuccess();
            onDeploy();
          }}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 border-2 border-yellow-300 border-b-6 border-red-950 font-black font-arcade text-lg text-white shadow-xl hover:brightness-110 active:translate-y-1 active:border-b-2 transition-all flex items-center justify-center gap-3 cursor-pointer"
        >
          <span>INTERVENE NOW ({countdown > 0 ? `${countdown}s` : 'READY'})</span>
          <ArrowRight className="w-6 h-6 animate-pulse" />
        </button>
      </div>
    </div>
  );
};
