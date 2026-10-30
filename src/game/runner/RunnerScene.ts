/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { soundManager } from '../../audio/soundManager';
import { ActiveMission, TokenType } from '../../types/ecoHero';

export type Lane = -1 | 0 | 1;
const LANE_WIDTH = 2.5;

interface ObstacleData {
  mesh: THREE.Group;
  type: 'truck' | 'low_pipe' | 'road_gap' | 'barrel' | 'burning_log';
  lane: Lane;
  z: number;
  width: number;
  height: number;
  depth: number;
  yOffset: number;
  requiresSlide?: boolean;
  requiresJump?: boolean;
}

export interface RunnerSceneOptions {
  skin?: 'emerald' | 'solar' | 'cyber' | 'aurora';
  magnetUpgradeLevel?: number;
  shieldUpgradeLevel?: number;
  coinMultiplier?: number;
  initialLives?: number;
}

interface CollectibleData {
  mesh: THREE.Group;
  type: 'coin' | 'token' | 'mission_beacon' | 'powerup';
  tokenType?: TokenType;
  missionType?: 'FOREST' | 'WASTE' | 'POLLUTION';
  powerupType?: 'magnet' | 'shield' | 'turbo';
  lane: Lane;
  z: number;
  radius: number;
}

interface ParticleEffect {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
}

export class RunnerScene {
  private container: HTMLDivElement;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private clock = new THREE.Clock();

  // Animation frame & software WebGL pacing
  private frameId = 0;
  private isSoftwareGl = false;
  private isDestroyed = false;

  // Options & upgrades
  private options: RunnerSceneOptions;
  public coinMultiplier = 1;

  // Player State
  public targetLane: Lane = 0;
  public currentLaneX = 0;
  public isJumping = false;
  public isSliding = false;
  public playerY = 0;
  private verticalVelocity = 0;
  private slideTimer = 0;
  private invulnerableTimer = 0;

  // Active Power-ups
  public magnetTimer = 0;
  public shieldActive = false;
  public turboTimer = 0;

  // Run progress & speed
  public currentSpeed = 22; // units per sec
  public distanceRun = 0;
  public isRunning = true;
  public lives = 5; // 5 lives to escape the monster
  public coinsCount = 0;
  public monsterDistance = 20; // Starts 20m behind player
  public collectedTokens: Record<TokenType, number> = {
    tree: 0,
    clean_air: 0,
    waste: 0,
    water: 0,
    solar: 0,
  };

  // Callbacks to React UI
  public onCoinsChange?: (coins: number) => void;
  public onTokensChange?: (tokens: Record<TokenType, number>) => void;
  public onDistanceChange?: (meters: number) => void;
  public onLivesChange?: (lives: number) => void;
  public onPowerupsChange?: (state: { magnetTime: number; hasShield: boolean; turboTime: number }) => void;
  public onMonsterDistanceChange?: (dist: number, danger: 'SAFE' | 'WARNING' | 'CRITICAL') => void;
  public onCityGatesReached?: (stats: { distance: number; coins: number; score: number }) => void;
  public onGameOver?: (stats: { distance: number; coins: number; score: number }) => void;
  public onMissionTrigger?: (mission: ActiveMission) => void;

  // 3D Meshes & Groups
  private heroGroup!: THREE.Group;
  private heroTorso!: THREE.Mesh;
  private heroVisor!: THREE.Mesh;
  private heroLegL!: THREE.Group;
  private heroLegR!: THREE.Group;
  private heroArmL!: THREE.Group;
  private heroArmR!: THREE.Group;
  private heroShadow!: THREE.Mesh;
  private shieldMesh!: THREE.Mesh;

  // 3D Monster Character Chasing Player
  private monsterGroup!: THREE.Group;
  private monsterArmL!: THREE.Group;
  private monsterArmR!: THREE.Group;
  private monsterJaw!: THREE.Mesh;

  // City Gates at 1000m
  private cityGateGroup: THREE.Group | null = null;
  private gateSpawned = false;
  private gateReached = false;

  private roadSegments: THREE.Group[] = [];
  private obstacles: ObstacleData[] = [];
  private collectibles: CollectibleData[] = [];
  private activeParticles: ParticleEffect[] = [];

  // Touch Swipe tracking
  private touchStartX = 0;
  private touchStartY = 0;

  // Spawn tracking
  private lastObstacleZ = -20;
  private nextMissionDistance = 350; // trigger emergency mission every ~350m
  private runTime = 0;

  // Environment restoration effect (smog clearing)
  private smogDensity = 0.028;
  private targetSmogDensity = 0.028;

  constructor(container: HTMLDivElement, options: RunnerSceneOptions = {}) {
    this.container = container;
    this.options = options;
    this.coinMultiplier = options.coinMultiplier || 1;
    this.lives = options.initialLives ?? 5;
    this.shieldActive = (options.shieldUpgradeLevel ?? 0) >= 1;
    this.init();
  }

