/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Recycle, Zap, Trash2, CheckCircle2, XCircle, Sparkles, RefreshCw } from 'lucide-react';
import { soundManager } from '../../audio/soundManager';
import confetti from 'canvas-confetti';

export type WasteCategory = 'plastic_metal' | 'organic' | 'paper' | 'ewaste';

interface WasteItem {
  id: string;
  name: string;
  emoji: string;
  category: WasteCategory;
  positionY: number; // 0 (top of belt) to 100 (drop off end)
}

const ITEM_CATALOG: Array<{ name: string; emoji: string; category: WasteCategory }> = [
  { name: 'Plastic Soda Bottle', emoji: '🍾', category: 'plastic_metal' },
  { name: 'Crushed Soda Can', emoji: '🥫', category: 'plastic_metal' },
  { name: 'Water Jug', emoji: '🧴', category: 'plastic_metal' },
  { name: 'Apple Core', emoji: '🍏', category: 'organic' },
  { name: 'Banana Peel', emoji: '🍌', category: 'organic' },
  { name: 'Leftover Bread', emoji: '🍞', category: 'organic' },
  { name: 'Cardboard Box', emoji: '📦', category: 'paper' },
  { name: 'Newspaper Bundle', emoji: '📰', category: 'paper' },
  { name: 'Paper Bag', emoji: '🛍️', category: 'paper' },
  { name: 'Broken Smartphone', emoji: '📱', category: 'ewaste' },
  { name: 'Laptop Battery', emoji: '🔋', category: 'ewaste' },
  { name: 'Old Circuit Board', emoji: '💾', category: 'ewaste' },
];

interface WasteRushProps {
  onComplete: (success: boolean, stats: { sortedCount: number; maxCombo: number }) => void;
}

