/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ArrowLeft, Droplets, CheckCircle2, Sparkles, Building, Heart, Wheat, Check } from 'lucide-react';
import { soundManager } from '../../audio/soundManager';
import confetti from 'canvas-confetti';
import { MissionConsequence } from '../../types/ecoHero';

interface TheLastDropArenaProps {
  onComplete: (consequence: MissionConsequence) => void;
  onExit: () => void;
}

interface RepairToolItem {
  id: string;
  name: string;
  icon: string;
  applied: boolean;
  isValid: boolean;
}

interface PipeTarget {
  id: string;
  name: string;
  icon: string;
  desc: string;
  connected: boolean;
}

export const TheLastDropArena: React.FC<TheLastDropArenaProps> = ({ onComplete, onExit }) => {
  // Step 1: Physical tools to test on the burst pipe (trial and error)
  const [tools, setTools] = useState<RepairToolItem[]>([
    { id: 'gasket', name: 'Rubber O-Ring Gasket', icon: '🛟', applied: false, isValid: true },
    { id: 'towel', name: 'Paper Towel', icon: '🧻', applied: false, isValid: false },
    { id: 'tape', name: 'Waterproof Seal Tape', icon: '🩹', applied: false, isValid: true },
    { id: 'gum', name: 'Sticky Chewing Gum', icon: '🍬', applied: false, isValid: false },
    { id: 'clamp', name: 'Heavy Steel Clamp', icon: '🔩', applied: false, isValid: true },
    { id: 'wrench', name: 'Torque Wrench', icon: '🔧', applied: false, isValid: true },
  ]);

  // Step 2: 3 municipal water distribution targets
  const [targets, setTargets] = useState<PipeTarget[]>([
    { id: 'hospital', name: 'Trauma Hospital', icon: '🏥', desc: 'Emergency medical care unit', connected: false },
    { id: 'homes', name: 'Residential District', icon: '🏡', desc: 'Neighborhood homes & apartments', connected: false },
    { id: 'farms', name: 'Urban Greenhouses', icon: '🌾', desc: 'Municipal food agriculture crops', connected: false },
  ]);

  const [selectedToolId, setSelectedToolId] = useState<string | null>(null);
  const [selectedPipe, setSelectedPipe] = useState<boolean>(false);
  const [isHoveringDropZone, setIsHoveringDropZone] = useState(false);
  const [wrongTarget, setWrongTarget] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string>('Test tools on the leaking pipe to discover what will hold 80 PSI pressure!');
  const [activeStep, setActiveStep] = useState<'SEAL_PIPE' | 'CONNECT_WATER' | 'COMPLETED'>('SEAL_PIPE');

  const validToolsAppliedCount = tools.filter((t) => t.isValid && t.applied).length;
  const isPipeFullySealed = validToolsAppliedCount === 4;
  const targetsConnectedCount = targets.filter((t) => t.connected).length;

  // Handle Drag & Drop of tools onto the pipe
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    setSelectedToolId(id);
  };

  const handleApplyTool = (toolId: string) => {
    const targetTool = tools.find((t) => t.id === toolId);
    if (!targetTool || targetTool.applied) return;

    if (!targetTool.isValid) {
      soundManager.playSortWrong();
      setWrongTarget(true);
      setFeedbackMsg(`❌ ${targetTool.name} blew apart under 80 PSI water pressure! Try industrial plumbing gear.`);
      setTimeout(() => setWrongTarget(false), 700);
      setSelectedToolId(null);
      return;
    }

    soundManager.playBuild();
    setFeedbackMsg(`✓ Installed ${targetTool.name}! Leak pressure dropping.`);

    setTools((prev) => {
      const next = prev.map((t) => (t.id === toolId ? { ...t, applied: true } : t));
      const count = next.filter((t) => t.isValid && t.applied).length;

      if (count === 4) {
        soundManager.playSuccess();
        confetti({ particleCount: 65, spread: 60, origin: { y: 0.5 } });
        setFeedbackMsg('🎉 Burst pipe fully sealed! Next: route clean water to city facilities.');
        setTimeout(() => setActiveStep('CONNECT_WATER'), 1200);
      }
      return next;
    });

    setSelectedToolId(null);
  };

  const handleConnectTarget = (targetId: string) => {
    soundManager.playBuild();
    setTargets((prev) => {
      const next = prev.map((tgt) => (tgt.id === targetId ? { ...tgt, connected: true } : tgt));
      const count = next.filter((t) => t.connected).length;
      if (count === 3) {
        soundManager.playSuccess();
        confetti({ particleCount: 90, spread: 70, origin: { y: 0.5 } });
        setActiveStep('COMPLETED');
      }
      return next;
    });
    setSelectedPipe(false);
  };

  const handleFinishMission = () => {
    const consequence: MissionConsequence = {
      missionId: 'last_drop',
      title: 'The Last Drop: Leaking Pipe Fixed!',
      success: true,
      pointsEarned: 35,
      resourcesSpent: 20,
      choiceMade: 'Sealed Burst Pipe & Connected Water Network',
      tradeoffSummary: 'Fixing pipeline leaks saves municipal water without depleting groundwater reserves.',
      sdgChanges: {
        sdg6_clean_water: 35,
        sdg11_sustainable_cities: 25,
      },
      citySafetyChange: 20,
      whatPlayerChanged: [
        'Sealed high-pressure water pipe joint and cracks with gasket and clamp',
        'Connected clean water pipeline to Trauma Hospital',
        'Restored fresh drinking water to residential homes and farms',
      ],
      citizenAndEnvironmentImpact: 'Over 50,000 liters of clean water saved daily, ensuring uninterrupted drinking water for hospitals and homes.',
      hackathonTakeaway: 'Preventing infrastructure water leaks is the fastest, cleanest way to secure a city’s water future.',
    };
    onComplete(consequence);
  };

  return (
    <div className="relative w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 select-none font-sans overflow-y-auto">
      {/* Header Bar */}
      <div className="w-full max-w-4xl mx-auto flex items-center justify-between z-20">
        <button
          onClick={onExit}
          className="px-4 py-2 rounded-2xl bg-slate-900 border-2 border-slate-700 hover:bg-slate-800 text-slate-200 font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Arena</span>
        </button>

        <div className="flex items-center gap-2 bg-slate-900/90 border-2 border-cyan-500/50 rounded-2xl px-4 py-2 shadow-xl">
          <Droplets className="w-5 h-5 text-cyan-400 animate-bounce" />
          <div>
            <span className="text-[10px] font-black uppercase text-cyan-400 font-mono block">
              MISSION 2: THE LAST DROP
            </span>
            <span className="text-xs sm:text-sm font-black text-white">
              {activeStep === 'SEAL_PIPE'
                ? `STEP 1: REPAIR THE BURST WATER PIPE (${validToolsAppliedCount}/4)`
                : activeStep === 'CONNECT_WATER'
                ? `STEP 2: DISTRIBUTE CLEAN WATER (${targetsConnectedCount}/3)`
                : 'MISSION ACCOMPLISHED!'}
            </span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-cyan-300">
          💧 Water Saved: {validToolsAppliedCount * 25}%
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="w-full max-w-4xl mx-auto my-4 flex-1 flex flex-col items-center justify-center">
        {/* STEP 1: FIX THE LEAKING PIPE */}
        {activeStep === 'SEAL_PIPE' && (
          <div className="w-full flex flex-col items-center gap-6">
            {/* Friendly Feedback / Instruction Banner */}
            <div className={`rounded-2xl px-6 py-3 text-center max-w-lg shadow-xl border-2 transition-all ${
              wrongTarget
                ? 'bg-rose-950/90 border-rose-400 text-rose-200'
                : 'bg-cyan-950/70 border-cyan-400/60 text-cyan-200'
            }`}>
              <span className="text-xs sm:text-sm font-bold">
                {feedbackMsg}
              </span>
            </div>

            {/* Big Interactive Pipe & Leak Target */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsHoveringDropZone(true);
              }}
              onDragLeave={() => setIsHoveringDropZone(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsHoveringDropZone(false);
                const toolId = e.dataTransfer.getData('text/plain');
                if (toolId) handleApplyTool(toolId);
              }}
              onClick={() => {
                if (selectedToolId) handleApplyTool(selectedToolId);
              }}
              className={`relative w-full max-w-xl h-64 sm:h-72 rounded-3xl border-4 transition-all flex flex-col items-center justify-center p-6 shadow-2xl cursor-pointer ${
                wrongTarget
                  ? 'border-rose-500 bg-rose-950/40 ring-4 ring-rose-400/50 animate-shake'
                  : isHoveringDropZone
                  ? 'border-cyan-400 bg-cyan-950/40 ring-4 ring-cyan-400/50 scale-102'
                  : 'border-slate-700 bg-slate-900/90'
              }`}
            >
              {/* Giant Pipe Illustration */}
              <div className="relative w-full h-24 bg-gradient-to-r from-slate-600 via-slate-400 to-slate-600 rounded-full border-4 border-slate-700 shadow-inner flex items-center justify-center">
                {/* Joint Ring */}
                <div className="absolute left-1/3 h-28 w-8 bg-slate-700 rounded-md border-2 border-slate-500 shadow-md" />
                <div className="absolute right-1/3 h-28 w-8 bg-slate-700 rounded-md border-2 border-slate-500 shadow-md" />

                {/* Leak / Crack Center */}
                <div className="relative z-10 flex flex-col items-center justify-center">
                  {!isPipeFullySealed ? (
                    <>
                      {/* Water Spraying Animation */}
                      <div className="absolute -top-16 text-4xl animate-bounce drop-shadow-[0_0_12px_rgba(6,182,212,0.8)]">
                        💦 💦 💦
                      </div>
                      <div className="w-14 h-14 rounded-full bg-cyan-500/30 border-2 border-dashed border-cyan-400 flex items-center justify-center text-cyan-200 font-black text-xs animate-ping" />
                    </>
                  ) : (
                    <div className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-full font-black text-sm shadow-xl">
                      <CheckCircle2 className="w-5 h-5 text-emerald-200" />
                      <span>PIPE 100% SEALED!</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Applied Parts Checklist */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                {tools.filter((t) => t.isValid).map((t) => (
                  <div
                    key={t.id}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                      t.applied
                        ? 'bg-emerald-950/80 border-emerald-400 text-emerald-300 shadow-sm'
                        : 'bg-slate-800/80 border-slate-700 text-slate-500'
                    }`}
                  >
                    <span>{t.icon}</span>
                    <span>{t.name}</span>
                    {t.applied && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Draggable Tools Tray */}
            <div className="w-full max-w-xl bg-slate-900/95 border-2 border-slate-700 rounded-3xl p-4 shadow-xl">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2 text-center">
                🛠️ AVAILABLE PLUMBING PARTS (DRAG OR TAP TO TEST)
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {tools.map((tool) => (
                  <div
                    key={tool.id}
                    draggable={!tool.applied}
                    onDragStart={(e) => handleDragStart(e, tool.id)}
                    onClick={() => {
                      if (!tool.applied) {
                        setSelectedToolId(selectedToolId === tool.id ? null : tool.id);
                        soundManager.playClick();
                      }
                    }}
                    className={`p-3 rounded-2xl border-2 flex flex-col items-center text-center transition-all cursor-grab active:cursor-grabbing select-none ${
                      tool.applied
                        ? 'bg-slate-950/50 border-slate-800 opacity-40 cursor-not-allowed'
                        : selectedToolId === tool.id
                        ? 'bg-cyan-900/60 border-cyan-400 ring-2 ring-cyan-400 scale-105 shadow-xl'
                        : 'bg-slate-800/90 border-slate-600 hover:border-cyan-400 hover:scale-102 shadow-md'
                    }`}
                  >
                    <span className="text-3xl mb-1">{tool.icon}</span>
                    <span className="text-xs font-bold text-white line-clamp-1">{tool.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: CONNECT WATER PIPES TO BUILDINGS */}
        {activeStep === 'CONNECT_WATER' && (
          <div className="w-full flex flex-col items-center gap-6">
            <div className="bg-emerald-950/70 border-2 border-emerald-400/60 rounded-2xl px-6 py-3 text-center max-w-lg shadow-xl animate-pulse">
              <span className="text-xs sm:text-sm font-bold text-emerald-200">
                🎉 Pipe fixed! Drag clean water pipe feeds to each facility to restore municipal service.
              </span>
            </div>

            {/* 3 Building Targets - NO PRE-HIGHLIGHT */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
              {targets.map((tgt) => (
                <div
                  key={tgt.id}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleConnectTarget(tgt.id);
                  }}
                  onClick={() => {
                    if (selectedPipe && !tgt.connected) {
                      handleConnectTarget(tgt.id);
                    }
                  }}
                  className={`p-5 rounded-3xl border-3 flex flex-col items-center text-center transition-all cursor-pointer ${
                    tgt.connected
                      ? 'bg-emerald-950/80 border-emerald-400 shadow-xl scale-102'
                      : 'bg-slate-900 border-slate-700 hover:border-slate-500'
                  }`}
                >
                  <span className="text-4xl mb-2">{tgt.icon}</span>
                  <h4 className="text-sm font-black text-white">{tgt.name}</h4>
                  <p className="text-xs text-slate-300 mt-1">{tgt.desc}</p>

                  <div className="mt-4">
                    {tgt.connected ? (
                      <span className="px-3 py-1 bg-emerald-500 text-slate-950 rounded-full text-xs font-black flex items-center gap-1 shadow-md">
                        <Check className="w-3.5 h-3.5" /> WATER FLOWING!
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-slate-800 text-slate-400 rounded-full text-xs font-bold border border-slate-700">
                        PENDING WATER
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Draggable Water Pipe Spool */}
            <div className="bg-slate-900 border-2 border-slate-700 rounded-3xl p-4 flex flex-col sm:flex-row items-center gap-4 shadow-xl">
              <div
                draggable={true}
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', 'pipe');
                  setSelectedPipe(true);
                }}
                onClick={() => {
                  setSelectedPipe(!selectedPipe);
                  soundManager.playClick();
                }}
                className={`px-6 py-4 rounded-2xl border-2 flex items-center gap-3 cursor-grab active:cursor-grabbing transition-all select-none ${
                  selectedPipe
                    ? 'bg-cyan-900 border-cyan-400 ring-2 ring-cyan-400 scale-105'
                    : 'bg-gradient-to-r from-cyan-600 to-blue-600 border-cyan-300 hover:scale-102 shadow-lg'
                }`}
              >
                <span className="text-3xl">🚰</span>
                <div className="text-left">
                  <div className="text-sm font-black text-white">DISTRIBUTION WATER PIPE</div>
                  <div className="text-xs text-cyan-200 font-medium">Drag or tap to connect</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: MISSION COMPLETED CELEBRATION */}
        {activeStep === 'COMPLETED' && (
          <div className="w-full max-w-lg bg-slate-900 border-2 border-emerald-400 rounded-3xl p-6 sm:p-8 text-center flex flex-col items-center gap-4 shadow-2xl animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-4xl">
              💧
            </div>

            <h3 className="text-2xl font-black font-arcade text-emerald-400">
              MISSION COMPLETED: LEAK FIXED!
            </h3>

            <p className="text-sm text-slate-200 leading-relaxed">
              You dragged the tools to seal the burst pipe bone-dry, and connected fresh water to the hospital, homes, and farms.
            </p>

            <div className="w-full bg-slate-950 rounded-2xl p-4 border border-slate-800 text-xs text-slate-300 space-y-2 text-left">
              <div className="flex justify-between font-bold">
                <span>Water Waste Stopped:</span>
                <span className="text-emerald-400">100% Sealed</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>City Hydration:</span>
                <span className="text-cyan-400">Restored to 100%</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Eco Points Earned:</span>
                <span className="text-yellow-400">+35 PTS</span>
              </div>
            </div>

            <button
              onClick={handleFinishMission}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-black font-arcade text-base shadow-xl hover:scale-102 transition-all cursor-pointer"
            >
              CLAIM REWARDS & CONTINUE
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
