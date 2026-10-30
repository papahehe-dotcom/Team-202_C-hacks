/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ArrowLeft, Trees, Bird, Flower2, Droplets, Sparkles, CheckCircle2, Check } from 'lucide-react';
import { soundManager } from '../../audio/soundManager';
import confetti from 'canvas-confetti';
import { MissionConsequence } from '../../types/ecoHero';

interface BringNatureBackArenaProps {
  onComplete: (consequence: MissionConsequence) => void;
  onExit: () => void;
}

interface NatureSpot {
  id: string;
  name: string;
  neededItem: 'tree' | 'flowers' | 'water' | 'ducks' | 'birds';
  icon: string;
  placed: boolean;
  desc: string;
}

interface NatureItem {
  id: 'tree' | 'flowers' | 'water' | 'ducks' | 'birds';
  name: string;
  icon: string;
}

export const BringNatureBackArena: React.FC<BringNatureBackArenaProps> = ({ onComplete, onExit }) => {
  const [spots, setSpots] = useState<NatureSpot[]>([
    { id: 'tree_spot', name: 'Barren Soil Mound', neededItem: 'tree', icon: '🌱', placed: false, desc: 'Dry compacted ground baking under intense sunlight' },
    { id: 'flower_spot', name: 'Open Meadow Patch', neededItem: 'flowers', icon: '🟤', placed: false, desc: 'Empty grassland lacking pollen and nectar for bees' },
    { id: 'pond_spot', name: 'Dry Pond Basin', neededItem: 'water', icon: '🏜️', placed: false, desc: 'Stone depression waiting for fresh water runoff' },
    { id: 'ducks_spot', name: 'Wetland Shoreline', neededItem: 'ducks', icon: '🌊', placed: false, desc: 'Aquatic bank awaiting water-loving animals' },
    { id: 'birds_spot', name: 'High Canopy Perch', neededItem: 'birds', icon: '🪵', placed: false, desc: 'Elevated woodland branches awaiting birds' },
  ]);

  const items: NatureItem[] = [
    { id: 'tree', name: 'Oak Tree Sapling', icon: '🌳' },
    { id: 'flowers', name: 'Wildflower Seed Pack', icon: '🌸' },
    { id: 'water', name: 'Fresh Spring Water', icon: '💧' },
    { id: 'ducks', name: 'Duck & Frog Family', icon: '🦆' },
    { id: 'birds', name: 'Songbird Pair', icon: '🐦' },
  ];

  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [wrongSpotId, setWrongSpotId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string>('Test plants and wildlife on park habitats to see what restores each ecosystem!');
  const [isFinished, setIsFinished] = useState(false);

  const restoredCount = spots.filter((s) => s.placed).length;

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    setSelectedItemId(id);
  };

  const handlePlaceNature = (spotId: string, itemType: string) => {
    const spot = spots.find((s) => s.id === spotId);
    if (!spot || spot.placed) return;

    if (spot.neededItem === itemType) {
      soundManager.playBuild();
      setFeedbackMsg(`✓ Flourishing! ${spot.name} restored with native biodiversity.`);
      setSpots((prev) => {
        const next = prev.map((s) => (s.id === spotId ? { ...s, placed: true } : s));
        const count = next.filter((s) => s.placed).length;
        if (count === 5) {
          soundManager.playSuccess();
          confetti({ particleCount: 80, spread: 65, origin: { y: 0.5 } });
          setIsFinished(true);
        }
        return next;
      });
    } else {
      soundManager.playSortWrong();
      setWrongSpotId(spotId);
      if (spot.id === 'ducks_spot') {
        setFeedbackMsg('❌ Waterfowl need a wetland shoreline to swim and forage!');
      } else if (spot.id === 'pond_spot') {
        setFeedbackMsg('❌ Dry pond basins require fresh spring water before aquatic species can survive!');
      } else if (spot.id === 'tree_spot') {
        setFeedbackMsg('❌ Sun-baked dry dirt mounds need deep-rooted oak tree saplings for canopy shade!');
      } else if (spot.id === 'flower_spot') {
        setFeedbackMsg('❌ Open meadows need wildflower seed packs to attract pollinating insects!');
      } else {
        setFeedbackMsg('❌ Songbirds nest in high canopy perches elevated off the forest floor!');
      }
      setTimeout(() => setWrongSpotId(null), 800);
    }

    setSelectedItemId(null);
  };

  const handleFinishMission = () => {
    const consequence: MissionConsequence = {
      missionId: 'bring_nature_back',
      title: 'Bring Nature Back: City Park Flourishing!',
      success: true,
      pointsEarned: 40,
      resourcesSpent: 20,
      choiceMade: 'Planted Native Trees, Flowers & Re-established Wildlife',
      tradeoffSummary: 'Connecting tree canopies, ponds, and flower meadows creates a thriving urban ecosystem.',
      sdgChanges: {
        sdg15_life_on_land: 45,
        sdg11_sustainable_cities: 35,
      },
      citySafetyChange: 26,
      whatPlayerChanged: [
        'Planted mature oak tree sapling in the park core',
        'Seeded colorful wildflower meadows for pollinating bees',
        'Filled the dry basin with crystal spring water for duck families',
      ],
      citizenAndEnvironmentImpact: 'Park ambient heat dropped by 4.2°C; over 24 bird and insect species returned to the park.',
      hackathonTakeaway: 'Urban biodiversity corridors reverse the urban heat island effect and restore mental well-being for citizens.',
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

        <div className="flex items-center gap-2 bg-slate-900/90 border-2 border-emerald-500/50 rounded-2xl px-4 py-2 shadow-xl">
          <Trees className="w-5 h-5 text-emerald-400 animate-bounce" />
          <div>
            <span className="text-[10px] font-black uppercase text-emerald-400 font-mono block">
              MISSION 6: BRING NATURE BACK
            </span>
            <span className="text-xs sm:text-sm font-black text-white">
              RESTORE FLORA & FAUNA TO THE PARK ({restoredCount}/5 RESTORED)
            </span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-emerald-300">
          🌿 Biodiversity: {restoredCount * 20}%
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
                : 'bg-emerald-950/70 border-emerald-400/60 text-emerald-200'
            }`}>
              <span className="text-xs sm:text-sm font-bold">
                {feedbackMsg}
              </span>
            </div>

            {/* Park Restoration Scene Grid - NO PRE-HIGHLIGHTING */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 w-full max-w-3xl">
              {spots.map((spot) => {
                const isWrong = wrongSpotId === spot.id;

                return (
                  <div
                    key={spot.id}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const droppedItem = e.dataTransfer.getData('text/plain');
                      if (droppedItem) handlePlaceNature(spot.id, droppedItem);
                    }}
                    onClick={() => {
                      if (selectedItemId && !spot.placed) {
                        handlePlaceNature(spot.id, selectedItemId);
                      }
                    }}
                    className={`p-4 rounded-3xl border-3 flex flex-col items-center text-center transition-all cursor-pointer relative overflow-hidden ${
                      spot.placed
                        ? 'bg-emerald-950/60 border-emerald-400 shadow-xl ring-2 ring-emerald-400/40 scale-102'
                        : isWrong
                        ? 'bg-rose-950/80 border-rose-500 ring-2 ring-rose-400 animate-shake'
                        : 'bg-slate-900 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    <div className="text-4xl mb-2">
                      {spot.placed
                        ? spot.neededItem === 'tree'
                          ? '🌳'
                          : spot.neededItem === 'flowers'
                          ? '🌺'
                          : spot.neededItem === 'water'
                          ? '💧'
                          : spot.neededItem === 'ducks'
                          ? '🦆'
                          : '🐦'
                        : spot.icon}
                    </div>

                    <h4 className="text-sm font-black text-white">{spot.name}</h4>
                    <p className="text-xs text-slate-300 mt-1">{spot.desc}</p>

                    <div className="mt-3">
                      {spot.placed ? (
                        <span className="px-2.5 py-1 bg-emerald-400 text-slate-950 rounded-full text-xs font-black flex items-center gap-1 shadow-md">
                          <Check className="w-3.5 h-3.5" /> THRIVING!
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 bg-slate-800 text-slate-400 rounded-full text-[11px] font-bold border border-slate-700">
                          BARREN HABITAT
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Draggable Nature Items Tray - NO GIVEAWAY HINTS */}
            <div className="w-full max-w-3xl bg-slate-900/95 border-2 border-slate-700 rounded-3xl p-4 shadow-xl">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2.5 text-center">
                🌱 AVAILABLE FLORA & FAUNA (DRAG OR TAP TO TEST)
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {items.map((item) => (
                  <div
                    key={item.id}
                    draggable={true}
                    onDragStart={(e) => handleDragStart(e, item.id)}
                    onClick={() => {
                      setSelectedItemId(selectedItemId === item.id ? null : item.id);
                      soundManager.playClick();
                    }}
                    className={`p-3 rounded-2xl border-2 flex flex-col items-center text-center cursor-grab active:cursor-grabbing transition-all select-none ${
                      selectedItemId === item.id
                        ? 'bg-emerald-900/60 border-emerald-400 ring-2 ring-emerald-400 scale-105 shadow-xl'
                        : 'bg-slate-800/90 border-slate-600 hover:border-emerald-400 hover:scale-102 shadow-md'
                    }`}
                  >
                    <span className="text-3xl mb-1">{item.icon}</span>
                    <span className="text-xs font-bold text-white line-clamp-1">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Victory Card */
          <div className="w-full max-w-lg bg-slate-900 border-2 border-emerald-400 rounded-3xl p-6 sm:p-8 text-center flex flex-col items-center gap-4 shadow-2xl animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-4xl">
              🌸
            </div>

            <h3 className="text-2xl font-black font-arcade text-emerald-400">
              PARK RESTORED TO FULL LIFE!
            </h3>

            <p className="text-sm text-slate-200 leading-relaxed">
              You planted shady trees and blooming flowers, filled the pond with sparkling water, and welcomed swimming ducks and songbirds to their new green home!
            </p>

            <div className="w-full bg-slate-950 rounded-2xl p-4 border border-slate-800 text-xs text-slate-300 space-y-2 text-left">
              <div className="flex justify-between font-bold">
                <span>Green Canopy Coverage:</span>
                <span className="text-emerald-400">100% Restored</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Wildlife Happiness:</span>
                <span className="text-cyan-400">Thriving & Singing</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Eco Points Earned:</span>
                <span className="text-yellow-400">+40 PTS</span>
              </div>
            </div>

            <button
              onClick={handleFinishMission}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black font-arcade text-base shadow-xl hover:scale-102 transition-all cursor-pointer"
            >
              CLAIM REWARDS & CONTINUE
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
