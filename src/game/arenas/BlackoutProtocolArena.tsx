/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ArrowLeft, Zap, Sun, Wind, CheckCircle2, Sparkles, Check } from 'lucide-react';
import { soundManager } from '../../audio/soundManager';
import confetti from 'canvas-confetti';
import { MissionConsequence } from '../../types/ecoHero';

interface BlackoutProtocolArenaProps {
  onComplete: (consequence: MissionConsequence) => void;
  onExit: () => void;
}

interface PowerBuilding {
  id: string;
  name: string;
  icon: string;
  neededSource: 'solar' | 'wind' | 'battery' | 'hydro';
  isPowered: boolean;
  desc: string;
}

interface PowerCableTool {
  id: 'solar' | 'wind' | 'battery' | 'hydro';
  name: string;
  icon: string;
  borderClass: string;
}

export const BlackoutProtocolArena: React.FC<BlackoutProtocolArenaProps> = ({ onComplete, onExit }) => {
  const [buildings, setBuildings] = useState<PowerBuilding[]>([
    { id: 'hospital', name: 'Trauma Hospital', icon: '🏥', neededSource: 'solar', isPowered: false, desc: 'Critical healthcare center requiring clean, direct sunlight energy.' },
    { id: 'water_pump', name: 'Water Pumping Plant', icon: '💧', neededSource: 'wind', isPowered: false, desc: 'High-volume municipal water pumping station.' },
    { id: 'homes', name: 'Homes & Schools', icon: '🏡', neededSource: 'battery', isPowered: false, desc: 'Residential community needing reliable backup energy.' },
    { id: 'train', name: 'Electric Train Line', icon: '🚊', neededSource: 'hydro', isPowered: false, desc: 'Rapid municipal transit network moving across town.' },
  ]);

  const cables: PowerCableTool[] = [
    { id: 'solar', name: '☀️ Solar Power Cable', icon: '⚡', borderClass: 'border-amber-400' },
    { id: 'wind', name: '💨 Wind Energy Cable', icon: '🌀', borderClass: 'border-cyan-400' },
    { id: 'battery', name: '🔋 Clean Battery Cable', icon: '🔋', borderClass: 'border-emerald-400' },
    { id: 'hydro', name: '💧 Water Turbine Cable', icon: '🌊', borderClass: 'border-blue-400' },
  ];

  const [selectedCable, setSelectedCable] = useState<'solar' | 'wind' | 'battery' | 'hydro' | null>(null);
  const [wrongTargetId, setWrongTargetId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string>('Test each clean energy cable to discover which facility it powers!');
  const [isFinished, setIsFinished] = useState(false);

  const poweredCount = buildings.filter((b) => b.isPowered).length;

  const handleDragStart = (e: React.DragEvent, cableId: 'solar' | 'wind' | 'battery' | 'hydro') => {
    e.dataTransfer.setData('text/plain', cableId);
    setSelectedCable(cableId);
  };

  const handlePowerBuilding = (buildingId: string, cableType: string) => {
    const building = buildings.find((b) => b.id === buildingId);
    if (!building || building.isPowered) return;

    if (building.neededSource === cableType) {
      soundManager.playBuild();
      setFeedbackMsg(`✓ Connected! ${building.name} is now powered by ${cableType.toUpperCase()}!`);
      setBuildings((prev) => {
        const next = prev.map((b) => (b.id === buildingId ? { ...b, isPowered: true } : b));
        const count = next.filter((b) => b.isPowered).length;
        if (count === 4) {
          soundManager.playSuccess();
          confetti({ particleCount: 70, spread: 60, origin: { y: 0.5 } });
          setIsFinished(true);
        }
        return next;
      });
    } else {
      soundManager.playSortWrong();
      setWrongTargetId(buildingId);
      setFeedbackMsg(`❌ Voltage mismatch for ${building.name}! Try another clean power source.`);
      setTimeout(() => setWrongTargetId(null), 800);
    }

    setSelectedCable(null);
  };

  const handleFinishMission = () => {
    const consequence: MissionConsequence = {
      missionId: 'blackout_protocol',
      title: 'Blackout Protocol: Clean Power Grid Online!',
      success: true,
      pointsEarned: 30,
      resourcesSpent: 20,
      choiceMade: 'Routed Renewable Solar, Wind, and Battery Cables',
      tradeoffSummary: 'Decentralized clean power routing restores hospitals and transit without fossil fuels.',
      sdgChanges: {
        sdg7_clean_energy: 40,
        sdg11_sustainable_cities: 32,
      },
      citySafetyChange: 25,
      whatPlayerChanged: [
        'Connected solar power cables to the Trauma Hospital',
        'Routed wind turbine energy to municipal water pumping',
        'Linked battery storage to residential homes and electric transit',
      ],
      citizenAndEnvironmentImpact: 'Complete grid stabilization: 0 blackout brownouts and zero toxic generator soot.',
      hackathonTakeaway: 'Renewable microgrids with dedicated battery links offer immediate resilience during heatwaves.',
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

        <div className="flex items-center gap-2 bg-slate-900/90 border-2 border-amber-500/50 rounded-2xl px-4 py-2 shadow-xl">
          <Zap className="w-5 h-5 text-amber-400 animate-bounce" />
          <div>
            <span className="text-[10px] font-black uppercase text-amber-400 font-mono block">
              MISSION 3: BLACKOUT PROTOCOL
            </span>
            <span className="text-xs sm:text-sm font-black text-white">
              CONNECT POWER CABLES TO DARK BUILDINGS ({poweredCount}/4 LIT)
            </span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-amber-300">
          ⚡ City Power: {poweredCount * 25}%
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="w-full max-w-4xl mx-auto my-4 flex-1 flex flex-col items-center justify-center">
        {!isFinished ? (
          <div className="w-full flex flex-col items-center gap-5">
            {/* Feedback & Instructions Banner */}
            <div className="bg-slate-900/90 border-2 border-amber-400/60 rounded-2xl px-6 py-2.5 text-center max-w-lg shadow-xl">
              <span className="text-xs sm:text-sm font-bold text-amber-200">
                {feedbackMsg}
              </span>
            </div>

            {/* City Buildings Grid (No destination highlight!) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
              {buildings.map((b) => {
                const isWrong = wrongTargetId === b.id;

                return (
                  <div
                    key={b.id}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const droppedType = e.dataTransfer.getData('text/plain');
                      handlePowerBuilding(b.id, droppedType);
                    }}
                    onClick={() => {
                      if (selectedCable && !b.isPowered) {
                        handlePowerBuilding(b.id, selectedCable);
                      }
                    }}
                    className={`p-5 rounded-3xl border-3 flex flex-col items-center text-center transition-all cursor-pointer relative overflow-hidden ${
                      b.isPowered
                        ? 'bg-amber-950/40 border-amber-400 shadow-2xl ring-2 ring-amber-400/50 scale-102'
                        : isWrong
                        ? 'bg-rose-950/80 border-rose-500 ring-2 ring-rose-400 animate-shake'
                        : 'bg-slate-900 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    {/* Glowing Window Backing when Powered */}
                    {b.isPowered && (
                      <div className="absolute inset-0 bg-gradient-to-t from-amber-500/20 via-yellow-400/10 to-transparent pointer-events-none" />
                    )}

                    <div className="text-4xl mb-2 relative z-10">{b.icon}</div>
                    <h4 className="text-sm sm:text-base font-black text-white relative z-10">{b.name}</h4>
                    <p className="text-xs text-slate-300 mt-1 relative z-10">{b.desc}</p>

                    <div className="mt-4 relative z-10">
                      {b.isPowered ? (
                        <span className="px-3 py-1 bg-amber-400 text-slate-950 rounded-full text-xs font-black flex items-center gap-1 shadow-md">
                          <Check className="w-3.5 h-3.5" /> LIGHTS ON!
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-slate-800 text-slate-400 rounded-full text-xs font-bold border border-slate-700">
                          DARK • DROP CABLE
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Draggable Power Cables Tray (No giveaway hints!) */}
            <div className="w-full max-w-2xl bg-slate-900/95 border-2 border-slate-700 rounded-3xl p-4 shadow-xl">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2.5 text-center">
                ⚡ AVAILABLE POWER CABLES (DRAG OR TAP TO TEST)
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {cables.map((cable) => (
                  <div
                    key={cable.id}
                    draggable={true}
                    onDragStart={(e) => handleDragStart(e, cable.id)}
                    onClick={() => {
                      setSelectedCable(selectedCable === cable.id ? null : cable.id);
                      soundManager.playClick();
                    }}
                    className={`p-3 rounded-2xl border-2 flex flex-col items-center text-center cursor-grab active:cursor-grabbing transition-all select-none ${
                      selectedCable === cable.id
                        ? 'bg-amber-900/60 border-amber-400 ring-2 ring-amber-400 scale-105 shadow-xl'
                        : `bg-slate-800/90 ${cable.borderClass} hover:scale-102 shadow-md`
                    }`}
                  >
                    <span className="text-3xl mb-1">{cable.icon}</span>
                    <span className="text-xs font-bold text-white line-clamp-1">{cable.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Victory Card */
          <div className="w-full max-w-lg bg-slate-900 border-2 border-amber-400 rounded-3xl p-6 sm:p-8 text-center flex flex-col items-center gap-4 shadow-2xl animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-4xl">
              ⚡
            </div>

            <h3 className="text-2xl font-black font-arcade text-amber-400">
              CITY BLACKOUT ENDED!
            </h3>

            <p className="text-sm text-slate-200 leading-relaxed">
              Every building is powered by clean renewable solar, wind, battery, and water energy. The city skyline is glowing brightly!
            </p>

            <div className="w-full bg-slate-950 rounded-2xl p-4 border border-slate-800 text-xs text-slate-300 space-y-2 text-left">
              <div className="flex justify-between font-bold">
                <span>Power Stability:</span>
                <span className="text-emerald-400">100% Online</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Fossil Fuel Used:</span>
                <span className="text-cyan-400">0% (100% Clean)</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Eco Points Earned:</span>
                <span className="text-yellow-400">+30 PTS</span>
              </div>
            </div>

            <button
              onClick={handleFinishMission}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-black font-arcade text-base shadow-xl hover:scale-102 transition-all cursor-pointer"
            >
              CLAIM REWARDS & CONTINUE
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
