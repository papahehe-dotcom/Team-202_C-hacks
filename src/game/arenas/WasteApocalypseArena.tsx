/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ArrowLeft, Recycle, Trash2, CheckCircle2, Sparkles, Waves, Check } from 'lucide-react';
import { soundManager } from '../../audio/soundManager';
import confetti from 'canvas-confetti';
import { MissionConsequence } from '../../types/ecoHero';

interface WasteApocalypseArenaProps {
  onComplete: (consequence: MissionConsequence) => void;
  onExit: () => void;
}

type BinType = 'blue' | 'green' | 'red';

interface TrashItem {
  id: string;
  name: string;
  emoji: string;
  targetBin: BinType;
  sorted: boolean;
}

export const WasteApocalypseArena: React.FC<WasteApocalypseArenaProps> = ({ onComplete, onExit }) => {
  const [trashItems, setTrashItems] = useState<TrashItem[]>([
    { id: 'bottle', name: 'Plastic Soda Bottle', emoji: '🍾', targetBin: 'blue', sorted: false },
    { id: 'banana', name: 'Banana Peel', emoji: '🍌', targetBin: 'green', sorted: false },
    { id: 'battery', name: 'Lithium Battery', emoji: '🔋', targetBin: 'red', sorted: false },
    { id: 'jar', name: 'Glass Jam Jar', emoji: '🥛', targetBin: 'blue', sorted: false },
    { id: 'apple', name: 'Apple Core', emoji: '🍏', targetBin: 'green', sorted: false },
    { id: 'chemical', name: 'Paint & Chemical Can', emoji: '🧪', targetBin: 'red', sorted: false },
  ]);

  const [riverNetPlaced, setRiverNetPlaced] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [wrongBin, setWrongBin] = useState<BinType | 'river' | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string>('Test items across bins to discover what is recyclable, compostable, or hazardous!');
  const [isFinished, setIsFinished] = useState(false);

  const sortedCount = trashItems.filter((t) => t.sorted).length + (riverNetPlaced ? 1 : 0);
  const totalTasks = 7;

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    setSelectedItemId(id);
  };

  const handleDropIntoBin = (bin: BinType) => {
    if (!selectedItemId) return;

    if (selectedItemId === 'river_net') {
      soundManager.playSortWrong();
      setWrongBin(bin);
      setFeedbackMsg('❌ The river boom net belongs across the water canal to trap floating trash!');
      setTimeout(() => setWrongBin(null), 800);
      setSelectedItemId(null);
      return;
    }

    const item = trashItems.find((t) => t.id === selectedItemId);
    if (!item || item.sorted) return;

    if (item.targetBin === bin) {
      soundManager.playSortCorrect();
      setFeedbackMsg(`✓ Correct! ${item.name} sorted successfully.`);
      setTrashItems((prev) => {
        const next = prev.map((t) => (t.id === item.id ? { ...t, sorted: true } : t));
        const allDone = next.every((t) => t.sorted) && riverNetPlaced;
        if (allDone) {
          soundManager.playSuccess();
          confetti({ particleCount: 75, spread: 60, origin: { y: 0.5 } });
          setIsFinished(true);
        }
        return next;
      });
    } else {
      soundManager.playSortWrong();
      setWrongBin(bin);
      if (item.targetBin === 'red') {
        setFeedbackMsg(`❌ ${item.name} contains toxic chemicals/heavy metals! It contaminates ordinary bins.`);
      } else if (item.targetBin === 'green') {
        setFeedbackMsg(`❌ ${item.name} is organic! It decomposes into soil nutrients in compost.`);
      } else {
        setFeedbackMsg(`❌ ${item.name} is durable synthetic packaging! It belongs with dry recyclables.`);
      }
      setTimeout(() => setWrongBin(null), 800);
    }

    setSelectedItemId(null);
  };

  const handlePlaceRiverNet = () => {
    if (selectedItemId && selectedItemId !== 'river_net') {
      soundManager.playSortWrong();
      setWrongBin('river');
      setFeedbackMsg('❌ Never dump trash into the river! Install the protective barrier net here.');
      setTimeout(() => setWrongBin(null), 800);
      setSelectedItemId(null);
      return;
    }

    if (riverNetPlaced) return;
    soundManager.playBuild();
    setRiverNetPlaced(true);
    setFeedbackMsg('✓ River net deployed! Floating plastics intercepted before reaching the sea.');

    const allDone = trashItems.every((t) => t.sorted);
    if (allDone) {
      soundManager.playSuccess();
      confetti({ particleCount: 75, spread: 60, origin: { y: 0.5 } });
      setIsFinished(true);
    }
    setSelectedItemId(null);
  };

  const handleFinishMission = () => {
    const consequence: MissionConsequence = {
      missionId: 'waste_apocalypse',
      title: 'Waste Apocalypse: City Streets Cleaned!',
      success: true,
      pointsEarned: 30,
      resourcesSpent: 15,
      choiceMade: 'Sorted Plastics, Compost & Installed River Boom',
      tradeoffSummary: 'Source-level sorting and river trash interception eliminate municipal landfill overflow.',
      sdgChanges: {
        sdg12_responsible_consumption: 45,
        sdg11_sustainable_cities: 25,
      },
      citySafetyChange: 20,
      whatPlayerChanged: [
        'Sorted plastic bottles and glass into the blue recycling bin',
        'Composted organic food waste into rich dark soil',
        'Deployed river floating trash boom to protect harbor delta',
      ],
      citizenAndEnvironmentImpact: 'Over 98% of street waste diverted from landfills; river delta is clear of micro-plastics.',
      hackathonTakeaway: 'Zero-waste cities rely on accessible color-coded sorting at the source and aquatic boom barriers.',
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
          <Recycle className="w-5 h-5 text-amber-400 animate-spin" style={{ animationDuration: '8s' }} />
          <div>
            <span className="text-[10px] font-black uppercase text-amber-400 font-mono block">
              MISSION 4: WASTE APOCALYPSE
            </span>
            <span className="text-xs sm:text-sm font-black text-white">
              SORT CITY TRASH & INSTALL RIVER NET ({sortedCount}/{totalTasks})
            </span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-amber-300">
          ♻️ Cleaned: {Math.round((sortedCount / totalTasks) * 100)}%
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="w-full max-w-4xl mx-auto my-4 flex-1 flex flex-col items-center justify-center">
        {!isFinished ? (
          <div className="w-full flex flex-col items-center gap-5">
            {/* Friendly Feedback / Instruction */}
            <div className={`rounded-2xl px-6 py-2.5 text-center max-w-lg shadow-xl border-2 transition-all ${
              wrongBin
                ? 'bg-rose-950/90 border-rose-400 text-rose-200'
                : 'bg-amber-950/70 border-amber-400/60 text-amber-200'
            }`}>
              <span className="text-xs sm:text-sm font-bold">
                {feedbackMsg}
              </span>
            </div>

            {/* The 3 Big Recycling Bins & River Net Target - NO PRE-HIGHLIGHTING */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5 w-full max-w-3xl">
              {/* 1. BLUE BIN: Recyclables */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleDropIntoBin('blue');
                }}
                onClick={() => {
                  if (selectedItemId) {
                    handleDropIntoBin('blue');
                  }
                }}
                className={`p-4 rounded-3xl border-3 flex flex-col items-center text-center transition-all cursor-pointer ${
                  wrongBin === 'blue'
                    ? 'bg-rose-950/80 border-rose-500 ring-4 ring-rose-500 animate-shake'
                    : 'bg-blue-950/40 border-blue-500/60 hover:border-blue-400'
                }`}
              >
                <div className="w-16 h-16 rounded-2xl bg-blue-600/30 border-2 border-blue-400 flex items-center justify-center text-3xl mb-2">
                  🟦
                </div>
                <h4 className="text-sm font-black text-blue-300">BLUE BIN</h4>
                <div className="text-[11px] font-bold text-white mt-0.5">Dry Recyclables</div>
              </div>

              {/* 2. GREEN BIN: Organic Compost */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleDropIntoBin('green');
                }}
                onClick={() => {
                  if (selectedItemId) {
                    handleDropIntoBin('green');
                  }
                }}
                className={`p-4 rounded-3xl border-3 flex flex-col items-center text-center transition-all cursor-pointer ${
                  wrongBin === 'green'
                    ? 'bg-rose-950/80 border-rose-500 ring-4 ring-rose-500 animate-shake'
                    : 'bg-emerald-950/40 border-emerald-500/60 hover:border-emerald-400'
                }`}
              >
                <div className="w-16 h-16 rounded-2xl bg-emerald-600/30 border-2 border-emerald-400 flex items-center justify-center text-3xl mb-2">
                  🟩
                </div>
                <h4 className="text-sm font-black text-emerald-300">GREEN BIN</h4>
                <div className="text-[11px] font-bold text-white mt-0.5">Organic Compost</div>
              </div>

              {/* 3. RED BIN: Hazardous */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleDropIntoBin('red');
                }}
                onClick={() => {
                  if (selectedItemId) {
                    handleDropIntoBin('red');
                  }
                }}
                className={`p-4 rounded-3xl border-3 flex flex-col items-center text-center transition-all cursor-pointer ${
                  wrongBin === 'red'
                    ? 'bg-rose-950/80 border-rose-500 ring-4 ring-rose-500 animate-shake'
                    : 'bg-rose-950/40 border-rose-500/60 hover:border-rose-400'
                }`}
              >
                <div className="w-16 h-16 rounded-2xl bg-rose-600/30 border-2 border-rose-400 flex items-center justify-center text-3xl mb-2">
                  🟥
                </div>
                <h4 className="text-sm font-black text-rose-300">RED BIN</h4>
                <div className="text-[11px] font-bold text-white mt-0.5">Hazardous Waste</div>
              </div>

              {/* 4. RIVER NET TARGET */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handlePlaceRiverNet();
                }}
                onClick={() => {
                  if (selectedItemId === 'river_net') handlePlaceRiverNet();
                }}
                className={`p-4 rounded-3xl border-3 flex flex-col items-center text-center transition-all cursor-pointer ${
                  riverNetPlaced
                    ? 'bg-cyan-950/80 border-cyan-400 shadow-md'
                    : wrongBin === 'river'
                    ? 'bg-rose-950/80 border-rose-500 ring-4 ring-rose-500 animate-shake'
                    : 'bg-slate-900 border-cyan-500/40 hover:border-cyan-400'
                }`}
              >
                <div className="w-16 h-16 rounded-2xl bg-cyan-600/30 border-2 border-cyan-400 flex items-center justify-center text-3xl mb-2">
                  🌊
                </div>
                <h4 className="text-sm font-black text-cyan-300">RIVER CANAL</h4>
                <div className="text-[11px] font-bold text-white mt-0.5">
                  {riverNetPlaced ? '✓ NET INSTALLED' : 'Aquatic Barrier'}
                </div>
              </div>
            </div>

            {/* Draggable Trash Pieces Tray - NO GIVEAWAY HINTS */}
            <div className="w-full max-w-3xl bg-slate-900/95 border-2 border-slate-700 rounded-3xl p-4 shadow-xl">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2.5 text-center">
                🗑️ AVAILABLE WASTE ITEMS (DRAG OR TAP TO TEST)
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
                {trashItems.map((item) => (
                  <div
                    key={item.id}
                    draggable={!item.sorted}
                    onDragStart={(e) => handleDragStart(e, item.id)}
                    onClick={() => {
                      if (!item.sorted) {
                        setSelectedItemId(selectedItemId === item.id ? null : item.id);
                        soundManager.playClick();
                      }
                    }}
                    className={`p-2.5 rounded-2xl border-2 flex flex-col items-center text-center transition-all cursor-grab active:cursor-grabbing select-none ${
                      item.sorted
                        ? 'bg-slate-950/50 border-slate-800 opacity-40 cursor-not-allowed'
                        : selectedItemId === item.id
                        ? 'bg-amber-900/60 border-amber-400 ring-2 ring-amber-400 scale-105 shadow-xl'
                        : 'bg-slate-800/90 border-slate-600 hover:border-amber-400 hover:scale-102 shadow-md'
                    }`}
                  >
                    <span className="text-3xl mb-1">{item.emoji}</span>
                    <span className="text-xs font-bold text-white line-clamp-1">{item.name}</span>
                    {item.sorted && (
                      <span className="text-[10px] text-emerald-400 font-bold mt-1">✓ Sorted</span>
                    )}
                  </div>
                ))}

                {/* River Boom Net Item */}
                <div
                  draggable={!riverNetPlaced}
                  onDragStart={(e) => handleDragStart(e, 'river_net')}
                  onClick={() => {
                    if (!riverNetPlaced) {
                      setSelectedItemId(selectedItemId === 'river_net' ? null : 'river_net');
                      soundManager.playClick();
                    }
                  }}
                  className={`p-2.5 rounded-2xl border-2 flex flex-col items-center text-center transition-all cursor-grab active:cursor-grabbing select-none ${
                    riverNetPlaced
                      ? 'bg-slate-950/50 border-slate-800 opacity-40 cursor-not-allowed'
                      : selectedItemId === 'river_net'
                      ? 'bg-cyan-900/60 border-cyan-400 ring-2 ring-cyan-400 scale-105 shadow-xl'
                      : 'bg-cyan-950/60 border-cyan-500 hover:scale-102 shadow-md'
                  }`}
                >
                  <span className="text-3xl mb-1">🥅</span>
                  <span className="text-xs font-bold text-cyan-200 line-clamp-1">River Net</span>
                  {riverNetPlaced && (
                    <span className="text-[10px] text-cyan-300 font-bold mt-1">✓ Placed</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Victory Card */
          <div className="w-full max-w-lg bg-slate-900 border-2 border-emerald-400 rounded-3xl p-6 sm:p-8 text-center flex flex-col items-center gap-4 shadow-2xl animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-4xl">
              ♻️
            </div>

            <h3 className="text-2xl font-black font-arcade text-emerald-400">
              STREETS & RIVER CLEANED!
            </h3>

            <p className="text-sm text-slate-200 leading-relaxed">
              Every bottle, battery, and banana peel was dragged into the correct bin, and the floating net is protecting the river fish!
            </p>

            <div className="w-full bg-slate-950 rounded-2xl p-4 border border-slate-800 text-xs text-slate-300 space-y-2 text-left">
              <div className="flex justify-between font-bold">
                <span>Plastic Diverted from Landfill:</span>
                <span className="text-emerald-400">100% Recycled</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>River Protection:</span>
                <span className="text-cyan-400">Fish Safe & Clean</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Eco Points Earned:</span>
                <span className="text-yellow-400">+30 PTS</span>
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
