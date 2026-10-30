/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Droplets, Shield, ArrowLeft, CheckCircle2, Sparkles, Waves, Check } from 'lucide-react';
import { soundManager } from '../../audio/soundManager';
import confetti from 'canvas-confetti';
import { MissionConsequence } from '../../types/ecoHero';

interface DrowningCityArenaProps {
  onComplete: (consequence: MissionConsequence) => void;
  onExit: () => void;
}

interface DefenseSpot {
  id: string;
  name: string;
  type: 'road_barrier' | 'drain_grate';
  icon: string;
  placed: boolean;
  desc: string;
}

export const DrowningCityArena: React.FC<DrowningCityArenaProps> = ({ onComplete, onExit }) => {
  // 5 Drag and drop defense targets
  const [spots, setSpots] = useState<DefenseSpot[]>([
    { id: 'barrier_1', name: 'West Avenue Levee', type: 'road_barrier', icon: '🧱', placed: false, desc: 'Low-lying boundary facing storm surge' },
    { id: 'barrier_2', name: 'Main Boulevard Embankment', type: 'road_barrier', icon: '🧱', placed: false, desc: 'Critical arterial route by the trauma center' },
    { id: 'barrier_3', name: 'East Canal Wall', type: 'road_barrier', icon: '🧱', placed: false, desc: 'Waterway boundary susceptible to overflow' },
    { id: 'drain_1', name: 'Central Storm Drain', type: 'drain_grate', icon: '🕳️', placed: false, desc: 'Underground street collector clogged by debris' },
    { id: 'drain_2', name: 'Hospital Retention Sump', type: 'drain_grate', icon: '🕳️', placed: false, desc: 'Subsurface runoff basin near emergency ward' },
  ]);

  const [selectedTool, setSelectedTool] = useState<'barrier' | 'drain' | null>(null);
  const [floodLevel, setFloodLevel] = useState(85); // 85% initially
  const [wrongSpotId, setWrongSpotId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string>('Test defenses on flood zones to discover what repels waves or drains water!');
  const [isFinished, setIsFinished] = useState(false);

  const placedCount = spots.filter((s) => s.placed).length;

  const handleDragStart = (e: React.DragEvent, type: 'barrier' | 'drain') => {
    e.dataTransfer.setData('text/plain', type);
    setSelectedTool(type);
  };

  const handleAttemptPlacement = (spotId: string, toolType: 'barrier' | 'drain') => {
    const spot = spots.find((s) => s.id === spotId);
    if (!spot || spot.placed) return;

    const isCorrect =
      (toolType === 'barrier' && spot.type === 'road_barrier') ||
      (toolType === 'drain' && spot.type === 'drain_grate');

    if (isCorrect) {
      soundManager.playBuild();
      setFeedbackMsg(`✓ Secured! ${spot.name} is now protected against flooding.`);
      setSpots((prev) => {
        const next = prev.map((s) => (s.id === spotId ? { ...s, placed: true } : s));
        const count = next.filter((s) => s.placed).length;
        setFloodLevel(Math.max(0, 85 - count * 17));

        if (count === 5) {
          soundManager.playSuccess();
          confetti({ particleCount: 75, spread: 60, origin: { y: 0.5 } });
          setIsFinished(true);
        }
        return next;
      });
    } else {
      soundManager.playSortWrong();
      setWrongSpotId(spotId);
      if (spot.type === 'drain_grate') {
        setFeedbackMsg('❌ Sandbags block storm drains and trap floodwaters! Use the Drain Cleaner here.');
      } else {
        setFeedbackMsg('❌ Drain cleaners cannot hold back surface river waves! You need a physical barrier here.');
      }
      setTimeout(() => setWrongSpotId(null), 800);
    }

    setSelectedTool(null);
  };

  const handleFinishMission = () => {
    const consequence: MissionConsequence = {
      missionId: 'drowning_city',
      title: 'The Drowning City: Flood Defenses Locked!',
      success: true,
      pointsEarned: 30,
      resourcesSpent: 20,
      choiceMade: 'Deployed Sandbag Barriers & Unclogged Storm Drains',
      tradeoffSummary: 'Tactile barriers protect critical infrastructure while retention drains absorb surges.',
      sdgChanges: {
        sdg6_clean_water: 30,
        sdg11_sustainable_cities: 35,
        sdg13_climate_action: 25,
      },
      citySafetyChange: 22,
      whatPlayerChanged: [
        'Placed heavy sandbag barriers on roads and levees',
        'Cleaned trash from central storm drains',
        'Routed stormwater safely into retention storage',
      ],
      citizenAndEnvironmentImpact: 'Trauma hospital and residential streets protected from flooding with 0 building damage.',
      hackathonTakeaway: 'Resilient cities combine physical flood defenses with active drain clearing for extreme weather.',
    };
    onComplete(consequence);
  };

  return (
    <div className="relative w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 select-none font-sans overflow-y-auto">
      {/* Header */}
      <div className="w-full max-w-4xl mx-auto flex items-center justify-between z-20">
        <button
          onClick={onExit}
          className="px-4 py-2 rounded-2xl bg-slate-900 border-2 border-slate-700 hover:bg-slate-800 text-slate-200 font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Arena</span>
        </button>

        <div className="flex items-center gap-2 bg-slate-900/90 border-2 border-blue-500/50 rounded-2xl px-4 py-2 shadow-xl">
          <Waves className="w-5 h-5 text-blue-400 animate-bounce" />
          <div>
            <span className="text-[10px] font-black uppercase text-blue-400 font-mono block">
              MISSION 1: THE DROWNING CITY
            </span>
            <span className="text-xs sm:text-sm font-black text-white">
              DEPLOY FLOOD DEFENSES & UNCLOG DRAINS ({placedCount}/5)
            </span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-cyan-300">
          🌊 Street Flood: {floodLevel}%
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="w-full max-w-4xl mx-auto my-4 flex-1 flex flex-col items-center justify-center">
        {!isFinished ? (
          <div className="w-full flex flex-col items-center gap-5">
            {/* Friendly Feedback / Instruction */}
            <div className={`rounded-2xl px-6 py-2.5 text-center max-w-lg shadow-xl border-2 transition-all ${
              wrongSpotId
                ? 'bg-rose-950/90 border-rose-400 text-rose-200'
                : 'bg-blue-950/70 border-blue-400/60 text-blue-200'
            }`}>
              <span className="text-xs sm:text-sm font-bold">
                {feedbackMsg}
              </span>
            </div>

            {/* City Flood Defense Map */}
            <div className="w-full max-w-2xl bg-slate-900 border-3 border-slate-700 rounded-3xl p-5 shadow-2xl relative overflow-hidden">
              {/* Water Surge Background */}
              <div
                className="absolute inset-0 bg-blue-600/20 transition-all duration-700 pointer-events-none"
                style={{ opacity: floodLevel / 100 }}
              />

              {/* Spots - NO PRE-HIGHLIGHTING */}
              <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {spots.map((spot) => {
                  const isWrong = wrongSpotId === spot.id;

                  return (
                    <div
                      key={spot.id}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const toolType = e.dataTransfer.getData('text/plain') as 'barrier' | 'drain';
                        if (toolType) handleAttemptPlacement(spot.id, toolType);
                      }}
                      onClick={() => {
                        if (selectedTool && !spot.placed) {
                          handleAttemptPlacement(spot.id, selectedTool);
                        }
                      }}
                      className={`p-4 rounded-2xl border-2 flex items-center gap-3 transition-all cursor-pointer ${
                        spot.placed
                          ? 'bg-emerald-950/80 border-emerald-400 shadow-md scale-101'
                          : isWrong
                          ? 'bg-rose-950/80 border-rose-500 ring-2 ring-rose-400 animate-shake'
                          : 'bg-slate-950/80 border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-2xl shrink-0">
                        {spot.placed ? '🛡️' : spot.icon}
                      </div>

                      <div className="flex-1 text-left">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs sm:text-sm font-black text-white">{spot.name}</h4>
                          {spot.placed ? (
                            <span className="text-[10px] bg-emerald-500 text-slate-950 font-black px-2 py-0.5 rounded-full flex items-center gap-0.5">
                              <Check className="w-3 h-3" /> SECURED
                            </span>
                          ) : (
                            <span className="text-[10px] bg-slate-800 text-slate-400 font-bold px-2 py-0.5 rounded-full border border-slate-700">
                              DEFENSE NEEDED
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-300 mt-0.5">{spot.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Draggable Toolbox */}
            <div className="w-full max-w-xl bg-slate-900/95 border-2 border-slate-700 rounded-3xl p-4 shadow-xl">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2.5 text-center">
                🛠️ AVAILABLE FLOOD DEFENSE ITEMS (DRAG OR TAP TO TEST)
              </span>

              <div className="grid grid-cols-2 gap-3">
                {/* 1. Heavy Sandbag Barrier */}
                <div
                  draggable={true}
                  onDragStart={(e) => handleDragStart(e, 'barrier')}
                  onClick={() => {
                    setSelectedTool(selectedTool === 'barrier' ? null : 'barrier');
                    soundManager.playClick();
                  }}
                  className={`p-3.5 rounded-2xl border-2 flex items-center gap-3 cursor-grab active:cursor-grabbing transition-all select-none ${
                    selectedTool === 'barrier'
                      ? 'bg-blue-900 border-cyan-400 ring-2 ring-cyan-400 scale-102'
                      : 'bg-slate-800/90 border-slate-600 hover:border-cyan-400 hover:scale-101 shadow-md'
                  }`}
                >
                  <span className="text-3xl">🧱</span>
                  <div className="text-left">
                    <div className="text-xs sm:text-sm font-black text-white">Heavy Sandbag Barrier</div>
                  </div>
                </div>

                {/* 2. Unclogged Drain Grate */}
                <div
                  draggable={true}
                  onDragStart={(e) => handleDragStart(e, 'drain')}
                  onClick={() => {
                    setSelectedTool(selectedTool === 'drain' ? null : 'drain');
                    soundManager.playClick();
                  }}
                  className={`p-3.5 rounded-2xl border-2 flex items-center gap-3 cursor-grab active:cursor-grabbing transition-all select-none ${
                    selectedTool === 'drain'
                      ? 'bg-blue-900 border-cyan-400 ring-2 ring-cyan-400 scale-102'
                      : 'bg-slate-800/90 border-slate-600 hover:border-cyan-400 hover:scale-101 shadow-md'
                  }`}
                >
                  <span className="text-3xl">🕳️</span>
                  <div className="text-left">
                    <div className="text-xs sm:text-sm font-black text-white">Storm Drain Cleaner</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Victory Card */
          <div className="w-full max-w-lg bg-slate-900 border-2 border-emerald-400 rounded-3xl p-6 sm:p-8 text-center flex flex-col items-center gap-4 shadow-2xl animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-4xl">
              🛡️
            </div>

            <h3 className="text-2xl font-black font-arcade text-emerald-400">
              STREETS SAVED FROM THE FLOOD!
            </h3>

            <p className="text-sm text-slate-200 leading-relaxed">
              You dragged all sandbag barriers into place and opened the storm drains. The floodwaters drained harmlessly into the underground aquifer!
            </p>

            <div className="w-full bg-slate-950 rounded-2xl p-4 border border-slate-800 text-xs text-slate-300 space-y-2 text-left">
              <div className="flex justify-between font-bold">
                <span>Flood Water Left:</span>
                <span className="text-emerald-400">0% (Completely Dry!)</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Homes & Hospital Protected:</span>
                <span className="text-cyan-400">100% Safe</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Eco Points Earned:</span>
                <span className="text-yellow-400">+30 PTS</span>
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
