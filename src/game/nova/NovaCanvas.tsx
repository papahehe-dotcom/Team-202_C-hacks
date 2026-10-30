/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect } from 'react';
import {
  PlayerState,
  GameStage,
  InteractiveObject,
  ResourceItem,
  HazardEntity,
  GrimeBoss,
  DistrictId,
  AbilityType,
} from './types';
import {
  DISTRICTS,
  CITY_BUILDINGS,
  CITY_GATES,
  WORLD_WIDTH,
  WORLD_HEIGHT,
} from './worldMap';
import { novaAudio } from './audio';

interface FloatingNotification {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  decay: number;
}

interface NovaCanvasProps {
  player: PlayerState;
  onUpdatePlayer: (updater: (prev: PlayerState) => PlayerState) => void;
  gameStage: GameStage;
  onSetGameStage: (stage: GameStage) => void;
  interactiveObjects: InteractiveObject[];
  onRestoreObject: (obj: InteractiveObject) => void;
  resources: ResourceItem[];
  onCollectResource: (res: ResourceItem) => void;
  hazards: HazardEntity[];
  boss: GrimeBoss;
  onUpdateBoss: (updater: (prev: GrimeBoss) => GrimeBoss) => void;
  onPlayerDeath: () => void;
  onVictory: () => void;
  activeDistrict: DistrictId;
  setActiveDistrict: (d: DistrictId) => void;
  showMinimap: boolean;
  virtualJoyDir: { x: number; y: number } | null;
}

