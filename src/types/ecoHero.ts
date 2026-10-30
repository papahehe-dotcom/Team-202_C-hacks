/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type GameScreen =
  | 'TITLE'
  | 'ESCAPE_RUNNER'
  | 'CITY_COMMAND'
  | 'MISSION_DROWNING'
  | 'MISSION_LAST_DROP'
  | 'MISSION_BLACKOUT'
  | 'MISSION_WASTE'
  | 'MISSION_BREATHLESS'
  | 'MISSION_NATURE'
  | 'MISSION_CONSEQUENCE'
  | 'CITY_RESTORE_VIEW'
  | 'GAME_OVER';

export type TokenType =
  | 'tree'
  | 'clean_air'
  | 'waste'
  | 'water'
  | 'solar';

export type PowerupType = 'magnet' | 'shield' | 'turbo';

export interface TokenInventory {
  tree: number;
  clean_air: number;
  waste: number;
  water: number;
  solar: number;
}

export interface CityDistrict {
  id: string;
  name: string;
  sdg: string;
  category?: 'power' | 'nature' | 'water' | 'recycle' | 'travel';
  description: string;
  costCoins: number;
  costTokens: { type: TokenType; count: number };
  unlocked: boolean;
  level: number;
  effect: string;
  icon: string;
}

export interface HeroUpgrades {
  magnetLevel: number;
  shieldLevel: number;
  coinMultiplier: number;
  selectedSkin: 'emerald' | 'solar' | 'cyber' | 'aurora';
  unlockedSkins: string[];
}

export interface EcoQuest {
  id: string;
  title: string;
  description: string;
  target: number;
  progress: number;
  rewardCoins: number;
  rewardToken: TokenType;
  completed: boolean;
  claimed: boolean;
}

export interface PlayerStats {
  highScore: number;
  totalDistance: number;
  runsCount: number;
  challengesCompleted: number;
  cityRestorationPercent: number;
}

export interface SdgScorecard {
  sdg6_clean_water: number;
  sdg7_clean_energy: number;
  sdg11_sustainable_cities: number;
  sdg12_responsible_consumption: number;
  sdg13_climate_action: number;
  sdg15_life_on_land: number;
}

export interface CityCrisisState {
  safetyPercent: number;
  ecoPoints: number;
  resources: number;
  timeRemainingSeconds: number;
  sdgs: SdgScorecard;
  completedMissionIds: string[];
  activeCrisisEffects: {
    flooding: boolean;
    drought: boolean;
    blackouts: boolean;
    wasteOverflow: boolean;
    smogSpike: boolean;
    biodiversityDepleted: boolean;
  };
}

export type MissionId =
  | 'drowning_city'
  | 'last_drop'
  | 'blackout_protocol'
  | 'waste_apocalypse'
  | 'breathless_city'
  | 'bring_nature_back';

export interface MissionDefinition {
  id: MissionId;
  title: string;
  subtitle: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert';
  sdgTags: string[];
  rewardPoints: number;
  resourceCost: number;
  environmentalCondition: string;
  challengeSummary: string;
  visualChangeNote: string;
}

export interface MissionConsequence {
  missionId: MissionId;
  title: string;
  success: boolean;
  pointsEarned: number;
  resourcesSpent: number;
  choiceMade: string;
  tradeoffSummary: string;
  sdgChanges: Partial<Record<keyof SdgScorecard, number>>;
  citySafetyChange: number;
  whatPlayerChanged: string[];
  citizenAndEnvironmentImpact: string;
  hackathonTakeaway: string;
}

export interface GameSaveData {
  ecoCoins: number;
  tokens: TokenInventory;
  districts: CityDistrict[];
  upgrades: HeroUpgrades;
  quests: EcoQuest[];
  stats: PlayerStats;
  crisisState: CityCrisisState;
  soundEnabled: boolean;
  musicEnabled: boolean;
}

export interface ActiveMission {
  type: 'FOREST' | 'WASTE' | 'POLLUTION';
  title: string;
  location: string;
  sdgTarget: string;
  threatLevel: 'URGENT' | 'CRITICAL' | 'HAZARD';
  description: string;
  rewardCoins: number;
  rewardToken: TokenType;
}
