/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { GameScreen, GameSaveData, MissionConsequence, MissionId, TokenType } from './types/ecoHero';
import { loadGameSave, saveGameSave } from './utils/saveManager';
import { TitleScreen } from './components/TitleScreen';
import { GameOverScreen } from './components/GameOverScreen';
import { RunnerCanvas } from './game/runner/RunnerCanvas';
import { EcoCityCommand } from './components/dashboard/EcoCityCommand';
import { DrowningCityArena } from './game/arenas/DrowningCityArena';
import { TheLastDropArena } from './game/arenas/TheLastDropArena';
import { BlackoutProtocolArena } from './game/arenas/BlackoutProtocolArena';
import { WasteApocalypseArena } from './game/arenas/WasteApocalypseArena';
import { BreathlessCityArena } from './game/arenas/BreathlessCityArena';
import { BringNatureBackArena } from './game/arenas/BringNatureBackArena';
import { MissionConsequenceModal } from './game/arenas/MissionConsequenceModal';
import { CityBuilderView } from './game/city/CityBuilderView';
import { soundManager } from './audio/soundManager';

export default function App() {
  const [saveData, setSaveData] = useState<GameSaveData>(() => loadGameSave());
  const [screen, setScreen] = useState<GameScreen>('TITLE');

  // Consequence report state
  const [activeConsequence, setActiveConsequence] = useState<MissionConsequence | null>(null);

  // Game over stats state
  const [gameOverStats, setGameOverStats] = useState<{
    distance: number;
    coins: number;
    score: number;
    tokens: Record<TokenType, number>;
    isNewHigh: boolean;
  } | null>(null);

  // Sync sound settings to soundManager on mount
  useEffect(() => {
    soundManager.soundEnabled = saveData.soundEnabled;
    soundManager.musicEnabled = saveData.musicEnabled;
  }, [saveData.soundEnabled, saveData.musicEnabled]);

  const handleUpdateSave = (updated: GameSaveData) => {
    setSaveData(updated);
    saveGameSave(updated);
  };

  const handleToggleSound = () => {
    const enabled = soundManager.toggleSound();
    handleUpdateSave({ ...saveData, soundEnabled: enabled });
  };

  const handleToggleMusic = () => {
    const enabled = soundManager.toggleMusic();
    handleUpdateSave({ ...saveData, musicEnabled: enabled });
  };

  // Phase 1 -> Phase 2 Transitions
  const handleCityGatesReached = (stats: { distance: number; coins: number; score: number }) => {
    soundManager.playGateVictory();
    // Award 50 bonus eco-points and coins for successfully outrunning the smog monster
    const updated: GameSaveData = {
      ...saveData,
      ecoCoins: saveData.ecoCoins + stats.coins + 50,
      crisisState: {
        ...saveData.crisisState,
        ecoPoints: saveData.crisisState.ecoPoints + 50,
        safetyPercent: Math.min(100, saveData.crisisState.safetyPercent + 5),
      },
      stats: {
        ...saveData.stats,
        highScore: Math.max(saveData.stats.highScore, stats.score),
        totalDistance: saveData.stats.totalDistance + stats.distance,
        runsCount: saveData.stats.runsCount + 1,
      },
    };
    handleUpdateSave(updated);
    setScreen('CITY_COMMAND');
  };

  const handleGameOver = (stats: { distance: number; coins: number; score: number; tokens: Record<TokenType, number> }) => {
    const isNewHigh = stats.score > saveData.stats.highScore;

    // Bank coins & tokens to persistent save
    const newTokens = { ...saveData.tokens };
    Object.entries(stats.tokens).forEach(([k, v]) => {
      const key = k as TokenType;
      newTokens[key] = (newTokens[key] || 0) + v;
    });

    const updated: GameSaveData = {
      ...saveData,
      ecoCoins: saveData.ecoCoins + stats.coins,
      tokens: newTokens,
      stats: {
        ...saveData.stats,
        highScore: Math.max(saveData.stats.highScore, stats.score),
        totalDistance: saveData.stats.totalDistance + stats.distance,
        runsCount: saveData.stats.runsCount + 1,
      },
    };
    handleUpdateSave(updated);

    setGameOverStats({
      ...stats,
      isNewHigh,
    });
    setScreen('GAME_OVER');
  };

  // Launch specific challenge arena
  const handleSelectMission = (missionId: MissionId) => {
    soundManager.playSelect();
    switch (missionId) {
      case 'drowning_city':
        setScreen('MISSION_DROWNING');
        break;
      case 'last_drop':
        setScreen('MISSION_LAST_DROP');
        break;
      case 'blackout_protocol':
        setScreen('MISSION_BLACKOUT');
        break;
      case 'waste_apocalypse':
        setScreen('MISSION_WASTE');
        break;
      case 'breathless_city':
        setScreen('MISSION_BREATHLESS');
        break;
      case 'bring_nature_back':
        setScreen('MISSION_NATURE');
        break;
      default:
        setScreen('MISSION_DROWNING');
    }
  };

  // Handle completion of any of the 6 tactical challenge arenas
  const handleMissionConsequence = (consequence: MissionConsequence) => {
    soundManager.playSuccess();
    setActiveConsequence(consequence);

    // Apply consequences to persistent crisis state and city
    const completedIds = saveData.crisisState.completedMissionIds.includes(consequence.missionId)
      ? saveData.crisisState.completedMissionIds
      : [...saveData.crisisState.completedMissionIds, consequence.missionId];

    // Boost SDG scorecards based on mission
    const newSdgs = { ...saveData.crisisState.sdgs };
    if (consequence.missionId === 'drowning_city') {
      newSdgs.sdg11_sustainable_cities = Math.min(100, newSdgs.sdg11_sustainable_cities + 18);
      newSdgs.sdg13_climate_action = Math.min(100, newSdgs.sdg13_climate_action + 15);
      newSdgs.sdg6_clean_water = Math.min(100, newSdgs.sdg6_clean_water + 12);
    } else if (consequence.missionId === 'last_drop') {
      newSdgs.sdg6_clean_water = Math.min(100, newSdgs.sdg6_clean_water + 24);
      newSdgs.sdg11_sustainable_cities = Math.min(100, newSdgs.sdg11_sustainable_cities + 14);
    } else if (consequence.missionId === 'blackout_protocol') {
      newSdgs.sdg7_clean_energy = Math.min(100, newSdgs.sdg7_clean_energy + 25);
      newSdgs.sdg13_climate_action = Math.min(100, newSdgs.sdg13_climate_action + 14);
    } else if (consequence.missionId === 'waste_apocalypse') {
      newSdgs.sdg12_responsible_consumption = Math.min(100, newSdgs.sdg12_responsible_consumption + 24);
      newSdgs.sdg11_sustainable_cities = Math.min(100, newSdgs.sdg11_sustainable_cities + 15);
    } else if (consequence.missionId === 'breathless_city') {
      newSdgs.sdg11_sustainable_cities = Math.min(100, newSdgs.sdg11_sustainable_cities + 18);
      newSdgs.sdg13_climate_action = Math.min(100, newSdgs.sdg13_climate_action + 16);
    } else if (consequence.missionId === 'bring_nature_back') {
      newSdgs.sdg15_life_on_land = Math.min(100, newSdgs.sdg15_life_on_land + 28);
      newSdgs.sdg13_climate_action = Math.min(100, newSdgs.sdg13_climate_action + 18);
      newSdgs.sdg11_sustainable_cities = Math.min(100, newSdgs.sdg11_sustainable_cities + 14);
    }

    // Toggle off physical city crisis flags
    const newEffects = { ...saveData.crisisState.activeCrisisEffects };
    if (consequence.missionId === 'drowning_city') newEffects.flooding = false;
    if (consequence.missionId === 'last_drop') newEffects.drought = false;
    if (consequence.missionId === 'blackout_protocol') newEffects.blackouts = false;
    if (consequence.missionId === 'waste_apocalypse') newEffects.wasteOverflow = false;
    if (consequence.missionId === 'breathless_city') newEffects.smogSpike = false;
    if (consequence.missionId === 'bring_nature_back') newEffects.biodiversityDepleted = false;

    // Automatically unlock or upgrade corresponding 3D city districts
    const newDistricts = saveData.districts.map((district) => {
      if (consequence.missionId === 'drowning_city' && district.id === 'water_treatment') {
        return { ...district, unlocked: true, level: Math.max(district.level, 1) };
      }
      if (consequence.missionId === 'blackout_protocol' && district.id === 'solar_power') {
        return { ...district, unlocked: true, level: Math.max(district.level, 1) };
      }
      if (consequence.missionId === 'waste_apocalypse' && district.id === 'recycling_hub') {
        return { ...district, unlocked: true, level: Math.max(district.level, 1) };
      }
      if (consequence.missionId === 'breathless_city' && (district.id === 'clean_air_scrubbers' || district.id === 'eco_transit')) {
        return { ...district, unlocked: true, level: Math.max(district.level, 1) };
      }
      if (consequence.missionId === 'bring_nature_back' && district.id === 'urban_canopy') {
        return { ...district, unlocked: true, level: Math.max(district.level, 1) };
      }
      return district;
    });

    const updated: GameSaveData = {
      ...saveData,
      ecoCoins: saveData.ecoCoins + consequence.pointsEarned * 2,
      crisisState: {
        ...saveData.crisisState,
        ecoPoints: saveData.crisisState.ecoPoints + consequence.pointsEarned,
        resources: Math.max(0, saveData.crisisState.resources - consequence.resourcesSpent + 15),
        safetyPercent: Math.min(100, saveData.crisisState.safetyPercent + Math.round(consequence.pointsEarned / 2.2)),
        completedMissionIds: completedIds,
        activeCrisisEffects: newEffects,
        sdgs: newSdgs,
      },
      districts: newDistricts,
      stats: {
        ...saveData.stats,
        challengesCompleted: saveData.stats.challengesCompleted + 1,
      },
    };

    handleUpdateSave(updated);
    setScreen('MISSION_CONSEQUENCE');
  };

  return (
    <div className="w-full min-h-screen overflow-x-hidden overflow-y-auto bg-slate-950 font-game select-none">
      {/* Phase 1 Title Screen */}
      {screen === 'TITLE' && (
        <TitleScreen
          saveData={saveData}
          onStartEscape={() => setScreen('ESCAPE_RUNNER')}
          onOpenCityCommand={() => setScreen('CITY_COMMAND')}
          onOpenCityBuilder={() => setScreen('CITY_RESTORE_VIEW')}
          onToggleSound={handleToggleSound}
          onToggleMusic={handleToggleMusic}
        />
      )}

      {/* Phase 1: 3D Escape Runner from the Smog Monster */}
      {screen === 'ESCAPE_RUNNER' && (
        <RunnerCanvas
          onGameOver={handleGameOver}
          onMissionTrigger={(mission) => {
            // Map legacy triggers if any into command missions
            setScreen('CITY_COMMAND');
          }}
          onCityGatesReached={handleCityGatesReached}
          onBackToTitle={() => setScreen('TITLE')}
          heroSkin={saveData.upgrades.selectedSkin}
          magnetLevel={saveData.upgrades.magnetLevel}
          shieldLevel={saveData.upgrades.shieldLevel}
          coinMultiplier={saveData.upgrades.coinMultiplier}
        />
      )}

      {/* Phase 2: Eco-City Command Dashboard */}
      {screen === 'CITY_COMMAND' && (
        <EcoCityCommand
          saveData={saveData}
          onSelectMission={handleSelectMission}
          onOpenCity3D={() => setScreen('CITY_RESTORE_VIEW')}
          onBackToTitle={() => setScreen('TITLE')}
          onStartRunner={() => setScreen('ESCAPE_RUNNER')}
        />
      )}

      {/* Phase 3 Tactile Gameplay Arena 1: The Drowning City */}
      {screen === 'MISSION_DROWNING' && (
        <DrowningCityArena
          onComplete={handleMissionConsequence}
          onExit={() => setScreen('CITY_COMMAND')}
        />
      )}

      {/* Phase 3 Tactile Gameplay Arena 2: The Last Drop */}
      {screen === 'MISSION_LAST_DROP' && (
        <TheLastDropArena
          onComplete={handleMissionConsequence}
          onExit={() => setScreen('CITY_COMMAND')}
        />
      )}

      {/* Phase 3 Tactile Gameplay Arena 3: Blackout Protocol */}
      {screen === 'MISSION_BLACKOUT' && (
        <BlackoutProtocolArena
          onComplete={handleMissionConsequence}
          onExit={() => setScreen('CITY_COMMAND')}
        />
      )}

      {/* Phase 3 Tactile Gameplay Arena 4: Waste Apocalypse */}
      {screen === 'MISSION_WASTE' && (
        <WasteApocalypseArena
          onComplete={handleMissionConsequence}
          onExit={() => setScreen('CITY_COMMAND')}
        />
      )}

      {/* Phase 3 Tactile Gameplay Arena 5: The Breathless City */}
      {screen === 'MISSION_BREATHLESS' && (
        <BreathlessCityArena
          onComplete={handleMissionConsequence}
          onExit={() => setScreen('CITY_COMMAND')}
        />
      )}

      {/* Phase 3 Tactile Gameplay Arena 6: Bring Nature Back */}
      {screen === 'MISSION_NATURE' && (
        <BringNatureBackArena
          onComplete={handleMissionConsequence}
          onExit={() => setScreen('CITY_COMMAND')}
        />
      )}

      {/* Consequence & SDG Impact Modal */}
      {screen === 'MISSION_CONSEQUENCE' && activeConsequence && (
        <MissionConsequenceModal
          consequence={activeConsequence}
          onContinue={() => setScreen('CITY_COMMAND')}
          onGoToCity3D={() => setScreen('CITY_RESTORE_VIEW')}
        />
      )}

      {/* 3D Restored City Metropolis View */}
      {screen === 'CITY_RESTORE_VIEW' && (
        <CityBuilderView
          saveData={saveData}
          onUpdateSave={handleUpdateSave}
          onBackToTitle={() => setScreen('TITLE')}
          onStartRun={() => setScreen('ESCAPE_RUNNER')}
          onOpenCityCommand={() => setScreen('CITY_COMMAND')}
        />
      )}

      {/* Game Over Screen */}
      {screen === 'GAME_OVER' && gameOverStats && (
        <GameOverScreen
          distance={gameOverStats.distance}
          coins={gameOverStats.coins}
          score={gameOverStats.score}
          tokens={gameOverStats.tokens}
          isNewHigh={gameOverStats.isNewHigh}
          onRestart={() => setScreen('ESCAPE_RUNNER')}
          onOpenCityCommand={() => setScreen('CITY_COMMAND')}
          onBackToTitle={() => setScreen('TITLE')}
        />
      )}
    </div>
  );
}
