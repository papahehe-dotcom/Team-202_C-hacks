/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Flame, Droplets, Shield, Award, Heart, Wind, AlertTriangle } from 'lucide-react';
import { soundManager } from '../../audio/soundManager';
import confetti from 'canvas-confetti';

interface Cell {
  id: number;
  type: 'tree' | 'burning' | 'burnt' | 'watered' | 'firebreak' | 'wildlife';
  health: number;
}

interface ForestRescueProps {
  onComplete: (success: boolean, stats: { treesSaved: number; firesExtinguished: number }) => void;
}

export const ForestRescue: React.FC<ForestRescueProps> = ({ onComplete }) => {
  const [grid, setGrid] = useState<Cell[]>(() => {
    // 5x5 forest grid
    const cells: Cell[] = [];
    for (let i = 0; i < 25; i++) {
      // 3 initial fires, 2 wildlife habitats, rest trees
      const isFire = i === 6 || i === 7 || i === 12;
      const isWildlife = i === 18 || i === 24;
      cells.push({
        id: i,
        type: isFire ? 'burning' : isWildlife ? 'wildlife' : 'tree',
        health: isFire ? 100 : 100,
      });
    }
    return cells;
  });

  const [selectedTool, setSelectedTool] = useState<'water' | 'firebreak'>('water');
  const [waterTank, setWaterTank] = useState(100);
  const [timeLeft, setTimeLeft] = useState(25);
  const [firesExtinguished, setFiresExtinguished] = useState(0);
  const [windDirection, setWindDirection] = useState<'NORTH' | 'EAST' | 'SOUTH' | 'WEST'>('EAST');
  const [isDone, setIsDone] = useState(false);

  // Water recharge
  useEffect(() => {
    const recharge = setInterval(() => {
      setWaterTank((prev) => Math.min(prev + 12, 100));
    }, 1000);
    return () => clearInterval(recharge);
  }, []);

  // Wind shifts periodically
  useEffect(() => {
    const windTimer = setInterval(() => {
      const dirs: Array<'NORTH' | 'EAST' | 'SOUTH' | 'WEST'> = ['NORTH', 'EAST', 'SOUTH', 'WEST'];
      setWindDirection(dirs[Math.floor(Math.random() * dirs.length)]);
    }, 6000);
    return () => clearInterval(windTimer);
  }, []);

  // Game clock & Fire Spread Loop
  useEffect(() => {
    if (isDone) return;

    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          endChallenge();
          return 0;
        }
        return t - 1;
      });

      // Fire simulation step
      setGrid((prevGrid) => {
        const next = prevGrid.map((c) => ({ ...c }));
        const burningIndices: number[] = [];

        next.forEach((cell, idx) => {
          if (cell.type === 'burning') {
            burningIndices.push(idx);
            cell.health -= 25;
            if (cell.health <= 0) {
              cell.type = 'burnt';
            }
          }
        });

        // Fire spreads to adjacent unburnt trees
        burningIndices.forEach((bIdx) => {
          const row = Math.floor(bIdx / 5);
          const col = bIdx % 5;
          const neighbors = [
            row > 0 ? bIdx - 5 : -1, // North
            row < 4 ? bIdx + 5 : -1, // South
            col > 0 ? bIdx - 1 : -1, // West
            col < 4 ? bIdx + 1 : -1, // East
          ];

          neighbors.forEach((nIdx) => {
            if (nIdx !== -1 && Math.random() > 0.65) {
              const target = next[nIdx];
              if (target.type === 'tree' || target.type === 'wildlife') {
                target.type = 'burning';
                target.health = 100;
              }
            }
          });
        });

        // Check if all fires are out!
        const remainingFires = next.filter((c) => c.type === 'burning').length;
        if (remainingFires === 0) {
          setTimeout(() => endChallenge(next), 200);
        }

        return next;
      });
    }, 1200);

    return () => clearInterval(timer);
  }, [isDone]);

  const endChallenge = (currentGrid = grid) => {
    setIsDone(true);
    const treesSaved = currentGrid.filter((c) => c.type === 'tree' || c.type === 'wildlife' || c.type === 'watered').length;
    const success = treesSaved >= 10;
    if (success) {
      soundManager.playSuccess();
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } else {
      soundManager.playSortWrong();
    }
    setTimeout(() => {
      onComplete(success, { treesSaved, firesExtinguished });
    }, 2400);
  };

  const handleCellClick = (idx: number) => {
    if (isDone) return;
    const target = grid[idx];

    if (selectedTool === 'water') {
      if (waterTank < 25) return;
      if (target.type === 'burning') {
        soundManager.playJump();
        setWaterTank((w) => w - 25);
        setFiresExtinguished((f) => f + 1);
        setGrid((prev) =>
          prev.map((c, i) => (i === idx ? { ...c, type: 'watered', health: 100 } : c))
        );
      } else if (target.type === 'tree' || target.type === 'wildlife') {
        // Pre-wet tree to fireproof it
        setWaterTank((w) => w - 20);
        setGrid((prev) =>
          prev.map((c, i) => (i === idx ? { ...c, type: 'watered' } : c))
        );
      }
    } else if (selectedTool === 'firebreak') {
      if (target.type === 'tree') {
        soundManager.playBuild();
        setGrid((prev) =>
          prev.map((c, i) => (i === idx ? { ...c, type: 'firebreak', health: 100 } : c))
        );
      }
    }
  };

  const burningCount = grid.filter((c) => c.type === 'burning').length;
  const treesAlive = grid.filter((c) => c.type === 'tree' || c.type === 'wildlife' || c.type === 'watered').length;

  return (
    <div className="relative w-full h-full bg-slate-950 text-white flex flex-col items-center justify-between p-4 overflow-hidden select-none">
      {/* Dynamic Background Wildfire Glow */}
      <div className="absolute inset-0 bg-radial from-orange-950/40 via-slate-950/80 to-slate-950 pointer-events-none" />

      {/* Top Arcade Mission Header */}
      <div className="w-full max-w-2xl bg-slate-900/90 border-2 border-orange-500/50 rounded-2xl p-4 backdrop-blur-md z-10 shadow-2xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center text-white shadow-lg animate-pulse">
            <Flame className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider bg-red-600 px-2 py-0.5 rounded text-white font-arcade">
                CRITICAL THREAT
              </span>
              <span className="text-xs text-orange-400 font-bold">SDG 13: Climate Action</span>
            </div>
            <h2 className="text-xl font-black font-arcade text-white tracking-wide">
              FOREST RESCUE: WILDFIRE CONTAINMENT
            </h2>
          </div>
        </div>

        {/* Meters */}
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-xs text-slate-400 font-bold uppercase">Time Left</div>
            <div className="text-2xl font-black font-arcade text-amber-400">{timeLeft}s</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-slate-400 font-bold uppercase">Active Fires</div>
            <div className="text-2xl font-black font-arcade text-red-500">{burningCount}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-slate-400 font-bold uppercase">Canopy Saved</div>
            <div className="text-2xl font-black font-arcade text-emerald-400">{treesAlive}/25</div>
          </div>
        </div>
      </div>

      {/* Interactive 5x5 Forest Grid */}
      <div className="relative z-10 my-auto p-4 bg-slate-900/80 border-4 border-slate-700 rounded-3xl shadow-2xl backdrop-blur-md">
        <div className="grid grid-cols-5 gap-2.5 w-[340px] sm:w-[420px] aspect-square">
          {grid.map((cell, idx) => {
            let bgClass = 'bg-emerald-800 border-emerald-600 hover:border-white';
            let icon = <span className="text-2xl">🌲</span>;

            if (cell.type === 'burning') {
              bgClass = 'bg-gradient-to-t from-red-600 to-orange-500 border-yellow-300 animate-pulse shadow-lg shadow-orange-500/50 scale-105';
              icon = <Flame className="w-8 h-8 text-yellow-200 animate-bounce" />;
            } else if (cell.type === 'burnt') {
              bgClass = 'bg-stone-800 border-stone-700 opacity-60';
              icon = <span className="text-2xl grayscale">🪵</span>;
            } else if (cell.type === 'watered') {
              bgClass = 'bg-cyan-800 border-cyan-400';
              icon = <Droplets className="w-7 h-7 text-cyan-200" />;
            } else if (cell.type === 'firebreak') {
              bgClass = 'bg-amber-950 border-amber-800';
              icon = <Shield className="w-6 h-6 text-amber-400" />;
            } else if (cell.type === 'wildlife') {
              bgClass = 'bg-emerald-700 border-amber-400';
              icon = <span className="text-2xl">🦌</span>;
            }

            return (
              <button
                key={cell.id}
                onClick={() => handleCellClick(idx)}
                className={`flex flex-col items-center justify-center rounded-2xl border-2 transition-all cursor-pointer transform active:scale-95 ${bgClass}`}
              >
                {icon}
                {cell.type === 'burning' && (
                  <div className="w-full px-1.5 mt-1">
                    <div className="w-full bg-black/50 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-yellow-400 h-full transition-all"
                        style={{ width: `${cell.health}%` }}
                      />
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Environmental Wind Indicator */}
        <div className="mt-3 flex items-center justify-between text-xs font-bold text-slate-300 px-2">
          <div className="flex items-center gap-1.5">
            <Wind className="w-4 h-4 text-cyan-400 animate-spin" />
            <span>WIND BEARING: <strong className="text-cyan-300 font-arcade">{windDirection}</strong></span>
          </div>
          <div className="text-slate-400">Tap burning tiles to drop retardant!</div>
        </div>
      </div>

      {/* Bottom Tool Selector & Water Tank Gauge */}
      <div className="w-full max-w-xl z-10 flex flex-col gap-3">
        {/* Water Capacity Bar */}
        <div className="bg-slate-900 border-2 border-cyan-500/40 rounded-xl p-2.5 flex items-center gap-3">
          <Droplets className="w-6 h-6 text-cyan-400 shrink-0" />
          <div className="flex-1">
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-cyan-300 font-arcade">AERIAL WATER TANK</span>
              <span className="text-white font-arcade">{waterTank}%</span>
            </div>
            <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
                style={{ width: `${waterTank}%` }}
              />
            </div>
          </div>
        </div>

        {/* Tool Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setSelectedTool('water')}
            className={`py-3 rounded-2xl font-black font-arcade text-base flex items-center justify-center gap-2 transition-all ${
              selectedTool === 'water'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg border-2 border-white scale-102'
                : 'bg-slate-800 text-slate-300 border-2 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Droplets className="w-5 h-5" />
            WATER BUCKET DROP (-25%)
          </button>
          <button
            onClick={() => setSelectedTool('firebreak')}
            className={`py-3 rounded-2xl font-black font-arcade text-base flex items-center justify-center gap-2 transition-all ${
              selectedTool === 'firebreak'
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg border-2 border-white scale-102'
                : 'bg-slate-800 text-slate-300 border-2 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Shield className="w-5 h-5" />
            CUT FIREBREAK LINE
          </button>
        </div>
      </div>
    </div>
  );
};
