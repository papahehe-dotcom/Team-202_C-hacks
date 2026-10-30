/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EnvironmentalSimulationState,
  GameStage,
  InteractiveObject,
  SavedGameData,
} from './types';

const STORAGE_KEY = 'eco_rush_nova_save_v1';

export function calculateSimulationState(
  restoredObjects: InteractiveObject[]
): EnvironmentalSimulationState {
  const restoredMap = new Map<string, boolean>();
  restoredObjects.forEach((obj) => {
    if (obj.restored) restoredMap.set(obj.id, true);
  });

  // Stage 1 (Industrial Air)
  const indRestored = ['ind-scrubber-1', 'ind-scrubber-2', 'ind-scrubber-3'].filter((id) =>
    restoredMap.get(id)
  ).length;
  const airPurity = Math.min(100, 15 + indRestored * 28);

  // Stage 2 (River Water)
  const rivRestored = ['riv-valve-1', 'riv-filter-2', 'riv-lock-3'].filter((id) =>
    restoredMap.get(id)
  ).length;
  const waterQuality = Math.min(100, 12 + rivRestored * 29);

  // Stage 3 (Energy Matrix)
  const engRestored = ['eng-solar-1', 'eng-battery-2', 'eng-substation-3'].filter((id) =>
    restoredMap.get(id)
  ).length;
  const energyStability = Math.min(100, 10 + engRestored * 30);

  // Stage 4 (Green Biosphere)
  const grnRestored = ['grn-seed-1', 'grn-canopy-2', 'grn-wetland-3'].filter((id) =>
    restoredMap.get(id)
  ).length;
  const natureHealth = Math.min(100, 8 + grnRestored * 30);

  // Stage 5 (Core Pillars)
  const coreRestored = [
    'core-nature-pillar',
    'core-water-pillar',
    'core-solar-pillar',
    'core-recycle-pillar',
  ].filter((id) => restoredMap.get(id)).length;

  const totalRestoredCount =
    indRestored + rivRestored + engRestored + grnRestored + coreRestored;
  const wasteRecycled = Math.min(100, 15 + totalRestoredCount * 5.3);

  const overallRestoration = Math.round(
    (airPurity * 0.2 +
      waterQuality * 0.2 +
      energyStability * 0.2 +
      natureHealth * 0.2 +
      wasteRecycled * 0.2)
  );

  return {
    airPurity: Math.round(airPurity),
    waterQuality: Math.round(waterQuality),
    energyStability: Math.round(energyStability),
    natureHealth: Math.round(natureHealth),
    wasteRecycled: Math.round(wasteRecycled),
    overallRestoration: Math.min(100, overallRestoration),
  };
}

export function evaluateGameStage(restoredObjects: InteractiveObject[]): GameStage {
  const isRestored = (id: string) =>
    restoredObjects.some((o) => o.id === id && o.restored);

  const stage1Done = ['ind-scrubber-1', 'ind-scrubber-2', 'ind-scrubber-3'].every(isRestored);
  if (!stage1Done) return 1;

  const stage2Done = ['riv-valve-1', 'riv-filter-2', 'riv-lock-3'].every(isRestored);
  if (!stage2Done) return 2;

  const stage3Done = ['eng-solar-1', 'eng-battery-2', 'eng-substation-3'].every(isRestored);
  if (!stage3Done) return 3;

  const stage4Done = ['grn-seed-1', 'grn-canopy-2', 'grn-wetland-3'].every(isRestored);
  if (!stage4Done) return 4;

  const stage5Done = [
    'core-nature-pillar',
    'core-water-pillar',
    'core-solar-pillar',
    'core-recycle-pillar',
  ].every(isRestored);
  if (!stage5Done) return 5;

  return 6; // All systems online + GRIME vulnerable or defeated
}

export const ACHIEVEMENTS = [
  { id: 'first_breath', title: 'First Breath', desc: 'Reactivate the first Industrial Smog Ionizer' },
  { id: 'clean_current', title: 'Clean Currents', desc: 'Restore potable water to the River Aqueduct' },
  { id: 'grid_online', title: 'Perpetual Glow', desc: 'Stabilize Nova with renewable solar power' },
  { id: 'canopy_rise', title: 'Verdant Rebirth', desc: 'Bloom all 3 native Biosphere bio-domes' },
  { id: 'core_breaker', title: 'Shield Shatterer', desc: 'Overload all 4 Central Core elemental pillars' },
  { id: 'grime_cleanser', title: 'Savior of Nova', desc: 'Defeat GRIME and restore 100% city sustainability' },
  { id: 'master_scavenger', title: 'Circular Economy', desc: 'Collect over 50 environmental resource nodes' },
];

export function loadSavedGame(): SavedGameData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        highScore: parsed.highScore || 0,
        bestRestoration: parsed.bestRestoration || 0,
        restoredObjectIds: parsed.restoredObjectIds || [],
        currentStage: parsed.currentStage || 1,
        achievements: parsed.achievements || [],
      };
    }
  } catch {
    // ignore
  }

  return {
    highScore: 0,
    bestRestoration: 0,
    restoredObjectIds: [],
    currentStage: 1,
    achievements: [],
  };
}

export function saveGameData(data: SavedGameData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}
