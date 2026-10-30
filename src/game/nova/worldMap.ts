/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  DistrictData,
  CityBuilding,
  CityGate,
  InteractiveObject,
  ResourceItem,
  HazardEntity,
  DistrictId,
  ResourceType,
} from './types';

export const WORLD_WIDTH = 2800;
export const WORLD_HEIGHT = 2400;

export const DISTRICTS: DistrictData[] = [
  {
    id: 'INDUSTRIAL',
    name: 'Industrial Sector',
    tagline: 'Smog-choked factory sector awaiting air filtration',
    x: 0,
    y: 0,
    width: 1200,
    height: 900,
    color: '#1a1f26',
    borderColor: '#0284c7',
    stageUnlocked: 1,
  },
  {
    id: 'RESIDENTIAL',
    name: 'Residential Plaza',
    tagline: 'Civic residential habitat suffering from system blackouts',
    x: 1300,
    y: 0,
    width: 1500,
    height: 900,
    color: '#0f172a',
    borderColor: '#38bdf8',
    stageUnlocked: 1,
  },
  {
    id: 'RIVER',
    name: 'River & Aqueduct Canal',
    tagline: 'Flooded industrial canal & toxic runoff waterways',
    x: 0,
    y: 950,
    width: 1200,
    height: 750,
    color: '#082f49',
    borderColor: '#06b6d4',
    stageUnlocked: 2,
  },
  {
    id: 'ENERGY',
    name: 'Energy Grid Matrix',
    tagline: 'High-voltage substations & solar collector arrays',
    x: 1300,
    y: 950,
    width: 1500,
    height: 750,
    color: '#1e1b4b',
    borderColor: '#f59e0b',
    stageUnlocked: 3,
  },
  {
    id: 'GREEN',
    name: 'Green Biosphere District',
    tagline: 'Degraded urban bio-forests & native botanical sanctuaries',
    x: 0,
    y: 1750,
    width: 2800,
    height: 650,
    color: '#064e3b',
    borderColor: '#10b981',
    stageUnlocked: 4,
  },
  {
    id: 'CENTRAL_CORE',
    name: 'Nova Central Core',
    tagline: 'Subterranean biosphere vault — source of the toxic collapse',
    x: 950,
    y: 680,
    width: 900,
    height: 680,
    color: '#172554',
    borderColor: '#8b5cf6',
    stageUnlocked: 5,
  },
];

export const CITY_GATES: CityGate[] = [
  {
    id: 'gate-ind-river',
    fromDistrict: 'INDUSTRIAL',
    toDistrict: 'RIVER',
    x: 480,
    y: 900,
    width: 240,
    height: 50,
    isOpen: false,
    unlockedAtStage: 2,
    label: 'Flood Barrier #01 (Unlocks Stage 2)',
  },
  {
    id: 'gate-river-energy',
    fromDistrict: 'RIVER',
    toDistrict: 'ENERGY',
    x: 1200,
    y: 1280,
    width: 50,
    height: 220,
    isOpen: false,
    unlockedAtStage: 3,
    label: 'Power Conduit Bridge (Unlocks Stage 3)',
  },
  {
    id: 'gate-energy-green',
    fromDistrict: 'ENERGY',
    toDistrict: 'GREEN',
    x: 1950,
    y: 1700,
    width: 260,
    height: 50,
    isOpen: false,
    unlockedAtStage: 4,
    label: 'Biosphere Perimeter Gate (Unlocks Stage 4)',
  },
  {
    id: 'gate-core-north',
    fromDistrict: 'RESIDENTIAL',
    toDistrict: 'CENTRAL_CORE',
    x: 1320,
    y: 670,
    width: 160,
    height: 30,
    isOpen: false,
    unlockedAtStage: 5,
    label: 'Core Quarantine Blast Door A',
  },
  {
    id: 'gate-core-south',
    fromDistrict: 'RIVER',
    toDistrict: 'CENTRAL_CORE',
    x: 1320,
    y: 1350,
    width: 160,
    height: 30,
    isOpen: false,
    unlockedAtStage: 5,
    label: 'Core Quarantine Blast Door B',
  },
];

