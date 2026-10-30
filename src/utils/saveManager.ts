/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  GameSaveData, 
  CityDistrict, 
  TokenType, 
  HeroUpgrades, 
  EcoQuest, 
  CityCrisisState, 
  MissionDefinition 
} from '../types/ecoHero';

const STORAGE_KEY = 'eco_hero_race_to_restore_v1';

export const INITIAL_DISTRICTS: CityDistrict[] = [
  // ⚡ Clean Power
  {
    id: 'solar_power',
    name: 'Sunny Solar Rooftops',
    sdg: 'SDG 7: Clean Energy',
    category: 'power',
    description: 'Catches warm sunshine on rooftops to give clean, free electricity to all city homes.',
    costCoins: 60,
    costTokens: { type: 'solar', count: 1 },
    unlocked: false,
    level: 0,
    effect: 'Provides clean electricity and stops coal smoke',
    icon: 'Sun',
  },
  {
    id: 'wind_farm',
    name: 'Spinning Wind Turbines',
    sdg: 'SDG 7: Clean Energy',
    category: 'power',
    description: 'Giant white windmills on the ridge that spin in the breeze to make clean electricity.',
    costCoins: 90,
    costTokens: { type: 'clean_air', count: 2 },
    unlocked: false,
    level: 0,
    effect: 'Blows fresh mountain breeze into city streets',
    icon: 'Wind',
  },
  {
    id: 'wave_energy',
    name: 'Ocean Wave Power Buoys',
    sdg: 'SDG 7: Clean Energy',
    category: 'power',
    description: 'Floating blue generators that turn river ripples and waves into endless green electricity.',
    costCoins: 110,
    costTokens: { type: 'water', count: 2 },
    unlocked: false,
    level: 0,
    effect: 'Powers riverside buildings using natural water motion',
    icon: 'Zap',
  },
  {
    id: 'geothermal_core',
    name: 'Deep Earth Heat Plant',
    sdg: 'SDG 7: Clean Energy',
    category: 'power',
    description: 'Taps gentle warm steam from deep underground to keep homes warm and streetlights bright.',
    costCoins: 140,
    costTokens: { type: 'solar', count: 2 },
    unlocked: false,
    level: 0,
    effect: 'Unstoppable clean power 24 hours a day, day and night',
    icon: 'Flame',
  },

  // 🌳 Green Nature
  {
    id: 'urban_canopy',
    name: 'Giant Green Tree Forest',
    sdg: 'SDG 15: Life on Land',
    category: 'nature',
    description: 'Tall, leafy native trees that give cool shade on sunny days and make crisp fresh air.',
    costCoins: 70,
    costTokens: { type: 'tree', count: 2 },
    unlocked: false,
    level: 0,
    effect: 'Cools down hot sidewalks and gives homes for birds',
    icon: 'Trees',
  },
  {
    id: 'cherry_blossom',
    name: 'Pink Blossom Walkway',
    sdg: 'SDG 11: Happy Cities',
    category: 'nature',
    description: 'Gorgeous pink blossom trees along walkways where citizens walk, jog, and relax together.',
    costCoins: 85,
    costTokens: { type: 'tree', count: 1 },
    unlocked: false,
    level: 0,
    effect: 'Makes the city look cheerful and boosts happiness',
    icon: 'Sparkles',
  },
  {
    id: 'rooftop_gardens',
    name: 'Sky Veggie Gardens',
    sdg: 'SDG 2: Zero Hunger',
    category: 'nature',
    description: 'Grow juicy red tomatoes, crisp carrots, and sweet strawberries right on top of apartment roofs!',
    costCoins: 95,
    costTokens: { type: 'tree', count: 2 },
    unlocked: false,
    level: 0,
    effect: 'Gives families healthy, fresh, free organic snacks',
    icon: 'Sprout',
  },
  {
    id: 'butterfly_sanctuary',
    name: 'Butterfly & Bee Garden',
    sdg: 'SDG 15: Life on Land',
    category: 'nature',
    description: 'A colorful sea of wildflowers buzzing with friendly honeybees and fluttering butterflies.',
    costCoins: 110,
    costTokens: { type: 'clean_air', count: 2 },
    unlocked: false,
    level: 0,
    effect: 'Pollinates flowering plants across every city corner',
    icon: 'Flower2',
  },
  {
    id: 'bio_dome',
    name: 'Grand Eco Glass Dome',
    sdg: 'SDG 15: Life on Land',
    category: 'nature',
    description: 'A sparkling geodesic glass dome protecting rare rainforest plants and mini tropical waterfalls.',
    costCoins: 160,
    costTokens: { type: 'tree', count: 3 },
    unlocked: false,
    level: 0,
    effect: 'Huge oxygen boost and world-class nature discovery',
    icon: 'Globe',
  },

  // 💧 Clean Water
  {
    id: 'water_filtration',
    name: 'River Water Purifier',
    sdg: 'SDG 6: Clean Water',
    category: 'water',
    description: 'Uses green reeds and bubble aerators to clean muddy river water into crystalline water.',
    costCoins: 75,
    costTokens: { type: 'water', count: 2 },
    unlocked: false,
    level: 0,
    effect: 'Turns polluted brown canal water into swimming-clean water',
    icon: 'Droplets',
  },
  {
    id: 'rainwater_tanks',
    name: 'Giant Rainwater Tanks',
    sdg: 'SDG 6: Clean Water',
    category: 'water',
    description: 'Big friendly storage tanks that catch clean rainwater from roofs during rain showers.',
    costCoins: 90,
    costTokens: { type: 'water', count: 1 },
    unlocked: false,
    level: 0,
    effect: 'Saves drinking water by using rain for gardens',
    icon: 'CloudRain',
  },
  {
    id: 'floating_wetlands',
    name: 'Floating Flower Islands',
    sdg: 'SDG 14: Life Below Water',
    category: 'water',
    description: 'Floating green rafts covered in water lilies that naturally soak up dirt and feed fish.',
    costCoins: 115,
    costTokens: { type: 'water', count: 2 },
    unlocked: false,
    level: 0,
    effect: 'Brings back ducks, frogs, and clear swimming fish',
    icon: 'Fish',
  },
  {
    id: 'water_fountains',
    name: 'Sparkling Drink Fountains',
    sdg: 'SDG 6: Clean Water',
    category: 'water',
    description: 'Ice-cold, delicious, touchless drinking fountains in town squares so no one buys plastic bottles.',
    costCoins: 130,
    costTokens: { type: 'water', count: 2 },
    unlocked: false,
    level: 0,
    effect: 'Keeps everyone happily hydrated with zero plastic waste',
    icon: 'GlassWater',
  },

  // ♻️ Zero Waste
  {
    id: 'recycling_hub',
    name: 'Super Sorting Robot Plant',
    sdg: 'SDG 12: Zero Waste',
    category: 'recycle',
    description: 'Friendly robotic arms that sort plastic, glass, paper, and metal in less than one second.',
    costCoins: 80,
    costTokens: { type: 'waste', count: 2 },
    unlocked: false,
    level: 0,
    effect: 'Reuses 98% of trash so landfills completely disappear',
    icon: 'Recycle',
  },
  {
    id: 'compost_depot',
    name: 'Organic Compost Station',
    sdg: 'SDG 12: Zero Waste',
    category: 'recycle',
    description: 'Turns banana peels, apple cores, and dry leaves into rich, dark, fertile garden soil.',
    costCoins: 70,
    costTokens: { type: 'waste', count: 1 },
    unlocked: false,
    level: 0,
    effect: 'Free rich soil for community gardens and street trees',
    icon: 'Apple',
  },
  {
    id: 'smog_vacuum',
    name: 'Clean Sky Air Balloons',
    sdg: 'SDG 13: Climate Action',
    category: 'recycle',
    description: 'Cute blimps floating gently in the sky that vacuum up soot and puff out fresh clean air.',
    costCoins: 125,
    costTokens: { type: 'clean_air', count: 2 },
    unlocked: false,
    level: 0,
    effect: 'Clears smog clouds so citizens can see blue skies',
    icon: 'Cloud',
  },
  {
    id: 'clean_street_drones',
    name: 'Solar Sweeper Rovers',
    sdg: 'SDG 11: Clean Cities',
    category: 'recycle',
    description: 'Quiet little solar-powered cleaning rovers that roll along sidewalks picking up dropped litter.',
    costCoins: 140,
    costTokens: { type: 'waste', count: 2 },
    unlocked: false,
    level: 0,
    effect: 'Sidewalks and bike paths stay 100% spotless',
    icon: 'Bot',
  },
  {
    id: 'green_packaging',
    name: 'Seaweed Wrapper Maker',
    sdg: 'SDG 12: Zero Waste',
    category: 'recycle',
    description: 'Makes natural food packaging from ocean seaweed that naturally dissolves safely in soil.',
    costCoins: 155,
    costTokens: { type: 'waste', count: 3 },
    unlocked: false,
    level: 0,
    effect: 'Completely eliminates single-use plastic snack bags',
    icon: 'PackageCheck',
  },

  // 🚆 Clean Travel
  {
    id: 'green_transit',
    name: 'Fast Flying Electric Train',
    sdg: 'SDG 11: Clean Transit',
    category: 'travel',
    description: 'A futuristic elevated monorail train that glides around the city silently with zero exhaust smoke.',
    costCoins: 120,
    costTokens: { type: 'clean_air', count: 2 },
    unlocked: false,
    level: 0,
    effect: 'Lets 10,000 citizens commute without traffic jams',
    icon: 'TrainTrack',
  },
  {
    id: 'ebike_stations',
    name: 'Sunny Electric Bike Docks',
    sdg: 'SDG 11: Clean Transit',
    category: 'travel',
    description: 'Unlock colorful electric bikes anytime to zip around town without burning petrol.',
    costCoins: 85,
    costTokens: { type: 'solar', count: 1 },
    unlocked: false,
    level: 0,
    effect: 'Fast, healthy, zero-smoke rides for teenagers and adults',
    icon: 'Bike',
  },
  {
    id: 'solar_streetlights',
    name: 'Glowing Solar Lanterns',
    sdg: 'SDG 7: Clean Energy',
    category: 'travel',
    description: 'Friendly golden lanterns that soak in sunshine by day and light up paths with warm glow at night.',
    costCoins: 95,
    costTokens: { type: 'solar', count: 1 },
    unlocked: false,
    level: 0,
    effect: 'Bright, welcoming streets powered 100% by sunlight',
    icon: 'Lightbulb',
  },
  {
    id: 'eco_playground',
    name: 'Kids Energy Play Park',
    sdg: 'SDG 3: Healthy Living',
    category: 'travel',
    description: 'Fun swings, merry-go-rounds, and trampolines that generate clean power while kids play!',
    costCoins: 105,
    costTokens: { type: 'tree', count: 2 },
    unlocked: false,
    level: 0,
    effect: 'Healthy active fun that lights up the park playground',
    icon: 'Smile',
  },
];

