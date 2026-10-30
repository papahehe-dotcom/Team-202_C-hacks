import React, { useEffect } from 'react';
import { GameCampaignState, EndingType } from '../types/game';
import { Earthy } from './Earthy';
import { Trophy, RotateCcw, CheckCircle2, AlertTriangle, Award, ArrowRight, Sparkles } from 'lucide-react';
import { gameAudio } from '../utils/audio';

interface FinalOutcomeModalProps {
  campaign: GameCampaignState;
  onPlayAgain: () => void;
}

export const FinalOutcomeModal: React.FC<FinalOutcomeModalProps> = ({
  campaign,
  onPlayAgain,
}) => {
  const { indicators, dailyResults, totalCcEarned, totalCcSpent, achievements } = campaign;

  // Calculate Ending Type
  const avgScore = dailyResults.length > 0 
    ? Math.round(dailyResults.reduce((sum, r) => sum + r.score, 0) / dailyResults.length)
    : 70;

  let ending: EndingType = 'SURVIVED_STRUGGLING';
  let title = 'SURVIVED, BUT STILL STRUGGLING';
  let summary = 'Verdantia made it through the 8-day heatwave without total collapse! Chronic air pollution and power strain remain challenges for the next season.';
  let badgeTheme = 'bg-amber-400 text-slate-950 border-amber-300';

  if (indicators.energyStability < 25) {
    ending = 'ELECTRICITY_BLACKOUT';
    title = '⚡ BLACKOUT DISASTER!';
    summary = 'The city power grid collapsed under air conditioning overload! Hospitals and water stations went dark during peak 43°C heat.';
    badgeTheme = 'bg-rose-500 text-white border-rose-300';
  } else if (indicators.citizenSafety < 40 || indicators.airQuality < 35) {
    ending = 'CLIMATE_EMERGENCY';
    title = '🔥 CLIMATE EMERGENCY!';
    summary = 'Severe heat exhaustion and thick smog overwhelmed local clinics. The city urgently needs cleaner transit and shade trees.';
    badgeTheme = 'bg-red-600 text-white border-red-300';
  } else if (avgScore >= 80 && indicators.citizenSafety >= 75 && indicators.energyStability >= 60) {
    ending = 'GREEN_RECOVERY';
    title = '🌟 GREEN RECOVERY CHAMPION!';
    summary = 'A monumental triumph! Verdantia transformed into a resilient, cool, solar-powered eco-city! Clear skies, safe families, and reliable power!';
    badgeTheme = 'bg-emerald-400 text-slate-950 border-emerald-200';
  }

  useEffect(() => {
    if (ending === 'GREEN_RECOVERY') {
      gameAudio.playCelebration();
    } else {
      gameAudio.playWarning();
    }
    gameAudio.speak(`Campaign concluded: ${title}. ${summary}`);
    return () => gameAudio.stopSpeaking();
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none">
      <div className="bg-slate-900 border-4 border-amber-400 rounded-3xl max-w-xl w-full p-4 sm:p-6 shadow-2xl flex flex-col max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-200 text-center text-white">
        {/* Animated Trophy / Mascot */}
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 border-4 border-white shadow-xl mx-auto flex items-center justify-center text-4xl mb-3 animate-bounce">
          {ending === 'GREEN_RECOVERY' ? '🏆' : ending === 'SURVIVED_STRUGGLING' ? '🏅' : '⚠️'}
        </div>

        {/* Ending Badge */}
        <div className={`inline-block px-4 py-1.5 rounded-2xl font-arcade text-xs sm:text-sm tracking-wider uppercase border-2 shadow-lg mb-2 mx-auto ${badgeTheme}`}>
          {title}
        </div>

        <h2 className="text-xl sm:text-2xl font-arcade text-white mb-2">
          8-DAY CAMPAIGN OUTCOME
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed mb-4">
          {summary}
        </p>

        {/* Earthy Speech */}
        <div className="mb-4 text-left">
          <Earthy
            mood={ending === 'GREEN_RECOVERY' ? 'cheering' : 'thinking'}
            dialogue={ending === 'GREEN_RECOVERY' 
              ? "Phenomenal job, Mayor! You proved that clean energy, trees, and smart efficiency protect both people and the planet!" 
              : "We survived, but the power grid barely held together! Next time, try investing in solar power and cool insulation on Day 1!"}
            size="md"
          />
        </div>

        {/* Campaign Stats Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5 text-xs">
          <div className="p-2.5 bg-slate-800 border border-slate-700 rounded-2xl">
            <span className="text-slate-400 block text-[10px] font-bold">Average Score</span>
            <strong className="text-base font-arcade text-amber-400">{avgScore}/100</strong>
          </div>
          <div className="p-2.5 bg-slate-800 border border-slate-700 rounded-2xl">
            <span className="text-slate-400 block text-[10px] font-bold">Coins Spent</span>
            <strong className="text-base font-arcade text-slate-200">{totalCcSpent} CC</strong>
          </div>
          <div className="p-2.5 bg-slate-800 border border-slate-700 rounded-2xl">
            <span className="text-slate-400 block text-[10px] font-bold">Citizen Safety</span>
            <strong className="text-base font-arcade text-rose-300">{indicators.citizenSafety}%</strong>
          </div>
          <div className="p-2.5 bg-slate-800 border border-slate-700 rounded-2xl">
            <span className="text-slate-400 block text-[10px] font-bold">Power Grid</span>
            <strong className="text-base font-arcade text-amber-300">{indicators.energyStability}%</strong>
          </div>
        </div>

        {/* 3D Play Again Button */}
        <button
          onClick={() => {
            gameAudio.playClick();
            onPlayAgain();
          }}
          className="w-full py-4 game-btn game-btn-green text-sm sm:text-base font-arcade tracking-wider gap-2 shadow-2xl hover:scale-102"
        >
          <RotateCcw className="w-5 h-5 text-emerald-100" />
          <span>PLAY AGAIN WITH NEW STRATEGY 🔄</span>
        </button>
      </div>
    </div>
  );
};