export const CITY_BUILDINGS: CityBuilding[] = [
  // Industrial Buildings
  { id: 'ind-b1', x: 80, y: 80, width: 220, height: 160, name: 'Nova Refinery Alpha', roofColor: '#334155' },
  { id: 'ind-b2', x: 420, y: 80, width: 240, height: 140, name: 'Chemical Processing Node', roofColor: '#1e293b' },
  { id: 'ind-b3', x: 80, y: 380, width: 180, height: 260, name: 'Assembly Depot 07', roofColor: '#334155' },
  { id: 'ind-b4', x: 750, y: 400, width: 340, height: 180, name: 'Smog Extractor Yard', roofColor: '#1e293b' },
  { id: 'ind-b5', x: 340, y: 550, width: 220, height: 220, name: 'Recycling Foundry', roofColor: '#475569' },

  // Residential Buildings
  { id: 'res-b1', x: 1400, y: 80, width: 260, height: 180, name: 'Skyview Hab Tower A', roofColor: '#0284c7' },
  { id: 'res-b2', x: 1800, y: 80, width: 280, height: 200, name: 'Skyview Hab Tower B', roofColor: '#0369a1' },
  { id: 'res-b3', x: 2250, y: 90, width: 340, height: 170, name: 'Civic Health Complex', roofColor: '#0284c7' },
  { id: 'res-b4', x: 1950, y: 380, width: 240, height: 280, name: 'Community Eco-Center', roofColor: '#075985' },
  { id: 'res-b5', x: 2360, y: 400, width: 320, height: 240, name: 'Nova Botanical Atrium', roofColor: '#0c4a6e' },

  // River Buildings & Aqueduct Walls
  { id: 'riv-b1', x: 80, y: 1040, width: 180, height: 260, name: 'Canal Pump Station 1', roofColor: '#0369a1' },
  { id: 'riv-b2', x: 420, y: 1350, width: 280, height: 160, name: 'Water Purity Laboratory', roofColor: '#0284c7' },
  { id: 'riv-b3', x: 840, y: 1020, width: 260, height: 180, name: 'Flood Dam Regulator', roofColor: '#075985' },

  // Energy Buildings
  { id: 'eng-b1', x: 1400, y: 1020, width: 260, height: 200, name: 'Fusion Battery Matrix', roofColor: '#78350f' },
  { id: 'eng-b2', x: 1800, y: 1350, width: 240, height: 240, name: 'Solar Thermal Generator', roofColor: '#92400e' },
  { id: 'eng-b3', x: 2300, y: 1040, width: 320, height: 180, name: 'Grid Relay Substation', roofColor: '#b45309' },
  { id: 'eng-b4', x: 2250, y: 1380, width: 340, height: 200, name: 'Quantum Capacitor Vault', roofColor: '#78350f' },

  // Green Biosphere Structures
  { id: 'grn-b1', x: 120, y: 1850, width: 280, height: 180, name: 'Bio-Dome Alpha', roofColor: '#065f46' },
  { id: 'grn-b2', x: 750, y: 1880, width: 360, height: 200, name: 'Seed Germination Conservatory', roofColor: '#047857' },
  { id: 'grn-b3', x: 1750, y: 1880, width: 320, height: 200, name: 'Flora Restoration Vault', roofColor: '#065f46' },
  { id: 'grn-b4', x: 2300, y: 1850, width: 340, height: 220, name: 'Atmospheric Oxygenator Dome', roofColor: '#047857' },
];