export const INITIAL_UPGRADES: HeroUpgrades = {
  magnetLevel: 0,
  shieldLevel: 0,
  coinMultiplier: 1,
  selectedSkin: 'emerald',
  unlockedSkins: ['emerald'],
};

export const INITIAL_QUESTS: EcoQuest[] = [
  {
    id: 'quest_sprint_500',
    title: 'First Sprint',
    description: 'Run a total distance of 500 meters across the metropolis.',
    target: 500,
    progress: 0,
    rewardCoins: 50,
    rewardToken: 'clean_air',
    completed: false,
    claimed: false,
  },
  {
    id: 'quest_coins_100',
    title: 'Coin Harvester',
    description: 'Collect 100 Eco Coins during your city runs.',
    target: 100,
    progress: 0,
    rewardCoins: 40,
    rewardToken: 'solar',
    completed: false,
    claimed: false,
  },
  {
    id: 'quest_challenges_3',
    title: 'Emergency Responder',
    description: 'Resolve 3 environmental emergencies during runs.',
    target: 3,
    progress: 0,
    rewardCoins: 75,
    rewardToken: 'tree',
    completed: false,
    claimed: false,
  },
  {
    id: 'quest_district_2',
    title: 'Urban Architect',
    description: 'Restore at least 2 city districts in the City Hub.',
    target: 2,
    progress: 0,
    rewardCoins: 100,
    rewardToken: 'waste',
    completed: false,
    claimed: false,
  },
  {
    id: 'quest_high_1000',
    title: 'Skyline Champion',
    description: 'Achieve a run score of 1,000 points or higher.',
    target: 1000,
    progress: 0,
    rewardCoins: 120,
    rewardToken: 'water',
    completed: false,
    claimed: false,
  },
];

