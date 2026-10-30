import React from 'react';
import { CityIndicators } from '../types/game';
import { BarChart3, X, Zap, Wind, Trees, Smile, ShieldCheck, Thermometer } from 'lucide-react';
import { gameAudio } from '../utils/audio';

interface CityStatusModalProps {
  indicators: CityIndicators;
  onClose: () => void;
}

export const CityStatusModal: React.FC<CityStatusModalProps> = ({
  indicators,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border-2 border-emerald-400/40 rounded-3xl max-w-md w-full p-5 shadow-2xl flex flex-col max-h-[85vh] overflow-y-auto animate-in zoom-in-95 duration-150 select-none">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📊</span>
            <div>
              <h3 className="text-base font-black text-slate-900">City Health Overview</h3>
              <p className="text-[11px] text-slate-500 font-medium">How Verdantia is doing right now</p>
            </div>
          </div>
          <button
            onClick={() => {
              gameAudio.playClick();
              onClose();
            }}
            className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 4 Core Status Cards */}
        <div className="grid grid-cols-2 gap-2.5 text-xs mb-4">
          {/* Temperature */}
          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-amber-800 font-bold mb-1">
              <Thermometer className="w-4 h-4 text-amber-600" />
              <span>City Heat</span>
            </div>
            <div>
              <strong className="text-xl text-amber-900 font-mono block">{indicators.temperatureC.toFixed(1)}°C</strong>
              <p className="text-[10px] text-amber-700 font-medium mt-0.5">
                {indicators.temperatureC > 40 ? '🔥 Scorching heatwave' : '🌤️ Shaded and cooling'}
              </p>
            </div>
          </div>

          {/* Power Grid */}
          <div className={`p-3 rounded-2xl border flex flex-col justify-between ${
            indicators.energyStability < 35 ? 'bg-rose-50 border-rose-300' : 'bg-sky-50 border-sky-200'
          }`}>
            <div className="flex items-center gap-1.5 font-bold mb-1 text-slate-800">
              <Zap className={`w-4 h-4 ${indicators.energyStability < 35 ? 'text-rose-600' : 'text-sky-600'}`} />
              <span>Electricity Grid</span>
            </div>
            <div>
              <strong className="text-xl text-slate-900 font-mono block">
                {indicators.energyStability}%
              </strong>
              <p className={`text-[10px] font-medium mt-0.5 ${
                indicators.energyStability < 35 ? 'text-rose-700 font-bold' : 'text-sky-700'
              }`}>
                {indicators.energyStability < 35 ? '⚠️ Risk of blackout!' : '⚡ Flowing smoothly'}
              </p>
            </div>
          </div>

          {/* Air Quality */}
          <div className="p-3 bg-teal-50 rounded-2xl border border-teal-200 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-teal-800 font-bold mb-1">
              <Wind className="w-4 h-4 text-teal-600" />
              <span>Air Quality</span>
            </div>
            <div>
              <strong className="text-xl text-teal-900 font-mono block">{indicators.airQuality}%</strong>
              <p className="text-[10px] text-teal-700 font-medium mt-0.5">
                {indicators.airQuality < 50 ? '🌫️ Hazy and smoggy' : '🍃 Clean and fresh breeze'}
              </p>
            </div>
          </div>

          {/* Citizen Safety */}
          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-emerald-800 font-bold mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Citizen Safety</span>
            </div>
            <div>
              <strong className="text-xl text-emerald-900 font-mono block">{indicators.citizenSafety}%</strong>
              <p className="text-[10px] text-emerald-700 font-medium mt-0.5">
                {indicators.citizenSafety < 50 ? '🚨 Heatstroke risks high' : '🛡️ Protected & hydrated'}
              </p>
            </div>
          </div>
        </div>

        {/* Tip Box */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] text-slate-600 leading-relaxed mb-4">
          <span className="font-bold text-slate-900 block mb-0.5">💡 Strategy Tip:</span>
          Remember: Turning on air-conditioning keeps citizens safe, but consumes extra power! Balance AC with trees and solar energy to protect both people and the electricity grid.
        </div>

        <button
          onClick={() => {
            gameAudio.playClick();
            onClose();
          }}
          className="w-full py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-colors cursor-pointer"
        >
          Back to Game Map
        </button>
      </div>
    </div>
  );
};