export const INTERACTIVE_OBJECTS: InteractiveObject[] = [
  // Stage 1: Industrial Air Scrubbers (3 objects)
  {
    id: 'ind-scrubber-1',
    name: 'Smog Ionizer Tower #1',
    district: 'INDUSTRIAL',
    stageRequired: 1,
    type: 'AIR_SCRUBBER',
    x: 480,
    y: 350,
    radius: 36,
    cost: { RECYCLE: 2, CLEAN_ENERGY: 1 },
    restored: false,
    description: 'Deploys high-velocity electrostatic filters to neutralize toxic industrial exhaust.',
    effect: '+25% Air Purity, eliminates local smog clouds',
  },
  {
    id: 'ind-scrubber-2',
    name: 'Catalytic Scrubbing Unit #2',
    district: 'INDUSTRIAL',
    stageRequired: 1,
    type: 'AIR_SCRUBBER',
    x: 880,
    y: 260,
    radius: 36,
    cost: { RECYCLE: 2, CLEAN_ENERGY: 2 },
    restored: false,
    description: 'Neutralizes sulfur and carbon particulates from the northern foundry chimneys.',
    effect: '+25% Air Purity, clears path toward central gates',
  },
  {
    id: 'ind-scrubber-3',
    name: 'Industrial Bio-Filter Array #3',
    district: 'INDUSTRIAL',
    stageRequired: 1,
    type: 'AIR_SCRUBBER',
    x: 640,
    y: 720,
    radius: 36,
    cost: { RECYCLE: 3, CLEAN_ENERGY: 2 },
    restored: false,
    description: 'Final industrial scrubber unit. Reactivating this opens Flood Barrier #01 to the River District.',
    effect: '+30% Air Purity, Unlocks River District!',
  },

  // Stage 2: River District Water Valves & Locks (3 objects)
  {
    id: 'riv-valve-1',
    name: 'Canal Flood Gate Alpha',
    district: 'RIVER',
    stageRequired: 2,
    type: 'WATER_GATE',
    x: 350,
    y: 1180,
    radius: 36,
    cost: { WATER: 2, RECYCLE: 2 },
    restored: false,
    description: 'Channels flood surges into subterranean storm aquifers before water breaches residential levees.',
    effect: '+25% Water Quality, prevents flood damage to homes',
  },
  {
    id: 'riv-filter-2',
    name: 'Reverse Osmosis Purifier #2',
    district: 'RIVER',
    stageRequired: 2,
    type: 'TREATMENT_PLANT',
    x: 680,
    y: 1240,
    radius: 36,
    cost: { WATER: 3, CLEAN_ENERGY: 2 },
    restored: false,
    description: 'Extracts heavy metals, micro-plastics and chemical runoff from the municipal drinking supply.',
    effect: '+30% Water Quality, restores potable water',
  },
  {
    id: 'riv-lock-3',
    name: 'Main Aqueduct Lock Valve #3',
    district: 'RIVER',
    stageRequired: 2,
    type: 'WATER_PIPE',
    x: 1040,
    y: 1480,
    radius: 36,
    cost: { WATER: 4, RECYCLE: 3 },
    restored: false,
    description: 'Pressurizes the primary clean water main supplying the Energy District cooling towers.',
    effect: '+35% Water Quality, Unlocks Energy Grid Matrix!',
  },

  // Stage 3: Energy District Solar Arrays & Relays (3 objects)
  {
    id: 'eng-solar-1',
    name: 'Solar Heliostat Array Alpha',
    district: 'ENERGY',
    stageRequired: 3,
    type: 'SOLAR_STATION',
    x: 1620,
    y: 1150,
    radius: 36,
    cost: { CLEAN_ENERGY: 2, RECYCLE: 2 },
    restored: false,
    description: 'Calibrates high-efficiency photovoltaic mirrors to feed renewable solar energy into Nova.',
    effect: '+30% Energy Stability, ends rolling blackouts',
  },
  {
    id: 'eng-battery-2',
    name: 'Superconductor Storage Matrix #2',
    district: 'ENERGY',
    stageRequired: 3,
    type: 'POWER_NODE',
    x: 2050,
    y: 1250,
    radius: 36,
    cost: { CLEAN_ENERGY: 3, NATURE: 2 },
    restored: false,
    description: 'Balances grid surges and stabilizes clean electrical transmission across the district.',
    effect: '+30% Energy Stability, neutralizes dangerous electrical arcs',
  },
  {
    id: 'eng-substation-3',
    name: 'Central Grid Transformer #3',
    district: 'ENERGY',
    stageRequired: 3,
    type: 'POWER_NODE',
    x: 2520,
    y: 1480,
    radius: 36,
    cost: { CLEAN_ENERGY: 4, RECYCLE: 3 },
    restored: false,
    description: 'Synchronizes renewable distribution and powers the magnetic perimeter locks of the Green Biosphere.',
    effect: '+35% Energy Stability, Unlocks Green Biosphere District!',
  },

  // Stage 4: Green Biosphere Conservatories & Forests (3 objects)
  {
    id: 'grn-seed-1',
    name: 'Native Canopy Spore Incubator #1',
    district: 'GREEN',
    stageRequired: 4,
    type: 'SEED_PLANTING',
    x: 520,
    y: 2000,
    radius: 36,
    cost: { NATURE: 3, WATER: 2 },
    restored: false,
    description: 'Germinates fast-growing resilient indigenous tree species that sequester carbon and cool the ground.',
    effect: '+30% Nature Health, restores wildlife canopy',
  },
  {
    id: 'grn-canopy-2',
    name: 'Biosphere Wetland Regenerator #2',
    district: 'GREEN',
    stageRequired: 4,
    type: 'SEED_PLANTING',
    x: 1380,
    y: 2150,
    radius: 36,
    cost: { NATURE: 4, WATER: 3 },
    restored: false,
    description: 'Reintroduces purifying aquatic flora to natural wetlands, stabilizing ground temperature.',
    effect: '+35% Nature Health, cleans groundwater tables',
  },
  {
    id: 'grn-wetland-3',
    name: 'Grand Ecological Biosphere Core #3',
    district: 'GREEN',
    stageRequired: 4,
    type: 'SEED_PLANTING',
    x: 2240,
    y: 2050,
    radius: 36,
    cost: { NATURE: 4, CLEAN_ENERGY: 3 },
    restored: false,
    description: 'Fully restores the biosphere. Sensors detect the root source of corruption inside the Central Core vault!',
    effect: '+35% Nature Health, Opens Central Core Blast Doors!',
  },

  // Stage 5: Central Core - 4 Overload Pillars (GRIME Final Boss Arena)
  {
    id: 'core-nature-pillar',
    name: 'Photosynthetic Pulse Pillar',
    district: 'CENTRAL_CORE',
    stageRequired: 5,
    type: 'CORE_PILLAR',
    x: 1120,
    y: 840,
    radius: 32,
    cost: { NATURE: 3 },
    restored: false,
    description: 'Overloads GRIME with pure photosynthetic botanical radiance, shattering its Toxic Sludge Shield.',
    effect: 'Removes 25% of GRIME shield',
  },
  {
    id: 'core-water-pillar',
    name: 'Hydro-Purification Surge Pillar',
    district: 'CENTRAL_CORE',
    stageRequired: 5,
    type: 'CORE_PILLAR',
    x: 1680,
    y: 840,
    radius: 32,
    cost: { WATER: 3 },
    restored: false,
    description: 'Directs pressurized crystal water rays to wash away GRIME’s corrosive acid mantle.',
    effect: 'Removes 25% of GRIME shield',
  },
  {
    id: 'core-solar-pillar',
    name: 'Solar Plasma Conduction Pillar',
    district: 'CENTRAL_CORE',
    stageRequired: 5,
    type: 'CORE_PILLAR',
    x: 1120,
    y: 1200,
    radius: 32,
    cost: { CLEAN_ENERGY: 3 },
    restored: false,
    description: 'Focuses high-frequency ultraviolet solar radiation to vaporize GRIME’s smog tentacles.',
    effect: 'Removes 25% of GRIME shield',
  },
  {
    id: 'core-recycle-pillar',
    name: 'Molecular Containment Matrix Pillar',
    district: 'CENTRAL_CORE',
    stageRequired: 5,
    type: 'CORE_PILLAR',
    x: 1680,
    y: 1200,
    radius: 32,
    cost: { RECYCLE: 3 },
    restored: false,
    description: 'Locks GRIME in a magnetic micro-matter containment field, fully exposing its vulnerable core.',
    effect: 'Removes 25% of GRIME shield (Shield fully down!)',
  },
];

