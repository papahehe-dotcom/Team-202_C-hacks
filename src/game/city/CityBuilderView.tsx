/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  ArrowLeft,
  Play,
  Sun,
  Trees,
  Droplets,
  Recycle,
  Wind,
  TrainTrack,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Zap,
  Flame,
  Sprout,
  Flower2,
  Globe,
  CloudRain,
  Fish,
  GlassWater,
  Apple,
  Cloud,
  Bot,
  PackageCheck,
  Bike,
  Lightbulb,
  Smile,
  Check,
} from 'lucide-react';
import { CityBuilderScene } from './CityBuilderScene';
import { GameSaveData, CityDistrict } from '../../types/ecoHero';
import { canAffordDistrict, purchaseDistrict } from '../../utils/saveManager';
import { soundManager } from '../../audio/soundManager';
import confetti from 'canvas-confetti';

interface CityBuilderViewProps {
  saveData: GameSaveData;
  onUpdateSave: (updated: GameSaveData) => void;
  onBackToTitle: () => void;
  onStartRun: () => void;
  onOpenCityCommand?: () => void;
}

type CategoryType = 'all' | 'power' | 'nature' | 'water' | 'recycle' | 'travel';
type FilterStatus = 'all' | 'ready' | 'built';

export const CityBuilderView: React.FC<CityBuilderViewProps> = ({
  saveData,
  onUpdateSave,
  onBackToTitle,
  onStartRun,
  onOpenCityCommand,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<CityBuilderScene | null>(null);

  const [activeCategory, setActiveCategory] = useState<CategoryType>('all');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>(
    saveData.districts[0]?.id || 'solar_power'
  );
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);

  useEffect(() => {
    if (!mountRef.current) return;
    const scene = new CityBuilderScene(mountRef.current, saveData.districts);
    sceneRef.current = scene;

    return () => {
      scene.destroy();
      sceneRef.current = null;
    };
  }, []);

  // Sync selected district object
  const selectedDistrict = useMemo(() => {
    return (
      saveData.districts.find((d) => d.id === selectedDistrictId) ||
      saveData.districts[0]
    );
  }, [saveData.districts, selectedDistrictId]);

  // Focus camera whenever selection changes
  const handleSelectDistrict = (district: CityDistrict) => {
    setSelectedDistrictId(district.id);
    soundManager.playFootstep();
    sceneRef.current?.focusOnDistrict(district.id);
  };

  const handlePurchase = (districtId: string) => {
    const updated = purchaseDistrict(saveData, districtId);
    if (updated) {
      soundManager.playBuild();
      confetti({ particleCount: 85, spread: 70, origin: { y: 0.6 } });
      onUpdateSave(updated);
      sceneRef.current?.updateDistrictState(updated.districts);
      sceneRef.current?.focusOnDistrict(districtId);
    } else {
      soundManager.playSortWrong();
    }
  };

  const getDistrictIcon = (id: string, className = 'w-5 h-5') => {
    switch (id) {
      case 'solar_power':
        return <Sun className={`${className} text-amber-400`} />;
      case 'wind_farm':
        return <Wind className={`${className} text-sky-400`} />;
      case 'wave_energy':
        return <Zap className={`${className} text-blue-400`} />;
      case 'geothermal_core':
        return <Flame className={`${className} text-orange-400`} />;
      case 'urban_canopy':
        return <Trees className={`${className} text-emerald-400`} />;
      case 'cherry_blossom':
        return <Sparkles className={`${className} text-pink-400`} />;
      case 'rooftop_gardens':
        return <Sprout className={`${className} text-lime-400`} />;
      case 'butterfly_sanctuary':
        return <Flower2 className={`${className} text-purple-400`} />;
      case 'bio_dome':
        return <Globe className={`${className} text-teal-400`} />;
      case 'water_filtration':
        return <Droplets className={`${className} text-cyan-400`} />;
      case 'rainwater_tanks':
        return <CloudRain className={`${className} text-blue-400`} />;
      case 'floating_wetlands':
        return <Fish className={`${className} text-emerald-400`} />;
      case 'water_fountains':
        return <GlassWater className={`${className} text-cyan-300`} />;
      case 'recycling_hub':
        return <Recycle className={`${className} text-amber-500`} />;
      case 'compost_depot':
        return <Apple className={`${className} text-green-500`} />;
      case 'smog_vacuum':
        return <Cloud className={`${className} text-sky-300`} />;
      case 'clean_street_drones':
        return <Bot className={`${className} text-yellow-400`} />;
      case 'green_packaging':
        return <PackageCheck className={`${className} text-emerald-300`} />;
      case 'green_transit':
        return <TrainTrack className={`${className} text-cyan-400`} />;
      case 'ebike_stations':
        return <Bike className={`${className} text-green-400`} />;
      case 'solar_streetlights':
        return <Lightbulb className={`${className} text-amber-300`} />;
      case 'eco_playground':
        return <Smile className={`${className} text-rose-400`} />;
      default:
        return <Sparkles className={`${className} text-yellow-400`} />;
    }
  };

  // Filtered districts list
  const filteredDistricts = useMemo(() => {
    return saveData.districts.filter((d) => {
      // Category filter
      if (activeCategory !== 'all' && d.category !== activeCategory) {
        return false;
      }
      // Status filter
      if (filterStatus === 'ready') {
        return !d.unlocked && canAffordDistrict(saveData, d);
      }
      if (filterStatus === 'built') {
        return d.unlocked;
      }
      return true;
    });
  }, [saveData, activeCategory, filterStatus]);

  const builtDistrictsCount = saveData.districts.filter((d) => d.unlocked).length;
  const totalCount = saveData.districts.length;
  const restorationPercent = Math.round((builtDistrictsCount / totalCount) * 100);

  return (
    <div className="relative w-full min-h-screen overflow-hidden select-none bg-slate-950 flex flex-col justify-between font-sans">
      {/* 3D Canvas Mount */}
      <div
        ref={mountRef}
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* --- TOP HUD BAR --- */}
      <div className="absolute top-4 inset-x-4 max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3 z-30 pointer-events-none">
        {/* Back & Title */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => {
              soundManager.playJump();
              onBackToTitle();
            }}
            title="Return to Main Menu"
            className="w-11 h-11 rounded-2xl bg-slate-900/90 border-2 border-slate-700 text-white flex items-center justify-center hover:bg-slate-800 shadow-xl cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {onOpenCityCommand && (
            <button
              onClick={() => {
                soundManager.playSelect();
                onOpenCityCommand();
              }}
              title="Return to Crisis Dashboard"
              className="px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 text-white font-arcade text-xs font-black flex items-center gap-1.5 shadow-xl hover:brightness-110 cursor-pointer border-2 border-white/40"
            >
              🚨 CRISIS DASHBOARD
            </button>
          )}

          <div className="bg-slate-900/90 border-2 border-emerald-500/50 rounded-2xl px-4 py-2 backdrop-blur-md shadow-xl">
            <span className="text-[10px] font-black uppercase text-emerald-400 font-arcade block">
              3D METROPOLIS BUILDER
            </span>
            <h1 className="text-sm sm:text-base font-black font-arcade text-white tracking-wide flex items-center gap-2">
              <span>CITY HEALTH: {restorationPercent}%</span>
              <span className="text-xs text-emerald-400 font-mono">
                ({builtDistrictsCount}/{totalCount} Built)
              </span>
            </h1>
          </div>
        </div>

        {/* Currency & Tokens Tray */}
        <div className="flex items-center gap-3 pointer-events-auto bg-slate-900/90 border-2 border-slate-700 rounded-2xl px-4 py-2 shadow-xl backdrop-blur-md text-xs font-black font-arcade text-white">
          <div className="flex items-center gap-1.5 text-yellow-400" title="Eco Coins">
            <span className="text-base">🪙</span>
            <span className="text-sm font-bold">{saveData.ecoCoins}</span>
          </div>

          <div className="h-4 w-px bg-slate-700" />

          {/* Token Counts */}
          <div className="flex items-center gap-2.5">
            <span title="Tree Tokens" className="flex items-center gap-1 text-emerald-400">
              🌲 <span>{saveData.tokens.tree}</span>
            </span>
            <span title="Clean Air Tokens" className="flex items-center gap-1 text-cyan-400">
              💨 <span>{saveData.tokens.clean_air}</span>
            </span>
            <span title="Waste Tokens" className="flex items-center gap-1 text-amber-400">
              ♻️ <span>{saveData.tokens.waste}</span>
            </span>
            <span title="Water Tokens" className="flex items-center gap-1 text-blue-400">
              💧 <span>{saveData.tokens.water}</span>
            </span>
            <span title="Solar Tokens" className="flex items-center gap-1 text-yellow-400">
              ⚡ <span>{saveData.tokens.solar}</span>
            </span>
          </div>

          <div className="h-4 w-px bg-slate-700" />

          <button
            onClick={() => {
              soundManager.playSuccess();
              onStartRun();
            }}
            title="Sprint in the Endless Runner to earn more coins and tokens"
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-arcade text-xs flex items-center gap-1.5 hover:brightness-110 cursor-pointer shadow-md"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>EARN COINS</span>
          </button>
        </div>
      </div>

      {/* Orbit Tip */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-slate-950/80 border border-slate-700 text-slate-300 text-xs font-bold px-4 py-1.5 rounded-full pointer-events-none z-20 shadow-md">
        🖱️ Drag around to rotate • Scroll to zoom • Click any option to zoom in!
      </div>

      {/* --- UNIFIED BOTTOM SHOP & BLUEPRINTS DOCK --- */}
      <div
        className={`absolute bottom-3 left-1/2 -translate-x-1/2 w-full max-w-5xl px-3 z-30 transition-transform duration-300 ${
          isDockCollapsed ? 'translate-y-[88%]' : 'translate-y-0'
        }`}
      >
        {/* Toggle Minimize Button */}
        <div className="flex justify-center mb-1">
          <button
            onClick={() => setIsDockCollapsed(!isDockCollapsed)}
            className="px-4 py-1.5 rounded-t-xl bg-slate-900 border-t-2 border-x-2 border-slate-700 text-slate-200 hover:text-white text-xs font-black font-arcade flex items-center gap-1.5 cursor-pointer shadow-lg"
          >
            {isDockCollapsed ? <ChevronUp className="w-4 h-4 text-emerald-400" /> : <ChevronDown className="w-4 h-4 text-emerald-400" />}
            <span>{isDockCollapsed ? 'OPEN ECO SHOP (22 ITEMS)' : 'MINIMIZE DOCK'}</span>
          </button>
        </div>

        <div className="bg-slate-900/95 border-2 border-slate-700 rounded-3xl p-3 sm:p-4 shadow-2xl backdrop-blur-md flex flex-col gap-3">
          {/* Category Filter Tabs */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
            <div className="flex items-center gap-1.5">
              {[
                { id: 'all', label: `🌟 All (${saveData.districts.length})` },
                { id: 'power', label: '⚡ Clean Power (4)' },
                { id: 'nature', label: '🌳 Green Nature (5)' },
                { id: 'water', label: '💧 Fresh Water (4)' },
                { id: 'recycle', label: '♻️ Zero Waste (5)' },
                { id: 'travel', label: '🚆 Clean Travel (4)' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id as CategoryType)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black font-arcade whitespace-nowrap transition-all cursor-pointer ${
                    activeCategory === tab.id
                      ? 'bg-emerald-500 text-slate-950 shadow-md scale-102'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Ready to build quick toggle */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setFilterStatus(filterStatus === 'ready' ? 'all' : 'ready')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold font-arcade transition-all cursor-pointer ${
                  filterStatus === 'ready'
                    ? 'bg-amber-400 text-slate-950 font-black'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                ✨ Can Build Now
              </button>
              <button
                onClick={() => setFilterStatus(filterStatus === 'built' ? 'all' : 'built')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold font-arcade transition-all cursor-pointer ${
                  filterStatus === 'built'
                    ? 'bg-cyan-400 text-slate-950 font-black'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                ✓ Built
              </button>
            </div>
          </div>

          {/* Carousel / Grid of Purchase Options */}
          <div className="flex gap-2 overflow-x-auto py-1 max-h-36 scrollbar-thin scrollbar-thumb-slate-700">
            {filteredDistricts.map((district) => {
              const isSelected = selectedDistrict.id === district.id;
              const canAfford = canAffordDistrict(saveData, district);

              return (
                <button
                  key={district.id}
                  onClick={() => handleSelectDistrict(district)}
                  className={`shrink-0 w-32 sm:w-36 p-2 rounded-2xl border-2 flex flex-col items-center text-center transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-slate-800 border-emerald-400 shadow-xl ring-2 ring-emerald-400/40 scale-105'
                      : district.unlocked
                      ? 'bg-slate-900/90 border-emerald-500/40 hover:border-emerald-400'
                      : canAfford
                      ? 'bg-slate-900/90 border-amber-400/80 animate-pulse hover:border-amber-300'
                      : 'bg-slate-950/80 border-slate-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  {/* Status Indicator */}
                  {district.unlocked ? (
                    <span className="absolute top-1 right-1.5 text-[9px] bg-emerald-500/20 text-emerald-400 font-black font-arcade px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                      <Check className="w-2.5 h-2.5" /> ONLINE
                    </span>
                  ) : canAfford ? (
                    <span className="absolute top-1 right-1.5 text-[9px] bg-amber-400 text-slate-950 font-black font-arcade px-1.5 py-0.2 rounded-full">
                      READY!
                    </span>
                  ) : null}

                  <div className="my-1.5">{getDistrictIcon(district.id, 'w-6 h-6')}</div>

                  <span className="text-xs font-bold text-white line-clamp-1 leading-tight">
                    {district.name}
                  </span>

                  <span className="text-[10px] font-bold mt-1">
                    {district.unlocked ? (
                      <span className="text-emerald-400 font-arcade">BUILT ✓</span>
                    ) : (
                      <span className="text-yellow-400 font-arcade">
                        {district.costCoins} 🪙
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Selected District Details & Action Panel */}
          {selectedDistrict && (
            <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex-1 w-full text-left">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-black uppercase text-emerald-400 font-arcade">
                    {selectedDistrict.sdg}
                  </span>
                  {selectedDistrict.unlocked && (
                    <span className="text-[10px] bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 font-black px-2 py-0.5 rounded-full font-arcade">
                      OPERATIONAL IN 3D
                    </span>
                  )}
                </div>

                <h3 className="text-base sm:text-lg font-black font-arcade text-white mb-1 flex items-center gap-2">
                  {getDistrictIcon(selectedDistrict.id, 'w-5 h-5')}
                  <span>{selectedDistrict.name}</span>
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                  {selectedDistrict.description}
                </p>

                <div className="mt-2 text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  <span>✨</span>
                  <span>{selectedDistrict.effect}</span>
                </div>
              </div>

              {/* Action Construct Button */}
              <div className="shrink-0 w-full sm:w-auto">
                {selectedDistrict.unlocked ? (
                  <div className="px-6 py-3 rounded-2xl bg-emerald-950/80 border-2 border-emerald-500 text-emerald-300 font-black font-arcade text-sm text-center shadow-lg">
                    ✓ BUILT IN METROPOLIS
                  </div>
                ) : (
                  <button
                    onClick={() => handlePurchase(selectedDistrict.id)}
                    disabled={!canAffordDistrict(saveData, selectedDistrict)}
                    className={`w-full sm:w-auto px-6 py-3.5 rounded-2xl font-black font-arcade text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      canAffordDistrict(saveData, selectedDistrict)
                        ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white shadow-xl hover:brightness-110 active:translate-y-1'
                        : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>
                      BUILD FOR {selectedDistrict.costCoins} 🪙 + {selectedDistrict.costTokens.count}{' '}
                      {selectedDistrict.costTokens.type.replace('_', ' ').toUpperCase()}
                    </span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
