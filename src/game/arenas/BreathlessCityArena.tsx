/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ArrowLeft, Wind, Trees, Bus, CheckCircle2, Sparkles, Check } from 'lucide-react';
import { soundManager } from '../../audio/soundManager';
import confetti from 'canvas-confetti';
import { MissionConsequence } from '../../types/ecoHero';

interface BreathlessCityArenaProps {
  onComplete: (consequence: MissionConsequence) => void;
  onExit: () => void;
}

interface SmogZone {
  id: string;
  name: string;
  neededTool: 'filter' | 'trees' | 'blimp' | 'electric_bus';
  icon: string;
  cleaned: boolean;
  desc: string;
}

interface AirTool {
  id: 'filter' | 'trees' | 'blimp' | 'electric_bus';
  name: string;
  icon: string;
}

export const BreathlessCityArena: React.FC<BreathlessCityArenaProps> = ({ onComplete, onExit }) => {
  const [zones, setZones] = useState<SmogZone[]>([
    { id: 'factory', name: 'Smoky Factory Chimneys', neededTool: 'filter', icon: '🏭', cleaned: false, desc: 'Heavy industrial particulate emissions from refinery stacks' },
    { id: 'highway', name: 'Highway Traffic Corridor', neededTool: 'trees', icon: '🚚', cleaned: false, desc: 'Multi-lane thoroughfare with constant exhaust fumes' },
    { id: 'downtown', name: 'Downtown Sky Plaza', neededTool: 'blimp', icon: '🏙️', cleaned: false, desc: 'Stagnant thermal inversion layer trapping smog above skyscrapers' },
    { id: 'bus_lane', name: 'Diesel Commuter Route', neededTool: 'electric_bus', icon: '🚏', cleaned: false, desc: 'Dense public transit corridor running on aged fossil fuel buses' },
  ]);

  const tools: AirTool[] = [
    { id: 'filter', name: 'Chimney Scrubber Filter', icon: '🌪️' },
    { id: 'trees', name: 'Air-Purifying Pine Belt', icon: '🌲' },
    { id: 'blimp', name: 'Atmospheric Air Drone', icon: '🎈' },
    { id: 'electric_bus', name: 'Zero-Emission Electric Bus', icon: '🚌' },
  ];

  const [selectedToolId, setSelectedToolId] = useState<string | null>(null);
  const [wrongZoneId, setWrongZoneId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string>('Test clean air technologies on city smog zones to see what purifies each emission source!');
  const [isFinished, setIsFinished] = useState(false);

  const cleanedCount = zones.filter((z) => z.cleaned).length;

  const handleDragStart = (e: React.DragEvent, toolId: string) => {
    e.dataTransfer.setData('text/plain', toolId);
    setSelectedToolId(toolId);
  };

  const handleCleanZone = (zoneId: string, toolType: string) => {
    const zone = zones.find((z) => z.id === zoneId);
    if (!zone || zone.cleaned) return;

    if (zone.neededTool === toolType) {
      soundManager.playBuild();
      setFeedbackMsg(`✓ Success! ${zone.name} is now cleared of emissions.`);
      setZones((prev) => {
        const next = prev.map((z) => (z.id === zoneId ? { ...z, cleaned: true } : z));
        const count = next.filter((z) => z.cleaned).length;
        if (count === 4) {
          soundManager.playSuccess();
          confetti({ particleCount: 75, spread: 60, origin: { y: 0.5 } });
          setIsFinished(true);
        }
        return next;
      });
    } else {
      soundManager.playSortWrong();
      setWrongZoneId(zoneId);
      if (zone.id === 'factory') {
        setFeedbackMsg('❌ Factory smokestacks require heavy industrial scrubbers to trap soot at the source!');
      } else if (zone.id === 'highway') {
        setFeedbackMsg('❌ Highway vehicle exhaust needs dense vegetative tree buffers to absorb roadway emissions!');
      } else if (zone.id === 'downtown') {
        setFeedbackMsg('❌ High-altitude atmospheric haze needs an airborne filtration blimp drone!');
      } else {
        setFeedbackMsg('❌ Commuter transit pollution is solved by replacing diesel fleets with zero-emission electric buses!');
      }
      setTimeout(() => setWrongZoneId(null), 800);
    }

    setSelectedToolId(null);
  };

  const handleFinishMission = () => {
    const consequence: MissionConsequence = {
      missionId: 'breathless_city',
      title: 'The Breathless City: Fresh Air Restored!',
      success: true,
      pointsEarned: 35,
      resourcesSpent: 20,
      choiceMade: 'Deployed Air Scrubbers, Pine Belts & Electric Buses',
      tradeoffSummary: 'Direct smokestack filtration paired with urban canopies purges harmful PM2.5 particulates.',
      sdgChanges: {
        sdg13_climate_action: 35,
        sdg11_sustainable_cities: 30,
      },
      citySafetyChange: 24,
      whatPlayerChanged: [
        'Installed high-efficiency scrubbers on industrial chimneys',
        'Planted dense pine tree buffers along highway corridors',
        'Deployed electric zero-emission transit buses',
      ],
      citizenAndEnvironmentImpact: 'Hospital respiratory emergency admissions plummeted by 82%; sky visibility returned.',
      hackathonTakeaway: 'Air purification works best when targeting industrial point sources while expanding natural vegetative filters.',
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
          <Wind className="w-5 h-5 text-cyan-400 animate-pulse" />
          <div>
            <span className="text-[10px] font-black uppercase text-cyan-400 font-mono block">
              MISSION 5: THE BREATHLESS CITY
            </span>
            <span className="text-xs sm:text-sm font-black text-white">
              DEPLOY CLEAN AIR TECHNOLOGIES ({cleanedCount}/4 CLEAN)
            </span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-cyan-300">
          💨 Clean Air: {cleanedCount * 25}%
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="w-full max-w-4xl mx-auto my-4 flex-1 flex flex-col items-center justify-center">
        {!isFinished ? (
          <div className="w-full flex flex-col items-center gap-5">
            {/* Friendly Feedback / Instruction */}
            <div className={`rounded-2xl px-6 py-2.5 text-center max-w-lg shadow-xl border-2 transition-all ${
              wrongZoneId
                ? 'bg-rose-950/90 border-rose-400 text-rose-200'
                : 'bg-cyan-950/70 border-cyan-400/60 text-cyan-200'
            }`}>
              <span className="text-xs sm:text-sm font-bold">
                {feedbackMsg}
              </span>
            </div>

            {/* City Smog Zones Grid - NO PRE-HIGHLIGHTING */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
              {zones.map((zone) => {
                const isWrong = wrongZoneId === zone.id;

                return (
                  <div
                    key={zone.id}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const droppedTool = e.dataTransfer.getData('text/plain');
                      if (droppedTool) handleCleanZone(zone.id, droppedTool);
                    }}
                    onClick={() => {
                      if (selectedToolId && !zone.cleaned) {
                        handleCleanZone(zone.id, selectedToolId);
                      }
                    }}
                    className={`p-5 rounded-3xl border-3 flex flex-col items-center text-center transition-all cursor-pointer relative overflow-hidden ${
                      zone.cleaned
                        ? 'bg-cyan-950/40 border-cyan-400 shadow-2xl scale-102'
                        : isWrong
                        ? 'bg-rose-950/80 border-rose-500 ring-2 ring-rose-400 animate-shake'
                        : 'bg-slate-900 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    {/* Smog Cloud Overlay if not cleaned */}
                    {!zone.cleaned && (
                      <div className="absolute top-2 right-2 text-2xl animate-pulse opacity-80" title="Smog Cloud">
                        🌫️
                      </div>
                    )}

                    <div className="text-4xl mb-2">{zone.cleaned ? '🌈' : zone.icon}</div>
                    <h4 className="text-sm sm:text-base font-black text-white">{zone.name}</h4>
                    <p className="text-xs text-slate-300 mt-1">{zone.desc}</p>

                    <div className="mt-4">
                      {zone.cleaned ? (
                        <span className="px-3 py-1 bg-cyan-400 text-slate-950 rounded-full text-xs font-black flex items-center gap-1 shadow-md">
                          <Check className="w-3.5 h-3.5" /> 100% PURE AIR!
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-slate-800 text-slate-400 rounded-full text-xs font-bold border border-slate-700">
                          SMOG ALERT • DROP CLEANSER
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Draggable Clean Air Tools Tray - NO GIVEAWAY HINTS */}
            <div className="w-full max-w-2xl bg-slate-900/95 border-2 border-slate-700 rounded-3xl p-4 shadow-xl">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2.5 text-center">
                🌪️ AVAILABLE CLEAN AIR TECHNOLOGIES (DRAG OR TAP TO TEST)
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {tools.map((t) => (
                  <div
                    key={t.id}
                    draggable={true}
                    onDragStart={(e) => handleDragStart(e, t.id)}
                    onClick={() => {
                      setSelectedToolId(selectedToolId === t.id ? null : t.id);
                      soundManager.playClick();
                    }}
                    className={`p-3 rounded-2xl border-2 flex flex-col items-center text-center cursor-grab active:cursor-grabbing transition-all select-none ${
                      selectedToolId === t.id
                        ? 'bg-cyan-900/60 border-cyan-400 ring-2 ring-cyan-400 scale-105 shadow-xl'
                        : 'bg-slate-800/90 border-slate-600 hover:border-cyan-400 hover:scale-102 shadow-md'
                    }`}
                  >
                    <span className="text-3xl mb-1">{t.icon}</span>
                    <span className="text-xs font-bold text-white line-clamp-1">{t.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Victory Card */
          <div className="w-full max-w-lg bg-slate-900 border-2 border-cyan-400 rounded-3xl p-6 sm:p-8 text-center flex flex-col items-center gap-4 shadow-2xl animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center text-4xl">
              🌬️
            </div>

            <h3 className="text-2xl font-black font-arcade text-cyan-400">
              BLUE SKIES RESTORED!
            </h3>

            <p className="text-sm text-slate-200 leading-relaxed">
              You dragged filters onto the factory, planted roadside pine trees, and deployed the fresh air blimp and electric buses. The air is crisp and pure!
            </p>

            <div className="w-full bg-slate-950 rounded-2xl p-4 border border-slate-800 text-xs text-slate-300 space-y-2 text-left">
              <div className="flex justify-between font-bold">
                <span>Smog Clearance:</span>
                <span className="text-emerald-400">100% Cleared</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Citizen Health:</span>
                <span className="text-cyan-400">Safe & Healthy</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Eco Points Earned:</span>
                <span className="text-yellow-400">+35 PTS</span>
              </div>
            </div>

            <button
              onClick={handleFinishMission}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black font-arcade text-base shadow-xl hover:scale-102 transition-all cursor-pointer"
            >
              CLAIM REWARDS & CONTINUE
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
