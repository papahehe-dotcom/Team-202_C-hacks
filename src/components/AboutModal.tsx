import React from 'react';
import { X, Globe, Heart, ShieldCheck } from 'lucide-react';
import { gameAudio } from '../utils/audio';

interface AboutModalProps {
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl flex flex-col max-h-[88vh] overflow-y-auto animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌍</span>
            <h3 className="text-base font-black text-slate-900">About Earth Savers</h3>
          </div>
          <button
            onClick={() => {
              gameAudio.playClick();
              onClose();
            }}
            className="p-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3.5 text-xs text-slate-700 leading-relaxed">
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl">
            <h4 className="font-bold text-emerald-900 text-sm mb-1">The Mission of Verdantia</h4>
            <p>
              In Earth Savers: The Last 8 Days, players experience the real-world consequences of urban environmental decisions. Verdantia faces record heat, dangerous smog, and an electricity shortage.
            </p>
          </div>

          <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
            Anchored in United Nations Sustainable Development Goals:
          </h4>

          <div className="space-y-2">
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
              <strong className="text-emerald-800 block">🏙️ SDG 11: Sustainable Cities and Communities</strong>
              <span>Ensure resilient cooling access, shaded streets, and safe public transport for vulnerable residents.</span>
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
              <strong className="text-amber-800 block">💡 SDG 12: Responsible Consumption and Production</strong>
              <span>Balance high air-conditioning demand with smart thermostat pledges and energy-efficient building design.</span>
            </div>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
              <strong className="text-sky-800 block">☀️ SDG 13: Climate Action</strong>
              <span>Transition from polluting fossil peakers to clean rooftop solar and battery storage.</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            gameAudio.playClick();
            onClose();
          }}
          className="w-full mt-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer"
        >
          Return to Game
        </button>
      </div>
    </div>
  );
};
