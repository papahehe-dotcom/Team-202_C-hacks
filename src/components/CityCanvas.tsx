import React, { useEffect, useRef, useState } from 'react';
import { CityIndicators, Intervention } from '../types/game';
import { gameAudio } from '../utils/audio';

interface CityCanvasProps {
  indicators: CityIndicators;
  interventions: Intervention[];
  onSelectInterventionCategory?: (category: string) => void;
  lastDeployedAction?: string | null;
}

interface DistrictInfo {
  id: string;
  name: string;
  role: string;
  x: number; // percentage 0-1
  y: number; // percentage 0-1
  radius: number;
  status: string;
  icon: string;
}

export const CityCanvas: React.FC<CityCanvasProps> = ({
  indicators,
  interventions,
  onSelectInterventionCategory,
  lastDeployedAction,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictInfo | null>(null);
  const [floatingParticles, setFloatingParticles] = useState<{ id: number; text: string; x: number; y: number }[]>([]);

  // Keep latest props in ref for 60fps canvas loop
  const stateRef = useRef({
    indicators,
    interventions,
    selectedDistrict,
  });

  useEffect(() => {
    stateRef.current = {
      indicators,
      interventions,
      selectedDistrict,
    };
  }, [indicators, interventions, selectedDistrict]);

  // When a new action is deployed, spawn a cheerful particle pop over the map
  useEffect(() => {
    if (lastDeployedAction) {
      const action = interventions.find(i => i.id === lastDeployedAction);
      if (action) {
        const id = Date.now() + Math.random();
        let targetX = 50;
        let targetY = 50;
        if (action.category === 'emergency') { targetX = 35; targetY = 60; }
        else if (action.category === 'energy') { targetX = 75; targetY = 40; }
        else if (action.category === 'nature') { targetX = 40; targetY = 35; }
        else if (action.category === 'infrastructure') { targetX = 65; targetY = 70; }

        setFloatingParticles(prev => [...prev.slice(-3), {
          id,
          text: `✨ ${action.name} Active!`,
          x: targetX,
          y: targetY,
        }]);

        setTimeout(() => {
          setFloatingParticles(prev => prev.filter(p => p.id !== id));
        }, 2200);
      }
    }
  }, [lastDeployedAction, interventions]);

  const districts: DistrictInfo[] = [
    {
      id: 'suburbs',
      name: 'Sunshine Suburbs',
      role: 'Residential Neighborhood',
      x: 0.22,
      y: 0.38,
      radius: 55,
      status: indicators.temperatureC > 40 ? 'Facing extreme heatwave' : 'Comfortable and shaded',
      icon: '🏡',
    },
    {
      id: 'downtown',
      name: 'Verdantia Metro Plaza',
      role: 'Civic Center & High-Rises',
      x: 0.48,
      y: 0.35,
      radius: 60,
      status: indicators.energyStability < 35 ? 'Power grid under heavy load' : 'Grid power flowing smoothly',
      icon: '🏢',
    },
    {
      id: 'health',
      name: 'Health & Care Hub',
      role: 'Central Hospital & Cooling Shelter',
      x: 0.34,
      y: 0.68,
      radius: 50,
      status: indicators.citizenSafety > 75 ? 'Safe with emergency cooling' : 'Emergency rooms seeing heat cases',
      icon: '🏥',
    },
    {
      id: 'industry',
      name: 'Clean-Tech & Power Zone',
      role: 'Energy Grid & Industrial Hub',
      x: 0.78,
      y: 0.42,
      radius: 55,
      status: indicators.airQuality > 70 ? 'Eco-filters operating cleanly' : 'Smokestack emissions active',
      icon: '🏭',
    },
    {
      id: 'riverpark',
      name: 'Riverside Emerald Greenway',
      role: 'Public Parklands & River Boardwalk',
      x: 0.58,
      y: 0.78,
      radius: 55,
      status: indicators.environmentalHealth > 65 ? 'Lush trees and fresh river breezes' : 'Needs more trees & care',
      icon: '🌳',
    },
  ];

  // Canvas drawing loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;

    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = rect.width > 50 ? rect.width : (canvas.parentElement?.clientWidth || 800);
      const h = rect.height > 50 ? rect.height : (canvas.parentElement?.clientHeight || 400);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Dynamic vehicle state
    const traffic = [
      { t: 0.1, speed: 0.0016, type: 'bus', color: '#10b981' },
      { t: 0.45, speed: 0.0022, type: 'car', color: '#f59e0b' },
      { t: 0.75, speed: 0.0019, type: 'car', color: '#38bdf8' },
    ];

    // Animated pedestrians
    const citizens = [
      { x: 0.46, y: 0.42, vx: 0.0004, color: '#3b82f6' },
      { x: 0.28, y: 0.45, vx: -0.0003, color: '#10b981' },
      { x: 0.36, y: 0.72, vx: 0.0005, color: '#ec4899' },
      { x: 0.62, y: 0.75, vx: -0.0004, color: '#f59e0b' },
    ];

    // Clouds drifting
    const clouds = [
      { x: 0.1, y: 0.12, r: 24, speed: 0.0003 },
      { x: 0.5, y: 0.08, r: 32, speed: 0.00025 },
      { x: 0.82, y: 0.16, r: 26, speed: 0.00035 },
    ];

    const render = () => {
      time += 0.016;
      const { indicators: ind, interventions: acts, selectedDistrict: sel } = stateRef.current;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const W = canvas.width / dpr;
      const H = canvas.height / dpr;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, W, H);

      // Query intervention quantities
      const treeLevel = acts.find(a => a.id === 'plant_trees')?.totalDeployed || 0;
      const solarLevel = acts.find(a => a.id === 'solar_energy')?.totalDeployed || 0;
      const coolingLevel = acts.find(a => a.id === 'cooling_centre')?.totalDeployed || 0;
      const parkLevel = acts.find(a => a.id === 'green_spaces')?.totalDeployed || 0;
      const transitLevel = acts.find(a => a.id === 'public_transport')?.totalDeployed || 0;
      const scrubberLevel = acts.find(a => a.id === 'industrial_pollution_controls')?.totalDeployed || 0;
      const waterLevel = acts.find(a => a.id === 'drinking_water')?.totalDeployed || 0;
      const lightLevel = acts.find(a => a.id === 'street_lighting')?.totalDeployed || 0;
      const backupLevel = acts.find(a => a.id === 'backup_power')?.totalDeployed || 0;

      const isBlackout = ind.energyStability < 18;
      const isPowerStrained = ind.energyStability < 35;
      const isSmoggy = ind.airQuality < 50;
      const isExtremeHeat = ind.temperatureC > 41;

      // ==========================================
      // 1. SKY & ATMOSPHERE
      // ==========================================
      const skyGrad = ctx.createLinearGradient(0, 0, 0, H * 0.45);
      if (isBlackout) {
        skyGrad.addColorStop(0, '#475569');
        skyGrad.addColorStop(1, '#64748b');
      } else if (isSmoggy && scrubberLevel === 0) {
        skyGrad.addColorStop(0, '#fed7aa'); // Smog haze
        skyGrad.addColorStop(0.5, '#fde68a');
        skyGrad.addColorStop(1, '#bae6fd');
      } else if (isExtremeHeat) {
        skyGrad.addColorStop(0, '#fef08a'); // Heatwave sun
        skyGrad.addColorStop(0.5, '#fed7aa');
        skyGrad.addColorStop(1, '#e0f2fe');
      } else {
        skyGrad.addColorStop(0, '#38bdf8'); // Fresh sky blue
        skyGrad.addColorStop(0.6, '#7dd3fc');
        skyGrad.addColorStop(1, '#e0f2fe');
      }
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, W, H);

      // Bright cheerful Sun
      if (!isBlackout) {
        const sunX = W * 0.88;
        const sunY = H * 0.12;
        // Sun rays halo
        ctx.save();
        ctx.fillStyle = 'rgba(254, 240, 138, 0.4)';
        ctx.beginPath();
        ctx.arc(sunX, sunY, 32 + Math.sin(time * 2) * 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(sunX, sunY, 20, 0, Math.PI * 2);
        ctx.fill();

        // Sun smiling face
        ctx.fillStyle = '#b45309';
        ctx.beginPath();
        ctx.arc(sunX - 6, sunY - 2, 2.5, 0, Math.PI * 2);
        ctx.arc(sunX + 6, sunY - 2, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(sunX, sunY + 3, 5, 0, Math.PI);
        ctx.stroke();
        ctx.restore();
      }

      // Drifting Fluffy Clouds
      clouds.forEach(c => {
        c.x += c.speed;
        if (c.x > 1.1) c.x = -0.15;
        const cx = c.x * W;
        const cy = c.y * H;
        ctx.save();
        ctx.fillStyle = isSmoggy && scrubberLevel === 0 ? 'rgba(254, 215, 170, 0.75)' : 'rgba(255, 255, 255, 0.85)';
        ctx.beginPath();
        ctx.arc(cx, cy, c.r, 0, Math.PI * 2);
        ctx.arc(cx + c.r * 0.6, cy - c.r * 0.2, c.r * 0.8, 0, Math.PI * 2);
        ctx.arc(cx - c.r * 0.5, cy + c.r * 0.1, c.r * 0.7, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Birds in sky if air is healthy
      if (ind.airQuality > 60) {
        ctx.save();
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 1.5;
        for (let b = 0; b < 3; b++) {
          const bx = ((W * 0.2 + time * 25 + b * 28) % (W * 0.8));
          const by = H * 0.15 + Math.sin(time * 3 + b) * 6 + b * 8;
          ctx.beginPath();
          ctx.arc(bx, by, 5, Math.PI, Math.PI * 1.8);
          ctx.arc(bx + 9, by, 5, Math.PI * 1.2, 0);
          ctx.stroke();
        }
        ctx.restore();
      }

      // ==========================================
      // 2. UNIFIED CITY TERRAIN & ROLLING GREEN HILLS
      // ==========================================
      // Background hills
      ctx.save();
      const hillGrad = ctx.createLinearGradient(0, H * 0.2, 0, H * 0.45);
      hillGrad.addColorStop(0, '#86efac');
      hillGrad.addColorStop(1, '#4ade80');
      ctx.fillStyle = hillGrad;
      ctx.beginPath();
      ctx.moveTo(0, H * 0.32);
      ctx.bezierCurveTo(W * 0.25, H * 0.24, W * 0.6, H * 0.35, W, H * 0.27);
      ctx.lineTo(W, H);
      ctx.lineTo(0, H);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Main City Valley Base (Lush Meadow)
      ctx.save();
      const meadowGrad = ctx.createLinearGradient(0, H * 0.28, 0, H);
      meadowGrad.addColorStop(0, parkLevel > 0 ? '#4ade80' : '#86efac');
      meadowGrad.addColorStop(0.5, parkLevel > 0 ? '#22c55e' : '#4ade80');
      meadowGrad.addColorStop(1, '#16a34a');
      ctx.fillStyle = meadowGrad;
      ctx.beginPath();
      ctx.moveTo(0, H * 0.3);
      ctx.lineTo(W, H * 0.28);
      ctx.lineTo(W, H);
      ctx.lineTo(0, H);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // ==========================================
      // 3. CRYSTAL BLUE WINDING RIVER & STONE BRIDGE
      // ==========================================
      ctx.save();
      // River channel
      ctx.beginPath();
      ctx.moveTo(W * 0.62, H * 0.28);
      ctx.bezierCurveTo(W * 0.58, H * 0.45, W * 0.78, H * 0.6, W * 0.52, H * 0.72);
      ctx.bezierCurveTo(W * 0.42, H * 0.78, W * 0.48, H * 0.9, W * 0.45, H);
      ctx.lineTo(W * 0.58, H);
      ctx.bezierCurveTo(W * 0.62, H * 0.88, W * 0.58, H * 0.8, W * 0.65, H * 0.72);
      ctx.bezierCurveTo(W * 0.88, H * 0.58, W * 0.72, H * 0.42, W * 0.72, H * 0.28);
      ctx.closePath();

      const waterGrad = ctx.createLinearGradient(W * 0.5, H * 0.28, W * 0.6, H);
      waterGrad.addColorStop(0, '#38bdf8');
      waterGrad.addColorStop(0.5, '#0284c7');
      waterGrad.addColorStop(1, '#0369a1');
      ctx.fillStyle = waterGrad;
      ctx.fill();

      // Water ripples
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1.5;
      for (let r = 0; r < 5; r++) {
        const ry = H * (0.35 + r * 0.12);
        const rx = W * (0.58 + Math.sin(time * 2 + r) * 0.04);
        ctx.beginPath();
        ctx.arc(rx, ry, 12 + (r % 3) * 4, 0, Math.PI * 0.6);
        ctx.stroke();
      }

      // Little sailboat on the river
      const boatY = H * (0.45 + (Math.sin(time * 0.8) * 0.5 + 0.5) * 0.35);
      const boatX = W * (0.64 + Math.sin(boatY * 0.05) * 0.03);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(boatX, boatY - 14);
      ctx.lineTo(boatX + 8, boatY - 2);
      ctx.lineTo(boatX, boatY - 2);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(boatX, boatY, 8, 0, Math.PI);
      ctx.fill();
      ctx.restore();

      // ==========================================
      // 4. CONNECTED ROAD NETWORK & STONE ARCH BRIDGE
      // ==========================================
      // Main Avenue & Street Loops
      ctx.save();
      ctx.fillStyle = '#64748b'; // Paved asphalt

      // Horizontal central thoroughfare
      ctx.fillRect(W * 0.06, H * 0.52 - 12, W * 0.88, 24);

      // North-South connecting avenues
      ctx.fillRect(W * 0.28, H * 0.34, 20, H * 0.32); // Suburbs to Main Ave
      ctx.fillRect(W * 0.44, H * 0.52, 20, H * 0.38); // Main Ave down to Hospital
      ctx.fillRect(W * 0.74, H * 0.36, 20, H * 0.36); // Main Ave to Eco-Industry

      // Stone Bridge crossing the river on the horizontal road
      const bridgeX = W * 0.62;
      const bridgeW = W * 0.14;
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(bridgeX - 4, H * 0.52 - 15, bridgeW + 8, 30);
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(bridgeX - 4, H * 0.52 - 17, bridgeW + 8, 4); // Railing top
      ctx.fillRect(bridgeX - 4, H * 0.52 + 13, bridgeW + 8, 4); // Railing bottom

      // Road markings (Zebra & dashed centerlines)
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(W * 0.06, H * 0.52);
      ctx.lineTo(W * 0.94, H * 0.52);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(W * 0.28 + 10, H * 0.34);
      ctx.lineTo(W * 0.28 + 10, H * 0.52);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(W * 0.44 + 10, H * 0.52);
      ctx.lineTo(W * 0.44 + 10, H * 0.9);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // Streetlights along roads
      ctx.save();
      const lampPositions = [
        { x: W * 0.16, y: H * 0.52 - 16 },
        { x: W * 0.36, y: H * 0.52 - 16 },
        { x: W * 0.54, y: H * 0.52 - 16 },
        { x: W * 0.82, y: H * 0.52 - 16 },
        { x: W * 0.44 - 6, y: H * 0.7 },
      ];
      lampPositions.forEach(lp => {
        ctx.fillStyle = '#334155';
        ctx.fillRect(lp.x, lp.y, 3, 16);
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(lp.x + 1.5, lp.y - 2, 4, 0, Math.PI * 2);
        ctx.fill();
        // Glow if lighting is repaired or not blackout
        if ((lightLevel > 0 || !isBlackout) && (isPowerStrained ? Math.sin(time * 6) > 0 : true)) {
          ctx.fillStyle = 'rgba(254, 240, 138, 0.35)';
          ctx.beginPath();
          ctx.arc(lp.x + 1.5, lp.y - 2, 10, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      ctx.restore();

      // ==========================================
      // 5. DISTRICT 1: SUNSHINE HAVEN (RESIDENTIAL)
      // ==========================================
      const subX = W * 0.14;
      const subY = H * 0.32;
      ctx.save();
      // Picket fence
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(subX - 10, subY - 4, W * 0.22, H * 0.18);

      // Cozy Houses in neighborhood
      for (let h = 0; h < 3; h++) {
        const hx = subX + h * (W * 0.065);
        const hy = subY + (h % 2) * 8;
        const hw = 36;
        const hh = 26;

        // House body
        ctx.fillStyle = isBlackout ? '#94a3b8' : '#fed7aa'; // Warm peach wall
        ctx.fillRect(hx, hy + 12, hw, hh);
        ctx.strokeStyle = '#fdba74';
        ctx.strokeRect(hx, hy + 12, hw, hh);

        // Roof
        ctx.fillStyle = isBlackout ? '#64748b' : '#f97316'; // Terracotta clay roof
        ctx.beginPath();
        ctx.moveTo(hx - 4, hy + 12);
        ctx.lineTo(hx + hw / 2, hy);
        ctx.lineTo(hx + hw + 4, hy + 12);
        ctx.closePath();
        ctx.fill();

        // Door
        ctx.fillStyle = '#7c2d12';
        ctx.fillRect(hx + 13, hy + 24, 10, 14);

        // Windows (Glowing warm yellow if power on)
        ctx.fillStyle = isBlackout ? '#475569' : isPowerStrained && Math.sin(time * 5 + h) > 0 ? '#94a3b8' : '#fef08a';
        ctx.fillRect(hx + 4, hy + 16, 6, 6);
        ctx.fillRect(hx + 26, hy + 16, 6, 6);

        // Rooftop Solar Panels (if unlocked)
        if (solarLevel > 0) {
          ctx.fillStyle = '#0284c7';
          ctx.fillRect(hx + 6, hy + 4, 24, 6);
          ctx.strokeStyle = '#38bdf8';
          ctx.strokeRect(hx + 6, hy + 4, 24, 6);
          // Solar grid sparkle
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(hx + 12, hy + 6, 2, 2);
          ctx.fillRect(hx + 22, hy + 6, 2, 2);
        }
      }

      // Front gardens & small shade trees
      for (let g = 0; g < 3; g++) {
        const gx = subX + g * (W * 0.065) + 38;
        const gy = subY + 28;
        ctx.fillStyle = '#78350f';
        ctx.fillRect(gx, gy, 3, 6);
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(gx + 1.5, gy - 2, 7, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // ==========================================
      // 6. DISTRICT 2: DOWNTOWN PLAZA & HIGH-RISES
      // ==========================================
      const dtX = W * 0.40;
      const dtY = H * 0.26;
      ctx.save();

      // High-Rise 1 (Modern Tower)
      const tw1W = 42;
      const tw1H = 90;
      ctx.fillStyle = isBlackout ? '#475569' : '#0284c7';
      ctx.fillRect(dtX, dtY, tw1W, tw1H);
      ctx.strokeStyle = '#0369a1';
      ctx.strokeRect(dtX, dtY, tw1W, tw1H);

      // Office Windows grid
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 3; c++) {
          ctx.fillStyle = isBlackout ? '#334155' : isPowerStrained && Math.sin(time * 7 + r * 2) > 0 ? '#94a3b8' : '#fef08a';
          ctx.fillRect(dtX + 6 + c * 12, dtY + 10 + r * 15, 6, 8);
        }
      }

      // Rooftop Garden / Solar
      if (solarLevel > 0) {
        ctx.fillStyle = '#0ea5e9';
        ctx.fillRect(dtX + 4, dtY - 6, tw1W - 8, 6);
        ctx.fillStyle = '#facc15';
        ctx.font = 'bold 8px sans-serif';
        ctx.fillText('☀️', dtX + 16, dtY - 1);
      }

      // High-Rise 2 (Verdantia Town Hall Clocktower)
      const tw2X = dtX + 48;
      const tw2W = 38;
      const tw2H = 75;
      ctx.fillStyle = isBlackout ? '#64748b' : '#38bdf8';
      ctx.fillRect(tw2X, dtY + 15, tw2W, tw2H);

      // Clocktower roof cone
      ctx.fillStyle = '#0369a1';
      ctx.beginPath();
      ctx.moveTo(tw2X - 2, dtY + 15);
      ctx.lineTo(tw2X + tw2W / 2, dtY - 8);
      ctx.lineTo(tw2X + tw2W + 2, dtY + 15);
      ctx.closePath();
      ctx.fill();

      // Clock face
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(tw2X + tw2W / 2, dtY + 28, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(tw2X + tw2W / 2 - 1, dtY + 22, 2, 6);
      ctx.fillRect(tw2X + tw2W / 2 - 1, dtY + 27, 5, 2);

      // Cobblestone Plaza in front
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(dtX - 10, H * 0.44, 110, 24);
      // Plaza Fountain
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(dtX + 45, H * 0.46, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(dtX + 45, H * 0.46, 3 + Math.sin(time * 3) * 1.5, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();

      // ==========================================
      // 7. DISTRICT 3: HEALTH & CARE HUB (HOSPITAL & COOLING SHELTER)
      // ==========================================
      const hospX = W * 0.28;
      const hospY = H * 0.62;
      ctx.save();
      // Hospital Building
      const hw = 75;
      const hh = 46;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(hospX, hospY, hw, hh);
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2;
      ctx.strokeRect(hospX, hospY, hw, hh);

      // Red Medical Cross
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(hospX + hw / 2 - 4, hospY + 8, 8, 20);
      ctx.fillRect(hospX + hw / 2 - 10, hospY + 14, 20, 8);

      // Hospital windows
      ctx.fillStyle = isBlackout && backupLevel === 0 ? '#64748b' : '#38bdf8';
      ctx.fillRect(hospX + 8, hospY + 12, 10, 10);
      ctx.fillRect(hospX + hw - 18, hospY + 12, 10, 10);
      ctx.fillRect(hospX + 8, hospY + 28, 10, 10);
      ctx.fillRect(hospX + hw - 18, hospY + 28, 10, 10);

      // Emergency backup generator badge
      if (backupLevel > 0) {
        ctx.fillStyle = '#10b981';
        ctx.fillRect(hospX + hw - 14, hospY - 6, 16, 14);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 8px sans-serif';
        ctx.fillText('⚡ON', hospX + hw - 13, hospY + 4);
      }

      // COOLING CENTRE PAVILION (When unlocked)
      if (coolingLevel > 0) {
        const ccX = hospX + hw + 10;
        const ccY = hospY + 6;
        // Big Cooling Tent
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.moveTo(ccX, ccY + 28);
        ctx.lineTo(ccX + 22, ccY);
        ctx.lineTo(ccX + 44, ccY + 28);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#0284c7';
        ctx.stroke();

        // Cooling mist particle aura
        ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
        ctx.beginPath();
        ctx.arc(ccX + 22, ccY + 14, 24 + Math.sin(time * 3) * 3, 0, Math.PI * 2);
        ctx.fill();

        // Snow / Mist icon
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px sans-serif';
        ctx.fillText('❄️', ccX + 16, ccY + 22);

        // Sign
        ctx.fillStyle = '#0284c7';
        ctx.font = 'bold 8px sans-serif';
        ctx.fillText('COOLING SHELTER', ccX - 2, ccY + 36);
      }

      // DRINKING WATER KIOSK (When unlocked)
      if (waterLevel > 0) {
        const wkX = hospX - 24;
        const wkY = hospY + 14;
        ctx.fillStyle = '#06b6d4';
        ctx.fillRect(wkX, wkY, 18, 22);
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px sans-serif';
        ctx.fillText('💧', wkX + 3, wkY + 15);
      }

      ctx.restore();

      // ==========================================
      // 8. DISTRICT 4: CLEAN-TECH & ECO-INDUSTRIAL ZONE
      // ==========================================
      const indX = W * 0.74;
      const indY = H * 0.32;
      ctx.save();

      // Factory main warehouse
      ctx.fillStyle = '#475569';
      ctx.fillRect(indX, indY + 18, 65, 42);
      ctx.strokeStyle = '#334155';
      ctx.strokeRect(indX, indY + 18, 65, 42);

      // Industrial Smokestacks
      const stackX = indX + 46;
      ctx.fillStyle = '#334155';
      ctx.fillRect(stackX, indY - 10, 14, 40);

      // Smokestack emissions:
      if (scrubberLevel > 0) {
        // High-Tech Clean Vapor (Sparkling clean white/blue puffs!)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(stackX + 7 + Math.sin(time * 2) * 3, indY - 18, 8, 0, Math.PI * 2);
        ctx.arc(stackX + 10, indY - 26, 11, 0, Math.PI * 2);
        ctx.fill();
        // Eco filter badge on chimney
        ctx.fillStyle = '#10b981';
        ctx.fillRect(stackX - 2, indY - 2, 18, 8);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 6px sans-serif';
        ctx.fillText('FILTER', stackX, indY + 4);
      } else {
        // Unscrubbed dirty industrial soot
        ctx.fillStyle = 'rgba(100, 116, 139, 0.7)';
        ctx.beginPath();
        ctx.arc(stackX + 7 + Math.sin(time * 3) * 5, indY - 18, 10, 0, Math.PI * 2);
        ctx.arc(stackX + 12 + Math.sin(time * 2) * 6, indY - 28, 14, 0, Math.PI * 2);
        ctx.fill();
      }

      // Wind Turbine (Clean energy!)
      const wtX = indX + 80;
      const wtY = indY + 8;
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(wtX - 1.5, wtY, 3, 36); // Pole
      // Blades spinning
      ctx.save();
      ctx.translate(wtX, wtY);
      ctx.rotate(time * 2.5);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      for (let b = 0; b < 3; b++) {
        ctx.rotate((Math.PI * 2) / 3);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -18);
        ctx.stroke();
      }
      ctx.restore();

      ctx.restore();

      // ==========================================
      // 9. DISTRICT 5: RIVERSIDE GREENWAY & URBAN TREES
      // ==========================================
      ctx.save();
      // Base park lawn
      const parkX = W * 0.54;
      const parkY = H * 0.68;
      ctx.fillStyle = parkLevel > 0 ? '#22c55e' : '#4ade80';
      ctx.beginPath();
      ctx.ellipse(parkX + 40, parkY + 30, 60, 30, 0, 0, Math.PI * 2);
      ctx.fill();

      // Park benches
      ctx.fillStyle = '#78350f';
      ctx.fillRect(parkX + 25, parkY + 32, 16, 4);

      // Trees collection (dynamically multiplies with treeLevel + parkLevel)
      const totalTreesToDraw = Math.min(22, 5 + treeLevel * 4 + parkLevel * 3);
      for (let t = 0; t < totalTreesToDraw; t++) {
        // Scatter along riverside, parks, and downtown street verges
        let tx = 0;
        let ty = 0;
        if (t < 8) {
          // Riverside park
          tx = parkX + 10 + (t * 14) % 65;
          ty = parkY + 12 + (t * 8) % 35;
        } else if (t < 14) {
          // Street avenue verges
          tx = W * 0.12 + (t * 28) % (W * 0.7);
          ty = H * 0.52 + 15;
        } else {
          // Suburb neighborhood
          tx = subX + (t * 22) % (W * 0.2);
          ty = subY + 38 + (t % 2) * 10;
        }

        // Tree trunk
        ctx.fillStyle = '#78350f';
        ctx.fillRect(tx + 4, ty + 10, 4, 10);

        // Foliage canopy
        ctx.fillStyle = parkLevel > 0 ? '#15803d' : '#16a34a';
        ctx.beginPath();
        ctx.arc(tx + 6, ty + 7, 9 + Math.sin(time * 2 + t) * 0.8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(tx + 4.5, ty + 4.5, 7, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // ==========================================
      // 10. ANIMATED VEHICLES (ECO-BUSES & CARS)
      // ==========================================
      traffic.forEach(v => {
        v.t += v.speed;
        if (v.t > 1.08) v.t = -0.08;

        const vx = v.t * W;
        const vy = H * 0.52 - 6;

        ctx.save();
        if (v.type === 'bus' || transitLevel > 0) {
          // Sleek Green Electric Bus
          const busW = 34;
          const busH = 15;
          ctx.fillStyle = '#10b981'; // Eco-emerald
          ctx.beginPath();
          if (typeof ctx.roundRect === 'function') {
            ctx.roundRect(vx, vy - 2, busW, busH, 4);
          } else {
            ctx.rect(vx, vy - 2, busW, busH);
          }
          ctx.fill();

          // Bus windows
          ctx.fillStyle = '#e0f2fe';
          ctx.fillRect(vx + 4, vy, 6, 6);
          ctx.fillRect(vx + 13, vy, 6, 6);
          ctx.fillRect(vx + 22, vy, 6, 6);

          // Wheels
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.arc(vx + 7, vy + busH - 2, 3, 0, Math.PI * 2);
          ctx.arc(vx + busW - 7, vy + busH - 2, 3, 0, Math.PI * 2);
          ctx.fill();

          // Green leaf insignia
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 7px sans-serif';
          ctx.fillText('⚡ECO', vx + 6, vy + 12);
        } else {
          // Standard car
          const carW = 20;
          const carH = 10;
          ctx.fillStyle = v.color;
          ctx.fillRect(vx, vy + 2, carW, carH);
          ctx.fillStyle = '#e2e8f0';
          ctx.fillRect(vx + 4, vy + 3, 6, 4);
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.arc(vx + 4, vy + carH + 1, 2.5, 0, Math.PI * 2);
          ctx.arc(vx + carW - 4, vy + carH + 1, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      // ==========================================
      // 11. ANIMATED WALKING PEDESTRIANS
      // ==========================================
      citizens.forEach((p, idx) => {
        p.x += p.vx;
        if (p.x > 0.88 || p.x < 0.12) p.vx *= -1;
        const px = p.x * W;
        const py = p.y * H;

        ctx.save();
        // Head
        ctx.fillStyle = '#fcd34d';
        ctx.beginPath();
        ctx.arc(px, py, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Body
        ctx.fillStyle = p.color;
        ctx.fillRect(px - 2.5, py + 3.5, 5, 7);

        // Legs animated walk cycle
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1.5;
        const legOffset = Math.sin(time * 8 + idx) * 3;
        ctx.beginPath();
        ctx.moveTo(px - 1, py + 10.5);
        ctx.lineTo(px - 1 - legOffset, py + 16);
        ctx.moveTo(px + 1, py + 10.5);
        ctx.lineTo(px + 1 + legOffset, py + 16);
        ctx.stroke();

        // If extreme heat, citizen carries a cute sun umbrella!
        if (isExtremeHeat && coolingLevel === 0) {
          ctx.fillStyle = '#f43f5e';
          ctx.beginPath();
          ctx.arc(px, py - 4, 7, Math.PI, 0);
          ctx.fill();
          ctx.strokeStyle = '#f43f5e';
          ctx.strokeRect(px - 0.5, py - 4, 1, 6);
        }
        ctx.restore();
      });

      // ==========================================
      // 12. SELECTED DISTRICT HIGHLIGHT
      // ==========================================
      if (sel) {
        ctx.save();
        const dx = sel.x * W;
        const dy = sel.y * H;
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 3;
        ctx.setLineDash([6, 6]);
        ctx.beginPath();
        ctx.arc(dx, dy, sel.radius + Math.sin(time * 4) * 3, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
        ctx.fill();
        ctx.setLineDash([]);
        ctx.restore();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Handle clicking on canvas to select district
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) / rect.width;
    const clickY = (e.clientY - rect.top) / rect.height;

    // Check proximity to district pins
    let found: DistrictInfo | null = null;
    for (const d of districts) {
      const dist = Math.hypot(clickX - d.x, clickY - d.y);
      if (dist < 0.12) {
        found = d;
        break;
      }
    }

    if (found) {
      gameAudio.playClick();
      setSelectedDistrict(found);
    } else {
      setSelectedDistrict(null);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-sky-100 overflow-hidden select-none"
    >
      {/* 60 FPS Living City Canvas */}
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="w-full h-full block cursor-pointer"
      />

      {/* Interactive District Pins Overlay (Toy Game Badges) */}
      {districts.map(d => {
        const isSelected = selectedDistrict?.id === d.id;
        return (
          <button
            key={d.id}
            onClick={(e) => {
              e.stopPropagation();
              gameAudio.playClick();
              setSelectedDistrict(isSelected ? null : d);
            }}
            style={{
              left: `${d.x * 100}%`,
              top: `${d.y * 100}%`,
              transform: 'translate(-50%, -50%)',
            }}
            className={`absolute flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-black transition-all cursor-pointer ${
              isSelected
                ? 'game-btn game-btn-yellow scale-110 z-20 shadow-xl'
                : 'bg-white/95 hover:bg-white text-slate-900 border-2 border-slate-300 border-b-4 border-slate-400 hover:scale-105 z-10 shadow-md'
            }`}
          >
            <span className="text-base">{d.icon}</span>
            <span className="hidden sm:inline font-black tracking-tight">{d.name}</span>
          </button>
        );
      })}

      {/* Floating Action Celebration Particles */}
      {floatingParticles.map(p => (
        <div
          key={p.id}
          style={{ left: `${p.x}%`, top: `${p.y}%` }}
          className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-1/2 px-3 py-1.5 rounded-full bg-emerald-500 text-white font-black text-xs shadow-lg animate-bounce z-30"
        >
          {p.text}
        </div>
      ))}

      {/* District Info Inspector Popup (Arcade Dialogue Style) */}
      {selectedDistrict && (
        <div className="absolute top-16 right-4 max-w-xs sm:max-w-sm bg-slate-900/95 backdrop-blur-md border-3 border-amber-400 rounded-3xl p-3.5 shadow-2xl z-30 transition-all text-white font-game">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl p-1.5 bg-amber-400/20 rounded-2xl border border-amber-300/40">{selectedDistrict.icon}</span>
              <div>
                <h4 className="text-xs sm:text-sm font-arcade text-amber-300 leading-tight">
                  {selectedDistrict.name}
                </h4>
                <p className="text-[11px] text-slate-300 font-semibold">
                  {selectedDistrict.role}
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedDistrict(null)}
              className="w-6 h-6 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="p-2.5 bg-slate-800/90 rounded-2xl text-[11px] text-slate-200 font-medium mb-2.5 border border-slate-700">
            <span className="font-arcade text-amber-400 block mb-0.5 text-[10px]">CURRENT SITUATION:</span>
            {selectedDistrict.status}
          </div>

          {onSelectInterventionCategory && (
            <button
              onClick={() => {
                gameAudio.playClick();
                if (selectedDistrict.id === 'suburbs' || selectedDistrict.id === 'riverpark') {
                  onSelectInterventionCategory('nature');
                } else if (selectedDistrict.id === 'health') {
                  onSelectInterventionCategory('emergency');
                } else if (selectedDistrict.id === 'industry') {
                  onSelectInterventionCategory('energy');
                } else {
                  onSelectInterventionCategory('all');
                }
                setSelectedDistrict(null);
              }}
              className="w-full py-2 game-btn game-btn-green text-xs font-arcade tracking-wider"
            >
              SHOW SOLUTIONS ▶
            </button>
          )}
        </div>
      )}

      {/* Top Left City Tag */}
      <div className="absolute top-3 left-3 pointer-events-none flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm text-xs font-extrabold text-slate-800 border border-slate-200">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
        <span>Verdantia Living City Map</span>
      </div>

      {/* Top Right Live Weather Indicators */}
      <div className="absolute top-3 right-3 pointer-events-none flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm text-xs font-extrabold text-slate-800 border border-slate-200">
        <span>🌡️ {indicators.temperatureC.toFixed(1)}°C</span>
        <span className="text-slate-300">|</span>
        <span className={indicators.energyStability < 30 ? 'text-rose-600 font-black animate-pulse' : 'text-slate-700'}>
          ⚡ {indicators.energyStability}% Grid
        </span>
        <span className="text-slate-300">|</span>
        <span className={indicators.airQuality < 45 ? 'text-amber-700 font-black' : 'text-slate-700'}>
          🍃 {indicators.airQuality}% Air
        </span>
      </div>
    </div>
  );
};