export function generateInitialResources(): ResourceItem[] {
  const items: ResourceItem[] = [];
  let id = 1;

  const spawnBatch = (type: ResourceType, count: number, minX: number, maxX: number, minY: number, maxY: number) => {
    for (let i = 0; i < count; i++) {
      items.push({
        id: `res-${id++}`,
        type,
        x: minX + Math.random() * (maxX - minX),
        y: minY + Math.random() * (maxY - minY),
        radius: 14,
        collected: false,
        respawnTime: 0,
        value: 1,
      });
    }
  };

  // Industrial Sector: Lots of RECYCLE and CLEAN_ENERGY
  spawnBatch('RECYCLE', 16, 120, 1100, 100, 800);
  spawnBatch('CLEAN_ENERGY', 14, 150, 1100, 120, 800);
  spawnBatch('WATER', 6, 200, 1000, 200, 800);
  spawnBatch('NATURE', 4, 300, 1000, 200, 800);

  // Residential Sector: Balanced
  spawnBatch('RECYCLE', 12, 1400, 2700, 100, 800);
  spawnBatch('CLEAN_ENERGY', 12, 1400, 2700, 100, 800);
  spawnBatch('WATER', 10, 1400, 2700, 100, 800);
  spawnBatch('NATURE', 8, 1400, 2700, 100, 800);

  // River Sector: Abundant WATER
  spawnBatch('WATER', 22, 120, 1150, 1020, 1650);
  spawnBatch('RECYCLE', 12, 120, 1150, 1020, 1650);
  spawnBatch('CLEAN_ENERGY', 8, 120, 1150, 1020, 1650);
  spawnBatch('NATURE', 8, 120, 1150, 1020, 1650);

  // Energy Sector: Abundant CLEAN_ENERGY
  spawnBatch('CLEAN_ENERGY', 24, 1350, 2700, 1000, 1680);
  spawnBatch('RECYCLE', 14, 1350, 2700, 1000, 1680);
  spawnBatch('NATURE', 10, 1350, 2700, 1000, 1680);
  spawnBatch('WATER', 8, 1350, 2700, 1000, 1680);

  // Green Biosphere: Abundant NATURE
  spawnBatch('NATURE', 26, 150, 2650, 1800, 2300);
  spawnBatch('WATER', 16, 150, 2650, 1800, 2300);
  spawnBatch('CLEAN_ENERGY', 12, 150, 2650, 1800, 2300);
  spawnBatch('RECYCLE', 10, 150, 2650, 1800, 2300);

  // Central Core: Strategic supplies for the boss fight
  spawnBatch('NATURE', 6, 1050, 1750, 750, 1300);
  spawnBatch('WATER', 6, 1050, 1750, 750, 1300);
  spawnBatch('CLEAN_ENERGY', 6, 1050, 1750, 750, 1300);
  spawnBatch('RECYCLE', 6, 1050, 1750, 750, 1300);

  return items;
}

