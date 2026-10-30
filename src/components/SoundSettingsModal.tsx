import React, { useState } from 'react';
import { Volume2, VolumeX, Mic, X } from 'lucide-react';
import { gameAudio } from '../utils/audio';
import { AudioSettings } from '../types/game';

interface SoundSettingsModalProps {
  onClose: () => void;
}

export const SoundSettingsModal: React.FC<SoundSettingsModalProps> = ({ onClose }) => {
  const [settings, setSettings] = useState<AudioSettings>(gameAudio.getSettings());

  const handleUpdate = (partial: Partial<AudioSettings>) => {
    const next = { ...settings, ...partial };
    setSettings(next);
    gameAudio.updateSettings(partial);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-sm w-full p-5 shadow-2xl animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-black text-slate-900">Audio & Voice Settings</h3>
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

        <div className="space-y-4 text-xs font-semibold text-slate-700">
          {/* Master Mute */}
          <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-2xl">
            <span className="flex items-center gap-1.5">
              {settings.masterMute ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
              <span>Master Sound</span>
            </span>
            <button
              onClick={() => handleUpdate({ masterMute: !settings.masterMute })}
              className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                settings.masterMute ? 'bg-rose-100 text-rose-800' : 'bg-emerald-600 text-white'
              }`}
            >
              {settings.masterMute ? 'Muted' : 'Sound ON'}
            </button>
          </div>

          {/* Voice Narration */}
          <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-2xl">
            <span className="flex items-center gap-1.5">
              <Mic className="w-4 h-4 text-sky-600" />
              <span>Earthy Voice Narration</span>
            </span>
            <button
              onClick={() => handleUpdate({ voiceEnabled: !settings.voiceEnabled })}
              className={`px-3 py-1 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                settings.voiceEnabled ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-600'
              }`}
            >
              {settings.voiceEnabled ? 'Voice ON' : 'Voice OFF'}
            </button>
          </div>

          {/* SFX Volume */}
          <div className="p-2.5 bg-slate-50 rounded-2xl">
            <div className="flex items-center justify-between mb-1.5">
              <span>Sound Effects (SFX)</span>
              <span className="font-mono text-slate-500">{Math.round(settings.sfxVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.sfxVolume}
              onChange={(e) => handleUpdate({ sfxVolume: parseFloat(e.target.value) })}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>
        </div>

        <button
          onClick={() => {
            gameAudio.playClick();
            onClose();
          }}
          className="w-full mt-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer"
        >
          Save & Close
        </button>
      </div>
    </div>
  );
};