export const NovaCanvas: React.FC<NovaCanvasProps> = ({
  player,
  onUpdatePlayer,
  gameStage,
  interactiveObjects,
  onRestoreObject,
  resources,
  onCollectResource,
  hazards,
  boss,
  onUpdateBoss,
  onPlayerDeath,
  onVictory,
  setActiveDistrict,
  showMinimap,
  virtualJoyDir,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Floating notifications & particles
  const floatingTextsRef = useRef<FloatingNotification[]>([]);
  const particlesRef = useRef<Particle[]>([]);

  // Input states
  const keysRef = useRef<{ [key: string]: boolean }>({});

  const addNotification = (x: number, y: number, text: string, color: string = '#38bdf8') => {
    floatingTextsRef.current.push({
      x,
      y,
      text,
      color,
      life: 60,
      maxLife: 60,
    });
  };

  const spawnParticles = (x: number, y: number, count: number, color: string) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 3.5;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 2 + Math.random() * 3,
        color,
        alpha: 1,
        decay: 0.02 + Math.random() * 0.03,
      });
    }
  };

  // Setup keyboard listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = true;
      keysRef.current[e.code] = true;

      // Handle interaction key 'E'
      if (e.key.toLowerCase() === 'e') {
        tryInteract();
      }

      // Handle abilities 1-4
      if (e.key === '1' || e.code === 'Digit1') triggerAbility('NATURE_PULSE');
      if (e.key === '2' || e.code === 'Digit2') triggerAbility('WATER_BURST');
      if (e.key === '3' || e.code === 'Digit3') triggerAbility('SOLAR_DASH');
      if (e.key === '4' || e.code === 'Digit4') triggerAbility('RECYCLE_SHIELD');
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = false;
      keysRef.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  });

  const tryInteract = () => {
    // Find nearest unrestored interactive object in radius 75
    let closest: InteractiveObject | null = null;
    let minDist = 75;

    for (const obj of interactiveObjects) {
      if (obj.restored) continue;
      const dist = Math.hypot(player.x - obj.x, player.y - obj.y);
      if (dist < minDist) {
        minDist = dist;
        closest = obj;
      }
    }

    if (!closest) return;

    // Check if player has required resources
    const cost = closest.cost;
    let canAfford = true;
    for (const [resType, reqAmount] of Object.entries(cost)) {
      if ((player.inventory[resType as keyof typeof player.inventory] || 0) < (reqAmount || 0)) {
        canAfford = false;
        break;
      }
    }

    if (!canAfford) {
      novaAudio.playHit();
      addNotification(closest.x, closest.y - 25, 'Missing Resources!', '#ef4444');
      return;
    }

    // Deduct cost and restore
    onUpdatePlayer((prev) => {
      const nextInv = { ...prev.inventory };
      for (const [resType, reqAmount] of Object.entries(cost)) {
        nextInv[resType as keyof typeof prev.inventory] -= (reqAmount || 0);
      }
      return {
        ...prev,
        inventory: nextInv,
        score: prev.score + 250,
        ecoPoints: prev.ecoPoints + 50,
      };
    });

    onRestoreObject(closest);
    novaAudio.playRestore();
    spawnParticles(closest.x, closest.y, 35, '#10b981');
    addNotification(closest.x, closest.y - 30, `+ ${closest.name} Restored!`, '#34d399');

    // If it's a core pillar, update GRIME
    if (closest.type === 'CORE_PILLAR') {
      onUpdateBoss((prev) => {
        const nextShield = Math.max(0, prev.shieldCoresActive - 1);
        return {
          ...prev,
          shieldCoresActive: nextShield,
        };
      });
      addNotification(closest.x, closest.y - 50, '⚡ GRIME SHIELD WEAKENED!', '#f59e0b');
    }
  };

  const triggerAbility = (ability: AbilityType) => {
    const abState = player.abilities[ability];
    if (!abState || abState.cooldownRemaining > 0) return;

    // Check resource cost
    const currentRes = player.inventory[abState.cost.type] || 0;
    if (currentRes < abState.cost.amount) {
      addNotification(player.x, player.y - 30, `Need ${abState.cost.amount} ${abState.cost.type}`, '#f87171');
      return;
    }

    // Deduct cost and trigger
    onUpdatePlayer((prev) => {
      const nextInv = { ...prev.inventory };
      nextInv[abState.cost.type] -= abState.cost.amount;
      return {
        ...prev,
        inventory: nextInv,
        abilities: {
          ...prev.abilities,
          [ability]: {
            ...abState,
            cooldownRemaining: abState.maxCooldown,
            durationRemaining: abState.duration,
          },
        },
      };
    });

    novaAudio.playAbility(ability);

    // Apply immediate world impact
    if (ability === 'NATURE_PULSE') {
      spawnParticles(player.x, player.y, 45, '#10b981');
      addNotification(player.x, player.y - 35, 'NATURE PULSE ACTIVATED!', '#10b981');
      // Push back nearby hazards & damage GRIME if shield down
      if (boss.active && boss.shieldCoresActive === 0) {
        const d = Math.hypot(player.x - boss.x, player.y - boss.y);
        if (d < 220) {
          onUpdateBoss((prev) => ({
            ...prev,
            health: Math.max(0, prev.health - 25),
          }));
          addNotification(boss.x, boss.y - 60, '-25 GRIME HP!', '#10b981');
        }
      }
    } else if (ability === 'WATER_BURST') {
      spawnParticles(player.x, player.y, 40, '#06b6d4');
      addNotification(player.x, player.y - 35, 'WATER BURST SURGE!', '#06b6d4');
      if (boss.active && boss.shieldCoresActive === 0) {
        const d = Math.hypot(player.x - boss.x, player.y - boss.y);
        if (d < 220) {
          onUpdateBoss((prev) => ({
            ...prev,
            health: Math.max(0, prev.health - 25),
          }));
          addNotification(boss.x, boss.y - 60, '-25 GRIME HP!', '#06b6d4');
        }
      }
    } else if (ability === 'SOLAR_DASH') {
      spawnParticles(player.x, player.y, 30, '#f59e0b');
      addNotification(player.x, player.y - 35, 'SOLAR DASH!', '#f59e0b');
    } else if (ability === 'RECYCLE_SHIELD') {
      spawnParticles(player.x, player.y, 35, '#8b5cf6');
      addNotification(player.x, player.y - 35, 'RECYCLE SHIELD UP!', '#8b5cf6');
    }
  };

  // Main Animation / Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      // Ensure canvas matches screen viewport
      if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
      }

      const cw = canvas.width;
      const ch = canvas.height;

      // --- 1. MOVEMENT & INPUT HANDLING ---
      let moveX = 0;
      let moveY = 0;

      if (keysRef.current['w'] || keysRef.current['arrowup']) moveY -= 1;
      if (keysRef.current['s'] || keysRef.current['arrowdown']) moveY += 1;
      if (keysRef.current['a'] || keysRef.current['arrowleft']) moveX -= 1;
      if (keysRef.current['d'] || keysRef.current['arrowright']) moveX += 1;

      // Virtual joystick
      if (virtualJoyDir) {
        moveX += virtualJoyDir.x;
        moveY += virtualJoyDir.y;
      }

      const len = Math.hypot(moveX, moveY);
      if (len > 0.1) {
        moveX = moveX / len;
        moveY = moveY / len;
      }

      // Check speed (Solar Dash increases speed)
      const isDashActive = player.abilities.SOLAR_DASH.durationRemaining > 0;
      const currentSpeed = isDashActive ? player.speed * 2.2 : player.speed;

      let nextX = player.x + moveX * currentSpeed * dt;
      let nextY = player.y + moveY * currentSpeed * dt;

      // Clamp within world bounds
      nextX = Math.max(player.radius + 10, Math.min(WORLD_WIDTH - player.radius - 10, nextX));
      nextY = Math.max(player.radius + 10, Math.min(WORLD_HEIGHT - player.radius - 10, nextY));

      // Building Collisions
      for (const b of CITY_BUILDINGS) {
        const testX = Math.max(b.x, Math.min(nextX, b.x + b.width));
        const testY = Math.max(b.y, Math.min(nextY, b.y + b.height));
        const d = Math.hypot(nextX - testX, nextY - testY);
        if (d < player.radius) {
          // Push player out
          const pushAngle = Math.atan2(nextY - testY, nextX - testX);
          nextX = testX + Math.cos(pushAngle) * (player.radius + 1);
          nextY = testY + Math.sin(pushAngle) * (player.radius + 1);
        }
      }

      // Gate Collisions (if closed)
      for (const gate of CITY_GATES) {
        if (!gate.isOpen) {
          const testX = Math.max(gate.x, Math.min(nextX, gate.x + gate.width));
          const testY = Math.max(gate.y, Math.min(nextY, gate.y + gate.height));
          const d = Math.hypot(nextX - testX, nextY - testY);
          if (d < player.radius) {
            const pushAngle = Math.atan2(nextY - testY, nextX - testX);
            nextX = testX + Math.cos(pushAngle) * (player.radius + 1);
            nextY = testY + Math.sin(pushAngle) * (player.radius + 1);
          }
        }
      }

      // Update player facing angle if moving
      let nextAngle = player.angle;
      if (len > 0.1) {
        nextAngle = Math.atan2(moveY, moveX);
      }

      // Decrement timers
      let nextInvuln = Math.max(0, player.invulnerableTimer - dt);
      const nextAbilities = { ...player.abilities };
      for (const k in nextAbilities) {
        const ab = nextAbilities[k as AbilityType];
        if (ab.cooldownRemaining > 0) {
          ab.cooldownRemaining = Math.max(0, ab.cooldownRemaining - dt);
        }
        if (ab.durationRemaining > 0) {
          ab.durationRemaining = Math.max(0, ab.durationRemaining - dt);
        }
      }

      // Update player position
      player.x = nextX;
      player.y = nextY;
      player.angle = nextAngle;
      player.invulnerableTimer = nextInvuln;

      // Determine active district
      for (const d of DISTRICTS) {
        if (
          player.x >= d.x &&
          player.x <= d.x + d.width &&
          player.y >= d.y &&
          player.y <= d.y + d.height
        ) {
          setActiveDistrict(d.id);
          break;
        }
      }

      // --- 2. RESOURCE COLLECTION ---
      for (const res of resources) {
        if (!res.collected) {
          const dist = Math.hypot(player.x - res.x, player.y - res.y);
          if (dist < player.radius + res.radius) {
            // Check inventory capacity
            const currentTotal =
              player.inventory.NATURE +
              player.inventory.WATER +
              player.inventory.CLEAN_ENERGY +
              player.inventory.RECYCLE;
            if (currentTotal < player.inventoryCap) {
              res.collected = true;
              res.respawnTime = 20; // 20s respawn
              novaAudio.playPickup(res.type);
              spawnParticles(res.x, res.y, 16, getResourceColor(res.type));
              addNotification(res.x, res.y - 15, `+1 ${res.type}`, getResourceColor(res.type));
              onCollectResource(res);
            } else {
              addNotification(player.x, player.y - 25, 'Inventory Full (15/15)!', '#fbbf24');
            }
          }
        } else {
          res.respawnTime -= dt;
          if (res.respawnTime <= 0) {
            res.collected = false;
          }
        }
      }

      // --- 3. HAZARD INTERACTIONS ---
      const hasShield = player.abilities.RECYCLE_SHIELD.durationRemaining > 0;
      if (player.invulnerableTimer <= 0 && !hasShield) {
        for (const haz of hazards) {
          if (!haz.active) continue;
          const dist = Math.hypot(player.x - haz.x, player.y - haz.y);
          if (dist < player.radius + haz.radius) {
            // Player takes damage
            player.health -= haz.damagePerSec * dt;
            if (player.health <= 0) {
              player.lives -= 1;
              player.health = player.maxHealth;
              player.invulnerableTimer = 3.0; // 3 seconds safety
              novaAudio.playHit();
              spawnParticles(player.x, player.y, 30, '#ef4444');
              addNotification(player.x, player.y - 40, '💔 LOST 1 LIFE!', '#ef4444');

              if (player.lives <= 0) {
                onPlayerDeath();
                return;
              }
            }
          }
        }
      }

      // --- 4. GRIME BOSS BEHAVIOR (Stage 5) ---
      if (boss.active && !boss.defeated) {
        // Boss attacks loop
        boss.attackCooldown -= dt;
        if (boss.attackCooldown <= 0) {
          boss.attackCooldown = 4.0;
          // Spawn attack towards player
          novaAudio.playBossRoar();
          boss.currentAttacks.push({
            id: `att-${Date.now()}`,
            type: Math.random() > 0.5 ? 'WAVE' : 'PROJECTILE',
            x: boss.x,
            y: boss.y,
            radius: 20,
            timer: 0,
            maxTimer: 3.5,
            executed: false,
            damage: 25,
          });
        }

        // Update attacks
        for (const att of boss.currentAttacks) {
          att.timer += dt;
          if (att.type === 'WAVE') {
            att.radius += 80 * dt;
          } else {
            // Projectile moves toward player
            const angle = Math.atan2(player.y - att.y, player.x - att.x);
            att.x += Math.cos(angle) * 160 * dt;
            att.y += Math.sin(angle) * 160 * dt;
          }

          // Check hit on player
          const d = Math.hypot(player.x - att.x, player.y - att.y);
          if (d < player.radius + att.radius && !att.executed) {
            if (player.invulnerableTimer <= 0 && !hasShield) {
              att.executed = true;
              player.health -= att.damage;
              novaAudio.playHit();
              addNotification(player.x, player.y - 25, '-25 TOXIC HIT!', '#ef4444');
              if (player.health <= 0) {
                player.lives -= 1;
                player.health = player.maxHealth;
                player.invulnerableTimer = 3.0;
                if (player.lives <= 0) {
                  onPlayerDeath();
                  return;
                }
              }
            }
          }
        }

        // Clean finished attacks
        boss.currentAttacks = boss.currentAttacks.filter(
          (a) => a.timer < a.maxTimer && !a.executed
        );

        // Check Victory
        if (boss.health <= 0) {
          boss.defeated = true;
          novaAudio.playVictory();
          spawnParticles(boss.x, boss.y, 100, '#34d399');
          addNotification(boss.x, boss.y - 80, '🌟 GRIME DISSOLVED! NOVA RESTORED!', '#34d399');
          setTimeout(() => {
            onVictory();
          }, 1500);
        }
      }

      // --- 5. CAMERA COMPUTATION ---
      let camX = player.x - cw / 2;
      let camY = player.y - ch / 2;
      camX = Math.max(0, Math.min(WORLD_WIDTH - cw, camX));
      camY = Math.max(0, Math.min(WORLD_HEIGHT - ch, camY));

      // --- 6. RENDERING ---
      ctx.clearRect(0, 0, cw, ch);

      ctx.save();
      ctx.translate(-camX, -camY);

      // A. Draw Districts floor & grid
      for (const d of DISTRICTS) {
        ctx.fillStyle = d.color;
        ctx.fillRect(d.x, d.y, d.width, d.height);

        // Grid lines
        ctx.strokeStyle = `${d.borderColor}20`;
        ctx.lineWidth = 1;
        const gridSize = 60;
        ctx.beginPath();
        for (let x = d.x; x < d.x + d.width; x += gridSize) {
          ctx.moveTo(x, d.y);
          ctx.lineTo(x, d.y + d.height);
        }
        for (let y = d.y; y < d.y + d.height; y += gridSize) {
          ctx.moveTo(d.x, y);
          ctx.lineTo(d.x + d.width, y);
        }
        ctx.stroke();

        // District Border
        ctx.strokeStyle = `${d.borderColor}50`;
        ctx.lineWidth = 4;
        ctx.strokeRect(d.x, d.y, d.width, d.height);

        // District floor label
        ctx.fillStyle = `${d.borderColor}30`;
        ctx.font = 'bold 32px Orbitron, sans-serif';
        ctx.fillText(d.name.toUpperCase(), d.x + 40, d.y + 60);
      }

      // B. Draw River Waterway animation
      const timeSec = time / 1000;
      ctx.fillStyle = '#0284c715';
      ctx.fillRect(0, 1100, 1200, 400);
      ctx.strokeStyle = '#38bdf840';
      ctx.lineWidth = 2;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        const waveY = 1150 + i * 70;
        for (let x = 0; x <= 1200; x += 40) {
          const y = waveY + Math.sin(x * 0.02 + timeSec * 2 + i) * 8;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // C. Draw Buildings with 3D sci-fi isometric depth
      for (const b of CITY_BUILDINGS) {
        // Drop shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.fillRect(b.x + 8, b.y + 8, b.width, b.height);

        // Front wall
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(b.x, b.y + 15, b.width, b.height - 15);

        // Roof top
        ctx.fillStyle = b.roofColor;
        ctx.fillRect(b.x, b.y, b.width, b.height - 15);

        // Roof border & solar details
        ctx.strokeStyle = '#38bdf880';
        ctx.lineWidth = 2;
        ctx.strokeRect(b.x, b.y, b.width, b.height - 15);

        // Building Name label
        if (b.name) {
          ctx.fillStyle = '#94a3b8';
          ctx.font = '10px Rajdhani, sans-serif';
          ctx.fillText(b.name, b.x + 8, b.y + 16);
        }
      }

      // D. Draw Gates & Barricades
      for (const gate of CITY_GATES) {
        if (!gate.isOpen) {
          // Closed Gate: Laser Barrier
          ctx.fillStyle = '#ef444430';
          ctx.fillRect(gate.x, gate.y, gate.width, gate.height);

          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 3;
          ctx.strokeRect(gate.x, gate.y, gate.width, gate.height);

          // Pulsing laser beam
          const pulse = (Math.sin(timeSec * 5) + 1) / 2;
          ctx.strokeStyle = `rgba(239, 68, 68, ${0.4 + pulse * 0.6})`;
          ctx.beginPath();
          ctx.moveTo(gate.x, gate.y + gate.height / 2);
          ctx.lineTo(gate.x + gate.width, gate.y + gate.height / 2);
          ctx.stroke();

          // Gate Label
          ctx.fillStyle = '#fca5a5';
          ctx.font = 'bold 11px Rajdhani, sans-serif';
          ctx.fillText(gate.label, gate.x + 6, gate.y - 8);
        } else {
          // Open Gate: Clean Green Portal
          ctx.fillStyle = '#10b98125';
          ctx.fillRect(gate.x, gate.y, gate.width, gate.height);

          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 2;
          ctx.setLineDash([6, 6]);
          ctx.strokeRect(gate.x, gate.y, gate.width, gate.height);
          ctx.setLineDash([]);

          ctx.fillStyle = '#6ee7b7';
          ctx.font = 'bold 11px Rajdhani, sans-serif';
          ctx.fillText('PORTAL OPEN >>', gate.x + 8, gate.y - 6);
        }
      }

      // E. Draw Hazards
      for (const haz of hazards) {
        if (!haz.active) continue;
        const pulse = Math.sin(timeSec * 3 + haz.x) * 4;

        if (haz.type === 'TOXIC_SMOG') {
          ctx.fillStyle = 'rgba(75, 85, 99, 0.45)';
          ctx.beginPath();
          ctx.arc(haz.x, haz.y, haz.radius + pulse, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = 'rgba(156, 163, 175, 0.3)';
          ctx.lineWidth = 2;
          ctx.stroke();
        } else if (haz.type === 'ACID_PUDDLE') {
          ctx.fillStyle = 'rgba(16, 185, 129, 0.35)';
          ctx.beginPath();
          ctx.ellipse(haz.x, haz.y, haz.radius + pulse, (haz.radius + pulse) * 0.6, 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = '#34d399';
          ctx.lineWidth = 2;
          ctx.stroke();
        } else if (haz.type === 'ELECTRICAL_ARC') {
          ctx.fillStyle = 'rgba(245, 158, 11, 0.2)';
          ctx.beginPath();
          ctx.arc(haz.x, haz.y, haz.radius + pulse, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 2;
          ctx.stroke();
        } else {
          // CORRUPTED GROUND
          ctx.fillStyle = 'rgba(139, 92, 246, 0.35)';
          ctx.beginPath();
          ctx.arc(haz.x, haz.y, haz.radius + pulse, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // F. Draw Resources (Floating items)
      for (const res of resources) {
        if (res.collected) continue;
        const bob = Math.sin(timeSec * 4 + res.x) * 4;
        const color = getResourceColor(res.type);

        // Glow ring
        ctx.fillStyle = `${color}30`;
        ctx.beginPath();
        ctx.arc(res.x, res.y + bob, res.radius + 6, 0, Math.PI * 2);
        ctx.fill();

        // Core orb
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(res.x, res.y + bob, res.radius, 0, Math.PI * 2);
        ctx.fill();

        // Icon letter inside
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 11px Rajdhani, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const letter = res.type === 'NATURE' ? '🌿' : res.type === 'WATER' ? '💧' : res.type === 'CLEAN_ENERGY' ? '⚡' : '♻️';
        ctx.fillText(letter, res.x, res.y + bob);
      }
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';

      // G. Draw Interactive Infrastructure
      for (const obj of interactiveObjects) {
        const pulse = Math.sin(timeSec * 3 + obj.y) * 3;

        // Base pad
        ctx.fillStyle = obj.restored ? '#064e3b' : '#334155';
        ctx.beginPath();
        ctx.arc(obj.x, obj.y, obj.radius + 6, 0, Math.PI * 2);
        ctx.fill();

        // Border
        ctx.strokeStyle = obj.restored ? '#10b981' : '#f59e0b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(obj.x, obj.y, obj.radius + pulse, 0, Math.PI * 2);
        ctx.stroke();

        // Icon inside
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 20px Rajdhani, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        let icon = '⚙️';
        if (obj.type === 'AIR_SCRUBBER') icon = '🌪️';
        if (obj.type === 'WATER_GATE' || obj.type === 'TREATMENT_PLANT') icon = '🚰';
        if (obj.type === 'SOLAR_STATION' || obj.type === 'POWER_NODE') icon = '⚡';
        if (obj.type === 'SEED_PLANTING') icon = '🌳';
        if (obj.type === 'CORE_PILLAR') icon = '💎';
        ctx.fillText(icon, obj.x, obj.y);

        // Status beacon or Proximity Prompt
        const distToPlayer = Math.hypot(player.x - obj.x, player.y - obj.y);
        if (!obj.restored) {
          if (distToPlayer < 75) {
            // Holographic prompt above object
            ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
            ctx.fillRect(obj.x - 90, obj.y - 75, 180, 48);
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(obj.x - 90, obj.y - 75, 180, 48);

            ctx.fillStyle = '#38bdf8';
            ctx.font = 'bold 12px Rajdhani, sans-serif';
            ctx.fillText('PRESS [E] OR TAP TO RESTORE', obj.x, obj.y - 58);

            // Cost summary
            const costStr = Object.entries(obj.cost)
              .map(([k, v]) => `${v}x ${k.replace('CLEAN_', '')}`)
              .join(', ');
            ctx.fillStyle = '#f59e0b';
            ctx.font = '11px Inter, sans-serif';
            ctx.fillText(`Cost: ${costStr}`, obj.x, obj.y - 40);
          } else {
            // Small badge
            ctx.fillStyle = '#f59e0b';
            ctx.font = 'bold 10px Rajdhani, sans-serif';
            ctx.fillText('OFFLINE', obj.x, obj.y - obj.radius - 8);
          }
        } else {
          ctx.fillStyle = '#10b981';
          ctx.font = 'bold 10px Rajdhani, sans-serif';
          ctx.fillText('ONLINE', obj.x, obj.y - obj.radius - 8);
        }
      }
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';

      // H. Draw GRIME BOSS (Stage 5)
      if (boss.active && !boss.defeated) {
        // Sludge aura
        const slimePulse = Math.sin(timeSec * 4) * 8;
        ctx.fillStyle = 'rgba(30, 41, 59, 0.7)';
        ctx.beginPath();
        ctx.arc(boss.x, boss.y, boss.radius + 20 + slimePulse, 0, Math.PI * 2);
        ctx.fill();

        // Dark smog titan body
        ctx.fillStyle = '#1e1b4b';
        ctx.beginPath();
        ctx.arc(boss.x, boss.y, boss.radius, 0, Math.PI * 2);
        ctx.fill();

        // Toxic tentacles
        ctx.strokeStyle = '#7c3aed';
        ctx.lineWidth = 6;
        for (let i = 0; i < 6; i++) {
          const a = (i * Math.PI) / 3 + timeSec * 1.5;
          const tx = boss.x + Math.cos(a) * (boss.radius + 35 + slimePulse);
          const ty = boss.y + Math.sin(a) * (boss.radius + 35 + slimePulse);
          ctx.beginPath();
          ctx.moveTo(boss.x, boss.y);
          ctx.lineTo(tx, ty);
          ctx.stroke();
        }

        // Glowing red malevolent eyes
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(boss.x - 22, boss.y - 15, 9, 0, Math.PI * 2);
        ctx.arc(boss.x + 22, boss.y - 15, 9, 0, Math.PI * 2);
        ctx.arc(boss.x, boss.y - 28, 6, 0, Math.PI * 2);
        ctx.fill();

        // Orbiting Toxic Shields (if shield cores active)
        if (boss.shieldCoresActive > 0) {
          ctx.strokeStyle = '#a855f7';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(boss.x, boss.y, boss.radius + 35, 0, Math.PI * 2);
          ctx.stroke();

          for (let s = 0; s < boss.shieldCoresActive; s++) {
            const sa = timeSec * 2 + (s * Math.PI * 2) / boss.shieldCoresActive;
            const sx = boss.x + Math.cos(sa) * (boss.radius + 35);
            const sy = boss.y + Math.sin(sa) * (boss.radius + 35);
            ctx.fillStyle = '#c084fc';
            ctx.beginPath();
            ctx.arc(sx, sy, 10, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Boss HP Bar
        const barW = 160;
        const barH = 12;
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(boss.x - barW / 2, boss.y - boss.radius - 30, barW, barH);
        const hpPct = boss.health / boss.maxHealth;
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(boss.x - barW / 2, boss.y - boss.radius - 30, barW * hpPct, barH);
        ctx.strokeStyle = '#f87171';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(boss.x - barW / 2, boss.y - boss.radius - 30, barW, barH);

        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 11px Orbitron, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(
          boss.shieldCoresActive > 0
            ? `GRIME [SHIELDED: ${boss.shieldCoresActive}/4 PILLARS]`
            : `GRIME [VULNERABLE: ${Math.round(boss.health)} HP]`,
          boss.x,
          boss.y - boss.radius - 36
        );
        ctx.textAlign = 'left';

        // Draw Boss attacks
        for (const att of boss.currentAttacks) {
          if (att.type === 'WAVE') {
            ctx.strokeStyle = 'rgba(168, 85, 247, 0.7)';
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.arc(att.x, att.y, att.radius, 0, Math.PI * 2);
            ctx.stroke();
          } else {
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(att.x, att.y, 14, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // I. Draw Player Character
      // Invulnerable flash
      const isInvuln = player.invulnerableTimer > 0;
      if (!isInvuln || Math.floor(timeSec * 15) % 2 === 0) {
        ctx.save();
        ctx.translate(player.x, player.y);
        ctx.rotate(player.angle);

        // Recycle Shield forcefield
        if (player.abilities.RECYCLE_SHIELD.durationRemaining > 0) {
          ctx.strokeStyle = '#8b5cf6';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(0, 0, player.radius + 12, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Solar Dash speed trail
        if (player.abilities.SOLAR_DASH.durationRemaining > 0) {
          ctx.fillStyle = '#fbbf2440';
          ctx.beginPath();
          ctx.arc(-15, 0, player.radius, 0, Math.PI * 2);
          ctx.fill();
        }

        // Eco-Hero Character Body
        // Shoulders / Armor
        ctx.fillStyle = '#0f766e';
        ctx.beginPath();
        ctx.arc(0, 0, player.radius, 0, Math.PI * 2);
        ctx.fill();

        // Chest core (Glowing green)
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(0, 0, 7, 0, Math.PI * 2);
        ctx.fill();

        // Helmet Visor (Facing forward along angle)
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(8, 0, 6, -Math.PI / 2, Math.PI / 2);
        ctx.fill();

        ctx.restore();
      }

      // J. Particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // K. Floating Texts
      for (let i = floatingTextsRef.current.length - 1; i >= 0; i--) {
        const ft = floatingTextsRef.current[i];
        ft.y -= 0.6;
        ft.life -= 1;

        if (ft.life <= 0) {
          floatingTextsRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = ft.life / ft.maxLife;
        ctx.fillStyle = ft.color;
        ctx.font = 'bold 14px Rajdhani, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      }

      ctx.restore(); // Restore camera translation

      // L. Mini-map Overlay (Top-Right)
      if (showMinimap) {
        drawMinimap(ctx, cw, ch);
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(animId);
    };
  }, [
    player,
    interactiveObjects,
    resources,
    hazards,
    boss,
    gameStage,
    showMinimap,
    virtualJoyDir,
  ]);

  const drawMinimap = (ctx: CanvasRenderingContext2D, cw: number, ch: number) => {
    const mw = 180;
    const mh = 140;
    const mx = cw - mw - 16;
    const my = 75;

    ctx.save();
    // Background frame
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(mx, my, mw, mh);
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(mx, my, mw, mh);

    const scaleX = mw / WORLD_WIDTH;
    const scaleY = mh / WORLD_HEIGHT;

    // Draw districts on minimap
    for (const d of DISTRICTS) {
      ctx.fillStyle = `${d.borderColor}30`;
      ctx.fillRect(mx + d.x * scaleX, my + d.y * scaleY, d.width * scaleX, d.height * scaleY);
    }

    // Draw interactive objectives
    for (const obj of interactiveObjects) {
      ctx.fillStyle = obj.restored ? '#10b981' : '#f59e0b';
      ctx.beginPath();
      ctx.arc(mx + obj.x * scaleX, my + obj.y * scaleY, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw Gates
    for (const gate of CITY_GATES) {
      ctx.fillStyle = gate.isOpen ? '#10b981' : '#ef4444';
      ctx.fillRect(
        mx + gate.x * scaleX,
        my + gate.y * scaleY,
        Math.max(2, gate.width * scaleX),
        Math.max(2, gate.height * scaleY)
      );
    }

    // Draw GRIME Boss if active
    if (boss.active && !boss.defeated) {
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(mx + boss.x * scaleX, my + boss.y * scaleY, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw Player Blip
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(mx + player.x * scaleX, my + player.y * scaleY, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#e0f2fe';
    ctx.font = '9px Orbitron, sans-serif';
    ctx.fillText('NOVA MAP', mx + 6, my + 14);

    ctx.restore();
  };

  const getResourceColor = (type: string) => {
    switch (type) {
      case 'NATURE':
        return '#10b981';
      case 'WATER':
        return '#06b6d4';
      case 'CLEAN_ENERGY':
        return '#f59e0b';
      case 'RECYCLE':
        return '#8b5cf6';
      default:
        return '#38bdf8';
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-slate-950">
      <canvas
        ref={canvasRef}
        className="w-full h-full block cursor-crosshair touch-none"
      />
    </div>
  );
};
