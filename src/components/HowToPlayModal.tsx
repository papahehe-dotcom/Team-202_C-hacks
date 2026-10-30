import React, { useState } from 'react';
import { Earthy } from './Earthy';
import { ArrowRight, CheckCircle2, Coins, Lightbulb, Zap, X, SkipForward, Play } from 'lucide-react';
import { gameAudio } from '../utils/audio';

interface HowToPlayModalProps {
  onClose: () => void;
  onStartCampaign: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({
  onClose,
  onStartCampaign,
}) => {
  const [step, setStep] = useState<number>(1);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 font-game select-none">
      <div className="bg-slate-900 border-4 border-amber-400 rounded-3xl max-w-xl w-full p-4 sm:p-6 shadow-2xl flex flex-col max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-150 text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎮</span>
            <div>
              <h3 className="text-base sm:text-lg font-arcade text-white">HOW TO PLAY</h3>
              <p className="text-xs text-amber-300 font-bold">Rule Book: Step {step} of 2</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                gameAudio.playClick();
                onStartCampaign();
              }}
              className="text-xs font-arcade text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <span>SKIP</span>
              <SkipForward className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                gameAudio.playClick();
                onClose();
              }}
              className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {step === 1 ? (
          /* Step 1: Currency & Daily Allowance */
          <div className="space-y-4">
            <div className="p-3.5 bg-amber-500/20 border-2 border-amber-400/40 rounded-2xl flex items-center gap-3">
              <span className="text-4xl animate-bounce">🪙</span>
              <div>
                <h4 className="text-sm font-arcade text-amber-300">WHAT IS CC? (CITY CREDITS)</h4>
                <p className="text-xs text-slate-200 leading-relaxed mt-0.5 font-medium">
                  <strong>CC are virtual game coins!</strong> Use them to build solar roofs, plant cooling trees, and open water stations. They are 100% in-game currency, not real money!
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 bg-emerald-950/60 border-2 border-emerald-500/50 rounded-2xl">
                <span className="text-xl block mb-0.5">💰 Starting Budget</span>
                <strong className="text-emerald-300 font-arcade text-base block">1,500 CC</strong>
                <span className="text-[11px] text-slate-300">You begin Day 1 with 1,500 CC to tackle the initial crises.</span>
              </div>

              <div className="p-3 bg-sky-950/60 border-2 border-sky-500/50 rounded-2xl">
                <span className="text-xl block mb-0.5">🌅 Daily Bonus</span>
                <strong className="text-sky-300 font-arcade text-base block">+50 CC / Morning</strong>
                <span className="text-[11px] text-slate-300">Every new sunrise gives your city 50 extra free coins to spend.</span>
              </div>
            </div>

            {/* Earthy Performance Rewards */}
            <div className="p-3 bg-slate-800/90 border border-slate-700 rounded-2xl text-xs">
              <h5 className="font-arcade text-amber-300 mb-1 flex items-center gap-1.5">
                <span>⭐</span>
                <span>EARTHY'S DAILY BONUS REWARDS</span>
              </h5>
              <p className="text-[11px] text-slate-300 leading-relaxed mb-2">
                Make balanced decisions each day to earn huge performance rewards from Earthy:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-center font-arcade text-[11px]">
                <div className="p-2 bg-emerald-900/60 border border-emerald-500 text-emerald-300 rounded-xl">90-100: +150 CC</div>
                <div className="p-2 bg-sky-900/60 border border-sky-500 text-sky-300 rounded-xl">75-89: +100 CC</div>
                <div className="p-2 bg-amber-900/60 border border-amber-500 text-amber-300 rounded-xl">50-74: +60 CC</div>
                <div className="p-2 bg-rose-900/60 border border-rose-500 text-rose-300 rounded-xl">&lt;50: +20 CC</div>
              </div>
            </div>
          </div>
        ) : (
          /* Step 2: How to Play and Important Rules */
          <div className="space-y-3 text-xs">
            <h4 className="font-arcade text-amber-300 text-sm">3 KEY RULES TO WIN</h4>

            <div className="space-y-2">
              <div className="flex items-start gap-2.5 p-2.5 bg-slate-800/90 rounded-2xl border border-slate-700">
                <span className="p-1 rounded-lg bg-rose-500/30 text-rose-300 font-arcade">1</span>
                <div>
                  <strong className="text-white block font-bold">1. Watch the Power Grid! ⚡</strong>
                  <span className="text-slate-300 text-[11px]">Heavy air-conditioning uses lots of electricity. If Power Grid drops below 25%, the city suffers a blackout! Invest in solar energy or insulation first.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 bg-slate-800/90 rounded-2xl border border-slate-700">
                <span className="p-1 rounded-lg bg-emerald-500/30 text-emerald-300 font-arcade">2</span>
                <div>
                  <strong className="text-white block font-bold">2. Plant Trees & Open Water Hubs! 🌲💧</strong>
                  <span className="text-slate-300 text-[11px]">Trees naturally cool streets and clean smoke without burning power. Drinking water prevents heat exhaustion!</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 bg-slate-800/90 rounded-2xl border border-slate-700">
                <span className="p-1 rounded-lg bg-cyan-500/30 text-cyan-300 font-arcade">3</span>
                <div>
                  <strong className="text-white block font-bold">3. Clean the Air for Health! 🍃</strong>
                  <span className="text-slate-300 text-[11px]">Factory scrubbers and electric buses eliminate toxic smog and bring back bright blue skies.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Navigation Buttons */}
        <div className="pt-4 mt-3 border-t-2 border-slate-800 flex items-center justify-between gap-2">
          {step === 2 ? (
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 game-btn bg-slate-800 text-slate-300 hover:text-white text-xs font-arcade"
            >
              ◀ BACK
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            {step === 1 ? (
              <button
                onClick={() => setStep(2)}
                className="px-6 py-2.5 game-btn game-btn-yellow text-xs font-arcade gap-1.5"
              >
                <span>NEXT: WIN RULES</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => {
                  gameAudio.playSuccess();
                  onStartCampaign();
                }}
                className="px-8 py-3 game-btn game-btn-green text-sm font-arcade tracking-wider gap-2 shadow-xl hover:scale-105"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>START MISSION NOW!</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