export const INITIAL_CRISIS_STATE: CityCrisisState = {
  safetyPercent: 64,
  ecoPoints: 320,
  resources: 160,
  timeRemainingSeconds: 720, // 12:00
  sdgs: {
    sdg6_clean_water: 75,
    sdg7_clean_energy: 52,
    sdg11_sustainable_cities: 64,
    sdg12_responsible_consumption: 43,
    sdg13_climate_action: 48,
    sdg15_life_on_land: 35,
  },
  completedMissionIds: [],
  activeCrisisEffects: {
    flooding: true,
    drought: true,
    blackouts: true,
    wasteOverflow: true,
    smogSpike: true,
    biodiversityDepleted: true,
  },
};

export const MISSIONS_CATALOG: MissionDefinition[] = [
  {
    id: 'drowning_city',
    title: 'The Drowning City',
    subtitle: 'Flash Flood & Blocked Drainage Channels',
    difficulty: 'Medium',
    sdgTags: ['SDG 6: Clean Water', 'SDG 11: Resilient Cities', 'SDG 13: Climate Action'],
    rewardPoints: 25,
    resourceCost: 40,
    environmentalCondition: 'Extreme torrential rainfall has overwhelmed storm canals. Clogged drains threaten to flood residential quarters and the trauma hospital.',
    challengeSummary: 'Tactile flood barrier placement, drain trash unclogging, and routing surging floodwaters into retention aquifers.',
    visualChangeNote: 'Flooded roadways drain dry, sunken buildings become accessible, and community rainwater storage fills.',
  },
  {
    id: 'last_drop',
    title: 'The Last Drop',
    subtitle: 'Drought, Depleted Aquifers & Pipe Fractures',
    difficulty: 'Hard',
    sdgTags: ['SDG 6: Clean Water & Sanitation', 'SDG 3: Good Health & Well-Being'],
    rewardPoints: 30,
    resourceCost: 45,
    environmentalCondition: 'Extended drought has dropped reservoir levels to 18%. High-pressure underground pipe fractures are wasting thousands of gallons daily.',
    challengeSummary: 'Identify high-pressure pipeline bursts, rotate pipe connectors to seal leaks, and allocate precious water fairly between homes, farms, and hospitals.',
    visualChangeNote: 'Dry fountains restart, community hydration kiosks open, and the central reservoir gradually recovers.',
  },
  {
    id: 'blackout_protocol',
    title: 'Blackout Protocol',
    subtitle: 'Heatwave Grid Collapse & Power Prioritization',
    difficulty: 'Medium',
    sdgTags: ['SDG 7: Affordable & Clean Energy', 'SDG 9: Industry & Infrastructure'],
    rewardPoints: 25,
    resourceCost: 35,
    environmentalCondition: 'An oppressive 42°C heatwave has triggered a massive AC surge. Transformers are overheating and the central power grid is cascading toward total blackout.',
    challengeSummary: 'Route clean energy cables from solar and wind farms directly to critical city nodes while preventing transformer fires.',
    visualChangeNote: 'Darkened city districts illuminate, zero-emission electric buses resume routes, and renewable microgrids activate.',
  },
  {
    id: 'waste_apocalypse',
    title: 'Waste Apocalypse',
    subtitle: 'Street Plastic Inundation & River Contamination',
    difficulty: 'Easy',
    sdgTags: ['SDG 12: Responsible Consumption', 'SDG 14: Life Below Water'],
    rewardPoints: 20,
    resourceCost: 25,
    environmentalCondition: 'Single-use plastic bottles, discarded electronics, and toxic waste are blocking streets and washing into the river delta, choking wildlife.',
    challengeSummary: 'Rapidly sort high-volume waste into dedicated recycling streams, then strategically deploy river-trash boom barriers to safeguard the harbor.',
    visualChangeNote: 'Streets become pristine, riverbanks clear of sludge, and aquatic wildlife returns to the clear river waters.',
  },
  {
    id: 'breathless_city',
    title: 'The Breathless City',
    subtitle: 'Severe Industrial Smog & Particulate Hotspots',
    difficulty: 'Hard',
    sdgTags: ['SDG 3: Good Health', 'SDG 11: Sustainable Cities', 'SDG 13: Climate Action'],
    rewardPoints: 30,
    resourceCost: 50,
    environmentalCondition: 'Stagnant atmospheric inversion has trapped hazardous PM2.5 soot over downtown. Hospital emergency rooms are overflowing with respiratory cases.',
    challengeSummary: 'Analyze the air quality heatmap, deploy electrostatic bio-scrubbers, route low-emission transit corridors, and designate tree air filters.',
    visualChangeNote: 'Smog hazes lift, atmospheric visibility dramatically clears, and lush green transit lanes line the boulevards.',
  },
  {
    id: 'bring_nature_back',
    title: 'Bring Nature Back',
    subtitle: 'Urban Heat Island, Habitat Loss & Soil Degeneration',
    difficulty: 'Expert',
    sdgTags: ['SDG 15: Life on Land', 'SDG 13: Climate Action', 'SDG 11: Sustainable Cities'],
    rewardPoints: 40,
    resourceCost: 60,
    environmentalCondition: 'Concrete sprawl has eradicated local wetlands and native tree cover, producing an unbearable +6°C urban heat dome with extinct bird populations.',
    challengeSummary: 'Directly plant native Miyawaki trees, construct retention wetlands, and weave unbroken green wildlife corridors through concrete districts.',
    visualChangeNote: 'Barren asphalt transforms into blooming biological corridors, microclimate cools by 4°C, and native songbirds populate the parks.',
  },
];

