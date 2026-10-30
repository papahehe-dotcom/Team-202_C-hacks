/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { 
  Heart, Pause, Play, RotateCcw, Home, Volume2, VolumeX, 
  ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Shield, Zap, 
  Magnet, AlertTriangle, Sparkles, Building2, ChevronRight
} from 'lucide-react';
import { RunnerScene } from './RunnerScene';
import { ActiveMission, TokenType } from '../../types/ecoHero';
import { soundManager } from '../../audio/soundManager';

interface RunnerCanvasProps {
  onGameOver: (stats: { distance: number; coins: number; score: number; tokens: Record<TokenType, number> }) => void;
  onMissionTrigger: (mission: ActiveMission) => void;
  onCityGatesReached: (stats: { distance: number; coins: number; score: number }) => void;
  onBackToTitle: () => void;
  heroSkin?: 'emerald' | 'solar' | 'cyber' | 'aurora';
  magnetLevel?: number;
  shieldLevel?: number;
  coinMultiplier?: number;
}

export const RunnerCanvas: React.FC<RunnerCanvasProps> = ({
  onGameOver,
  onMissionTrigger,
  onCityGatesReached,
  onBackToTitle,
  heroSkin = 'emerald',
  magnetLevel = 0,
  shieldLevel = 0,
  coinMultiplier = 1,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<RunnerScene | null>(null);

  const [distance, setDistance] = useState(0);
  const [coins, setCoins] = useState(0);
  const [lives, setLives] = useState(5);
  const [monsterDistance, setMonsterDistance] = useState(20);
  const [monsterDanger, setMonsterDanger] = useState<'SAFE' | 'WARNING' | 'CRITICAL'>('SAFE');
  const [powerups, setPowerups] = useState({ magnetTime: 0, hasShield: false, turboTime: 0 });
  const [showGateReachedModal, setShowGateReachedModal] = useState(false);
  const [gateStats, setGateStats] = useState<{ distance: number; coins: number; score: number } | null>(null);
  const [tokens, setTokens] = useState<Record<TokenType, number>>({
    tree: 0,
    clean_air: 0,
    waste: 0,
    water: 0,
    solar: 0,
  });
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!mountRef.current) return;
    const scene = new RunnerScene(mountRef.current, {
      skin: heroSkin,
      magnetUpgradeLevel: magnetLevel,
      shieldUpgradeLevel: shieldLevel,
      coinMultiplier,
      initialLives: 5,
    });
    sceneRef.current = scene;

    scene.onDistanceChange = (m) => setDistance(m);
    scene.onCoinsChange = (c) => setCoins(c);
    scene.onLivesChange = (l) => setLives(l);
    scene.onTokensChange = (t) => setTokens(t);
    scene.onPowerupsChange = (p) => setPowerups(p);
    scene.onMonsterDistanceChange = (d, danger) => {
      setMonsterDistance(d);
      setMonsterDanger(danger);
    };

    scene.onCityGatesReached = (stats) => {
      setGateStats(stats);
      setShowGateReachedModal(true);
    };

    scene.onGameOver = (stats) => {
      onGameOver({
        ...stats,
        tokens: { ...scene.collectedTokens },
      });
    };

    scene.onMissionTrigger = (m) => {
      onMissionTrigger(m);
    };

    soundManager.startMusic();

    return () => {
      scene.destroy();
      sceneRef.current = null;
      soundManager.stopMusic();
    };
  }, []);

  const handlePauseToggle = () => {
    if (!sceneRef.current) return;
    const nextPaused = !isPaused;
    setIsPaused(nextPaused);
    sceneRef.current.isRunning = !nextPaused;
  };

  const handleRestart = () => {
    if (!mountRef.current) return;
    sceneRef.current?.destroy();
    const newScene = new RunnerScene(mountRef.current, {
      skin: heroSkin,
      magnetUpgradeLevel: magnetLevel,
      shieldUpgradeLevel: shieldLevel,
      coinMultiplier,
      initialLives: 5,
    });
    sceneRef.current = newScene;

    newScene.onDistanceChange = (m) => setDistance(m);
    newScene.onCoinsChange = (c) => setCoins(c);
    newScene.onLivesChange = (l) => setLives(l);
    newScene.onTokensChange = (t) => setTokens(t);
    newScene.onPowerupsChange = (p) => setPowerups(p);
    newScene.onMonsterDistanceChange = (d, danger) => {
      setMonsterDistance(d);
      setMonsterDanger(danger);
    };
    newScene.onCityGatesReached = (stats) => {
      setGateStats(stats);
      setShowGateReachedModal(true);
    };
    newScene.onGameOver = (stats) => {
      onGameOver({ ...stats, tokens: { ...newScene.collectedTokens } });
    };
    newScene.onMissionTrigger = (m) => onMissionTrigger(m);

    setDistance(0);
    setCoins(0);
    setLives(5);
    setMonsterDistance(20);
    setMonsterDanger('SAFE');
    setIsPaused(false);
    setShowGateReachedModal(false);
  };

  const gateProgressPercent = Math.min(100, Math.round((distance / 2500) * 100));

  return (
    <div className="relative w-full min-h-screen overflow-hidden select-none bg-slate-900 font-game flex flex-col justify-between">
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full" />

      {/* Top Arcade HUD (Light, Crisp, High-Contrast Game Style) */}
      <div className="absolute top-3 inset-x-3 sm:inset-x-6 max-w-4xl mx-auto flex flex-col gap-2 z-30 pointer-events-none">
        {/* Main Status Row */}
        <div className="flex items-center justify-between gap-2">
          {/* 5 Hearts / Lives + Escape Gate Progress */}
          <div className="flex items-center gap-2 pointer-events-auto">
            {/* 5 Heart Icons */}
            <div className="bg-white/95 border-2 border-emerald-400 rounded-2xl px-3 py-1.5 flex items-center gap-1 shadow-lg backdrop-blur-md">
              {[1, 2, 3, 4, 5].map((heartIndex) => (
                <Heart
                  key={heartIndex}
                  className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${
                    heartIndex <= lives
                      ? 'text-rose-500 fill-rose-500 scale-100 animate-pulse'
                      : 'text-slate-300 scale-75'
                  }`}
                />
              ))}
              <span className="text-xs font-black font-arcade text-slate-800 ml-1">
                {lives}/5
              </span>
            </div>

            {/* Escape to City Gates Distance */}
            <div className="bg-white/95 border-2 border-sky-400 rounded-2xl px-3 py-1 shadow-lg backdrop-blur-md text-slate-800 hidden sm:block">
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-sky-700 font-arcade">
                <Building2 className="w-3.5 h-3.5 text-sky-600" />
                <span>GATES: {Math.max(0, 2500 - distance)}M AWAY</span>
              </div>
              <div className="w-28 bg-slate-200 h-2 rounded-full overflow-hidden mt-0.5 border border-sky-200">
                <div 
                  className="bg-gradient-to-r from-sky-400 to-emerald-500 h-full transition-all duration-200" 
                  style={{ width: `${gateProgressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Monster Radar Alert Banner */}
          <div 
            className={`pointer-events-auto px-3.5 py-1.5 rounded-2xl border-2 flex items-center gap-2 shadow-lg backdrop-blur-md transition-all ${
              monsterDanger === 'CRITICAL'
                ? 'bg-rose-500/95 border-rose-300 text-white animate-bounce'
                : monsterDanger === 'WARNING'
                ? 'bg-amber-400/95 border-amber-200 text-slate-900'
                : 'bg-emerald-100/95 border-emerald-400 text-emerald-950'
            }`}
          >
            <span className="text-base sm:text-lg">👹</span>
            <div className="flex flex-col">
              <span className="text-[9px] font-black tracking-wider uppercase font-arcade leading-tight">
                {monsterDanger === 'CRITICAL' ? 'MONSTER LUNGING!' : monsterDanger === 'WARNING' ? 'MONSTER CLOSING IN' : 'MONSTER CHASE'}
              </span>
              <span className="text-xs font-black font-arcade">
                {monsterDistance}M BEHIND
              </span>
            </div>
          </div>

          {/* Coins & Pause Button */}
          <div className="flex items-center gap-2 pointer-events-auto">
            <div className="bg-white/95 border-2 border-amber-400 rounded-2xl px-3 py-1.5 shadow-lg backdrop-blur-md flex items-center gap-1.5 text-slate-900">
              <span className="text-base">🪙</span>
              <span className="text-base font-black font-arcade text-amber-600">{coins}</span>
            </div>

            <button
              onClick={handlePauseToggle}
              className="w-10 h-10 rounded-2xl bg-white/95 border-2 border-slate-300 text-slate-800 flex items-center justify-center hover:bg-slate-100 shadow-lg cursor-pointer"
              title="Pause Game"
            >
              {isPaused ? <Play className="w-5 h-5 fill-slate-800" /> : <Pause className="w-5 h-5 fill-slate-800" />}
            </button>
          </div>
        </div>

        {/* Mobile City Gates Progress bar (shown on small screens) */}
        <div className="sm:hidden w-full bg-white/90 border border-sky-300 rounded-xl px-2.5 py-1 shadow flex items-center justify-between text-[10px] font-arcade text-slate-800">
          <span>RUN TO GATES: {distance}m / 2500m</span>
          <span className="text-emerald-600 font-black">{gateProgressPercent}%</span>
        </div>
      </div>

      {/* Active Power-ups Bar (Floating Left) */}
      <div className="absolute top-24 left-4 z-20 pointer-events-none flex flex-col gap-2">
        {powerups.hasShield && (
          <div className="bg-cyan-500/90 border-2 border-white px-3 py-1 rounded-2xl text-xs font-black font-arcade text-white flex items-center gap-2 shadow-lg animate-pulse">
            <Shield className="w-4 h-4 fill-white" />
            <span>BIO-SHIELD ACTIVE</span>
          </div>
        )}

        {powerups.magnetTime > 0 && (
          <div className="bg-rose-500/90 border-2 border-white px-3 py-1 rounded-2xl text-xs font-black font-arcade text-white flex items-center gap-2 shadow-lg">
            <Magnet className="w-4 h-4" />
            <span>MAGNET: {powerups.magnetTime}S</span>
          </div>
        )}

        {powerups.turboTime > 0 && (
          <div className="bg-emerald-500/90 border-2 border-white px-3 py-1 rounded-2xl text-xs font-black font-arcade text-white flex items-center gap-2 shadow-lg animate-bounce">
            <Zap className="w-4 h-4 fill-white" />
            <span>TURBO SPEED: {powerups.turboTime}S</span>
          </div>
        )}

        {/* Collected Action Tokens */}
        <div className="flex flex-col gap-1 mt-1">
          {Object.entries(tokens).map(([type, count]) => {
            if (count === 0) return null;
            const icons: Record<string, string> = {
              tree: '🌲',
              clean_air: '💨',
              waste: '♻️',
              water: '💧',
              solar: '⚡',
            };
            return (
              <div
                key={type}
                className="bg-white/90 border border-slate-300 px-2.5 py-0.5 rounded-xl text-[11px] font-black font-arcade text-slate-800 flex items-center gap-1.5 shadow"
              >
                <span>{icons[type]}</span>
                <span>x{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Visual Controls Guide (Floating Center-Top Hint for first 100m) */}
      {distance < 120 && (
        <div className="absolute top-20 inset-x-0 mx-auto max-w-sm text-center z-20 pointer-events-none bg-white/90 border-2 border-emerald-400 rounded-2xl p-2 shadow-xl animate-bounce">
          <span className="text-xs font-black text-slate-800 font-arcade">
            SWIPE OR USE KEYS (A/D: MOVE, W: JUMP, S: SLIDE)
          </span>
          <p className="text-[10px] text-rose-600 font-bold">
            Avoid obstacles so the monster doesn't catch you! Reach 1000m to enter the City!
          </p>
        </div>
      )}

      {/* Bottom Ergonomic Virtual Controls (Light, Vibrant, Touch Friendly) */}
      <div className="absolute bottom-5 inset-x-4 max-w-lg mx-auto flex items-center justify-between z-30 pointer-events-none">
        {/* Left / Right Buttons */}
        <div className="flex gap-2 pointer-events-auto">
          <button
            onPointerDown={() => sceneRef.current?.moveLeft()}
            className="w-14 h-14 rounded-3xl bg-white/95 border-3 border-slate-300 border-b-6 border-slate-400 active:translate-y-1 active:border-b-2 text-slate-800 flex items-center justify-center shadow-xl cursor-pointer hover:bg-slate-50"
            title="Move Left (A / Left Arrow)"
          >
            <ArrowLeft className="w-7 h-7" />
          </button>
          <button
            onPointerDown={() => sceneRef.current?.moveRight()}
            className="w-14 h-14 rounded-3xl bg-white/95 border-3 border-slate-300 border-b-6 border-slate-400 active:translate-y-1 active:border-b-2 text-slate-800 flex items-center justify-center shadow-xl cursor-pointer hover:bg-slate-50"
            title="Move Right (D / Right Arrow)"
          >
            <ArrowRight className="w-7 h-7" />
          </button>
        </div>

        {/* Jump / Slide Buttons */}
        <div className="flex gap-2 pointer-events-auto">
          <button
            onPointerDown={() => sceneRef.current?.jump()}
            className="w-14 h-14 rounded-3xl bg-emerald-500 border-3 border-emerald-200 border-b-6 border-emerald-700 active:translate-y-1 active:border-b-2 text-white flex flex-col items-center justify-center shadow-xl cursor-pointer hover:brightness-110"
            title="Jump (W / Space / Up)"
          >
            <ArrowUp className="w-6 h-6" />
            <span className="text-[9px] font-black font-arcade">JUMP</span>
          </button>
          <button
            onPointerDown={() => sceneRef.current?.slide()}
            className="w-14 h-14 rounded-3xl bg-amber-500 border-3 border-amber-200 border-b-6 border-amber-700 active:translate-y-1 active:border-b-2 text-white flex flex-col items-center justify-center shadow-xl cursor-pointer hover:brightness-110"
            title="Slide (S / Down Arrow)"
          >
            <ArrowDown className="w-6 h-6" />
            <span className="text-[9px] font-black font-arcade">SLIDE</span>
          </button>
        </div>
      </div>

      {/* City Gates Reached Victory Modal (Transitions to Phase 2 - City Command!) */}
      {showGateReachedModal && gateStats && (
        <div className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border-4 border-emerald-500 rounded-3xl p-6 text-slate-900 text-center shadow-2xl animate-in zoom-in-95">
            <div className="w-20 h-20 rounded-full bg-emerald-100 border-4 border-emerald-400 mx-auto flex items-center justify-center text-4xl shadow-lg mb-3">
              🏰
            </div>
            <div className="inline-block px-3 py-1 rounded-full bg-emerald-500 text-white font-arcade text-xs tracking-wider uppercase mb-2">
              PHASE 1 COMPLETE!
            </div>
            <h2 className="text-3xl font-black font-arcade text-emerald-700 mb-1">
              CITY GATES SECURED!
            </h2>
            <p className="text-xs font-bold text-slate-600 mb-4">
              You sprinted 1,000 meters and escaped the Smog Monster! The blast doors slammed shut, keeping the creature out.
            </p>

            <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-3 mb-5 flex items-center justify-around text-xs font-black font-arcade">
              <div>
                <span className="text-slate-400 block text-[10px]">COINS COLLECTED</span>
                <span className="text-amber-500 text-base">+{gateStats.coins} 🪙</span>
              </div>
              <div className="h-6 w-px bg-slate-300" />
              <div>
                <span className="text-slate-400 block text-[10px]">ESCAPE SCORE</span>
                <span className="text-emerald-600 text-base">{gateStats.score} PTS</span>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 text-xs text-amber-900 font-bold mb-5 text-left">
              ⚠️ <span className="font-arcade">URGENT ALERT:</span> While inside the gates, you discover the metropolis is collapsing under severe climate crises (flooding, power outages, dirty water, and suffocating smog)!
            </div>

            <button
              onClick={() => onCityGatesReached(gateStats)}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 border-b-4 border-emerald-800 text-white font-black font-arcade text-base shadow-xl hover:brightness-105 active:translate-y-1 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>ENTER ECO-CITY COMMAND (PHASE 2)</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Pause Menu Modal */}
      {isPaused && (
        <div className="absolute inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white border-4 border-emerald-500 rounded-3xl p-6 text-slate-900 text-center shadow-2xl">
            <h2 className="text-3xl font-black font-arcade text-emerald-600 mb-6">GAME PAUSED</h2>

            <div className="space-y-3">
              <button
                onClick={handlePauseToggle}
                className="w-full py-4 rounded-2xl bg-emerald-500 text-white font-black font-arcade text-base shadow-lg hover:bg-emerald-600 cursor-pointer"
              >
                RESUME SPRINT
              </button>
              <button
                onClick={handleRestart}
                className="w-full py-3.5 rounded-2xl bg-slate-100 border-2 border-slate-300 font-black font-arcade text-sm text-slate-700 hover:bg-slate-200 cursor-pointer"
              >
                RESTART RUN
              </button>
              <button
                onClick={() => {
                  soundManager.stopMusic();
                  onBackToTitle();
                }}
                className="w-full py-3.5 rounded-2xl bg-slate-100 border-2 border-slate-300 font-black font-arcade text-sm text-slate-500 hover:bg-slate-200 cursor-pointer"
              >
                QUIT TO TITLE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
