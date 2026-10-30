/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type DistrictId =
  | 'INDUSTRIAL'
  | 'RESIDENTIAL'
  | 'RIVER'
  | 'ENERGY'
  | 'GREEN'
  | 'CENTRAL_CORE';

export type GameStage = 1 | 2 | 3 | 4 | 5 | 6; // 1: Air, 2: Water, 3: Energy, 4: Nature, 5: GRIME Boss, 6: Victory

export type ResourceType = 'NATURE' | 'WATER' | 'CLEAN_ENERGY' | 'RECYCLE';

export type AbilityType = 'NATURE_PULSE' | 'WATER_BURST' | 'SOLAR_DASH' | 'RECYCLE_SHIELD';

export type HazardType =
  | 'TOXIC_SMOG'
  | 'ACID_PUDDLE'
  | 'ELECTRICAL_ARC'
  | 'FALLING_DEBRIS'
  | 'CORRUPTED_GROUND'
  | 'POLLUTION_WAVE';

export interface ResourceItem {
  id: string;
  type: ResourceType;
  x: number;
  y: number;
  radius: number;
  collected: boolean;
  respawnTime: number;
  value: number;
}

export interface InteractiveObject {
  id: string;
  name: string;
  district: DistrictId;
  stageRequired: GameStage;
  type:
    | 'AIR_SCRUBBER'
    | 'WATER_PIPE'
    | 'WATER_GATE'
    | 'TREATMENT_PLANT'
    | 'SOLAR_STATION'
    | 'POWER_NODE'
    | 'SEED_PLANTING'
    | 'RECYCLE_MACHINE'
    | 'CORE_PILLAR';
  x: number;
  y: number;
  radius: number;
  cost: Partial<Record<ResourceType, number>>;
  restored: boolean;
  description: string;
  effect: string;
}

export interface CityGate {
  id: string;
  fromDistrict: DistrictId;
  toDistrict: DistrictId;
  x: number;
  y: number;
  width: number;
  height: number;
  isOpen: boolean;
  unlockedAtStage: GameStage;
  label: string;
}

export interface DistrictData {
  id: DistrictId;
  name: string;
  tagline: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  borderColor: string;
  stageUnlocked: GameStage;
}

export interface CityBuilding {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  name?: string;
  roofColor: string;
}

export interface HazardEntity {
  id: string;
  type: HazardType;
  x: number;
  y: number;
  radius: number;
  vx?: number;
  vy?: number;
  active: boolean;
  damagePerSec: number;
}

export interface BossAttack {
  id: string;
  type: 'WAVE' | 'PROJECTILE' | 'GROUND_CORRUPTION' | 'SHOCKWAVE';
  x: number;
  y: number;
  radius: number;
  timer: number;
  maxTimer: number;
  executed: boolean;
  damage: number;
}

export interface GrimeBoss {
  active: boolean;
  revealed: boolean;
  x: number;
  y: number;
  radius: number;
  health: number;
  maxHealth: number;
  shieldCoresActive: number; // 4 cores, each removes 25% shield
  attackCooldown: number;
  currentAttacks: BossAttack[];
  defeated: boolean;
}

export interface EnvironmentalSimulationState {
  airPurity: number;      // 0-100%
  waterQuality: number;   // 0-100%
  energyStability: number;// 0-100%
  natureHealth: number;   // 0-100%
  wasteRecycled: number;  // 0-100%
  overallRestoration: number; // 0-100%
}

export interface PlayerInventory {
  NATURE: number;
  WATER: number;
  CLEAN_ENERGY: number;
  RECYCLE: number;
}

export interface AbilityState {
  unlocked: boolean;
  cooldownRemaining: number;
  maxCooldown: number;
  durationRemaining: number;
  duration: number;
  cost: { type: ResourceType; amount: number };
}

export interface PlayerState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  angle: number;
  speed: number;
  lives: number;
  maxLives: number;
  health: number;
  maxHealth: number;
  invulnerableTimer: number;
  inventory: PlayerInventory;
  inventoryCap: number;
  abilities: Record<AbilityType, AbilityState>;
  score: number;
  ecoPoints: number;
}

export interface SavedGameData {
  highScore: number;
  bestRestoration: number;
  restoredObjectIds: string[];
  currentStage: GameStage;
  achievements: string[];
}
