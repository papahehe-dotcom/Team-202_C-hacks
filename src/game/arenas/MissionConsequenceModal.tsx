/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  CheckCircle2, ArrowRight, Sparkles, Building2, 
  TrendingUp, Scale, AlertCircle, HeartHandshake, Award
} from 'lucide-react';
import { MissionConsequence } from '../../types/ecoHero';
import { soundManager } from '../../audio/soundManager';

interface MissionConsequenceModalProps {
  consequence: MissionConsequence;
  onContinue: () => void;
  onGoToCity3D: () => void;
}

export const MissionConsequenceModal: React.FC<MissionConsequenceModalProps> = ({
  consequence,
  onContinue,
  onGoToCity3D,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 font-game select-none overflow-y-auto">
      <div className="bg-white border-4 border-emerald-500 rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl text-slate-900 animate-in zoom-in-95 my-auto max-h-[92vh] overflow-y-auto">
        {/* Top Header Badge */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-slate-100 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 border-2 border-emerald-400 flex items-center justify-center text-xl">
              🌟
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-emerald-600 font-arcade block">
                SUSTAINABILITY CONSEQUENCE REPORT
              </span>
              <h2 className="text-xl sm:text-2xl font-black font-arcade text-slate-900 leading-tight">
                {consequence.title} RESOLVED
              </h2>
            </div>
          </div>

          <div className="text-right">
            <span className="px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-black font-arcade">
              +{consequence.pointsEarned} ECO-POINTS
            </span>
          </div>
        </div>

        {/* 1. What the Player Changed (Direct Actions) */}
        <div className="mb-3.5">
          <h3 className="text-xs font-black font-arcade text-slate-700 flex items-center gap-1.5 mb-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>WHAT YOU PHYSICALLY CHANGED</span>
          </h3>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-1.5">
            {consequence.whatPlayerChanged.map((action, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs font-bold text-slate-700">
                <span className="text-emerald-500 mt-0.5">•</span>
                <span>{action}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 2. SDGs Improved (Scorecard Impact) */}
        <div className="mb-3.5">
          <h3 className="text-xs font-black font-arcade text-slate-700 flex items-center gap-1.5 mb-2">
            <TrendingUp className="w-4 h-4 text-sky-500" />
            <span>SDG SCORECARD IMPROVEMENTS</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Object.entries(consequence.sdgChanges).map(([sdgKey, delta]) => {
              const labels: Record<string, string> = {
                sdg3_good_health: 'SDG 3: Health',
                sdg6_clean_water: 'SDG 6: Clean Water',
                sdg7_clean_energy: 'SDG 7: Clean Energy',
                sdg9_infrastructure: 'SDG 9: Industry',
                sdg11_sustainable_cities: 'SDG 11: Cities',
                sdg12_responsible_consumption: 'SDG 12: Circular',
                sdg13_climate_action: 'SDG 13: Climate',
                sdg14_life_below_water: 'SDG 14: Oceans',
                sdg15_life_on_land: 'SDG 15: Land',
              };
              return (
                <div key={sdgKey} className="bg-sky-50 border border-sky-200 rounded-xl p-2 text-center">
                  <span className="text-[10px] font-bold text-sky-800 block truncate">
                    {labels[sdgKey] || sdgKey}
                  </span>
                  <span className="text-sm font-black font-arcade text-sky-600">
                    +{delta} PTS
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Trade-offs Made */}
        <div className="mb-3.5">
          <h3 className="text-xs font-black font-arcade text-slate-700 flex items-center gap-1.5 mb-1.5">
            <Scale className="w-4 h-4 text-amber-500" />
            <span>POLICY TRADE-OFF SELECTED</span>
          </h3>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs">
            <div className="font-black text-amber-900 mb-0.5">
              Policy Choice: {consequence.choiceMade}
            </div>
            <p className="font-medium text-amber-950 leading-relaxed">
              {consequence.tradeoffSummary}
            </p>
          </div>
        </div>

        {/* 4. Citizen & Environmental Impact */}
        <div className="mb-4">
          <h3 className="text-xs font-black font-arcade text-slate-700 flex items-center gap-1.5 mb-1.5">
            <HeartHandshake className="w-4 h-4 text-rose-500" />
            <span>CITIZEN & ENVIRONMENTAL IMPACT</span>
          </h3>
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-xs text-emerald-950 font-medium">
            {consequence.citizenAndEnvironmentImpact}
          </div>
        </div>

        {/* 5. Hackathon Sustainability Insight */}
        <div className="bg-slate-900 text-slate-100 rounded-2xl p-3 text-[11px] mb-5 border-2 border-slate-700">
          <div className="flex items-center gap-1.5 font-arcade text-amber-400 font-bold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>UN SUSTAINABLE DEVELOPMENT INSIGHT</span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            {consequence.hackathonTakeaway}
          </p>
        </div>

        {/* Bottom Navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-200">
          <button
            onClick={() => {
              soundManager.playBuild();
              onGoToCity3D();
            }}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 border-2 border-slate-300 text-slate-800 font-black font-arcade text-xs cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>🏙️ VIEW RESTORED 3D CITY</span>
          </button>

          <button
            onClick={() => {
              soundManager.playSuccess();
              onContinue();
            }}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 border-b-4 border-emerald-800 hover:brightness-105 active:translate-y-1 text-white font-black font-arcade text-sm shadow-xl flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>CONTINUE TO DASHBOARD</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