  private init() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    // Detect software WebGL
    this.isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 1. Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);

    // 2. Scene & Bright Light Sky
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xbae6fd); // Light bright sky blue
    this.scene.fog = new THREE.FogExp2(0xdbeafe, 0.009); // Soft light horizon mist

    // 3. Camera
    this.camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 200);
    this.camera.position.set(0, 3.8, 6.2);
    this.camera.lookAt(0, 1.2, -6);

    // 4. Lighting & Warm Sun
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Cheerful warm daylight & soft sky fill
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xbbf7d0, 1.4);
    this.scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfffbeb, 2.0);
    sunLight.position.set(10, 20, 10);
    sunLight.castShadow = !this.isSoftwareGl;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 1;
    sunLight.shadow.camera.far = 50;
    sunLight.shadow.camera.left = -12;
    sunLight.shadow.camera.right = 12;
    sunLight.shadow.camera.top = 12;
    sunLight.shadow.camera.bottom = -12;
    sunLight.shadow.bias = -0.0005;
    this.scene.add(sunLight);

    // 5. Build Hero & Chasing Smog Monster
    this.buildEcoHero();
    this.buildSmogMonster();

    // 6. Build Continuous Road Loop
    this.buildRoadSegments();

    // 7. Initial Obstacle & Collectible populate
    for (let z = -30; z > -140; z -= 18) {
      this.spawnSegmentFeatures(z);
    }

    // 8. Event listeners
    window.addEventListener('resize', this.onResize);
    window.addEventListener('keydown', this.onKeyDown);
    this.container.addEventListener('touchstart', this.onTouchStart, { passive: true });
    this.container.addEventListener('touchend', this.onTouchEnd, { passive: true });

    // Start loop
    this.clock.start();
    this.animate();
  }

  // --- Procedural 3D Eco Hero Character (Group of 8 distinct parts) ---
  private buildEcoHero() {
    this.heroGroup = new THREE.Group();
    this.heroGroup.position.set(0, 0, 0);

    // Dynamic Skin Palette
    const skin = this.options.skin || 'emerald';
    let primaryColor = 0x059669;
    let vestColor = 0x10b981;
    let armorColor = 0x0f172a;
    let visorColor = 0x06b6d4;
    let visorEmissive = 0x0891b2;
    let accentColor = 0xfacc15;

    if (skin === 'solar') {
      primaryColor = 0xd97706;
      vestColor = 0xf59e0b;
      armorColor = 0x451a03;
      visorColor = 0xfef08a;
      visorEmissive = 0xf59e0b;
      accentColor = 0xfbbf24;
    } else if (skin === 'cyber') {
      primaryColor = 0x7c3aed;
      vestColor = 0xa855f7;
      armorColor = 0x1e1b4b;
      visorColor = 0xec4899;
      visorEmissive = 0xdb2777;
      accentColor = 0x06b6d4;
    } else if (skin === 'aurora') {
      primaryColor = 0x0284c7;
      vestColor = 0x38bdf8;
      armorColor = 0x082f49;
      visorColor = 0x6ee7b7;
      visorEmissive = 0x10b981;
      accentColor = 0xa7f3d0;
    }

    // Materials
    const suitMat = new THREE.MeshStandardMaterial({
      color: primaryColor,
      roughness: 0.35,
      metalness: 0.2,
    });
    const vestMat = new THREE.MeshStandardMaterial({
      color: vestColor,
      roughness: 0.3,
      metalness: 0.4,
    });
    const armorMat = new THREE.MeshStandardMaterial({
      color: armorColor,
      roughness: 0.5,
      metalness: 0.7,
    });
    const visorMat = new THREE.MeshStandardMaterial({
      color: visorColor,
      emissive: visorEmissive,
      emissiveIntensity: 0.9,
      roughness: 0.1,
      metalness: 0.9,
    });
    const accentMat = new THREE.MeshStandardMaterial({
      color: accentColor,
      roughness: 0.3,
      metalness: 0.8,
    });

    // Bio-Shield Forcefield Mesh
    const shieldGeo = new THREE.SphereGeometry(1.35, 18, 18);
    const shieldMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.7,
      transparent: true,
      opacity: 0.38,
      roughness: 0.1,
      metalness: 0.8,
      wireframe: true,
    });
    this.shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
    this.shieldMesh.position.y = 1.05;
    this.shieldMesh.visible = this.shieldActive;
    this.heroGroup.add(this.shieldMesh);

    // 1. Torso
    const torsoGeo = new THREE.BoxGeometry(0.7, 0.8, 0.45);
    this.heroTorso = new THREE.Mesh(torsoGeo, suitMat);
    this.heroTorso.position.y = 1.05;
    this.heroTorso.castShadow = !this.isSoftwareGl;
    this.heroGroup.add(this.heroTorso);

    // Solar Chest Plate
    const chestPlate = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.4, 0.1), vestMat);
    chestPlate.position.set(0, 0.05, 0.22);
    this.heroTorso.add(chestPlate);

    // 2. Head & Helmet
    const headGeo = new THREE.SphereGeometry(0.28, 16, 14);
    const head = new THREE.Mesh(headGeo, armorMat);
    head.position.set(0, 1.7, 0);
    this.heroGroup.add(head);

    // 3. Cyber Visor
    const visorGeo = new THREE.BoxGeometry(0.42, 0.16, 0.22);
    this.heroVisor = new THREE.Mesh(visorGeo, visorMat);
    this.heroVisor.position.set(0, 1.72, 0.18);
    this.heroGroup.add(this.heroVisor);

    // 4. Eco Jetpack (Twin Solar Air-Canisters)
    const packGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.55, 12);
    const packL = new THREE.Mesh(packGeo, accentMat);
    packL.position.set(-0.24, 1.1, -0.28);
    this.heroGroup.add(packL);

    const packR = new THREE.Mesh(packGeo, accentMat);
    packR.position.set(0.24, 1.1, -0.28);
    this.heroGroup.add(packR);

    // Jetpack Sprout Antenna
    const sproutGeo = new THREE.ConeGeometry(0.08, 0.25, 8);
    const sprout = new THREE.Mesh(sproutGeo, suitMat);
    sprout.rotation.x = Math.PI;
    sprout.position.set(0, 1.5, -0.26);
    this.heroGroup.add(sprout);

    // 5. Left Leg (Thigh + Boot)
    this.heroLegL = new THREE.Group();
    this.heroLegL.position.set(-0.22, 0.65, 0);
    const legLMesh = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.65, 0.26), armorMat);
    legLMesh.position.y = -0.32;
    legLMesh.castShadow = !this.isSoftwareGl;
    this.heroLegL.add(legLMesh);
    this.heroGroup.add(this.heroLegL);

    // 6. Right Leg
    this.heroLegR = new THREE.Group();
    this.heroLegR.position.set(0.22, 0.65, 0);
    const legRMesh = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.65, 0.26), armorMat);
    legRMesh.position.y = -0.32;
    legRMesh.castShadow = !this.isSoftwareGl;
    this.heroLegR.add(legRMesh);
    this.heroGroup.add(this.heroLegR);

    // 7. Left Arm
    this.heroArmL = new THREE.Group();
    this.heroArmL.position.set(-0.46, 1.35, 0);
    const armLMesh = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.6, 0.2), suitMat);
    armLMesh.position.y = -0.3;
    this.heroArmL.add(armLMesh);
    this.heroGroup.add(this.heroArmL);

    // 8. Right Arm
    this.heroArmR = new THREE.Group();
    this.heroArmR.position.set(0.46, 1.35, 0);
    const armRMesh = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.6, 0.2), suitMat);
    armRMesh.position.y = -0.3;
    this.heroArmR.add(armRMesh);
    this.heroGroup.add(this.heroArmR);

    // Contact Shadow Plane
    const shadowGeo = new THREE.PlaneGeometry(1.2, 1.2);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
    });
    this.heroShadow = new THREE.Mesh(shadowGeo, shadowMat);
    this.heroShadow.rotation.x = -Math.PI / 2;
    this.heroShadow.position.y = 0.02;
    this.heroGroup.add(this.heroShadow);

    this.scene.add(this.heroGroup);
  }

  // --- 3D Chasing Smog Monster Character ---
  private buildSmogMonster() {
    this.monsterGroup = new THREE.Group();
    this.monsterGroup.position.set(0, 0, this.monsterDistance);

    // Dark noxious smog materials
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x181024,
      emissive: 0x581c87,
      emissiveIntensity: 0.35,
      roughness: 0.6,
      metalness: 0.4,
    });
    const spikeMat = new THREE.MeshStandardMaterial({
      color: 0x3b0764,
      emissive: 0x7e22ce,
      emissiveIntensity: 0.6,
      roughness: 0.3,
    });
    const eyeMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
    });
    const teethMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      roughness: 0.2,
    });

    // Main Golem Torso (Giant jagged mass)
    const torso = new THREE.Mesh(new THREE.DodecahedronGeometry(1.6, 1), bodyMat);
    torso.position.y = 2.4;
    torso.scale.set(1.4, 1.2, 1.3);
    this.monsterGroup.add(torso);

    // Spiky Dorsal Ridges
    for (let s = 0; s < 4; s++) {
      const spike = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.8, 5), spikeMat);
      spike.rotation.x = -Math.PI / 4;
      spike.position.set(0, 2.8 + s * 0.3, -0.8 + s * 0.5);
      this.monsterGroup.add(spike);
    }

    // Head
    const head = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.2, 1.4), bodyMat);
    head.position.set(0, 3.8, -0.3);
    this.monsterGroup.add(head);

    // Glowing Eyes
    const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), eyeMat);
    eyeL.position.set(-0.4, 3.9, -1.05);
    this.monsterGroup.add(eyeL);

    const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), eyeMat);
    eyeR.position.set(0.4, 3.9, -1.05);
    this.monsterGroup.add(eyeR);

    // Horns
    for (const hx of [-0.65, 0.65]) {
      const horn = new THREE.Mesh(new THREE.ConeGeometry(0.22, 1.1, 5), spikeMat);
      horn.rotation.z = hx > 0 ? -0.4 : 0.4;
      horn.rotation.x = -0.3;
      horn.position.set(hx, 4.6, -0.3);
      this.monsterGroup.add(horn);
    }

    // Gaping Maw & Fangs
    this.monsterJaw = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.4, 0.8), bodyMat);
    this.monsterJaw.position.set(0, 3.2, -0.7);
    this.monsterGroup.add(this.monsterJaw);

    // Upper & Lower Fangs
    for (let f = -0.4; f <= 0.4; f += 0.25) {
      const fangTop = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.24, 4), teethMat);
      fangTop.rotation.x = Math.PI;
      fangTop.position.set(f, 3.45, -0.95);
      this.monsterGroup.add(fangTop);

      const fangBottom = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.22, 4), teethMat);
      fangBottom.position.set(f, 0.2, -0.35);
      this.monsterJaw.add(fangBottom);
    }

    // Giant Claws Arms
    this.monsterArmL = new THREE.Group();
    this.monsterArmL.position.set(-1.8, 3.2, 0);
    const armLMesh = new THREE.Mesh(new THREE.BoxGeometry(0.6, 2.0, 0.7), bodyMat);
    armLMesh.position.set(0, -0.8, -0.4);
    armLMesh.rotation.x = 0.5;
    this.monsterArmL.add(armLMesh);
    this.monsterGroup.add(this.monsterArmL);

    this.monsterArmR = new THREE.Group();
    this.monsterArmR.position.set(1.8, 3.2, 0);
    const armRMesh = new THREE.Mesh(new THREE.BoxGeometry(0.6, 2.0, 0.7), bodyMat);
    armRMesh.position.set(0, -0.8, -0.4);
    armRMesh.rotation.x = 0.5;
    this.monsterArmR.add(armRMesh);
    this.monsterGroup.add(this.monsterArmR);

    this.scene.add(this.monsterGroup);
  }

  // --- City Gates at 1000m ---
  private spawnCityGates() {
    if (this.gateSpawned) return;
    this.gateSpawned = true;

    this.cityGateGroup = new THREE.Group();
    this.cityGateGroup.position.set(0, 0, -130);

    const pillarMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      roughness: 0.3,
      metalness: 0.8,
      emissive: 0x059669,
      emissiveIntensity: 0.5,
    });
    const gatePillarL = new THREE.Mesh(new THREE.BoxGeometry(1.8, 14, 2.2), pillarMat);
    gatePillarL.position.set(-6, 7, 0);
    this.cityGateGroup.add(gatePillarL);

    const gatePillarR = new THREE.Mesh(new THREE.BoxGeometry(1.8, 14, 2.2), pillarMat);
    gatePillarR.position.set(6, 7, 0);
    this.cityGateGroup.add(gatePillarR);

    // Cross Arch
    const archTop = new THREE.Mesh(new THREE.BoxGeometry(13.8, 2.6, 2.4), pillarMat);
    archTop.position.set(0, 12.5, 0);
    this.cityGateGroup.add(archTop);

    // Glowing Neon Safe Zone Sign
    const signMat = new THREE.MeshBasicMaterial({ color: 0x34d399 });
    const sign = new THREE.Mesh(new THREE.BoxGeometry(9, 1.4, 0.4), signMat);
    sign.position.set(0, 12.5, 1.3);
    this.cityGateGroup.add(sign);

    // Green Energy Shield Gate Field
    const fieldGeo = new THREE.PlaneGeometry(10.2, 11);
    const fieldMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide,
    });
    const field = new THREE.Mesh(fieldGeo, fieldMat);
    field.position.set(0, 5.5, 0);
    this.cityGateGroup.add(field);

    this.scene.add(this.cityGateGroup);
  }

  // --- Power-up Spawner ---
  private spawnPowerup(lane: Lane, z: number, powerupType: 'magnet' | 'shield' | 'turbo') {
    const powerGroup = new THREE.Group();
    powerGroup.position.set(lane * LANE_WIDTH, 1.1, z);

    if (powerupType === 'magnet') {
      const magnetMat = new THREE.MeshStandardMaterial({
        color: 0xef4444,
        emissive: 0xef4444,
        emissiveIntensity: 0.4,
        metalness: 0.8,
        roughness: 0.2,
      });
      const tipMat = new THREE.MeshStandardMaterial({
        color: 0xe2e8f0,
        metalness: 0.9,
        roughness: 0.1,
      });
      const archGeo = new THREE.TorusGeometry(0.35, 0.1, 8, 16, Math.PI);
      const arch = new THREE.Mesh(archGeo, magnetMat);
      arch.rotation.z = Math.PI;
      powerGroup.add(arch);

      const tipL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.22, 0.2), tipMat);
      tipL.position.set(-0.35, -0.15, 0);
      powerGroup.add(tipL);

      const tipR = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.22, 0.2), tipMat);
      tipR.position.set(0.35, -0.15, 0);
      powerGroup.add(tipR);
    } else if (powerupType === 'shield') {
      const orbMat = new THREE.MeshStandardMaterial({
        color: 0x06b6d4,
        emissive: 0x0891b2,
        emissiveIntensity: 0.8,
        roughness: 0.1,
        metalness: 0.6,
      });
      const orb = new THREE.Mesh(new THREE.IcosahedronGeometry(0.42, 1), orbMat);
      powerGroup.add(orb);

      const ringGeo = new THREE.TorusGeometry(0.62, 0.03, 8, 20);
      const ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0x67e8f9 }));
      ring.rotation.x = Math.PI / 4;
      powerGroup.add(ring);
    } else {
      const turboMat = new THREE.MeshStandardMaterial({
        color: 0x10b981,
        emissive: 0x34d399,
        emissiveIntensity: 0.9,
        roughness: 0.2,
        metalness: 0.5,
      });
      const boltUpper = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.45, 0.15), turboMat);
      boltUpper.rotation.z = -Math.PI / 6;
      boltUpper.position.set(-0.1, 0.15, 0);
      powerGroup.add(boltUpper);

      const boltLower = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.45, 0.15), turboMat);
      boltLower.rotation.z = -Math.PI / 6;
      boltLower.position.set(0.1, -0.15, 0);
      powerGroup.add(boltLower);
    }

    this.scene.add(powerGroup);
    this.collectibles.push({
      mesh: powerGroup,
      type: 'powerup',
      powerupType,
      lane,
      z,
      radius: 0.7,
    });
  }

  // --- Endless Road System (Light, Attractive & Vibrant) ---
  private buildRoadSegments() {
    const SEGMENT_LENGTH = 60;
    const TOTAL_SEGMENTS = 4;

    // Cheerful pastel building palette
    const buildingColors = [0xf8fafc, 0xe0f2fe, 0xdcfce7, 0xfef3c7, 0xfce7f3];

    for (let i = 0; i < TOTAL_SEGMENTS; i++) {
      const segGroup = new THREE.Group();
      segGroup.position.z = -i * SEGMENT_LENGTH;

      // Clean bright road surface (Light sleek slate/concrete)
      const roadGeo = new THREE.PlaneGeometry(8.5, SEGMENT_LENGTH);
      const roadMat = new THREE.MeshStandardMaterial({
        color: 0x94a3b8, // Light modern paved road
        roughness: 0.6,
        metalness: 0.05,
      });
      const roadMesh = new THREE.Mesh(roadGeo, roadMat);
      roadMesh.rotation.x = -Math.PI / 2;
      roadMesh.receiveShadow = !this.isSoftwareGl;
      segGroup.add(roadMesh);

      // Cheerful Emerald & Yellow Eco-Dividers
      for (const lx of [-1.25, 1.25]) {
        for (let sz = -SEGMENT_LENGTH / 2 + 3; sz < SEGMENT_LENGTH / 2; sz += 6) {
          const stripeGeo = new THREE.PlaneGeometry(0.2, 3);
          const stripeMat = new THREE.MeshBasicMaterial({ color: 0x10b981 }); // Eco emerald lane
          const stripe = new THREE.Mesh(stripeGeo, stripeMat);
          stripe.rotation.x = -Math.PI / 2;
          stripe.position.set(lx, 0.01, sz);
          segGroup.add(stripe);
        }
      }

      // Bright Light Curbs
      const curbMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.5 });
      for (const cx of [-4.5, 4.5]) {
        const curb = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.35, SEGMENT_LENGTH), curbMat);
        curb.position.set(cx, 0.15, 0);
        curb.receiveShadow = !this.isSoftwareGl;
        segGroup.add(curb);
      }

      // Vibrant Green Grass Buffers on sides
      const grassMat = new THREE.MeshStandardMaterial({ color: 0x86efac, roughness: 0.8 });
      for (const gx of [-9.5, 9.5]) {
        const grass = new THREE.Mesh(new THREE.PlaneGeometry(9, SEGMENT_LENGTH), grassMat);
        grass.rotation.x = -Math.PI / 2;
        grass.position.set(gx, 0.05, 0);
        grass.receiveShadow = !this.isSoftwareGl;
        segGroup.add(grass);
      }

      // Cheerful roadside Eco-City Buildings & Stylized Green Trees
      for (let pz = -SEGMENT_LENGTH / 2 + 6; pz < SEGMENT_LENGTH / 2; pz += 15) {
        // Modern solar streetlight
        const lamp = this.createStreetlight();
        lamp.position.set(-4.8, 0, pz);
        segGroup.add(lamp);

        // Friendly roadside tree
        const tree = this.createEcoTree();
        tree.position.set(4.8, 0, pz + 4);
        segGroup.add(tree);

        // Left Pastel Building
        const bColL = buildingColors[Math.abs(Math.floor(pz)) % buildingColors.length];
        const bHeightL = 10 + (Math.abs(pz * 7) % 14);
        const bMatL = new THREE.MeshStandardMaterial({ color: bColL, roughness: 0.4 });
        const bL = new THREE.Mesh(new THREE.BoxGeometry(6, bHeightL, 10), bMatL);
        bL.position.set(-11, bHeightL / 2, pz);
        bL.castShadow = !this.isSoftwareGl;
        segGroup.add(bL);

        // Right Pastel Building
        const bColR = buildingColors[(Math.abs(Math.floor(pz)) + 2) % buildingColors.length];
        const bHeightR = 12 + (Math.abs(pz * 5) % 12);
        const bMatR = new THREE.MeshStandardMaterial({ color: bColR, roughness: 0.4 });
        const bR = new THREE.Mesh(new THREE.BoxGeometry(6, bHeightR, 10), bMatR);
        bR.position.set(11, bHeightR / 2, pz + 6);
        bR.castShadow = !this.isSoftwareGl;
        segGroup.add(bR);
      }

      this.scene.add(segGroup);
      this.roadSegments.push(segGroup);
    }
  }

  private createEcoTree(): THREE.Group {
    const tree = new THREE.Group();
    // Trunk
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.9 });
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.25, 2.2, 7), trunkMat);
    trunk.position.y = 1.1;
    tree.add(trunk);

    // Fluffy Green Foliage
    const foliageMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.7 });
    const crown1 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.9, 1), foliageMat);
    crown1.position.y = 2.6;
    tree.add(crown1);

    const crown2 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.65, 1), foliageMat);
    crown2.position.set(0.15, 3.4, 0.1);
    tree.add(crown2);

    return tree;
  }

  private createStreetlight(): THREE.Group {
    const lamp = new THREE.Group();
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.6, roughness: 0.3 });
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 5, 8), poleMat);
    pole.position.y = 2.5;
    lamp.add(pole);

    const head = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.15, 0.8), poleMat);
    head.position.set(0.3, 5, 0);
    lamp.add(head);

    // Solar panel top on the streetlight!
    const solarTop = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.05, 0.8),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.9, roughness: 0.1 })
    );
    solarTop.position.set(0.3, 5.15, 0);
    lamp.add(solarTop);

    const lightBulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    );
    lightBulb.position.set(0.3, 4.88, 0);
    lamp.add(lightBulb);

    return lamp;
  }

  private createFactoryVent(): THREE.Group {
    const vent = new THREE.Group();
    const ventMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.7, metalness: 0.5 });
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 3.5, 8), ventMat);
    col.position.y = 1.75;
    vent.add(col);

    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.08, 6, 12), ventMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 3.5;
    vent.add(rim);

    return vent;
  }

  // --- Dynamic Obstacle & Collectible Spawner ---
  private spawnSegmentFeatures(zTarget: number) {
    const lanes: Lane[] = [-1, 0, 1];
    // Pick 1 or 2 lanes for obstacles
    const numObstacles = Math.random() > 0.4 ? 2 : 1;
    const shuffledLanes = [...lanes].sort(() => Math.random() - 0.5);

    for (let i = 0; i < numObstacles; i++) {
      const lane = shuffledLanes[i];
      const randType = Math.random();

      if (randType < 0.28) {
        // Smog Truck
        this.spawnTruck(lane, zTarget);
      } else if (randType < 0.52) {
        // Low Pipe / Barrier (Requires Slide)
        this.spawnLowPipe(lane, zTarget);
      } else if (randType < 0.76) {
        // Road Fissure / Spikes (Requires Jump)
        this.spawnRoadGap(lane, zTarget);
      } else {
        // Toxic Barrel / Log
        this.spawnToxicBarrel(lane, zTarget);
      }
    }

    // Free lane gets coins or Action Token
    const freeLane = shuffledLanes[numObstacles] ?? 0;

    // Check if time for a Mission Beacon!
    if (this.distanceRun >= this.nextMissionDistance) {
      this.spawnMissionBeacon(freeLane, zTarget - 12);
      this.nextMissionDistance = this.distanceRun + 450 + Math.random() * 200;
    } else if (Math.random() < 0.18) {
      // Spawn Power-up (Magnet, Bio-Shield, Turbo)
      const pTypes: Array<'magnet' | 'shield' | 'turbo'> = ['magnet', 'shield', 'turbo'];
      const p = pTypes[Math.floor(Math.random() * pTypes.length)];
      this.spawnPowerup(freeLane, zTarget, p);
    } else if (Math.random() > 0.65) {
      // Action Token
      const tokenTypes: TokenType[] = ['tree', 'clean_air', 'waste', 'water', 'solar'];
      const chosenToken = tokenTypes[Math.floor(Math.random() * tokenTypes.length)];
      this.spawnActionToken(freeLane, zTarget, chosenToken);
    } else {
      // Row of 3 Coins
      for (let c = 0; c < 3; c++) {
        this.spawnCoin(freeLane, zTarget - c * 2.5);
      }
    }
  }

  private spawnTruck(lane: Lane, z: number) {
    const truck = new THREE.Group();
    truck.position.set(lane * LANE_WIDTH, 0, z);

    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4 });
    const cabMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3 });
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });

    // Cargo Box
    const cargo = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.8, 3.2), bodyMat);
    cargo.position.y = 1.4;
    cargo.castShadow = !this.isSoftwareGl;
    truck.add(cargo);

    // Front Cab
    const cab = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.2, 1.2), cabMat);
    cab.position.set(0, 1.1, 2.1);
    cab.castShadow = !this.isSoftwareGl;
    truck.add(cab);

    // Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.25, 8);
    wheelGeo.rotateZ(Math.PI / 2);
    for (const wx of [-0.95, 0.95]) {
      for (const wz of [-1, 1, 2.2]) {
        const wheel = new THREE.Mesh(wheelGeo, wheelMat);
        wheel.position.set(wx, 0.35, wz);
        truck.add(wheel);
      }
    }

    this.scene.add(truck);
    this.obstacles.push({
      mesh: truck,
      type: 'truck',
      lane,
      z,
      width: 1.8,
      height: 2.3,
      depth: 4.4,
      yOffset: 1.15,
    });
  }

  private spawnLowPipe(lane: Lane, z: number) {
    const barrier = new THREE.Group();
    barrier.position.set(lane * LANE_WIDTH, 0, z);

    const metalMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3, metalness: 0.7 });
    const cautionMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 });

    // Two side stands
    for (const sx of [-1.1, 1.1]) {
      const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.2, 8), metalMat);
      stand.position.set(sx, 1.1, 0);
      barrier.add(stand);
    }

    // High overhead bar (Player MUST slide under!)
    const crossBar = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.45, 0.45), cautionMat);
    crossBar.position.set(0, 1.5, 0);
    barrier.add(crossBar);

    // Glowing Down Arrow (Visual Hint to Slide)
    const arrow = new THREE.Mesh(
      new THREE.ConeGeometry(0.18, 0.3, 4),
      new THREE.MeshBasicMaterial({ color: 0xef4444 })
    );
    arrow.rotation.z = Math.PI;
    arrow.position.set(0, 1.05, 0);
    barrier.add(arrow);

    this.scene.add(barrier);
    this.obstacles.push({
      mesh: barrier,
      type: 'low_pipe',
      lane,
      z,
      width: 2.2,
      height: 1.2,
      depth: 0.6,
      yOffset: 1.5,
      requiresSlide: true,
    });
  }

  private spawnRoadGap(lane: Lane, z: number) {
    const gap = new THREE.Group();
    gap.position.set(lane * LANE_WIDTH, 0, z);

    // Hazard Pit / Road Break (Requires Jump!)
    const pitGeo = new THREE.PlaneGeometry(2.0, 3.2);
    const pitMat = new THREE.MeshBasicMaterial({ color: 0x090d16 });
    const pit = new THREE.Mesh(pitGeo, pitMat);
    pit.rotation.x = -Math.PI / 2;
    pit.position.y = 0.02;
    gap.add(pit);

    // Glowing Neon Warning Edge
    const edgeGeo = new THREE.BoxGeometry(2.1, 0.1, 0.15);
    const edgeMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const edgeFront = new THREE.Mesh(edgeGeo, edgeMat);
    edgeFront.position.set(0, 0.05, 1.6);
    gap.add(edgeFront);

    // Jump icon upward arrow
    const upArrow = new THREE.Mesh(
      new THREE.ConeGeometry(0.2, 0.35, 4),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    );
    upArrow.position.set(0, 0.25, 0);
    gap.add(upArrow);

    this.scene.add(gap);
    this.obstacles.push({
      mesh: gap,
      type: 'road_gap',
      lane,
      z,
      width: 2.0,
      height: 0.4,
      depth: 3.2,
      yOffset: 0.2,
      requiresJump: true,
    });
  }

  private spawnToxicBarrel(lane: Lane, z: number) {
    const barrelGroup = new THREE.Group();
    barrelGroup.position.set(lane * LANE_WIDTH, 0, z);

    const barrelMat = new THREE.MeshStandardMaterial({
      color: 0xca8a04,
      roughness: 0.35,
      metalness: 0.4,
    });
    const barrelGeo = new THREE.CylinderGeometry(0.45, 0.45, 1.1, 12);
    const b1 = new THREE.Mesh(barrelGeo, barrelMat);
    b1.position.set(-0.4, 0.55, 0);
    b1.castShadow = !this.isSoftwareGl;
    barrelGroup.add(b1);

    const b2 = new THREE.Mesh(barrelGeo, barrelMat);
    b2.position.set(0.4, 0.55, 0.2);
    b2.castShadow = !this.isSoftwareGl;
    barrelGroup.add(b2);

    this.scene.add(barrelGroup);
    this.obstacles.push({
      mesh: barrelGroup,
      type: 'barrel',
      lane,
      z,
      width: 1.8,
      height: 1.2,
      depth: 1.4,
      yOffset: 0.6,
    });
  }

  // --- Collectibles ---
  private spawnCoin(lane: Lane, z: number) {
    const coinGroup = new THREE.Group();
    coinGroup.position.set(lane * LANE_WIDTH, 0.8, z);

    const coinGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.08, 14);
    coinGeo.rotateZ(Math.PI / 2);
    const coinMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      metalness: 0.9,
      roughness: 0.2,
      emissive: 0xca8a04,
      emissiveIntensity: 0.4,
    });
    const coinMesh = new THREE.Mesh(coinGeo, coinMat);
    coinGroup.add(coinMesh);

    this.scene.add(coinGroup);
    this.collectibles.push({
      mesh: coinGroup,
      type: 'coin',
      lane,
      z,
      radius: 0.5,
    });
  }

  private spawnActionToken(lane: Lane, z: number, tokenType: TokenType) {
    const tokenGroup = new THREE.Group();
    tokenGroup.position.set(lane * LANE_WIDTH, 1.2, z);

    // Glowing badge color by type
    const colors: Record<TokenType, number> = {
      tree: 0x22c55e,
      clean_air: 0x06b6d4,
      waste: 0xf59e0b,
      water: 0x3b82f6,
      solar: 0xeab308,
    };
    const color = colors[tokenType] || 0x10b981;

    const tokenGeo = new THREE.OctahedronGeometry(0.48, 0);
    const tokenMat = new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.7,
      metalness: 0.4,
      roughness: 0.2,
    });
    const badge = new THREE.Mesh(tokenGeo, tokenMat);
    tokenGroup.add(badge);

    // Orbiting ring
    const ringGeo = new THREE.TorusGeometry(0.65, 0.04, 8, 20);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 3;
    tokenGroup.add(ring);

    this.scene.add(tokenGroup);
    this.collectibles.push({
      mesh: tokenGroup,
      type: 'token',
      tokenType,
      lane,
      z,
      radius: 0.7,
    });
  }

  private spawnMissionBeacon(lane: Lane, z: number) {
    const beacon = new THREE.Group();
    beacon.position.set(lane * LANE_WIDTH, 0, z);

    const missions: Array<{ type: 'FOREST' | 'WASTE' | 'POLLUTION' }> = [
      { type: 'FOREST' },
      { type: 'WASTE' },
      { type: 'POLLUTION' },
    ];
    const mission = missions[Math.floor(Math.random() * missions.length)];

    // Holographic Pillar
    const beamGeo = new THREE.CylinderGeometry(0.4, 0.4, 6, 12, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.y = 3;
    beacon.add(beam);

    // Pulsing Core
    const coreGeo = new THREE.IcosahedronGeometry(0.6, 0);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0xffedd5 });
    const core = new THREE.Mesh(coreGeo, coreMat);
    core.position.y = 1.8;
    beacon.add(core);

    this.scene.add(beacon);
    this.collectibles.push({
      mesh: beacon,
      type: 'mission_beacon',
      missionType: mission.type,
      lane,
      z,
      radius: 1.2,
    });
  }

  // --- Input Actions ---
  public moveLeft() {
    if (this.targetLane > -1) {
      this.targetLane = (this.targetLane - 1) as Lane;
      soundManager.playSlide();
    }
  }

  public moveRight() {
    if (this.targetLane < 1) {
      this.targetLane = (this.targetLane + 1) as Lane;
      soundManager.playSlide();
    }
  }

  public jump() {
    if (!this.isJumping) {
      this.isJumping = true;
      this.isSliding = false;
      this.verticalVelocity = 14;
      soundManager.playJump();
    }
  }

  public slide() {
    if (!this.isSliding) {
      this.isSliding = true;
      this.slideTimer = 0.55; // slide duration seconds
      soundManager.playSlide();
    }
  }

  private onKeyDown = (e: KeyboardEvent) => {
    if (!this.isRunning) return;
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
      this.moveLeft();
    } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
      this.moveRight();
    } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === ' ') {
      this.jump();
    } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
      this.slide();
    }
  };

  private onTouchStart = (e: TouchEvent) => {
    if (!this.isRunning || e.touches.length === 0) return;
    this.touchStartX = e.touches[0].clientX;
    this.touchStartY = e.touches[0].clientY;
  };

  private onTouchEnd = (e: TouchEvent) => {
    if (!this.isRunning || e.changedTouches.length === 0) return;
    const dx = e.changedTouches[0].clientX - this.touchStartX;
    const dy = e.changedTouches[0].clientY - this.touchStartY;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (Math.max(absX, absY) > 30) {
      if (absX > absY) {
        if (dx > 0) this.moveRight();
        else this.moveLeft();
      } else {
        if (dy < 0) this.jump();
        else this.slide();
      }
    }
  };

  // --- Particles ---
  private emitParticles(pos: THREE.Vector3, color: number, count = 8) {
    for (let i = 0; i < count; i++) {
      const pGeo = new THREE.SphereGeometry(0.08, 6, 6);
      const pMat = new THREE.MeshBasicMaterial({ color });
      const pMesh = new THREE.Mesh(pGeo, pMat);
      pMesh.position.copy(pos);
      this.scene.add(pMesh);

      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 4,
        Math.random() * 4 + 1,
        (Math.random() - 0.5) * 4
      );
      this.activeParticles.push({
        mesh: pMesh,
        velocity: vel,
        life: 0,
        maxLife: 0.35 + Math.random() * 0.25,
      });
    }
  }

  // --- Main Tick & Animation Loop ---
  private animate = () => {
    if (this.isDestroyed) return;

    const delta = Math.min(this.clock.getDelta(), 0.08); // cap lag spikes
    this.update(delta);
    this.renderer.render(this.scene, this.camera);

    if (this.isSoftwareGl) {
      this.afterDraw(this.animate);
    } else {
      this.frameId = requestAnimationFrame(this.animate);
    }
  };

  private afterDraw(cb: () => void) {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        this.frameId = window.setTimeout(poll, 5);
      } else {
        if (sync) gl.deleteSync(sync);
        this.frameId = window.setTimeout(cb, 60);
      }
    };
    this.frameId = window.setTimeout(poll, 5);
  }

  private update(delta: number) {
    if (!this.isRunning) return;

    this.runTime += delta;
    this.distanceRun += this.currentSpeed * delta;
    this.onDistanceChange?.(Math.floor(this.distanceRun));

    // Dynamic speed scaling (gradual arcade acceleration)
    if (this.currentSpeed < 34) {
      this.currentSpeed += delta * 0.12;
    }

    // Dynamic environment clearing: smog thins and sky warms up as distance progresses!
    const restoreFactor = Math.min(this.distanceRun / 1500, 1.0);
    this.targetSmogDensity = 0.028 - restoreFactor * 0.016;
    this.smogDensity = THREE.MathUtils.damp(this.smogDensity, this.targetSmogDensity, 2, delta);
    if (this.scene.fog instanceof THREE.FogExp2) {
      this.scene.fog.density = this.smogDensity;
    }

    // 1. Player Lane Lerp
    const targetX = this.targetLane * LANE_WIDTH;
    this.currentLaneX = THREE.MathUtils.damp(this.currentLaneX, targetX, 14, delta);
    this.heroGroup.position.x = this.currentLaneX;

    // Lean into lane switch
    const rollAngle = (this.currentLaneX - targetX) * 0.08;
    this.heroGroup.rotation.z = rollAngle;

    // 2. Jump Physics
    if (this.isJumping) {
      this.playerY += this.verticalVelocity * delta;
      this.verticalVelocity -= 36 * delta; // gravity
      if (this.playerY <= 0) {
        this.playerY = 0;
        this.isJumping = false;
        this.verticalVelocity = 0;
        this.emitParticles(this.heroGroup.position, 0x64748b, 4);
      }
    }
    this.heroGroup.position.y = this.playerY;

    // 3. Slide Mechanic
    if (this.isSliding) {
      this.slideTimer -= delta;
      this.heroTorso.scale.y = 0.5;
      this.heroTorso.position.y = 0.55;
      this.heroVisor.position.y = 1.0;
      this.heroGroup.rotation.x = 0.5; // duck forward tilt
      if (this.slideTimer <= 0) {
        this.isSliding = false;
        this.heroTorso.scale.y = 1.0;
        this.heroTorso.position.y = 1.05;
        this.heroVisor.position.y = 1.72;
        this.heroGroup.rotation.x = 0;
      }
    } else {
      this.heroGroup.rotation.x = 0;
    }

    // 4. Character Running Animation
    if (!this.isJumping && !this.isSliding) {
      const runCycle = this.runTime * this.currentSpeed * 0.75;
      this.heroLegL.rotation.x = Math.sin(runCycle) * 0.7;
      this.heroLegR.rotation.x = -Math.sin(runCycle) * 0.7;
      this.heroArmL.rotation.x = -Math.sin(runCycle) * 0.6;
      this.heroArmR.rotation.x = Math.sin(runCycle) * 0.6;
      this.heroTorso.position.y = 1.05 + Math.abs(Math.sin(runCycle * 2)) * 0.06;
    }

    // 5. Invulnerability blink
    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer -= delta;
      this.heroGroup.visible = Math.floor(this.runTime * 20) % 2 === 0;
    } else {
      this.heroGroup.visible = true;
    }

    // 6. Power-ups Update
    if (this.magnetTimer > 0) {
      this.magnetTimer = Math.max(0, this.magnetTimer - delta);
    }
    if (this.turboTimer > 0) {
      this.turboTimer = Math.max(0, this.turboTimer - delta);
      this.currentSpeed = 38;
    }
    this.onPowerupsChange?.({
      magnetTime: Math.ceil(this.magnetTimer),
      hasShield: this.shieldActive,
      turboTime: Math.ceil(this.turboTimer),
    });

    if (this.shieldMesh) {
      this.shieldMesh.visible = this.shieldActive;
      if (this.shieldActive) {
        this.shieldMesh.rotation.y += delta * 2.5;
      }
    }

    // 7. Chasing Monster Update & Distance Animation
    if (this.monsterGroup) {
      // If player is running cleanly without stumbling, monster slowly falls back
      this.monsterDistance = Math.min(23, this.monsterDistance + delta * 1.4);
      this.monsterGroup.position.z = this.monsterDistance;
      this.monsterGroup.position.x = THREE.MathUtils.damp(this.monsterGroup.position.x, this.currentLaneX, 4, delta);

      // Monster lumbering run animation
      const monsterCycle = this.runTime * 9;
      if (this.monsterArmL && this.monsterArmR) {
        this.monsterArmL.rotation.x = Math.sin(monsterCycle) * 0.8;
        this.monsterArmR.rotation.x = -Math.sin(monsterCycle) * 0.8;
      }
      if (this.monsterJaw) {
        this.monsterJaw.rotation.x = Math.abs(Math.sin(monsterCycle * 0.7)) * 0.35;
      }

      // Danger level callback for HUD
      const danger = this.monsterDistance > 13 ? 'SAFE' : this.monsterDistance > 6 ? 'WARNING' : 'CRITICAL';
      this.onMonsterDistanceChange?.(Math.round(this.monsterDistance), danger);

      // Monster caught player!
      if (this.monsterDistance <= 3.2 && this.invulnerableTimer <= 0) {
        this.triggerMonsterBite();
      }
    }

    // 8. City Gates Approaching (2500m target - Extended gameplay)
    if (this.distanceRun >= 2370 && !this.gateSpawned) {
      this.spawnCityGates();
    }

    // 9. Scroll Road Segments
    const moveZ = this.currentSpeed * delta;
    const SEGMENT_LENGTH = 60;
    for (const seg of this.roadSegments) {
      seg.position.z += moveZ;
      if (seg.position.z > SEGMENT_LENGTH) {
        seg.position.z -= SEGMENT_LENGTH * this.roadSegments.length;
      }
    }

    // Scroll City Gates
    if (this.cityGateGroup) {
      this.cityGateGroup.position.z += moveZ;
      if (this.cityGateGroup.position.z >= 0 && !this.gateReached) {
        this.gateReached = true;
        this.isRunning = false;
        soundManager.playGateVictory();
        const finalScore = Math.floor(2500 * 2 + this.coinsCount * 10);
        this.onCityGatesReached?.({
          distance: 2500,
          coins: this.coinsCount,
          score: finalScore,
        });
        return;
      }
    }

    // 10. Update Obstacles & Collision Check
    const playerBox = new THREE.Box3();
    const heroHeight = this.isSliding ? 0.7 : 1.8;
    const heroMin = new THREE.Vector3(
      this.currentLaneX - 0.45,
      this.playerY,
      -0.4
    );
    const heroMax = new THREE.Vector3(
      this.currentLaneX + 0.45,
      this.playerY + heroHeight,
      0.4
    );
    playerBox.set(heroMin, heroMax);

    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      obs.mesh.position.z += moveZ;

      // Obstacle AABB
      const halfW = obs.width / 2;
      const halfD = obs.depth / 2;
      const obsBox = new THREE.Box3(
        new THREE.Vector3(obs.mesh.position.x - halfW, obs.yOffset - obs.height / 2, obs.mesh.position.z - halfD),
        new THREE.Vector3(obs.mesh.position.x + halfW, obs.yOffset + obs.height / 2, obs.mesh.position.z + halfD)
      );

      // Collision Check
      if (this.invulnerableTimer <= 0 && playerBox.intersectsBox(obsBox)) {
        if (this.turboTimer > 0) {
          // Smash obstacle during turbo rush!
          soundManager.playHit();
          this.emitParticles(obs.mesh.position, 0x10b981, 18);
          this.scene.remove(obs.mesh);
          this.obstacles.splice(i, 1);
          continue;
        } else if (obs.requiresSlide && this.isSliding) {
          // Successfully slid under!
        } else if (obs.requiresJump && this.isJumping && this.playerY > 0.8) {
          // Successfully jumped over!
        } else {
          // Obstacle hit!
          if (this.shieldActive) {
            this.shieldActive = false;
            if (this.shieldMesh) this.shieldMesh.visible = false;
            this.invulnerableTimer = 1.0;
            soundManager.playShieldBreak();
            this.emitParticles(this.heroGroup.position, 0x06b6d4, 18);
            // Monster gains small distance through shield
            this.monsterDistance = Math.max(4.0, this.monsterDistance - 4);
          } else {
            this.handleHit();
          }
        }
      }

      // Despawn past player
      if (obs.mesh.position.z > 12) {
        this.scene.remove(obs.mesh);
        this.obstacles.splice(i, 1);
      }
    }

    // 11. Update Collectibles, Coins, Powerups
    for (let i = this.collectibles.length - 1; i >= 0; i--) {
      const col = this.collectibles[i];
      col.mesh.position.z += moveZ;

      // Spin collectible
      col.mesh.rotation.y += delta * 3;

      // Distance to hero
      const dx = col.mesh.position.x - this.currentLaneX;
      const dz = col.mesh.position.z - 0;
      const dy = col.mesh.position.y - (this.playerY + 0.9);
      const dist = Math.sqrt(dx * dx + dz * dz + dy * dy);

      // Magnet pull towards player
      if (this.magnetTimer > 0 && (col.type === 'coin' || col.type === 'token')) {
        if (dist < 10) {
          col.mesh.position.x = THREE.MathUtils.damp(col.mesh.position.x, this.currentLaneX, 12, delta);
          col.mesh.position.y = THREE.MathUtils.damp(col.mesh.position.y, this.playerY + 0.9, 12, delta);
          col.mesh.position.z = THREE.MathUtils.damp(col.mesh.position.z, 0, 14, delta);
        }
      }

      if (dist < col.radius + 0.6) {
        if (col.type === 'coin') {
          this.coinsCount += 1 * this.coinMultiplier;
          this.onCoinsChange?.(this.coinsCount);
          soundManager.playCoin();
          this.emitParticles(col.mesh.position, 0xfacc15, 6);
        } else if (col.type === 'token' && col.tokenType) {
          this.collectedTokens[col.tokenType] = (this.collectedTokens[col.tokenType] || 0) + 1;
          this.onTokensChange?.({ ...this.collectedTokens });
          soundManager.playToken();
          this.emitParticles(col.mesh.position, 0x10b981, 12);
        } else if (col.type === 'powerup' && col.powerupType) {
          soundManager.playPowerup();
          if (col.powerupType === 'magnet') {
            const extra = (this.options.magnetUpgradeLevel || 0) * 3;
            this.magnetTimer = 10 + extra;
            this.emitParticles(col.mesh.position, 0xef4444, 15);
          } else if (col.powerupType === 'shield') {
            this.shieldActive = true;
            if (this.shieldMesh) this.shieldMesh.visible = true;
            this.emitParticles(col.mesh.position, 0x06b6d4, 15);
          } else if (col.powerupType === 'turbo') {
            this.turboTimer = 6;
            soundManager.playBoost();
            this.emitParticles(col.mesh.position, 0x10b981, 20);
          }
        } else if (col.type === 'mission_beacon') {
          soundManager.playSiren();
          this.triggerMission(col.missionType || 'FOREST');
        }

        this.scene.remove(col.mesh);
        this.collectibles.splice(i, 1);
        continue;
      }

      // Despawn past camera
      if (col.mesh.position.z > 8) {
        this.scene.remove(col.mesh);
        this.collectibles.splice(i, 1);
      }
    }

    // 12. Procedural Far-distance Spawning
    this.lastObstacleZ += moveZ;
    if (this.lastObstacleZ > -100) {
      this.spawnSegmentFeatures(-150);
      this.lastObstacleZ = -140;
    }

    // 13. Update Particles
    for (let i = this.activeParticles.length - 1; i >= 0; i--) {
      const p = this.activeParticles[i];
      p.life += delta;
      p.mesh.position.addScaledVector(p.velocity, delta);
      p.velocity.y -= 9.8 * delta;
      const scale = 1 - p.life / p.maxLife;
      p.mesh.scale.set(scale, scale, scale);

      if (p.life >= p.maxLife) {
        this.scene.remove(p.mesh);
        this.activeParticles.splice(i, 1);
      }
    }
  }

  private handleHit() {
    soundManager.playHit();
    soundManager.playMonsterRoar();
    this.emitParticles(this.heroGroup.position, 0xef4444, 15);

    // Camera shake
    this.camera.position.x += (Math.random() - 0.5) * 0.7;
    this.camera.position.y += (Math.random() - 0.5) * 0.5;

    // Monster surges closer!
    this.monsterDistance = Math.max(2.8, this.monsterDistance - 7.5);
    this.invulnerableTimer = 1.0;

    // Check if monster grabs player!
    if (this.monsterDistance <= 3.2) {
      this.triggerMonsterBite();
    }
  }

  private triggerMonsterBite() {
    this.lives -= 1;
    soundManager.playMonsterBite();
    this.emitParticles(this.heroGroup.position, 0x9333ea, 25);
    this.onLivesChange?.(this.lives);

    // Camera violent shake
    this.camera.position.x += (Math.random() - 0.5) * 1.2;
    this.camera.position.y += (Math.random() - 0.5) * 0.8;

    // Emergency adrenaline burst pushes monster back
    this.monsterDistance = 18;
    this.invulnerableTimer = 2.0;

    if (this.lives <= 0) {
      this.isRunning = false;
      const finalScore = Math.floor(this.distanceRun * 2 + this.coinsCount * 10);
      this.onGameOver?.({
        distance: Math.floor(this.distanceRun),
        coins: this.coinsCount,
        score: finalScore,
      });
    }
  }

  private triggerMission(type: 'FOREST' | 'WASTE' | 'POLLUTION') {
    this.isRunning = false;
    let mission: ActiveMission;
    if (type === 'FOREST') {
      mission = {
        type: 'FOREST',
        title: 'WILDFIRE IN WEST CANOPY',
        location: 'Sector 7 Greenbelt',
        sdgTarget: 'SDG 13: Climate Action & Forest Resilience',
        threatLevel: 'CRITICAL',
        description: 'Blistering temperatures have sparked a multi-front fire threatening ancient redwoods and animal habitats. Extinguish the blaze and cut emergency firebreaks!',
        rewardCoins: 50,
        rewardToken: 'tree',
      };
    } else if (type === 'WASTE') {
      mission = {
        type: 'WASTE',
        title: 'MUNICIPAL RECYCLING CONVEYOR OVERFLOW',
        location: 'Eco-District 4 Sorting Depot',
        sdgTarget: 'SDG 12: Responsible Consumption & Waste Divergence',
        threatLevel: 'URGENT',
        description: 'A massive wave of mixed city waste is rushing toward the incinerator! Rapidly sort plastics, paper, metal, and compost into correct bins before the facility jams!',
        rewardCoins: 45,
        rewardToken: 'waste',
      };
    } else {
      mission = {
        type: 'POLLUTION',
        title: 'SMOG CODE RED: POWER GRID SURGE',
        location: 'Central Environmental Monitoring Tower',
        sdgTarget: 'SDG 11: Resilient Urban Infrastructure',
        threatLevel: 'HAZARD',
        description: 'Toxic particulate smog has peaked. Re-balance the renewable power grid, route hydro-purifiers, and synchronize atmospheric bio-scrubbers!',
        rewardCoins: 60,
        rewardToken: 'clean_air',
      };
    }

    this.onMissionTrigger?.(mission);
  }

  public resumeRun() {
    this.isRunning = true;
    this.invulnerableTimer = 1.0;
  }

  private onResize = () => {
    if (!this.container || this.isDestroyed) return;
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  public destroy() {
    this.isDestroyed = true;
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('keydown', this.onKeyDown);
    this.container.removeEventListener('touchstart', this.onTouchStart);
    this.container.removeEventListener('touchend', this.onTouchEnd);
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
      clearTimeout(this.frameId);
    }
    this.renderer.dispose();
  }
}
