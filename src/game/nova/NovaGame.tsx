/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  PlayerState,
  GameStage,
  InteractiveObject,
  ResourceItem,
  HazardEntity,
  GrimeBoss,
  DistrictId,
  AbilityType,
  EnvironmentalSimulationState,
} from './types';
import {
  INTERACTIVE_OBJECTS,
  generateInitialResources,
  generateInitialHazards,
  CITY_GATES,
  DISTRICTS,
} from './worldMap';
import {
  calculateSimulationState,
  evaluateGameStage,
  loadSavedGame,
  saveGameData,
} from './simulation';
import { NovaCanvas } from './NovaCanvas';
import { novaAudio } from './audio';
import {
  Heart,
  Shield,
  Zap,
  Droplets,
  Leaf,
  RefreshCw,
  Compass,
  Volume2,
  VolumeX,
  HelpCircle,
  Map as MapIcon,
  Award,
  ChevronRight,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

interface NovaGameProps {
  onOpenHub?: () => void;
}

export const NovaGame: React.FC<NovaGameProps> = ({ onOpenHub }) => {
  // Load saved state or default
  const savedData = useRef(loadSavedGame()).current;

  // Player State
  const [player, setPlayer] = useState<PlayerState>({
    x: 480,
    y: 420,
    vx: 0,
    vy: 0,
    radius: 18,
    angle: 0,
    speed: 240,
    lives: 5,
    maxLives: 5,
    health: 100,
    maxHealth: 100,
    invulnerableTimer: 0,
    inventory: {
      NATURE: 2,
      WATER: 2,
      CLEAN_ENERGY: 2,
      RECYCLE: 2,
    },
    inventoryCap: 15,
    abilities: {
      NATURE_PULSE: {
        unlocked: true,
        cooldownRemaining: 0,
        maxCooldown: 8,
        durationRemaining: 0,
        duration: 2,
        cost: { type: 'NATURE', amount: 1 },
      },
      WATER_BURST: {
        unlocked: true,
        cooldownRemaining: 0,
        maxCooldown: 8,
        durationRemaining: 0,
        duration: 2,
        cost: { type: 'WATER', amount: 1 },
      },
      SOLAR_DASH: {
        unlocked: true,
        cooldownRemaining: 0,
        maxCooldown: 6,
        durationRemaining: 0,
        duration: 1.5,
        cost: { type: 'CLEAN_ENERGY', amount: 1 },
      },
      RECYCLE_SHIELD: {
        unlocked: true,
        cooldownRemaining: 0,
        maxCooldown: 12,
        durationRemaining: 0,
        duration: 5,
        cost: { type: 'RECYCLE', amount: 1 },
      },
    },
    score: 0,
    ecoPoints: 0,
  });

  const [gameStage, setGameStage] = useState<GameStage>(1);
  const [interactiveObjects, setInteractiveObjects] = useState<InteractiveObject[]>(
    () => JSON.parse(JSON.stringify(INTERACTIVE_OBJECTS))
  );
  const [resources, setResources] = useState<ResourceItem[]>(() =>
    generateInitialResources()
  );
  const [hazards] = useState<HazardEntity[]>(() =>
    generateInitialHazards()
  );

  // GRIME Final Boss
  const [boss, setBoss] = useState<GrimeBoss>({
    active: false,
    revealed: false,
    x: 1400,
    y: 1020,
    radius: 65,
    health: 100,
    maxHealth: 100,
    shieldCoresActive: 4,
    attackCooldown: 3.5,
    currentAttacks: [],
    defeated: false,
  });

  const [activeDistrict, setActiveDistrict] = useState<DistrictId>('INDUSTRIAL');
  const [showMinimap, setShowMinimap] = useState<boolean>(true);
  const [showStoryModal, setShowStoryModal] = useState<boolean>(false);
  const [showGameOverModal, setShowGameOverModal] = useState<boolean>(false);
  const [showVictoryModal, setShowVictoryModal] = useState<boolean>(false);
  const [stageToast, setStageToast] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Mobile virtual joystick
  const [virtualJoyDir, setVirtualJoyDir] = useState<{ x: number; y: number } | null>(null);

  // Simulation Metrics
  const [simulation, setSimulation] = useState<EnvironmentalSimulationState>(() =>
    calculateSimulationState(interactiveObjects)
  );

  // Handle stage gate opening
  const updateGatesForStage = useCallback((stage: GameStage) => {
    CITY_GATES.forEach((gate) => {
      if (gate.unlockedAtStage <= stage) {
        if (!gate.isOpen) {
          gate.isOpen = true;
          novaAudio.playGateUnlock();
        }
      }
    });
  }, []);

  // Check stage evolution whenever objects are restored
  const handleRestoreObject = (obj: InteractiveObject) => {
    setInteractiveObjects((prev) => {
      const next = prev.map((o) => (o.id === obj.id ? { ...o, restored: true } : o));
      const nextSim = calculateSimulationState(next);
      setSimulation(nextSim);

      const nextStage = evaluateGameStage(next);
      if (nextStage !== gameStage) {
        setGameStage(nextStage);
        updateGatesForStage(nextStage);

        let toastMsg = '';
        if (nextStage === 2) toastMsg = 'STAGE 2: WATER CRISIS! RIVER GATES OPENED.';
        if (nextStage === 3) toastMsg = 'STAGE 3: ENERGY GRID FAILURE! SUBSTATION UNLOCKED.';
        if (nextStage === 4) toastMsg = 'STAGE 4: BIOSPHERE DESTRUCTION! GREEN DISTRICT ACCESSIBLE.';
        if (nextStage === 5) {
          toastMsg = 'STAGE 5: WARNING! CENTRAL CORE OPENED. POLLUTION TITAN GRIME DISCOVERED!';
          setBoss((b) => ({ ...b, active: true, revealed: true }));
          novaAudio.playBossRoar();
        }
        if (nextStage === 6) {
          toastMsg = 'STAGE 6: NOVA RESTORED! GRIME SHIELD DESTROYED!';
        }

        setStageToast(toastMsg);
        setTimeout(() => setStageToast(null), 5000);
      }

      // Save progress
      saveGameData({
        highScore: Math.max(savedData.highScore, player.score + 250),
        bestRestoration: Math.max(savedData.bestRestoration, nextSim.overallRestoration),
        restoredObjectIds: next.filter((o) => o.restored).map((o) => o.id),
        currentStage: nextStage,
        achievements: savedData.achievements,
      });

      return next;
    });
  };

  const handleCollectResource = (res: ResourceItem) => {
    setPlayer((prev) => {
      const current = prev.inventory[res.type] || 0;
      return {
        ...prev,
        inventory: {
          ...prev.inventory,
          [res.type]: current + 1,
        },
        score: prev.score + 25,
        ecoPoints: prev.ecoPoints + 5,
      };
    });
  };

  const handlePlayerDeath = () => {
    setShowGameOverModal(true);
  };

  const handleVictory = () => {
    setShowVictoryModal(true);
  };

  const restartGame = () => {
    setPlayer((prev) => ({
      ...prev,
      x: 480,
      y: 420,
      lives: 5,
      health: 100,
      invulnerableTimer: 2.0,
      inventory: { NATURE: 3, WATER: 3, CLEAN_ENERGY: 3, RECYCLE: 3 },
    }));
    setShowGameOverModal(false);
    setShowVictoryModal(false);
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    novaAudio.enabled = next;
    novaAudio.musicEnabled = next;
    if (next) novaAudio.startAmbient();
    else novaAudio.stopAmbient();
  };

  // Joystick touch handlers
  const joyCenterRef = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    joyCenterRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!joyCenterRef.current) return;
    const touch = e.touches[0];
    const dx = touch.clientX - joyCenterRef.current.x;
    const dy = touch.clientY - joyCenterRef.current.y;
    const dist = Math.hypot(dx, dy);
    if (dist > 10) {
      setVirtualJoyDir({ x: dx / dist, y: dy / dist });
    }
  };

  const handleTouchEnd = () => {
    joyCenterRef.current = null;
    setVirtualJoyDir(null);
  };

  // Stage description helper
  const getStageDirective = () => {
    switch (gameStage) {
      case 1:
        return 'Stage 1: Restore 3 Smog Ionizers in the Industrial Sector to unlock River Gates.';
      case 2:
        return 'Stage 2: Repair 3 River Flood Gates & Water Filtration nodes to stop toxic runoff.';
      case 3:
        return 'Stage 3: Synchronize 3 Solar Heliostats & Power Substation matrices.';
      case 4:
        return 'Stage 4: Cultivate 3 Bio-Dome Seed Incubators in the Green Biosphere.';
      case 5:
        return 'Stage 5: ENTER CENTRAL CORE! Overload 4 Elemental Pillars to shatter GRIME\'s shield!';
      case 6:
        return 'Stage 6: NOVA RESTORED! GRIME defeated and the Last Green Signal is broadcast!';
      default:
        return '';
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans text-slate-100 flex flex-col">
      {/* --- TOP HUD BAR --- */}
      <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-2 bg-slate-950/80 backdrop-blur-md border-b border-cyan-500/30">
        {/* Left: Title & Lives */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-extrabold text-lg tracking-wider font-mono">
              ECO-RUSH
            </span>
            <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-semibold bg-cyan-950 border border-cyan-400/40 text-cyan-300 rounded">
              NOVA METROPOLIS
            </span>
          </div>

          {/* 5 Lives Display */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-900/90 rounded-full border border-rose-500/40">
            {Array.from({ length: 5 }).map((_, idx) => (
              <Heart
                key={idx}
                className={`w-4 h-4 transition-transform ${
                  idx < player.lives
                    ? 'text-rose-500 fill-rose-500 drop-shadow-[0_0_6px_rgba(244,63,94,0.7)]'
                    : 'text-slate-600'
                }`}
              />
            ))}
            <span className="ml-1 text-xs font-bold text-rose-300">{player.lives}/5</span>
          </div>

          {/* Health Bar */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-900/90 rounded-full border border-emerald-500/40">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <div className="w-20 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-300"
                style={{ width: `${(player.health / player.maxHealth) * 100}%` }}
              />
            </div>
            <span className="text-xs font-mono font-bold text-emerald-300">
              {Math.max(0, Math.round(player.health))} HP
            </span>
          </div>
        </div>

        {/* Center: Inventory Supplies */}
        <div className="hidden lg:flex items-center gap-3 bg-slate-900/90 px-4 py-1 rounded-full border border-slate-700">
          <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold" title="Nature Sprouts">
            <Leaf className="w-3.5 h-3.5" />
            <span>{player.inventory.NATURE}</span>
          </div>
          <div className="flex items-center gap-1 text-cyan-400 text-xs font-bold" title="Purified Water">
            <Droplets className="w-3.5 h-3.5" />
            <span>{player.inventory.WATER}</span>
          </div>
          <div className="flex items-center gap-1 text-amber-400 text-xs font-bold" title="Clean Solar Cells">
            <Zap className="w-3.5 h-3.5" />
            <span>{player.inventory.CLEAN_ENERGY}</span>
          </div>
          <div className="flex items-center gap-1 text-violet-400 text-xs font-bold" title="Recycled Alloys">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{player.inventory.RECYCLE}</span>
          </div>
          <span className="text-[10px] text-slate-400 border-l border-slate-700 pl-2">
            Bag: {player.inventory.NATURE + player.inventory.WATER + player.inventory.CLEAN_ENERGY + player.inventory.RECYCLE}/15
          </span>
        </div>

        {/* Right: Metrics & Settings */}
        <div className="flex items-center gap-2">
          {/* Sustainability Meter */}
          <div className="flex items-center gap-2 bg-emerald-950/60 border border-emerald-400/40 px-3 py-1 rounded-lg">
            <div className="text-right">
              <div className="text-[10px] text-emerald-300 font-semibold uppercase tracking-wider">
                Restoration
              </div>
              <div className="text-sm font-black text-emerald-400 font-mono">
                {simulation.overallRestoration}%
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowMinimap(!showMinimap)}
            className={`p-2 rounded-lg border transition-colors ${
              showMinimap
                ? 'bg-cyan-900/60 border-cyan-400 text-cyan-200'
                : 'bg-slate-900 border-slate-700 text-slate-400'
            }`}
            title="Toggle Minimap [M]"
          >
            <MapIcon className="w-4 h-4" />
          </button>

          <button
            onClick={toggleSound}
            className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white"
            title="Toggle Audio"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          <button
            onClick={() => setShowStoryModal(true)}
            className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-cyan-400 hover:text-cyan-200"
            title="Story & Objectives"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {onOpenHub && (
            <button
              onClick={onOpenHub}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-slate-300 hover:text-white hover:border-slate-500"
              title="Return to Game Hub"
            >
              HUB
            </button>
          )}
        </div>
      </header>

      {/* --- CURRENT OBJECTIVE BANNER --- */}
      <div className="absolute top-12 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        <div className="bg-slate-950/85 backdrop-blur-md border border-cyan-500/30 px-3 py-1.5 rounded-lg max-w-xl flex items-center gap-2 text-xs">
          <Compass className="w-4 h-4 text-cyan-400 shrink-0 animate-pulse" />
          <div>
            <span className="text-cyan-400 font-bold mr-1">CURRENT DIRECTIVE:</span>
            <span className="text-slate-200">{getStageDirective()}</span>
          </div>
        </div>

        <div className="hidden sm:flex bg-slate-950/85 backdrop-blur-md border border-slate-700 px-3 py-1 rounded-lg text-xs font-semibold text-slate-300">
          Sector: <span className="text-cyan-300 font-bold ml-1">{DISTRICTS.find(d => d.id === activeDistrict)?.name}</span>
        </div>
      </div>

      {/* --- STAGE TOAST NOTIFICATION --- */}
      {stageToast && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-40 bg-gradient-to-r from-emerald-950 via-slate-900 to-cyan-950 border-2 border-emerald-400/80 px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce">
          <Award className="w-6 h-6 text-emerald-400 animate-spin" />
          <span className="text-emerald-300 font-bold font-mono text-sm tracking-wide">
            {stageToast}
          </span>
        </div>
      )}

      {/* --- MAIN GAME CANVAS --- */}
      <div className="flex-1 w-full h-full relative">
        <NovaCanvas
          player={player}
          onUpdatePlayer={setPlayer}
          gameStage={gameStage}
          onSetGameStage={setGameStage}
          interactiveObjects={interactiveObjects}
          onRestoreObject={handleRestoreObject}
          resources={resources}
          onCollectResource={handleCollectResource}
          hazards={hazards}
          boss={boss}
          onUpdateBoss={setBoss}
          onPlayerDeath={handlePlayerDeath}
          onVictory={handleVictory}
          activeDistrict={activeDistrict}
          setActiveDistrict={setActiveDistrict}
          showMinimap={showMinimap}
          virtualJoyDir={virtualJoyDir}
        />

        {/* Mobile Virtual Joystick Touch Region */}
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="md:hidden absolute bottom-24 left-6 w-28 h-28 rounded-full border-2 border-cyan-500/30 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center touch-none z-30"
        >
          <div className="w-10 h-10 rounded-full bg-cyan-400/40 border border-cyan-300 flex items-center justify-center text-xs text-white">
            MOVE
          </div>
        </div>
      </div>

      {/* --- BOTTOM ABILITY & HOTBAR BAR --- */}
      <footer className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-slate-950/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-cyan-500/40 shadow-2xl">
        {/* Ability 1: Nature Pulse */}
        <button
          onClick={() => {
            const ev = new KeyboardEvent('keydown', { key: '1', code: 'Digit1' });
            window.dispatchEvent(ev);
          }}
          className={`flex flex-col items-center p-2 rounded-xl border transition-all ${
            player.abilities.NATURE_PULSE.cooldownRemaining > 0
              ? 'bg-slate-900/50 border-slate-700 opacity-60'
              : 'bg-emerald-950/70 border-emerald-500 hover:bg-emerald-900/80 active:scale-95'
          }`}
          title="Clear corruption & push hazards (Cost: 1 Nature)"
        >
          <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold">
            <Leaf className="w-4 h-4" />
            <span>[1] PULSE</span>
          </div>
          <span className="text-[10px] text-emerald-300 font-mono mt-0.5">
            {player.abilities.NATURE_PULSE.cooldownRemaining > 0
              ? `${Math.ceil(player.abilities.NATURE_PULSE.cooldownRemaining)}s`
              : 'READY'}
          </span>
        </button>

        {/* Ability 2: Water Burst */}
        <button
          onClick={() => {
            const ev = new KeyboardEvent('keydown', { key: '2', code: 'Digit2' });
            window.dispatchEvent(ev);
          }}
          className={`flex flex-col items-center p-2 rounded-xl border transition-all ${
            player.abilities.WATER_BURST.cooldownRemaining > 0
              ? 'bg-slate-900/50 border-slate-700 opacity-60'
              : 'bg-cyan-950/70 border-cyan-500 hover:bg-cyan-900/80 active:scale-95'
          }`}
          title="Extinguish toxic fires & wash acid (Cost: 1 Water)"
        >
          <div className="flex items-center gap-1 text-cyan-400 text-xs font-bold">
            <Droplets className="w-4 h-4" />
            <span>[2] BURST</span>
          </div>
          <span className="text-[10px] text-cyan-300 font-mono mt-0.5">
            {player.abilities.WATER_BURST.cooldownRemaining > 0
              ? `${Math.ceil(player.abilities.WATER_BURST.cooldownRemaining)}s`
              : 'READY'}
          </span>
        </button>

        {/* Ability 3: Solar Dash */}
        <button
          onClick={() => {
            const ev = new KeyboardEvent('keydown', { key: '3', code: 'Digit3' });
            window.dispatchEvent(ev);
          }}
          className={`flex flex-col items-center p-2 rounded-xl border transition-all ${
            player.abilities.SOLAR_DASH.cooldownRemaining > 0
              ? 'bg-slate-900/50 border-slate-700 opacity-60'
              : 'bg-amber-950/70 border-amber-500 hover:bg-amber-900/80 active:scale-95'
          }`}
          title="2.2x speed boost & phase through hazards (Cost: 1 Clean Energy)"
        >
          <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
            <Zap className="w-4 h-4" />
            <span>[3] DASH</span>
          </div>
          <span className="text-[10px] text-amber-300 font-mono mt-0.5">
            {player.abilities.SOLAR_DASH.cooldownRemaining > 0
              ? `${Math.ceil(player.abilities.SOLAR_DASH.cooldownRemaining)}s`
              : 'READY'}
          </span>
        </button>

        {/* Ability 4: Recycle Shield */}
        <button
          onClick={() => {
            const ev = new KeyboardEvent('keydown', { key: '4', code: 'Digit4' });
            window.dispatchEvent(ev);
          }}
          className={`flex flex-col items-center p-2 rounded-xl border transition-all ${
            player.abilities.RECYCLE_SHIELD.cooldownRemaining > 0
              ? 'bg-slate-900/50 border-slate-700 opacity-60'
              : 'bg-violet-950/70 border-violet-500 hover:bg-violet-900/80 active:scale-95'
          }`}
          title="Invulnerable barrier for 5s (Cost: 1 Recycle)"
        >
          <div className="flex items-center gap-1 text-violet-400 text-xs font-bold">
            <RefreshCw className="w-4 h-4" />
            <span>[4] SHIELD</span>
          </div>
          <span className="text-[10px] text-violet-300 font-mono mt-0.5">
            {player.abilities.RECYCLE_SHIELD.cooldownRemaining > 0
              ? `${Math.ceil(player.abilities.RECYCLE_SHIELD.cooldownRemaining)}s`
              : 'READY'}
          </span>
        </button>

        {/* Touch Interact Button for Mobile */}
        <button
          onClick={() => {
            const ev = new KeyboardEvent('keydown', { key: 'e', code: 'KeyE' });
            window.dispatchEvent(ev);
          }}
          className="ml-2 px-3 py-2 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-extrabold text-xs rounded-xl shadow-lg border border-emerald-300/40 active:scale-95 flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>[E] RESTORE</span>
        </button>
      </footer>

      {/* --- STORY & OBJECTIVES MODAL --- */}
      {showStoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-cyan-500/50 max-w-2xl w-full rounded-2xl p-6 shadow-2xl flex flex-col gap-4 text-slate-200">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <h2 className="text-xl font-black text-cyan-400 tracking-wider font-mono">
                NOVA ARCHIVES: MISSION BRIEFING
              </h2>
              <button
                onClick={() => setShowStoryModal(false)}
                className="text-slate-400 hover:text-white font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
              <p>
                Welcome, <span className="text-emerald-400 font-bold">Eco-Guardian</span>. You are deployed into <span className="text-cyan-300 font-bold">NOVA</span>, a futuristic metropolis on the brink of total ecological collapse.
              </p>

              <div className="p-3 bg-slate-800/80 rounded-xl border border-cyan-500/20 space-y-2">
                <h3 className="font-bold text-cyan-300 text-sm">ONE INTERCONNECTED CITY</h3>
                <p>
                  Nova is not a set of disjointed levels. It is one living metropolis with six interconnected sectors: <span className="text-slate-300 font-semibold">Industrial, Residential, River Aqueduct, Energy Matrix, Green Biosphere, and the Central Core.</span>
                </p>
                <p>
                  Security gates initially block hazardous sectors. As you restore environmental systems, new gateways open seamlessly across the city.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-slate-800/60 rounded-lg border border-emerald-500/30">
                  <div className="text-emerald-400 font-bold flex items-center gap-1">🌿 NATURE</div>
                  <p className="text-[11px] text-slate-300 mt-1">Found in parks. Used to germinate bio-domes & power Nature Pulse.</p>
                </div>
                <div className="p-2.5 bg-slate-800/60 rounded-lg border border-cyan-500/30">
                  <div className="text-cyan-400 font-bold flex items-center gap-1">💧 WATER</div>
                  <p className="text-[11px] text-slate-300 mt-1">Found by canals. Used to repair aqueduct valves & Water Burst.</p>
                </div>
                <div className="p-2.5 bg-slate-800/60 rounded-lg border border-amber-500/30">
                  <div className="text-amber-400 font-bold flex items-center gap-1">⚡ CLEAN ENERGY</div>
                  <p className="text-[11px] text-slate-300 mt-1">Found in substations. Used to power solar arrays & Solar Dash.</p>
                </div>
                <div className="p-2.5 bg-slate-800/60 rounded-lg border border-violet-500/30">
                  <div className="text-violet-400 font-bold flex items-center gap-1">♻️ RECYCLE ALLOY</div>
                  <p className="text-[11px] text-slate-300 mt-1">Found near foundries. Used for building filters & Recycle Shield.</p>
                </div>
              </div>

              <div className="p-3 bg-rose-950/40 rounded-xl border border-rose-500/30">
                <div className="text-rose-400 font-bold flex items-center gap-1.5 text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  THE SOURCE OF CORRUPTION: GRIME
                </div>
                <p className="text-[11px] text-rose-200/90 mt-1">
                  All environmental failures are secretly orchestrated by a massive toxic titan named <strong>GRIME</strong> lurking sealed inside the Central Core vault. Once you restore the outer sectors, the blast doors will open for the final showdown!
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowStoryModal(false)}
              className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-sm uppercase tracking-wider transition-colors"
            >
              Resume Guardian Mission
            </button>
          </div>
        </div>
      )}

      {/* --- GAME OVER MODAL --- */}
      {showGameOverModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-lg">
          <div className="bg-slate-900 border-2 border-rose-500 max-w-md w-full rounded-2xl p-6 shadow-2xl flex flex-col gap-4 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-rose-500/20 border-2 border-rose-500 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-rose-400 tracking-wider font-mono">
              GUARDIAN SYSTEM OFFLINE
            </h2>
            <p className="text-xs text-slate-300">
              All 5 lives were exhausted by toxic smog, acid runoff, or electrical surges before Nova could be stabilized.
            </p>

            <div className="p-3 bg-slate-800 rounded-xl text-xs space-y-1 text-slate-300">
              <div className="flex justify-between">
                <span>City Restoration Achieved:</span>
                <span className="font-bold text-emerald-400">{simulation.overallRestoration}%</span>
              </div>
              <div className="flex justify-between">
                <span>Eco Score:</span>
                <span className="font-bold text-cyan-400">{player.score}</span>
              </div>
              <div className="flex justify-between">
                <span>Current Stage:</span>
                <span className="font-bold text-amber-400">Stage {gameStage}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 italic">
              Tip: Activate Recycle Shield [4] or Solar Dash [3] when navigating through dense hazard zones!
            </p>

            <button
              onClick={restartGame}
              className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-sm uppercase tracking-wider transition-colors shadow-lg shadow-rose-600/30"
            >
              Reboot Eco-Guardian (Play Again)
            </button>
          </div>
        </div>
      )}

      {/* --- VICTORY MODAL --- */}
      {showVictoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-lg">
          <div className="bg-slate-900 border-2 border-emerald-400 max-w-xl w-full rounded-2xl p-6 shadow-2xl flex flex-col gap-4 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 animate-pulse">
              <Award className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-emerald-400 tracking-wider font-mono">
              THE LAST GREEN SIGNAL BROADCAST!
            </h2>
            <p className="text-xs text-slate-300">
              GRIME has dissolved into harmless organic compost. Nova’s skies are pristine, rivers flow pure, and the Grand Biosphere thrives once again!
            </p>

            {/* UN Sustainable Development Goals Impact Report */}
            <div className="p-4 bg-slate-800/80 rounded-xl border border-emerald-500/30 text-left space-y-2">
              <h3 className="font-bold text-cyan-300 text-xs uppercase tracking-wider">
                UNITED NATIONS SDGs REPORT CARD
              </h3>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 bg-slate-900/60 rounded border border-cyan-400/30">
                  <div className="font-bold text-cyan-400">SDG 6: Clean Water</div>
                  <div className="text-slate-300">Aqueducts purified, flood barriers secured.</div>
                </div>
                <div className="p-2 bg-slate-900/60 rounded border border-amber-400/30">
                  <div className="font-bold text-amber-400">SDG 7: Clean Energy</div>
                  <div className="text-slate-300">Solar arrays & renewable matrix online.</div>
                </div>
                <div className="p-2 bg-slate-900/60 rounded border border-emerald-400/30">
                  <div className="font-bold text-emerald-400">SDG 11: Sustainable Cities</div>
                  <div className="text-slate-300">All 6 districts interconnected & resilient.</div>
                </div>
                <div className="p-2 bg-slate-900/60 rounded border border-violet-400/30">
                  <div className="font-bold text-violet-400">SDG 13: Climate Action</div>
                  <div className="text-slate-300">Industrial smog neutralized by ionizers.</div>
                </div>
                <div className="p-2 bg-slate-900/60 rounded border border-teal-400/30">
                  <div className="font-bold text-teal-400">SDG 14: Life Below Water</div>
                  <div className="text-slate-300">Micro-plastics and chemical runoff purged.</div>
                </div>
                <div className="p-2 bg-slate-900/60 rounded border border-green-400/30">
                  <div className="font-bold text-green-400">SDG 15: Life on Land</div>
                  <div className="text-slate-300">Native canopy and biodomes restored.</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-mono font-bold px-4 py-2 bg-slate-800 rounded-lg">
              <span className="text-slate-400">FINAL ECO SCORE:</span>
              <span className="text-emerald-400 text-base">{player.score + 1000} PTS</span>
            </div>

            <button
              onClick={restartGame}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-bold rounded-xl text-sm uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20"
            >
              Celebrate & Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
