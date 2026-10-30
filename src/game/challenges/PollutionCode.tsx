/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Activity, Wind, Zap, Droplets, CheckCircle, Sliders, Cpu, Gauge } from 'lucide-react';
import { soundManager } from '../../audio/soundManager';
import confetti from 'canvas-confetti';

interface PollutionCodeProps {
  onComplete: (success: boolean, stats: { ppmPurged: number }) => void;
}

export const PollutionCode: React.FC<PollutionCodeProps> = ({ onComplete }) => {
  // Subsystem 1: Power Allocation (Target: 75 - 85%)
  const [powerAlloc, setPowerAlloc] = useState(30);

  // Subsystem 2: Frequency Resonance Dials (Target: [true, false, true])
  const [toggles, setToggles] = useState<[boolean, boolean, boolean]>([false, false, false]);

  // Subsystem 3: Valve Sequence (Target: 1 -> 2 -> 3)
  const [valveState, setValveState] = useState<[boolean, boolean, boolean]>([false, false, false]);

  const [ppm, setPpm] = useState(285);
  const [timeLeft, setTimeLeft] = useState(25);
  const [isDone, setIsDone] = useState(false);

  // Check Subsystem status
  const isPowerCalibrated = powerAlloc >= 75 && powerAlloc <= 85;
  const isFrequencyCalibrated = toggles[0] === true && toggles[1] === false && toggles[2] === true;
  const isValvesCalibrated = valveState[0] && valveState[1] && valveState[2];

  // Dynamic PPM calculation
  useEffect(() => {
    let currentPpm = 285;
    if (isPowerCalibrated) currentPpm -= 90;
    if (isFrequencyCalibrated) currentPpm -= 100;
    if (isValvesCalibrated) currentPpm -= 70;
    setPpm(Math.max(currentPpm, 25));

    if (isPowerCalibrated && isFrequencyCalibrated && isValvesCalibrated && !isDone) {
      setIsDone(true);
      soundManager.playSuccess();
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.5 } });
      setTimeout(() => {
        onComplete(true, { ppmPurged: 260 });
      }, 2000);
    }
  }, [isPowerCalibrated, isFrequencyCalibrated, isValvesCalibrated, isDone, onComplete]);

  // Timer
  useEffect(() => {
    if (isDone) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setIsDone(true);
          const solved = isPowerCalibrated && isFrequencyCalibrated && isValvesCalibrated;
          soundManager.playSortWrong();
          setTimeout(() => onComplete(solved, { ppmPurged: 285 - ppm }), 1500);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isDone, isPowerCalibrated, isFrequencyCalibrated, isValvesCalibrated, onComplete, ppm]);

  const toggleSwitch = (idx: 0 | 1 | 2) => {
    soundManager.playCoin();
    setToggles((prev) => {
      const next: [boolean, boolean, boolean] = [...prev];
      next[idx] = !next[idx];
      return next;
    });
  };

  const handleValveClick = (valveNum: 0 | 1 | 2) => {
    soundManager.playBuild();
    setValveState((prev) => {
      const next: [boolean, boolean, boolean] = [...prev];
      next[valveNum] = true;
      return next;
    });
  };

  return (
    <div className="relative w-full h-full bg-slate-950 text-white flex flex-col items-center justify-between p-4 overflow-hidden select-none">
      {/* Top Arcade HUD */}
      <div className="w-full max-w-3xl bg-slate-900/95 border-2 border-cyan-500/50 rounded-2xl p-4 backdrop-blur-md z-10 shadow-2xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-cyan-500 flex items-center justify-center text-white shadow-lg animate-pulse">
            <Cpu className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider bg-cyan-600 px-2 py-0.5 rounded text-white font-arcade">
                ATMOSPHERE PURGE
              </span>
              <span className="text-xs text-cyan-400 font-bold">SDG 11: Resilient Cities</span>
            </div>
            <h2 className="text-xl font-black font-arcade text-white tracking-wide">
              POLLUTION CODE: BIO-SCRUBBER DIAGNOSTIC
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <div className="text-center">
            <div className="text-xs text-slate-400 font-bold uppercase">Time Limit</div>
            <div className="text-2xl font-black font-arcade text-amber-400">{timeLeft}s</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-slate-400 font-bold uppercase">Air Quality</div>
            <div
              className={`text-2xl font-black font-arcade ${
                ppm <= 50 ? 'text-emerald-400' : ppm <= 150 ? 'text-yellow-400' : 'text-red-500'
              }`}
            >
              {ppm} PPM
            </div>
          </div>
        </div>
      </div>

      {/* Main Terminal Console with 3 Interactive Subsystems */}
      <div className="w-full max-w-3xl my-auto grid grid-cols-1 md:grid-cols-3 gap-4 z-10">
        {/* Module 1: Clean Power Load Allocator */}
        <div className={`p-4 rounded-2xl border-2 transition-all backdrop-blur-md flex flex-col justify-between ${
          isPowerCalibrated ? 'bg-emerald-950/40 border-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-slate-900/80 border-slate-700'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap className={`w-5 h-5 ${isPowerCalibrated ? 'text-emerald-400' : 'text-yellow-400'}`} />
                <span className="font-black font-arcade text-sm">1. CLEAN GRID LOAD</span>
              </div>
              {isPowerCalibrated ? (
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              ) : (
                <span className="text-xs font-bold text-yellow-400">TUNE 75-85%</span>
              )}
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Allocate solar & wind current into the scrubber array without tripping the circuit.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-300 font-bold">POWER OUTPUT:</span>
              <span className={`font-arcade font-black text-lg ${isPowerCalibrated ? 'text-emerald-400' : 'text-white'}`}>
                {powerAlloc}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={powerAlloc}
              onChange={(e) => {
                setPowerAlloc(Number(e.target.value));
                soundManager.playFootstep();
              }}
              className="w-full accent-cyan-400 cursor-pointer h-3 bg-slate-800 rounded-lg"
            />
            <div className="w-full flex justify-between text-[10px] text-slate-500 font-bold px-1">
              <span>0% LOW</span>
              <span className="text-emerald-400">TARGET: 80%</span>
              <span>100% OVERLOAD</span>
            </div>
          </div>
        </div>

        {/* Module 2: Scrubber Frequency Alignment */}
        <div className={`p-4 rounded-2xl border-2 transition-all backdrop-blur-md flex flex-col justify-between ${
          isFrequencyCalibrated ? 'bg-emerald-950/40 border-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-slate-900/80 border-slate-700'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sliders className={`w-5 h-5 ${isFrequencyCalibrated ? 'text-emerald-400' : 'text-cyan-400'}`} />
                <span className="font-black font-arcade text-sm">2. HARMONIC FILTER</span>
              </div>
              {isFrequencyCalibrated ? (
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              ) : (
                <span className="text-xs font-bold text-cyan-400 font-arcade">PATTERNS</span>
              )}
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Align filter polarity switches (Alpha ON, Beta OFF, Gamma ON) to break down nitrogen soot.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {(['ALPHA', 'BETA', 'GAMMA'] as const).map((name, i) => {
              const active = toggles[i as 0 | 1 | 2];
              return (
                <button
                  key={name}
                  onClick={() => toggleSwitch(i as 0 | 1 | 2)}
                  className={`py-3 px-2 rounded-xl border-2 font-black font-arcade text-xs flex flex-col items-center gap-1 cursor-pointer transition-all ${
                    active
                      ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-md shadow-cyan-500/30'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500'
                  }`}
                >
                  <span>{name}</span>
                  <span className={`text-[10px] ${active ? 'text-black font-bold' : 'text-slate-500'}`}>
                    {active ? 'ON' : 'OFF'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Module 3: Hydro Conduit Valves */}
        <div className={`p-4 rounded-2xl border-2 transition-all backdrop-blur-md flex flex-col justify-between ${
          isValvesCalibrated ? 'bg-emerald-950/40 border-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-slate-900/80 border-slate-700'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Droplets className={`w-5 h-5 ${isValvesCalibrated ? 'text-emerald-400' : 'text-blue-400'}`} />
                <span className="font-black font-arcade text-sm">3. WATER FLUSH</span>
              </div>
              {isValvesCalibrated ? (
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              ) : (
                <span className="text-xs font-bold text-blue-400">OPEN VALVES</span>
              )}
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Depress all 3 high-pressure conduit valves to flood the thermal scrubbers with clean water.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {['V-1 INLET', 'V-2 FILTER', 'V-3 OUTLET'].map((label, idx) => {
              const isOpen = valveState[idx as 0 | 1 | 2];
              return (
                <button
                  key={label}
                  onClick={() => handleValveClick(idx as 0 | 1 | 2)}
                  disabled={isOpen}
                  className={`py-3 px-1 rounded-xl border-2 font-black font-arcade text-xs flex flex-col items-center justify-center transition-all ${
                    isOpen
                      ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-500/30'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-blue-400 cursor-pointer active:scale-95'
                  }`}
                >
                  <span>{label}</span>
                  <span className="text-[10px] mt-0.5">{isOpen ? 'OPEN' : 'LOCKED'}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Atmospheric Status Bar */}
      <div className="w-full max-w-3xl z-10 bg-slate-900 border-2 border-slate-700 rounded-2xl p-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Gauge className="w-6 h-6 text-cyan-400 animate-spin" />
          <span className="text-xs font-bold text-slate-300">
            METROPOLITAN BIO-SCRUBBER STATUS: {ppm <= 50 ? 'OPTIMAL' : 'CALIBRATING'}
          </span>
        </div>
        <div className="text-xs font-black font-arcade text-emerald-400">
          {[isPowerCalibrated, isFrequencyCalibrated, isValvesCalibrated].filter(Boolean).length}/3 MODULES ONLINE
        </div>
      </div>
    </div>
  );
};
