/**
 * EARTH SAVERS: THE LAST 8 DAYS
 * Core Game Engine Types & Interfaces
 */

export interface CityIndicators {
  citizenSafety: number;       // 0-100%
  energyStability: number;     // 0-100%
  airQuality: number;          // 0-100%
  environmentalHealth: number; // 0-100%
  publicWellbeing: number;     // 0-100%
  temperatureC: number;        // e.g. 43.5°C down to 32.0°C
  powerDemandMw: number;       // e.g. 380 MW
  powerCapacityMw: number;     // e.g. 420 MW
}

export interface InterventionImpact {
  citizenSafety: number;
  energyStability: number;
  airQuality: number;
  environmentalHealth: number;
  publicWellbeing: number;
  powerDemandDelta: number;     // + uses power, - saves power
  powerCapacityDelta: number;   // + adds power capacity
  temperatureDelta: number;     // - cools city
  delayedBenefitNote?: string;
}

export interface Intervention {
  id: string;
  name: string;
  cost: number; // in CC (City Credits)
  icon: string;
  category: 'emergency' | 'energy' | 'nature' | 'infrastructure' | 'civic';
  description: string;
  impactDescription: string;
  impacts: InterventionImpact;
  maxPerDay: number;
  totalDeployed: number;
  visualTag: 'trees' | 'cooling' | 'water' | 'solar' | 'efficiency' | 'transit' | 'scrubbers' | 'grid' | 'parks' | 'lights' | 'backup';
}

export interface DayScenario {
  dayNumber: number;
  title: string;
  subtitle: string;
  crisisTheme: 'heat' | 'blackout' | 'pollution' | 'shade' | 'energy_dilemma' | 'vulnerable' | 'extreme' | 'final';
  earthyOpeningDialogue: string;
  earthyVoiceText: string;
  ambientTempC: number;
  pollutionLevel: 'Moderate' | 'Heavy' | 'Hazardous' | 'Severe';
  powerGridAlert: boolean;
  briefingPoints: string[];
}

export type EarthyMood = 'happy' | 'thinking' | 'worried' | 'cheering' | 'talking';

export interface ActionRecord {
  day: number;
  interventionId: string;
  name: string;
  cost: number;
  timestamp: string;
}

export interface DayResult {
  day: number;
  score: number; // 0-100
  title: string;
  bonusCC: number;
  citizenSafetyDelta: number;
  energyStabilityDelta: number;
  airQualityDelta: number;
  environmentalHealthDelta: number;
  publicWellbeingDelta: number;
  earthyComment: string;
  totalSpentToday: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedDay?: number;
}

export type EndingType = 
  | 'GREEN_RECOVERY'
  | 'SURVIVED_STRUGGLING'
  | 'ELECTRICITY_BLACKOUT'
  | 'CLIMATE_EMERGENCY';

export interface GameCampaignState {
  currentDay: number; // 1 to 8
  unlockedDay: number; // 1 to 8
  cityCredits: number; // starts at 1500 CC
  indicators: CityIndicators;
  interventions: Intervention[];
  actionHistory: ActionRecord[];
  dailyResults: DayResult[];
  achievements: Achievement[];
  consecutiveGoodDays: number;
  totalCcEarned: number;
  totalCcSpent: number;
  hasSeenIntro: boolean;
  hasSeenTutorial: boolean;
}

export type GameScreen = 
  | 'TITLE'
  | 'INTRO_STORY'
  | 'TUTORIAL'
  | 'LEVEL_SELECT'
  | 'GAMEPLAY'
  | 'DAY_EVALUATION'
  | 'FINAL_OUTCOME';

export interface AudioSettings {
  musicVolume: number; // 0 to 1
  sfxVolume: number;   // 0 to 1
  voiceEnabled: boolean;
  masterMute: boolean;
}