export const INITIAL_SAVE: GameSaveData = {
  ecoCoins: 50,
  tokens: {
    tree: 1,
    clean_air: 1,
    waste: 1,
    water: 1,
    solar: 1,
  },
  districts: INITIAL_DISTRICTS,
  upgrades: INITIAL_UPGRADES,
  quests: INITIAL_QUESTS,
  stats: {
    highScore: 0,
    totalDistance: 0,
    runsCount: 0,
    challengesCompleted: 0,
    cityRestorationPercent: 0,
  },
  crisisState: INITIAL_CRISIS_STATE,
  soundEnabled: true,
  musicEnabled: true,
};

export function updateQuestProgress(save: GameSaveData): GameSaveData {
  const builtCount = save.districts.filter((d) => d.unlocked).length;
  const updatedQuests = save.quests.map((q) => {
    let p = q.progress;
    if (q.id === 'quest_sprint_500') p = save.stats.totalDistance;
    else if (q.id === 'quest_challenges_3') p = save.stats.challengesCompleted;
    else if (q.id === 'quest_district_2') p = builtCount;
    else if (q.id === 'quest_high_1000') p = save.stats.highScore;
    const completed = p >= q.target;
    return { ...q, progress: Math.min(p, q.target), completed: q.completed || completed };
  });
  return { ...save, quests: updatedQuests };
}

