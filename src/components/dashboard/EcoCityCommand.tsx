/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, ShieldCheck, Clock, Coins, Droplets, Zap, 
  Trees, Wind, Recycle, Building, AlertTriangle, ArrowRight, 
  Sparkles, CheckCircle2, Play, Home, MapPin, Compass, Navigation
} from 'lucide-react';
import { GameSaveData, MissionDefinition, MissionId, SdgScorecard } from '../../types/ecoHero';
import { MISSIONS_CATALOG } from '../../utils/saveManager';
import { soundManager } from '../../audio/soundManager';

interface EcoCityCommandProps {
  saveData: GameSaveData;
  onSelectMission: (missionId: MissionId) => void;
  onOpenCity3D: () => void;
  onBackToTitle: () => void;
  onStartRunner: () => void;
}

interface CrisisZoneHotspot {
  id: MissionId;
  name: string;
  district: string;
  icon: string;
  sdg: string;
  xPercent: number; // Position on city map %
  yPercent: number;
  crisisVisual: string;
  resolvedVisual: string;
  crisisDescription: string;
}

const CITY_CRISIS_ZONES: CrisisZoneHotspot[] = [
  {
    id: 'drowning_city',
    name: 'Coastal Inundation & Blocked Conduits',
    district: 'Harbor & Riverfront Basin',
    icon: '🌊',
    sdg: 'SDG 11 & 13',
    xPercent: 78,
    yPercent: 26,
    crisisVisual: 'Water overflowing seawall, flash flooding streets',
    resolvedVisual: 'Stormwater swales active, hospital protected',
    crisisDescription: 'Storm surge has blocked drains! Flash floods threatening Metro Trauma Center.',
  },
  {
    id: 'last_drop',
    name: 'High-Pressure Aquifer Pipe Fracture',
    district: 'North Aqueduct & Reservoir',
    icon: '🚰',
    sdg: 'SDG 6 · Clean Water',
    xPercent: 26,
    yPercent: 24,
    crisisVisual: 'Pressurized water fountain shooting 15m in the air',
    resolvedVisual: 'Sealed pipeline, steady pure drinking water',
    crisisDescription: 'Main water transmission valve ruptured! City reservoir dropping fast.',
  },
  {
    id: 'blackout_protocol',
    name: 'Transformer Overload & Grid Failure',
    district: 'Central Energy Substation',
    icon: '⚡',
    sdg: 'SDG 7 · Clean Energy',
    xPercent: 72,
    yPercent: 62,
    crisisVisual: 'Sparking transformers, brownout flickering towers',
    resolvedVisual: 'Solar arrays & wind microgrid glowing golden',
    crisisDescription: 'Heatwave power spike blew circuits! Hospital life-support on backup battery.',
  },
  {
    id: 'waste_apocalypse',
    name: 'Canal Plastic Choke & Illegal Dumping',
    district: 'East Market & Riverbank',
    icon: '🗑️',
    sdg: 'SDG 12 & 14',
    xPercent: 30,
    yPercent: 64,
    crisisVisual: 'Piles of uncollected garbage, plastics in river',
    resolvedVisual: 'Floating boom barrier catches trash, organic compost hub',
    crisisDescription: 'Single-use plastics choking the fish sanctuary and clogging stormwater channels.',
  },
  {
    id: 'breathless_city',
    name: 'Toxic Smog Inversion & Particulate Spike',
    district: 'Interstate Freight Highway',
    icon: '🏭',
    sdg: 'SDG 3, 11 & 13',
    xPercent: 50,
    yPercent: 44,
    crisisVisual: 'Heavy yellow-grey soot cloud trapping vehicles',
    resolvedVisual: 'Electric bus lanes, dense green shade corridors',
    crisisDescription: 'Diesel emissions reached 290 PPM hazardous levels. Pediatric asthma alerts triggered.',
  },
  {
    id: 'bring_nature_back',
    name: 'Scorched Asphalt Heat Dome',
    district: 'South Woodland & Eco-Park',
    icon: '🌲',
    sdg: 'SDG 15 · Life on Land',
    xPercent: 52,
    yPercent: 82,
    crisisVisual: '42°C cracked dry dirt crater, trapped wildlife',
    resolvedVisual: 'Lush Miyawaki canopy & continuous animal bridge',
    crisisDescription: 'Urban deforestation created an extreme heat island; deer & native pollinators cut off.',
  },
];