export const WasteRush: React.FC<WasteRushProps> = ({ onComplete }) => {
  const [items, setItems] = useState<WasteItem[]>([]);
  const [sortedCount, setSortedCount] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(25);
  const [isGameOver, setIsGameOver] = useState(false);
  const [lastFeedback, setLastFeedback] = useState<'CORRECT' | 'WRONG' | null>(null);

  const TARGET_GOAL = 14;
  const speedRef = useRef(1.6);

  // Spawn initial items
  useEffect(() => {
    const initial: WasteItem[] = [];
    for (let i = 0; i < 3; i++) {
      const template = ITEM_CATALOG[Math.floor(Math.random() * ITEM_CATALOG.length)];
      initial.push({
        id: `item-${Date.now()}-${i}`,
        ...template,
        positionY: 20 + i * 25,
      });
    }
    setItems(initial);
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (isGameOver) return;
      if (e.key === 'ArrowLeft' || e.key === '1') sortActiveItem('plastic_metal');
      if (e.key === 'ArrowUp' || e.key === '2') sortActiveItem('organic');
      if (e.key === 'ArrowDown' || e.key === '3') sortActiveItem('paper');
      if (e.key === 'ArrowRight' || e.key === '4') sortActiveItem('ewaste');
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  });

  // Conveyor Belt Animation Loop
  useEffect(() => {
    if (isGameOver) return;

    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          finishGame(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    const animLoop = setInterval(() => {
      setItems((prevItems) => {
        const next = prevItems.map((item) => ({
          ...item,
          positionY: item.positionY + speedRef.current,
        }));

        // Check if bottom item fell off conveyor (missed)
        if (next.length > 0 && next[0].positionY >= 95) {
          soundManager.playSortWrong();
          setCombo(0);
          setLastFeedback('WRONG');
          next.shift();
        }

        // Spawn new item if less than 4 items on belt
        if (next.length < 4) {
          const lastY = next.length > 0 ? next[next.length - 1].positionY : 0;
          if (lastY > 24) {
            const template = ITEM_CATALOG[Math.floor(Math.random() * ITEM_CATALOG.length)];
            next.push({
              id: `item-${Date.now()}-${Math.random()}`,
              ...template,
              positionY: 0,
            });
          }
        }

        return next;
      });
    }, 40);

    return () => {
      clearInterval(interval);
      clearInterval(animLoop);
    };
  }, [isGameOver]);

  const sortActiveItem = (chosenCategory: WasteCategory) => {
    if (isGameOver || items.length === 0) return;

    // The item closest to the bottom (index 0) is the target
    const currentItem = items[0];
    if (currentItem.category === chosenCategory) {
      // SUCCESSFUL SORT
      soundManager.playSortCorrect();
      setLastFeedback('CORRECT');
      const newCombo = combo + 1;
      setCombo(newCombo);
      setMaxCombo((m) => Math.max(m, newCombo));
      const newCount = sortedCount + 1;
      setSortedCount(newCount);

      // Speed up slightly
      speedRef.current = Math.min(speedRef.current + 0.08, 3.2);

      // Pop item
      setItems((prev) => prev.slice(1));

      if (newCount >= TARGET_GOAL) {
        finishGame(true, newCount);
      }
    } else {
      // MISSED SORT
      soundManager.playSortWrong();
      setLastFeedback('WRONG');
      setCombo(0);
      setItems((prev) => prev.slice(1));
    }
  };

  const finishGame = (success: boolean, finalCount = sortedCount) => {
    setIsGameOver(true);
    if (success) {
      soundManager.playSuccess();
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.5 } });
    }
    setTimeout(() => {
      onComplete(success, { sortedCount: finalCount, maxCombo });
    }, 2200);
  };

  const currentItem = items[0];

  return (
    <div className="relative w-full h-full bg-slate-950 text-white flex flex-col items-center justify-between p-4 overflow-hidden select-none">
      {/* Top Arcade HUD */}
      <div className="w-full max-w-2xl bg-slate-900/95 border-2 border-amber-500/50 rounded-2xl p-4 backdrop-blur-md z-10 shadow-2xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-lg animate-bounce">
            <Recycle className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider bg-amber-600 px-2 py-0.5 rounded text-white font-arcade">
                CIRCULAR RUSH
              </span>
              <span className="text-xs text-amber-400 font-bold">SDG 12: Zero Waste</span>
            </div>
            <h2 className="text-xl font-black font-arcade text-white tracking-wide">
              WASTE RUSH: HIGH-SPEED SORTING
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-xs text-slate-400 font-bold uppercase">Time</div>
            <div className="text-2xl font-black font-arcade text-amber-400">{timeLeft}s</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-slate-400 font-bold uppercase">Combo</div>
            <div className="text-2xl font-black font-arcade text-cyan-400">{combo}x</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-slate-400 font-bold uppercase">Sorted</div>
            <div className="text-2xl font-black font-arcade text-emerald-400">
              {sortedCount}/{TARGET_GOAL}
            </div>
          </div>
        </div>
      </div>

      {/* Central 3D Perspective Conveyor Belt */}
      <div className="relative w-full max-w-md h-72 sm:h-80 my-auto flex flex-col items-center justify-center">
        {/* Animated conveyor belt frame */}
        <div className="relative w-48 sm:w-56 h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-x-8 border-slate-700 shadow-2xl rounded-xl overflow-hidden flex flex-col items-center">
          {/* Moving conveyor ridges */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, #ffffff 0px, #ffffff 6px, transparent 6px, transparent 24px)',
              animation: 'conveyor-roll 0.8s linear infinite',
            }}
          />

          {/* Active items rolling down */}
          {items.map((item, index) => {
            const isFront = index === 0;
            return (
              <div
                key={item.id}
                className={`absolute flex flex-col items-center transition-transform ${
                  isFront ? 'scale-115 z-20' : 'scale-90 opacity-80 z-10'
                }`}
                style={{ top: `${item.positionY}%` }}
              >
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center text-4xl shadow-xl border-3 ${
                    isFront
                      ? 'bg-amber-400/20 border-amber-300 animate-pulse ring-4 ring-amber-400/40'
                      : 'bg-slate-800/80 border-slate-600'
                  }`}
                >
                  {item.emoji}
                </div>
                {isFront && (
                  <span className="mt-1 px-2 py-0.5 bg-black/80 rounded-full text-[11px] font-black text-amber-300 font-arcade whitespace-nowrap">
                    {item.name}
                  </span>
                )}
              </div>
            );
          })}

          {/* Target Sort Line */}
          <div className="absolute bottom-6 w-full border-b-4 border-dashed border-red-500/80 flex justify-center">
            <span className="text-[10px] font-black bg-red-600 px-2 py-0.5 rounded text-white font-arcade uppercase">
              SORT ZONE
            </span>
          </div>
        </div>

        {/* Feedback Flash */}
        {lastFeedback && (
          <div
            key={Date.now()}
            className={`absolute top-4 font-black font-arcade text-lg px-4 py-1.5 rounded-full shadow-2xl animate-bounce ${
              lastFeedback === 'CORRECT' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
            }`}
          >
            {lastFeedback === 'CORRECT' ? '✨ PERFECT RECYCLE!' : '⚠️ CONTAMINATED BIN!'}
          </div>
        )}
      </div>

      {/* 4 Color-Coded Recycling Receptacle Bins (Tactile arcade pads) */}
      <div className="w-full max-w-2xl z-10 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Bin 1: Blue - Plastic / Metal */}
        <button
          onClick={() => sortActiveItem('plastic_metal')}
          className="group relative p-3 rounded-2xl bg-gradient-to-b from-blue-500 to-blue-700 border-2 border-blue-300 border-b-6 border-blue-900 active:translate-y-1 active:border-b-2 shadow-lg flex flex-col items-center text-center cursor-pointer transition-all"
        >
          <div className="text-3xl mb-1 group-hover:scale-110 transition-transform">🧴🥫</div>
          <div className="font-black font-arcade text-sm text-white">PLASTICS & METAL</div>
          <div className="text-[10px] text-blue-200 font-bold uppercase mt-0.5">← Key 1 / Left</div>
        </button>

        {/* Bin 2: Green - Organics */}
        <button
          onClick={() => sortActiveItem('organic')}
          className="group relative p-3 rounded-2xl bg-gradient-to-b from-emerald-500 to-emerald-700 border-2 border-emerald-300 border-b-6 border-emerald-900 active:translate-y-1 active:border-b-2 shadow-lg flex flex-col items-center text-center cursor-pointer transition-all"
        >
          <div className="text-3xl mb-1 group-hover:scale-110 transition-transform">🍏🍌</div>
          <div className="font-black font-arcade text-sm text-white">ORGANIC COMPOST</div>
          <div className="text-[10px] text-emerald-200 font-bold uppercase mt-0.5">↑ Key 2 / Up</div>
        </button>

        {/* Bin 3: Yellow - Paper */}
        <button
          onClick={() => sortActiveItem('paper')}
          className="group relative p-3 rounded-2xl bg-gradient-to-b from-amber-500 to-amber-700 border-2 border-amber-300 border-b-6 border-amber-900 active:translate-y-1 active:border-b-2 shadow-lg flex flex-col items-center text-center cursor-pointer transition-all"
        >
          <div className="text-3xl mb-1 group-hover:scale-110 transition-transform">📦📰</div>
          <div className="font-black font-arcade text-sm text-white">PAPER & CARTONS</div>
          <div className="text-[10px] text-amber-200 font-bold uppercase mt-0.5">↓ Key 3 / Down</div>
        </button>

        {/* Bin 4: Purple - E-Waste */}
        <button
          onClick={() => sortActiveItem('ewaste')}
          className="group relative p-3 rounded-2xl bg-gradient-to-b from-purple-500 to-purple-700 border-2 border-purple-300 border-b-6 border-purple-900 active:translate-y-1 active:border-b-2 shadow-lg flex flex-col items-center text-center cursor-pointer transition-all"
        >
          <div className="text-3xl mb-1 group-hover:scale-110 transition-transform">📱🔋</div>
          <div className="font-black font-arcade text-sm text-white">E-WASTE / TECH</div>
          <div className="text-[10px] text-purple-200 font-bold uppercase mt-0.5">→ Key 4 / Right</div>
        </button>
      </div>
    </div>
  );
};