export function generateInitialHazards(): HazardEntity[] {
  const hazards: HazardEntity[] = [];
  let id = 1;

  // Industrial smog
  for (let i = 0; i < 7; i++) {
    hazards.push({
      id: `haz-smog-${id++}`,
      type: 'TOXIC_SMOG',
      x: 250 + Math.random() * 800,
      y: 200 + Math.random() * 600,
      radius: 45,
      active: true,
      damagePerSec: 15,
      vx: (Math.random() - 0.5) * 20,
      vy: (Math.random() - 0.5) * 20,
    });
  }

  // River acid puddles
  for (let i = 0; i < 8; i++) {
    hazards.push({
      id: `haz-acid-${id++}`,
      type: 'ACID_PUDDLE',
      x: 200 + Math.random() * 900,
      y: 1100 + Math.random() * 500,
      radius: 40,
      active: true,
      damagePerSec: 20,
    });
  }

  // Energy electrical arcs
  for (let i = 0; i < 8; i++) {
    hazards.push({
      id: `haz-elec-${id++}`,
      type: 'ELECTRICAL_ARC',
      x: 1450 + Math.random() * 1100,
      y: 1100 + Math.random() * 500,
      radius: 35,
      active: true,
      damagePerSec: 25,
    });
  }

  // Green corrupted ground
  for (let i = 0; i < 9; i++) {
    hazards.push({
      id: `haz-corp-${id++}`,
      type: 'CORRUPTED_GROUND',
      x: 300 + Math.random() * 2200,
      y: 1850 + Math.random() * 450,
      radius: 42,
      active: true,
      damagePerSec: 18,
    });
  }

  return hazards;
}
