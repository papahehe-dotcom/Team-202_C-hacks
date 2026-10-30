import React, { useState } from 'react';
import { Intervention, CityIndicators } from '../types/game';
import { 
  Trees, Snowflake, Droplets, Fan, Sun, Home, Bus, 
  Factory, Zap, Megaphone, Flower2, Trash2, Lightbulb, 
  ShieldAlert, Sparkles, ChevronRight, Rocket
} from 'lucide-react';
import { gameAudio } from '../utils/audio';

interface ActionPanelProps {
  interventions: Intervention[];
  cityCredits: number;
  indicators: CityIndicators;
  onDeployAction: (actionId: string) => void;
  onEndDay: () => void;
  dayNumber: number;
  activeCategoryFilter?: string;
  onFilterChange?: (catId: string) => void;
}

export const ActionPanel: React.FC<ActionPanelProps> = ({
  interventions,
  cityCredits,
  indicators,
  onDeployAction,
  onEndDay,
  dayNumber,
  activeCategoryFilter = 'all',
  onFilterChange,
}) => {
  const [filter, setFilter] = useState<string>(activeCategoryFilter);

  React.useEffect(() => {
    if (activeCategoryFilter) {
      setFilter(activeCategoryFilter);
    }
  }, [activeCategoryFilter]);

  const handleSelectFilter = (id: string) => {
    gameAudio.playClick();
    setFilter(id);
    if (onFilterChange) onFilterChange(id);
  };

  const categories = [
    { id: 'all', label: '🌟 All Cards', icon: '🌟' },
    { id: 'emergency', label: '❄️ Heat Relief', icon: '❄️' },
    { id: 'energy', label: '⚡ Clean Energy', icon: '⚡' },
    { id: 'nature', label: '🌳 Green Parks', icon: '🌳' },
    { id: 'infrastructure', label: '🚌 Eco-City', icon: '🚌' },
  ];

  const filtered = filter === 'all'
    ? interventions
    : interventions.filter(i => {
        if (filter === 'infrastructure') return i.category === 'infrastructure' || i.category === 'civic';
        return i.category === filter;
      });

  // Fun kid-friendly power tags and quick descriptions
  const getCardDetails = (item: Intervention) => {
    switch (item.id) {
      case 'plant_trees':
        return {
          superPower: '🌲 Shade canopy cools streets by 2°C & cleans smog!',
          effect: '+15% Nature & Air',
          tradeoff: 'Takes time to grow',
          cardTheme: 'border-emerald-400 bg-gradient-to-b from-emerald-50 to-teal-50',
          btnTheme: 'game-btn-green',
        };
      case 'cooling_centre':
        return {
          superPower: '🧊 Cold refuge with water mist & air-con so seniors stay safe!',
          effect: '+25% Safety',
          tradeoff: 'Uses +30 MW power',
          cardTheme: 'border-sky-400 bg-gradient-to-b from-sky-50 to-blue-50',
          btnTheme: 'game-btn-blue',
        };
      case 'drinking_water':
        return {
          superPower: '💧 Free icy water kiosks in parks to stop heat dehydration!',
          effect: '+20% Safety',
          tradeoff: 'Affordable 80 CC',
          cardTheme: 'border-cyan-400 bg-gradient-to-b from-cyan-50 to-sky-50',
          btnTheme: 'game-btn-blue',
        };
      case 'ac_expansion':
        return {
          superPower: '❄️ Powerful chillers for hospitals & crowded schools!',
          effect: '+25% Safety',
          tradeoff: 'Uses +35 MW power',
          cardTheme: 'border-indigo-400 bg-gradient-to-b from-indigo-50 to-blue-50',
          btnTheme: 'game-btn-blue',
        };
      case 'solar_energy':
        return {
          superPower: '☀️ Giant solar roofs turn blazing hot sun into free electricity!',
          effect: '+30% Clean Power',
          tradeoff: 'Zero smoke',
          cardTheme: 'border-amber-400 bg-gradient-to-b from-amber-50 to-yellow-50',
          btnTheme: 'game-btn-yellow',
        };
      case 'building_efficiency':
        return {
          superPower: '🏠 Cool roof tiles & insulation keep homes naturally chilled!',
          effect: 'Saves 16 MW power',
          tradeoff: '+18% Grid stability',
          cardTheme: 'border-teal-400 bg-gradient-to-b from-teal-50 to-emerald-50',
          btnTheme: 'game-btn-green',
        };
      case 'public_transport':
        return {
          superPower: '🚌 Electric eco-buses replace thousands of gas-guzzling cars!',
          effect: '+18% Fresh Air',
          tradeoff: '+12% Happiness',
          cardTheme: 'border-emerald-400 bg-gradient-to-b from-emerald-50 to-teal-50',
          btnTheme: 'game-btn-green',
        };
      case 'industrial_pollution_controls':
        return {
          superPower: '🏭 High-tech smokestack filters capture black industrial smoke!',
          effect: '+25% Fresh Air',
          tradeoff: 'Clear blue skies',
          cardTheme: 'border-slate-400 bg-gradient-to-b from-slate-50 to-slate-100',
          btnTheme: 'game-btn-blue',
        };
      case 'grid_upgrade':
        return {
          superPower: '⚡ Smart cables & transformers stop city-wide power cuts!',
          effect: '+28% Power Grid',
          tradeoff: 'Adds 50 MW capacity',
          cardTheme: 'border-amber-400 bg-gradient-to-b from-amber-50 to-orange-50',
          btnTheme: 'game-btn-yellow',
        };
      case 'public_awareness':
        return {
          superPower: '📢 Fun TV & phone challenges teaching citizens how to save power!',
          effect: 'Saves 20 MW load',
          tradeoff: 'Super cheap 60 CC',
          cardTheme: 'border-purple-400 bg-gradient-to-b from-purple-50 to-fuchsia-50',
          btnTheme: 'game-btn-purple',
        };
      case 'green_spaces':
        return {
          superPower: '🌸 Pocket flower parks and fountains for neighborhood kids!',
          effect: '+22% Nature & Joy',
          tradeoff: 'Cools town center',
          cardTheme: 'border-lime-400 bg-gradient-to-b from-lime-50 to-emerald-50',
          btnTheme: 'game-btn-green',
        };
      case 'waste_management':
        return {
          superPower: '♻️ Smart compost & recycling stops smelly methane fires!',
          effect: '+16% Fresh Air',
          tradeoff: '+14% Nature',
          cardTheme: 'border-teal-400 bg-gradient-to-b from-teal-50 to-cyan-50',
          btnTheme: 'game-btn-green',
        };
      case 'street_lighting':
        return {
          superPower: '💡 Bright glow-in-the-dark LED lanterns keep night streets safe!',
          effect: 'Saves 8 MW power',
          tradeoff: '+10% Safety',
          cardTheme: 'border-yellow-400 bg-gradient-to-b from-yellow-50 to-amber-50',
          btnTheme: 'game-btn-yellow',
        };
      case 'backup_power':
        return {
          superPower: '🔋 Giant emergency mega-batteries store energy for heatwaves!',
          effect: '+24% Grid Defense',
          tradeoff: 'Prevents blackouts',
          cardTheme: 'border-red-400 bg-gradient-to-b from-red-50 to-orange-50',
          btnTheme: 'game-btn-orange',
        };
      default:
        return {
          superPower: item.description,
          effect: 'Boosts City',
          tradeoff: 'Balanced choice',
          cardTheme: 'border-emerald-400 bg-white',
          btnTheme: 'game-btn-green',
        };
    }
  };

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Trees': return <Trees className="w-5 h-5 text-emerald-600" />;
      case 'Snowflake': return <Snowflake className="w-5 h-5 text-sky-600" />;
      case 'Droplets': return <Droplets className="w-5 h-5 text-cyan-600" />;
      case 'Fan': return <Fan className="w-5 h-5 text-blue-600 animate-spin" style={{ animationDuration: '4s' }} />;
      case 'Sun': return <Sun className="w-5 h-5 text-amber-500 animate-pulse" />;
      case 'Home': return <Home className="w-5 h-5 text-teal-600" />;
      case 'Bus': return <Bus className="w-5 h-5 text-emerald-600" />;
      case 'Factory': return <Factory className="w-5 h-5 text-slate-700" />;
      case 'Zap': return <Zap className="w-5 h-5 text-yellow-500" />;
      case 'Megaphone': return <Megaphone className="w-5 h-5 text-purple-600" />;
      case 'Flower2': return <Flower2 className="w-5 h-5 text-pink-500" />;
      case 'Trash2': return <Trash2 className="w-5 h-5 text-teal-600" />;
      case 'Lightbulb': return <Lightbulb className="w-5 h-5 text-amber-500" />;
      case 'ShieldAlert': return <ShieldAlert className="w-5 h-5 text-red-600" />;
      default: return <Sparkles className="w-5 h-5 text-amber-500" />;
    }
  };

  return (
    <div className="bg-slate-900/95 backdrop-blur-md border-t-4 border-slate-950 p-2 sm:p-3 shadow-2xl flex flex-col gap-2">
      {/* Top Deck Bar: Category Filter Chips + Big End-Day Launcher */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {categories.map(cat => {
            const isActive = filter === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleSelectFilter(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  isActive
                    ? 'game-btn game-btn-yellow scale-105'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                }`}
              >
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Big Juicy Launch Next Day Button */}
        <button
          onClick={() => {
            gameAudio.playSuccess();
            onEndDay();
          }}
          className="game-btn game-btn-orange px-5 py-2 text-xs sm:text-sm font-arcade tracking-wider gap-2 shadow-xl hover:scale-105"
        >
          <Rocket className="w-4 h-4 text-yellow-200 animate-bounce" />
          <span>FINISH DAY {dayNumber} ▶</span>
        </button>
      </div>

      {/* Chunky Card Deck Tray */}
      <div className="flex gap-2.5 overflow-x-auto py-2 px-1 no-scrollbar items-stretch min-h-[195px]">
        {filtered.map(item => {
          const canAfford = cityCredits >= item.cost;
          const info = getCardDetails(item);

          return (
            <div
              key={item.id}
              className={`min-w-[210px] max-w-[210px] sm:min-w-[225px] sm:max-w-[225px] p-2.5 rounded-2xl border-3 border-b-6 flex flex-col justify-between transition-all select-none ${
                canAfford
                  ? `${info.cardTheme} hover:-translate-y-1 hover:shadow-xl`
                  : 'bg-slate-200/90 border-slate-300 opacity-60'
              }`}
            >
              <div>
                {/* Card Top: Icon + Name + Cost Badge */}
                <div className="flex items-start justify-between gap-1.5 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-8 h-8 rounded-xl bg-white shadow-md flex items-center justify-center shrink-0 border border-slate-200">
                      {renderIcon(item.icon)}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 leading-tight">
                        {item.name}
                      </h4>
                      {item.totalDeployed > 0 && (
                        <span className="text-[10px] font-black text-emerald-800 bg-emerald-200/90 px-1.5 py-0.2 rounded-md inline-block">
                          ⭐ Built x{item.totalDeployed}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Golden Coin Cost Badge */}
                  <div className="px-2 py-0.5 rounded-lg bg-amber-300 border border-amber-400 text-amber-950 font-arcade text-[11px] shrink-0 shadow-sm">
                    🪙{item.cost}
                  </div>
                </div>

                {/* Catchy Kid-Friendly Power Blurb */}
                <p className="text-[11px] text-slate-700 font-semibold leading-snug line-clamp-2 mb-1.5 min-h-[32px]">
                  {info.superPower}
                </p>

                {/* Stat Badges */}
                <div className="flex flex-wrap gap-1 mb-2">
                  <span className="text-[10px] font-black text-emerald-900 bg-emerald-200/90 px-1.5 py-0.5 rounded-md">
                    ✨ {info.effect}
                  </span>
                  {info.tradeoff && (
                    <span className="text-[9px] font-bold text-slate-600 bg-white/80 px-1 py-0.5 rounded-md border border-slate-200">
                      ⚖️ {info.tradeoff}
                    </span>
                  )}
                </div>
              </div>

              {/* Big Chunky 3D Deploy Button */}
              <button
                type="button"
                disabled={!canAfford}
                onClick={() => {
                  onDeployAction(item.id);
                }}
                className={`w-full py-1.5 text-xs font-black rounded-xl game-btn ${
                  canAfford
                    ? `${info.btnTheme} text-white shadow-md`
                    : 'bg-slate-300 text-slate-500 border-2 border-slate-400 cursor-not-allowed'
                }`}
              >
                <span>{canAfford ? '⚡ BUILD NOW' : 'NEED COINS'}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