export function loadGameSave(): GameSaveData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_SAVE;
    const parsed = JSON.parse(raw);
    const loaded: GameSaveData = {
      ...INITIAL_SAVE,
      ...parsed,
      tokens: { ...INITIAL_SAVE.tokens, ...(parsed.tokens || {}) },
      upgrades: { ...INITIAL_UPGRADES, ...(parsed.upgrades || {}) },
      quests: INITIAL_QUESTS.map((initQ) => {
        const saved = (parsed.quests || []).find((q: EcoQuest) => q.id === initQ.id);
        return saved ? { ...initQ, ...saved } : initQ;
      }),
      districts: INITIAL_DISTRICTS.map((initD) => {
        const saved = (parsed.districts || []).find((d: CityDistrict) => d.id === initD.id);
        return saved ? { ...initD, ...saved } : initD;
      }),
      stats: { ...INITIAL_SAVE.stats, ...(parsed.stats || {}) },
      crisisState: {
        ...INITIAL_CRISIS_STATE,
        ...(parsed.crisisState || {}),
        sdgs: { ...INITIAL_CRISIS_STATE.sdgs, ...(parsed.crisisState?.sdgs || {}) },
        activeCrisisEffects: { ...INITIAL_CRISIS_STATE.activeCrisisEffects, ...(parsed.crisisState?.activeCrisisEffects || {}) },
      },
    };
    return updateQuestProgress(loaded);
  } catch {
    return INITIAL_SAVE;
  }
}

export function saveGameSave(data: GameSaveData) {
  try {
    const builtCount = data.districts.filter((d) => d.unlocked).length;
    data.stats.cityRestorationPercent = Math.round((builtCount / data.districts.length) * 100);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localstorage error ignore
  }
}