export const EcoCityCommand: React.FC<EcoCityCommandProps> = ({
  saveData,
  onSelectMission,
  onOpenCity3D,
  onBackToTitle,
  onStartRunner,
}) => {
  const [activeZoneId, setActiveZoneId] = useState<MissionId>('drowning_city');
  const [timeLeft, setTimeLeft] = useState(saveData.crisisState.timeRemainingSeconds || 720);

  // Crisis clock countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const crisis = saveData.crisisState;
  const completedCount = crisis.completedMissionIds.length;
  const totalMissions = CITY_CRISIS_ZONES.length;
  const activeZone = CITY_CRISIS_ZONES.find((z) => z.id === activeZoneId) || CITY_CRISIS_ZONES[0];
  const activeMissionDef = MISSIONS_CATALOG.find((m) => m.id === activeZoneId);
  const isZoneResolved = crisis.completedMissionIds.includes(activeZoneId);

  const handleZoneClick = (zoneId: MissionId) => {
    soundManager.playSelect();
    setActiveZoneId(zoneId);
  };

  const handleDeployToCrisis = () => {
    soundManager.playClick();
    onSelectMission(activeZoneId);
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-sky-100 via-sky-50 to-emerald-50 text-slate-800 font-game flex flex-col justify-between p-2 sm:p-4 select-none overflow-y-auto relative gap-2">
      {/* Top Real-Time City HUD */}
      <header className="w-full max-w-6xl mx-auto flex items-center justify-between pb-2 border-b-2 border-sky-200 z-20">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 border-2 border-white shadow-md flex items-center justify-center text-white text-xl">
            🏛️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-2xl font-black font-arcade text-slate-800 tracking-tight leading-none">
                METROPOLIS CRISIS MAP
              </h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black font-arcade ${
                  crisis.safetyPercent >= 80
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse'
                }`}
              >
                {crisis.safetyPercent >= 80 ? 'CITY RECOVERING ✓' : 'CRISIS IN PROGRESS'}
              </span>
            </div>
            <p className="text-[11px] font-bold text-slate-500">
              Interactive City Map • Tap any crisis hotspot to deploy our Eco Hero
            </p>
          </div>
        </div>

        {/* Global Key Meters */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* City Safety */}
          <div className="bg-white/95 border-2 border-emerald-300 shadow-sm rounded-2xl px-3 py-1 text-center">
            <span className="text-[9px] font-black font-arcade text-slate-400 block uppercase">SAFETY</span>
            <span className="text-sm sm:text-base font-black font-arcade text-emerald-700">
              {crisis.safetyPercent}%
            </span>
          </div>

          {/* Eco Points */}
          <div className="bg-white/95 border-2 border-amber-300 shadow-sm rounded-2xl px-3 py-1 text-center">
            <span className="text-[9px] font-black font-arcade text-slate-400 block uppercase">ECO-PTS</span>
            <span className="text-sm sm:text-base font-black font-arcade text-amber-600">
              {crisis.ecoPoints}
            </span>
          </div>

          {/* Crisis Timer */}
          <div className="bg-white/95 border-2 border-rose-300 shadow-sm rounded-2xl px-3 py-1 text-center">
            <span className="text-[9px] font-black font-arcade text-slate-400 block uppercase">TIMER</span>
            <span className="text-sm sm:text-base font-black font-arcade text-rose-600">
              {formatTime(timeLeft)}
            </span>
          </div>

          {/* View 3D City Builder */}
          <button
            onClick={() => {
              soundManager.playBuild();
              onOpenCity3D();
            }}
            className="px-3 py-2 rounded-2xl bg-white border-2 border-emerald-400 hover:bg-emerald-50 text-emerald-800 text-xs font-black font-arcade shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
            title="Inspect 3D Restored Metropolis"
          >
            <span>🏙️</span>
            <span className="hidden md:inline">3D CITY</span>
          </button>

          {/* Escape Sprint */}
          <button
            onClick={() => {
              soundManager.playClick();
              onStartRunner();
            }}
            className="px-3 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black font-arcade shadow-sm flex items-center gap-1 cursor-pointer active:scale-95 transition-all"
            title="Run Phase 1 Escape Runner"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span className="hidden md:inline">RUNNER</span>
          </button>

          <button
            onClick={onBackToTitle}
            className="w-10 h-10 rounded-2xl bg-white border-2 border-slate-300 text-slate-700 hover:bg-slate-100 flex items-center justify-center shadow-sm cursor-pointer active:scale-95 transition-all"
            title="Title Screen"
          >
            <Home className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Living City Crisis Map Visual Stage */}
      <div className="w-full max-w-6xl mx-auto flex-1 my-2 relative rounded-3xl border-3 border-sky-300 shadow-2xl overflow-hidden bg-gradient-to-br from-emerald-100 via-sky-100 to-teal-100 flex flex-col justify-between">
        {/* Visual Map Grid Canvas (Roads, River Canal, High-Rises, Parks) */}
        <div className="absolute inset-0 select-none pointer-events-none">
          {/* Blue Curved River Canal cutting through the city */}
          <svg className="w-full h-full opacity-60" preserveAspectRatio="none" viewBox="0 0 100 100">
            <path
              d="M 0,35 Q 25,20 50,45 T 100,25 L 100,40 Q 75,55 50,60 T 0,50 Z"
              fill="#7dd3fc"
              stroke="#0284c7"
              strokeWidth="0.8"
            />
            {/* City Road Network Grid Lines */}
            <line x1="10" y1="10" x2="90" y2="10" stroke="#cbd5e1" strokeWidth="1.2" strokeDasharray="2,2" />
            <line x1="10" y1="50" x2="90" y2="50" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="3,3" />
            <line x1="10" y1="85" x2="90" y2="85" stroke="#cbd5e1" strokeWidth="1.2" strokeDasharray="2,2" />
            <line x1="25" y1="10" x2="25" y2="90" stroke="#cbd5e1" strokeWidth="1.2" strokeDasharray="2,2" />
            <line x1="50" y1="10" x2="50" y2="90" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="3,3" />
            <line x1="75" y1="10" x2="75" y2="90" stroke="#cbd5e1" strokeWidth="1.2" strokeDasharray="2,2" />
          </svg>

          {/* Stylized City Landmarks (Low-Poly 2D Buildings) */}
          <div className="absolute top-[8%] left-[8%] text-3xl opacity-75">🏢</div>
          <div className="absolute top-[12%] left-[45%] text-4xl opacity-80">🏙️</div>
          <div className="absolute top-[8%] right-[10%] text-3xl opacity-75">🏥</div>
          <div className="absolute bottom-[20%] left-[8%] text-3xl opacity-75">🏭</div>
          <div className="absolute bottom-[10%] right-[12%] text-4xl opacity-80">🌳</div>
          <div className="absolute bottom-[22%] right-[40%] text-3xl opacity-75">🏡</div>
        </div>

        {/* 6 Real Physical Crisis Sector Pins on City Map */}
        {CITY_CRISIS_ZONES.map((zone) => {
          const isResolved = crisis.completedMissionIds.includes(zone.id);
          const isSelected = activeZoneId === zone.id;

          return (
            <div
              key={zone.id}
              onClick={() => handleZoneClick(zone.id)}
              style={{ left: `${zone.xPercent}%`, top: `${zone.yPercent}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-30 transition-transform active:scale-95 group"
            >
              {/* Crisis Sector Visual Halo */}
              <div
                className={`relative flex items-center justify-center rounded-3xl p-2.5 transition-all ${
                  isSelected
                    ? 'ring-4 ring-amber-400 scale-110 shadow-2xl'
                    : 'hover:scale-105 shadow-lg'
                } ${
                  isResolved
                    ? 'bg-emerald-500 text-white border-2 border-white'
                    : 'bg-white text-slate-800 border-3 border-rose-400'
                }`}
              >
                {/* Warning Pulse Beacon if in crisis */}
                {!isResolved && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 border border-white text-[9px] font-black text-white items-center justify-center">
                      !
                    </span>
                  </span>
                )}

                <div className="flex items-center gap-2">
                  <span className="text-2xl drop-shadow">{zone.icon}</span>
                  <div className="hidden sm:block text-left pr-1">
                    <div className="text-[10px] font-black font-arcade uppercase tracking-tight leading-none">
                      {zone.district}
                    </div>
                    <span
                      className={`text-[9px] font-bold ${
                        isResolved ? 'text-emerald-100' : 'text-rose-600'
                      }`}
                    >
                      {isResolved ? 'RESOLVED ✓' : 'CRISIS ACTIVE'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Eco Hero Character Pin sitting on the selected district */}
              {isSelected && (
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce z-40 pointer-events-none">
                  <div className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-900 border border-slate-800 text-[9px] font-black font-arcade shadow-md flex items-center gap-1 whitespace-nowrap">
                    <span>🏃</span>
                    <span>HERO HERE</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Bottom Tactical Dispatch Card (Interactive, Real, No Generic Table) */}
        <div className="w-full max-w-4xl mx-auto p-3 sm:p-4 bg-white/95 backdrop-blur-md rounded-3xl border-3 border-sky-300 shadow-2xl z-40 mb-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner border-2 ${
                isZoneResolved
                  ? 'bg-emerald-100 border-emerald-400 text-emerald-800'
                  : 'bg-rose-100 border-rose-400 text-rose-800 animate-pulse'
              }`}
            >
              {activeZone.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black font-arcade px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
                  {activeZone.sdg}
                </span>
                <span className="text-xs font-bold text-slate-500">{activeZone.district}</span>
              </div>
              <h2 className="text-base sm:text-lg font-black font-arcade text-slate-800 leading-snug">
                {activeZone.name}
              </h2>
              <p className="text-xs text-slate-600 font-medium line-clamp-1">
                {isZoneResolved ? activeZone.resolvedVisual : activeZone.crisisDescription}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {/* Physical Dispatch Button that launches character into arena */}
            <div
              onClick={handleDeployToCrisis}
              className={`w-full sm:w-auto px-5 py-3 rounded-2xl text-xs font-black font-arcade uppercase shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all select-none ${
                isZoneResolved
                  ? 'bg-sky-500 hover:bg-sky-600 text-white ring-2 ring-sky-300'
                  : 'bg-rose-500 hover:bg-rose-600 text-white ring-2 ring-rose-300 animate-bounce'
              }`}
            >
              <span>{isZoneResolved ? 'REPLAY CHALLENGE' : 'DEPLOY HERO TO SITE'}</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Mini SDG Scorecard Ribbon */}
      <footer className="w-full max-w-6xl mx-auto flex items-center justify-between pt-1 border-t border-sky-200 text-slate-600 text-[11px] font-bold">
        <div className="flex items-center gap-3">
          <span className="font-arcade text-slate-700">SDG RATINGS:</span>
          <span className="flex items-center gap-1">💧 Water: {crisis.sdgs.sdg6_clean_water}%</span>
          <span className="flex items-center gap-1">⚡ Energy: {crisis.sdgs.sdg7_clean_energy}%</span>
          <span className="flex items-center gap-1">🏙️ Cities: {crisis.sdgs.sdg11_sustainable_cities}%</span>
          <span className="flex items-center gap-1">♻️ Circular: {crisis.sdgs.sdg12_responsible_consumption}%</span>
          <span className="flex items-center gap-1">🌍 Climate: {crisis.sdgs.sdg13_climate_action}%</span>
          <span className="flex items-center gap-1">🌲 Land: {crisis.sdgs.sdg15_life_on_land}%</span>
        </div>
        <div className="text-emerald-700 font-arcade">
          {completedCount}/{totalMissions} CRISES OVERCOME
        </div>
      </footer>
    </div>
  );
};