export function claimQuestReward(save: GameSaveData, questId: string): GameSaveData | null {
  const quest = save.quests.find((q) => q.id === questId);
  if (!quest || !quest.completed || quest.claimed) return null;

  const newTokens = { ...save.tokens };
  newTokens[quest.rewardToken] = (newTokens[quest.rewardToken] || 0) + 1;

  const updatedQuests = save.quests.map((q) => (q.id === questId ? { ...q, claimed: true } : q));
  const updated: GameSaveData = {
    ...save,
    ecoCoins: save.ecoCoins + quest.rewardCoins,
    tokens: newTokens,
    quests: updatedQuests,
  };
  saveGameSave(updated);
  return updated;
}

export function purchaseUpgrade(
  save: GameSaveData,
  type: 'magnet' | 'shield' | 'multiplier'
): GameSaveData | null {
  const costs: Record<string, { coins: number; tokenType: TokenType; tokenCost: number }> = {
    magnet: {
      coins: (save.upgrades.magnetLevel + 1) * 60,
      tokenType: 'solar',
      tokenCost: save.upgrades.magnetLevel + 1,
    },
    shield: {
      coins: (save.upgrades.shieldLevel + 1) * 75,
      tokenType: 'clean_air',
      tokenCost: save.upgrades.shieldLevel + 1,
    },
    multiplier: {
      coins: save.upgrades.coinMultiplier * 100,
      tokenType: 'waste',
      tokenCost: save.upgrades.coinMultiplier,
    },
  };

  const req = costs[type];
  if (!req) return null;
  if (save.ecoCoins < req.coins) return null;
  if ((save.tokens[req.tokenType] || 0) < req.tokenCost) return null;

  const newUpgrades = { ...save.upgrades };
  if (type === 'magnet') {
    if (newUpgrades.magnetLevel >= 3) return null;
    newUpgrades.magnetLevel += 1;
  } else if (type === 'shield') {
    if (newUpgrades.shieldLevel >= 3) return null;
    newUpgrades.shieldLevel += 1;
  } else if (type === 'multiplier') {
    if (newUpgrades.coinMultiplier >= 3) return null;
    newUpgrades.coinMultiplier += 1;
  }

  const newTokens = { ...save.tokens };
  newTokens[req.tokenType] -= req.tokenCost;

  const updated: GameSaveData = {
    ...save,
    ecoCoins: save.ecoCoins - req.coins,
    tokens: newTokens,
    upgrades: newUpgrades,
  };
  saveGameSave(updated);
  return updated;
}

export function unlockSkin(save: GameSaveData, skinId: 'emerald' | 'solar' | 'cyber' | 'aurora', costCoins: number): GameSaveData | null {
  if (save.upgrades.unlockedSkins.includes(skinId)) {
    // Select skin
    const updated = {
      ...save,
      upgrades: { ...save.upgrades, selectedSkin: skinId },
    };
    saveGameSave(updated);
    return updated;
  }
  if (save.ecoCoins < costCoins) return null;

  const updated: GameSaveData = {
    ...save,
    ecoCoins: save.ecoCoins - costCoins,
    upgrades: {
      ...save.upgrades,
      selectedSkin: skinId,
      unlockedSkins: [...save.upgrades.unlockedSkins, skinId],
    },
  };
  saveGameSave(updated);
  return updated;
}

export function canAffordDistrict(save: GameSaveData, district: CityDistrict): boolean {
  if (district.unlocked) return false;
  if (save.ecoCoins < district.costCoins) return false;
  const tokenType = district.costTokens.type;
  if ((save.tokens[tokenType] || 0) < district.costTokens.count) return false;
  return true;
}

export function purchaseDistrict(save: GameSaveData, districtId: string): GameSaveData | null {
  const target = save.districts.find((d) => d.id === districtId);
  if (!target || target.unlocked) return null;
  if (!canAffordDistrict(save, target)) return null;

  const newCoins = save.ecoCoins - target.costCoins;
  const newTokens = { ...save.tokens };
  newTokens[target.costTokens.type] -= target.costTokens.count;

  const newDistricts = save.districts.map((d) => {
    if (d.id === districtId) {
      return { ...d, unlocked: true, level: 1 };
    }
    return d;
  });

  const updated: GameSaveData = {
    ...save,
    ecoCoins: newCoins,
    tokens: newTokens,
    districts: newDistricts,
  };

  saveGameSave(updated);
  return updated;
}
