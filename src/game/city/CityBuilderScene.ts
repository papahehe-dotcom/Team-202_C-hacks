/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { CityDistrict } from '../../types/ecoHero';

export class CityBuilderScene {
  private container: HTMLDivElement;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private clock = new THREE.Clock();
  private frameId = 0;
  private isSoftwareGl = false;
  private isDestroyed = false;

  // Camera Orbit & LookAt
  private isDragging = false;
  private prevMouseX = 0;
  private prevMouseY = 0;
  private cameraAngle = Math.PI / 4;
  private cameraPitch = 0.6;
  private cameraDistance = 42;
  private lookTarget = new THREE.Vector3(0, 2, 0);
  private desiredLookTarget = new THREE.Vector3(0, 2, 0);

  // Procedural Building Groups & Animations
  private districtGroups: Map<string, THREE.Group> = new Map();
  private districtLocations: Map<string, THREE.Vector3> = new Map();
  private turbineRotors: THREE.Group[] = [];
  private waveBuoys: THREE.Group[] = [];
  private blimpMesh: THREE.Group | null = null;
  private monorailTrain!: THREE.Mesh;
  private monorailAngle = 0;
  private riverMesh!: THREE.Mesh;
  private groundMesh!: THREE.Mesh;

  private districtsData: CityDistrict[] = [];

  constructor(container: HTMLDivElement, districts: CityDistrict[]) {
    this.container = container;
    this.districtsData = districts;
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
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);

    // 2. Scene
    this.scene = new THREE.Scene();
    this.updateAtmosphere();

    // 3. Camera
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 500);
    this.updateCameraPosition();

    // 4. Lighting & Environment
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x334155, 1.2);
    this.scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xfff7ed, 1.9);
    dirLight.position.set(22, 45, 22);
    dirLight.castShadow = !this.isSoftwareGl;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    this.scene.add(dirLight);

    // 5. Build Base Metropolis Island
    this.buildBaseCity();

    // 6. Build 22 District Slots
    this.buildDistrictSlots();

    // 7. Mouse Orbit Controls
    this.setupInteractions();

    this.clock.start();
    this.animate();
  }

  private updateAtmosphere() {
    const builtCount = this.districtsData.filter((d) => d.unlocked).length;
    const progress = Math.min(1, builtCount / 12);

    // Transition sky & fog from light soft morning to vibrant crisp azure
    const smogColor = new THREE.Color(0xbfe6fb);
    const cleanSkyColor = new THREE.Color(0x38bdf8);
    const currentSky = smogColor.clone().lerp(cleanSkyColor, progress);

    this.scene.background = currentSky;
    this.scene.fog = new THREE.FogExp2(currentSky.getHex(), 0.007 - progress * 0.0035);
  }

  private buildBaseCity() {
    const builtCount = this.districtsData.filter((d) => d.unlocked).length;
    const progress = Math.min(1, builtCount / 10);

    // Main Land Island (Large rounded plateau)
    const groundGeo = new THREE.CylinderGeometry(26, 28, 3.5, 36);
    const groundMat = new THREE.MeshStandardMaterial({
      color: progress > 0.35 ? 0x16a34a : 0x475569, // Lush green lawn vs industrial grey
      roughness: 0.75,
    });
    this.groundMesh = new THREE.Mesh(groundGeo, groundMat);
    this.groundMesh.position.y = -1.75;
    this.groundMesh.receiveShadow = !this.isSoftwareGl;
    this.scene.add(this.groundMesh);

    // River Canal cutting across city
    const riverGeo = new THREE.PlaneGeometry(8, 52);
    const riverMat = new THREE.MeshStandardMaterial({
      color: progress > 0.25 ? 0x06b6d4 : 0x713f12, // Sparkling blue water vs muddy sludge
      roughness: 0.1,
      metalness: 0.5,
    });
    this.riverMesh = new THREE.Mesh(riverGeo, riverMat);
    this.riverMesh.rotation.x = -Math.PI / 2;
    this.riverMesh.position.set(0, 0.02, 0);
    this.scene.add(this.riverMesh);

    // Central City Plaza (Round paved hub)
    const plazaGeo = new THREE.CylinderGeometry(5.5, 5.5, 0.2, 32);
    const plazaMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.4 });
    const plaza = new THREE.Mesh(plazaGeo, plazaMat);
    plaza.position.set(0, 0.1, 0);
    this.scene.add(plaza);

    // Circular Monorail Ring
    const trackGeo = new THREE.TorusGeometry(20, 0.16, 8, 48);
    const trackMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8, roughness: 0.3 });
    const track = new THREE.Mesh(trackGeo, trackMat);
    track.rotation.x = Math.PI / 2;
    track.position.y = 4.8;
    this.scene.add(track);

    // Monorail Train Capsule
    const trainMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.5 });
    this.monorailTrain = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.9, 1.1), trainMat);
    this.monorailTrain.position.set(20, 4.8, 0);
    this.scene.add(this.monorailTrain);
  }

  // --- Helper to register slot location ---
  private registerSlot(id: string, pos: THREE.Vector3, group: THREE.Group) {
    this.districtLocations.set(id, pos);
    this.districtGroups.set(id, group);
    this.scene.add(group);
  }

  private isItemUnlocked(id: string): boolean {
    return !!this.districtsData.find((d) => d.id === id)?.unlocked;
  }

  // --- 22 Procedural District Models ---
  private buildDistrictSlots() {
    this.turbineRotors = [];
    this.waveBuoys = [];
    this.blimpMesh = null;

    // 1. Solar Rooftops (-11, -11)
    this.buildSolarRooftops(-11, -11);

    // 2. Spinning Wind Turbines (14, 8)
    this.buildWindTurbines(14, 8);

    // 3. Ocean Wave Power Buoys (-2.5, 19)
    this.buildWaveBuoys(-2.5, 19);

    // 4. Deep Earth Heat Plant (-17, -5)
    this.buildGeothermalPlant(-17, -5);

    // 5. Giant Green Tree Forest (11, -11)
    this.buildTreeForest(11, -11);

    // 6. Pink Blossom Walkway (6, -7)
    this.buildCherryBlossoms(6, -7);

    // 7. Sky Veggie Gardens (-7, -15)
    this.buildRooftopGardens(-7, -15);

    // 8. Butterfly & Bee Garden (16, -4)
    this.buildButterflyGarden(16, -4);

    // 9. Grand Rainforest Glass Dome (16, -13)
    this.buildBioDome(16, -13);

    // 10. River Water Purifier (0, 13)
    this.buildWaterPurifier(0, 13);

    // 11. Giant Rainwater Tanks (4, 15)
    this.buildRainwaterTanks(4, 15);

    // 12. Floating Flower Islands (-3.5, 9)
    this.buildFloatingWetlands(-3.5, 9);

    // 13. Sparkling Drink Fountains (0, 3)
    this.buildDrinkingFountains(0, 3);

    // 14. Super Sorting Robot Plant (-12, 5)
    this.buildRecyclingPlant(-12, 5);

    // 15. Organic Compost Station (-16, 2)
    this.buildCompostStation(-16, 2);

    // 16. Clean Sky Air Balloons (-8, 10)
    this.buildSmogBalloon(-8, 10);

    // 17. Solar Sweeper Rovers (8, 0)
    this.buildSweeperRovers(8, 0);

    // 18. Seaweed Wrapper Maker (-14, 11)
    this.buildGreenPackaging(-14, 11);

    // 19. Fast Flying Electric Train (0, -15)
    this.buildTransitTerminal(0, -15);

    // 20. Sunny Electric Bike Docks (4, -3)
    this.buildEbikeStation(4, -3);

    // 21. Glowing Solar Lanterns (2, 5)
    this.buildSolarLanterns(2, 5);

    // 22. Kids Energy Play Park (8, -15)
    this.buildEcoPlayground(8, -15);
  }

  // 1. Solar Rooftops
  private buildSolarRooftops(x: number, z: number) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    const unlocked = this.isItemUnlocked('solar_power');

    if (unlocked) {
      const panelMat = new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        metalness: 0.9,
        roughness: 0.1,
        emissive: 0x0369a1,
        emissiveIntensity: 0.4,
      });
      const standMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8 });

      for (let px = -2; px <= 2; px += 2) {
        for (let pz = -2; pz <= 2; pz += 2) {
          const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.4, 8), standMat);
          stand.position.set(px, 0.7, pz);
          group.add(stand);

          const panel = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 1.2), panelMat);
          panel.rotation.x = Math.PI / 7;
          panel.position.set(px, 1.45, pz);
          group.add(panel);
        }
      }
    } else {
      this.createBlueprintStand(group, 0x38bdf8);
    }
    this.registerSlot('solar_power', new THREE.Vector3(x, 2, z), group);
  }

  // 2. Wind Turbines
  private buildWindTurbines(x: number, z: number) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    const unlocked = this.isItemUnlocked('wind_farm');

    if (unlocked) {
      const towerMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2 });
      const bladeMat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, roughness: 0.3 });

      const offsets = [[-1.5, -1.2], [1.5, -0.8], [0, 1.6]];
      offsets.forEach(([ox, oz]) => {
        const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.25, 7, 10), towerMat);
        tower.position.set(ox, 3.5, oz);
        group.add(tower);

        const nacelle = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.3, 0.7), towerMat);
        nacelle.position.set(ox, 7, oz);
        group.add(nacelle);

        const rotor = new THREE.Group();
        rotor.position.set(ox, 7, oz + 0.4);

        for (let b = 0; b < 3; b++) {
          const blade = new THREE.Mesh(new THREE.BoxGeometry(0.16, 2.8, 0.05), bladeMat);
          blade.position.y = 1.4;
          const bladeHolder = new THREE.Group();
          bladeHolder.rotation.z = (b * Math.PI * 2) / 3;
          bladeHolder.add(blade);
          rotor.add(bladeHolder);
        }

        group.add(rotor);
        this.turbineRotors.push(rotor);
      });
    } else {
      this.createBlueprintStand(group, 0x0ea5e9);
    }
    this.registerSlot('wind_farm', new THREE.Vector3(x, 4, z), group);
  }

  // 3. Ocean Wave Power Buoys
  private buildWaveBuoys(x: number, z: number) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    const unlocked = this.isItemUnlocked('wave_energy');

    if (unlocked) {
      const buoyMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.6 });
      const yellowRingMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xeab308, emissiveIntensity: 0.4 });

      for (let i = 0; i < 3; i++) {
        const bGroup = new THREE.Group();
        bGroup.position.set((i - 1) * 2.2, 0.2, 0);

        const buoy = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 0.8, 12), buoyMat);
        bGroup.add(buoy);

        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.65, 0.08, 8, 16), yellowRingMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = 0.2;
        bGroup.add(ring);

        group.add(bGroup);
        this.waveBuoys.push(bGroup);
      }
    } else {
      this.createBlueprintStand(group, 0x06b6d4);
    }
    this.registerSlot('wave_energy', new THREE.Vector3(x, 1, z), group);
  }

  // 4. Geothermal Plant
  private buildGeothermalPlant(x: number, z: number) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    const unlocked = this.isItemUnlocked('geothermal_core');

    if (unlocked) {
      const plantMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.6 });
      const core = new THREE.Mesh(new THREE.BoxGeometry(3, 2.5, 3), plantMat);
      core.position.y = 1.25;
      group.add(core);

      const chimney = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.5, 4, 12),
        new THREE.MeshStandardMaterial({ color: 0x78716c })
      );
      chimney.position.set(0.8, 2, 0.8);
      group.add(chimney);

      // Glowing heat crystal
      const crystal = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.7),
        new THREE.MeshStandardMaterial({ color: 0xf97316, emissive: 0xe11d48, emissiveIntensity: 0.6 })
      );
      crystal.position.set(0, 2.8, 0);
      group.add(crystal);
    } else {
      this.createBlueprintStand(group, 0xf97316);
    }
    this.registerSlot('geothermal_core', new THREE.Vector3(x, 2, z), group);
  }

  // 5. Giant Green Tree Forest
  private buildTreeForest(x: number, z: number) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    const unlocked = this.isItemUnlocked('urban_canopy');

    if (unlocked) {
      const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
      const leavesMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.6 });

      const offsets = [[-2, -2], [0, -1.5], [2, -2], [-1.5, 1.5], [1.5, 1.5], [0, 2]];
      offsets.forEach(([ox, oz]) => {
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.25, 2, 8), trunkMat);
        trunk.position.set(ox, 1, oz);
        group.add(trunk);

        for (let l = 0; l < 3; l++) {
          const foliage = new THREE.Mesh(new THREE.ConeGeometry(1.2 - l * 0.25, 1.5, 8), leavesMat);
          foliage.position.set(ox, 2.2 + l * 0.8, oz);
          group.add(foliage);
        }
      });
    } else {
      this.createBlueprintStand(group, 0x16a34a);
    }
    this.registerSlot('urban_canopy', new THREE.Vector3(x, 3, z), group);
  }

  // 6. Pink Blossom Walkway
  private buildCherryBlossoms(x: number, z: number) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    const unlocked = this.isItemUnlocked('cherry_blossom');

    if (unlocked) {
      const pinkMat = new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.5 });
      const trunkMat = new THREE.MeshStandardMaterial({ color: 0x451a03 });

      for (let i = -1.5; i <= 1.5; i += 1.5) {
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 1.8, 8), trunkMat);
        trunk.position.set(i, 0.9, 0);
        group.add(trunk);

        const crown = new THREE.Mesh(new THREE.DodecahedronGeometry(1.2), pinkMat);
        crown.position.set(i, 2.2, 0);
        group.add(crown);
      }
    } else {
      this.createBlueprintStand(group, 0xf472b6);
    }
    this.registerSlot('cherry_blossom', new THREE.Vector3(x, 2, z), group);
  }

  // 7. Sky Veggie Gardens
  private buildRooftopGardens(x: number, z: number) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    const unlocked = this.isItemUnlocked('rooftop_gardens');

    if (unlocked) {
      const buildingMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 });
      const bldg = new THREE.Mesh(new THREE.BoxGeometry(3.5, 2.5, 3.5), buildingMat);
      bldg.position.y = 1.25;
      group.add(bldg);

      // Green planters on roof
      const soilMat = new THREE.MeshStandardMaterial({ color: 0x3f2d18 });
      const vegMat = new THREE.MeshStandardMaterial({ color: 0x22c55e });
      const redMat = new THREE.MeshStandardMaterial({ color: 0xef4444 });

      for (let rx = -1; rx <= 1; rx += 1) {
        const planter = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.3, 2.5), soilMat);
        planter.position.set(rx, 2.65, 0);
        group.add(planter);

        const sprig = new THREE.Mesh(new THREE.SphereGeometry(0.2, 6, 6), vegMat);
        sprig.position.set(rx, 2.9, -0.6);
        group.add(sprig);

        const tomato = new THREE.Mesh(new THREE.SphereGeometry(0.15, 6, 6), redMat);
        tomato.position.set(rx, 2.9, 0.6);
        group.add(tomato);
      }
    } else {
      this.createBlueprintStand(group, 0x22c55e);
    }
    this.registerSlot('rooftop_gardens', new THREE.Vector3(x, 2, z), group);
  }

  // 8. Butterfly & Bee Garden
  private buildButterflyGarden(x: number, z: number) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    const unlocked = this.isItemUnlocked('butterfly_sanctuary');

    if (unlocked) {
      // Grass patch with colorful flowers
      const flowerColors = [0xfacc15, 0xa855f7, 0xec4899, 0x38bdf8];
      for (let i = 0; i < 8; i++) {
        const fx = (Math.random() - 0.5) * 3;
        const fz = (Math.random() - 0.5) * 3;
        const stem = new THREE.Mesh(
          new THREE.CylinderGeometry(0.04, 0.04, 0.6, 6),
          new THREE.MeshStandardMaterial({ color: 0x15803d })
        );
        stem.position.set(fx, 0.3, fz);
        group.add(stem);

        const petal = new THREE.Mesh(
          new THREE.SphereGeometry(0.25, 8, 8),
          new THREE.MeshStandardMaterial({ color: flowerColors[i % flowerColors.length] })
        );
        petal.position.set(fx, 0.65, fz);
        group.add(petal);
      }
    } else {
      this.createBlueprintStand(group, 0xa855f7);
    }
    this.registerSlot('butterfly_sanctuary', new THREE.Vector3(x, 1, z), group);
  }

  // 9. Grand Rainforest Glass Dome
  private buildBioDome(x: number, z: number) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    const unlocked = this.isItemUnlocked('bio_dome');

    if (unlocked) {
      const glassMat = new THREE.MeshStandardMaterial({
        color: 0x6ee7b7,
        transparent: true,
        opacity: 0.6,
        roughness: 0.1,
      });
      const dome = new THREE.Mesh(new THREE.SphereGeometry(3.2, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), glassMat);
      dome.position.y = 0.1;
      group.add(dome);

      // Mini palm tree inside dome
      const palmTrunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.2, 2.2, 8),
        new THREE.MeshStandardMaterial({ color: 0x78350f })
      );
      palmTrunk.position.y = 1.1;
      group.add(palmTrunk);

      const leaves = new THREE.Mesh(
        new THREE.ConeGeometry(1.6, 1.2, 8),
        new THREE.MeshStandardMaterial({ color: 0x059669 })
      );
      leaves.position.y = 2.4;
      group.add(leaves);
    } else {
      this.createBlueprintStand(group, 0x10b981);
    }
    this.registerSlot('bio_dome', new THREE.Vector3(x, 2, z), group);
  }

  // 10. River Water Purifier
  private buildWaterPurifier(x: number, z: number) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    const unlocked = this.isItemUnlocked('water_filtration');

    if (unlocked) {
      const glassMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.75,
        roughness: 0.1,
      });
      const dome = new THREE.Mesh(new THREE.SphereGeometry(2.4, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), glassMat);
      dome.position.y = 0.1;
      group.add(dome);

      const fountain = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.2, 3, 8),
        new THREE.MeshBasicMaterial({ color: 0x67e8f9 })
      );
      fountain.position.y = 1.5;
      group.add(fountain);
    } else {
      this.createBlueprintStand(group, 0x06b6d4);
    }
    this.registerSlot('water_filtration', new THREE.Vector3(x, 2, z), group);
  }

  // 11. Giant Rainwater Tanks
  private buildRainwaterTanks(x: number, z: number) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    const unlocked = this.isItemUnlocked('rainwater_tanks');

    if (unlocked) {
      const tankMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.5, roughness: 0.3 });
      const pipeMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8 });

      for (let i = -1; i <= 1; i += 2) {
        const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 2.5, 16), tankMat);
        tank.position.set(i * 1.2, 1.25, 0);
        group.add(tank);

        const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.8, 8), pipeMat);
        pipe.position.set(i * 1.2, 1.4, 0.9);
        group.add(pipe);
      }
    } else {
      this.createBlueprintStand(group, 0x0284c7);
    }
    this.registerSlot('rainwater_tanks', new THREE.Vector3(x, 2, z), group);
  }

  // 12. Floating Flower Islands
  private buildFloatingWetlands(x: number, z: number) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    const unlocked = this.isItemUnlocked('floating_wetlands');

    if (unlocked) {
      const raftMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 });
      const flowerMat = new THREE.MeshStandardMaterial({ color: 0xf43f5e });

      for (let i = -1; i <= 1; i += 2) {
        const raft = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.2, 12), raftMat);
        raft.position.set(i * 1.2, 0.1, 0);
        group.add(raft);

        const flower = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), flowerMat);
        flower.position.set(i * 1.2, 0.35, 0);
        group.add(flower);
      }
    } else {
      this.createBlueprintStand(group, 0x10b981);
    }
    this.registerSlot('floating_wetlands', new THREE.Vector3(x, 1, z), group);
  }

  // 13. Sparkling Drink Fountains
  private buildDrinkingFountains(x: number, z: number) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    const unlocked = this.isItemUnlocked('water_fountains');

    if (unlocked) {
      const stoneMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.2 });
      const basin = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.2, 0.6, 16), stoneMat);
      basin.position.y = 0.3;
      group.add(basin);

      const jet = new THREE.Mesh(
        new THREE.ConeGeometry(0.4, 1.8, 8),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
      );
      jet.position.y = 1.2;
      group.add(jet);
    } else {
      this.createBlueprintStand(group, 0x38bdf8);
    }
    this.registerSlot('water_fountains', new THREE.Vector3(x, 1.5, z), group);
  }

  // 14. Super Sorting Robot Plant
  private buildRecyclingPlant(x: number, z: number) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    const unlocked = this.isItemUnlocked('recycling_hub');

    if (unlocked) {
      const buildingMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3 });
      const mainBuilding = new THREE.Mesh(new THREE.BoxGeometry(4.2, 2.4, 3.2), buildingMat);
      mainBuilding.position.y = 1.2;
      group.add(mainBuilding);

      const domeMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.2 });
      const dome = new THREE.Mesh(new THREE.IcosahedronGeometry(1.5, 1), domeMat);
      dome.position.set(0, 2.5, 0);
      group.add(dome);
    } else {
      this.createBlueprintStand(group, 0xf59e0b);
    }
    this.registerSlot('recycling_hub', new THREE.Vector3(x, 2, z), group);
  }

  // 15. Organic Compost Station
  private buildCompostStation(x: number, z: number) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    const unlocked = this.isItemUnlocked('compost_depot');

    if (unlocked) {
      const woodMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 });
      const bin = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.4, 1.8), woodMat);
      bin.position.y = 0.7;
      group.add(bin);

      const soil = new THREE.Mesh(
        new THREE.BoxGeometry(2.2, 0.4, 1.6),
        new THREE.MeshStandardMaterial({ color: 0x271a0c })
      );
      soil.position.y = 1.3;
      group.add(soil);
    } else {
      this.createBlueprintStand(group, 0x84cc16);
    }
    this.registerSlot('compost_depot', new THREE.Vector3(x, 1.5, z), group);
  }

  // 16. Clean Sky Air Balloons
  private buildSmogBalloon(x: number, z: number) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    const unlocked = this.isItemUnlocked('smog_vacuum');

    if (unlocked) {
      const blimpGroup = new THREE.Group();
      blimpGroup.position.set(0, 7.5, 0);

      const balloonMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.3,
        roughness: 0.3,
      });
      const balloon = new THREE.Mesh(new THREE.SphereGeometry(1.8, 16, 12), balloonMat);
      balloon.scale.set(1.5, 1, 1);
      blimpGroup.add(balloon);

      const gondola = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 0.5, 0.6),
        new THREE.MeshStandardMaterial({ color: 0x1e293b })
      );
      gondola.position.y = -1.2;
      blimpGroup.add(gondola);

      // Tether cable to ground
      const cable = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 7.5, 6),
        new THREE.MeshBasicMaterial({ color: 0x64748b })
      );
      cable.position.y = 3.75;
      group.add(cable);

      group.add(blimpGroup);
      this.blimpMesh = blimpGroup;
    } else {
      this.createBlueprintStand(group, 0x38bdf8);
    }
    this.registerSlot('smog_vacuum', new THREE.Vector3(x, 4, z), group);
  }

  // 17. Solar Sweeper Rovers
  private buildSweeperRovers(x: number, z: number) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    const unlocked = this.isItemUnlocked('clean_street_drones');

    if (unlocked) {
      const yellowMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.4 });
      for (let i = -1; i <= 1; i += 2) {
        const rover = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.4, 0.6), yellowMat);
        rover.position.set(i * 1.2, 0.25, 0);
        group.add(rover);
      }
    } else {
      this.createBlueprintStand(group, 0xfacc15);
    }
    this.registerSlot('clean_street_drones', new THREE.Vector3(x, 1, z), group);
  }

  // 18. Seaweed Wrapper Maker
  private buildGreenPackaging(x: number, z: number) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    const unlocked = this.isItemUnlocked('green_packaging');

    if (unlocked) {
      const labMat = new THREE.MeshStandardMaterial({ color: 0x059669 });
      const bldg = new THREE.Mesh(new THREE.BoxGeometry(2.8, 2, 2.4), labMat);
      bldg.position.y = 1;
      group.add(bldg);
    } else {
      this.createBlueprintStand(group, 0x059669);
    }
    this.registerSlot('green_packaging', new THREE.Vector3(x, 1.5, z), group);
  }

  // 19. Fast Flying Electric Train
  private buildTransitTerminal(x: number, z: number) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    const unlocked = this.isItemUnlocked('green_transit');

    if (unlocked) {
      const terminalMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.2 });
      const terminal = new THREE.Mesh(new THREE.CylinderGeometry(3, 3, 1.5, 16), terminalMat);
      terminal.position.y = 0.75;
      group.add(terminal);

      const spire = new THREE.Mesh(
        new THREE.ConeGeometry(0.6, 5, 8),
        new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.8 })
      );
      spire.position.y = 4;
      group.add(spire);
    } else {
      this.createBlueprintStand(group, 0x06b6d4);
    }
    this.registerSlot('green_transit', new THREE.Vector3(x, 3, z), group);
  }

  // 20. Sunny Electric Bike Docks
  private buildEbikeStation(x: number, z: number) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    const unlocked = this.isItemUnlocked('ebike_stations');

    if (unlocked) {
      const dockMat = new THREE.MeshStandardMaterial({ color: 0x0284c7 });
      const canopy = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.1, 1.4), dockMat);
      canopy.position.set(0, 1.4, 0);
      group.add(canopy);

      const bikeMat = new THREE.MeshStandardMaterial({ color: 0x22c55e });
      for (let i = -0.7; i <= 0.7; i += 0.7) {
        const bike = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.6, 0.8), bikeMat);
        bike.position.set(i, 0.35, 0);
        group.add(bike);
      }
    } else {
      this.createBlueprintStand(group, 0x22c55e);
    }
    this.registerSlot('ebike_stations', new THREE.Vector3(x, 1.5, z), group);
  }

  // 21. Glowing Solar Lanterns
  private buildSolarLanterns(x: number, z: number) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    const unlocked = this.isItemUnlocked('solar_streetlights');

    if (unlocked) {
      const poleMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });
      const lampMat = new THREE.MeshStandardMaterial({
        color: 0xfef08a,
        emissive: 0xfde047,
        emissiveIntensity: 0.8,
      });

      for (let i = -1.2; i <= 1.2; i += 2.4) {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 2.5, 8), poleMat);
        pole.position.set(i, 1.25, 0);
        group.add(pole);

        const lantern = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), lampMat);
        lantern.position.set(i, 2.6, 0);
        group.add(lantern);
      }
    } else {
      this.createBlueprintStand(group, 0xfacc15);
    }
    this.registerSlot('solar_streetlights', new THREE.Vector3(x, 2, z), group);
  }

  // 22. Kids Energy Play Park
  private buildEcoPlayground(x: number, z: number) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    const unlocked = this.isItemUnlocked('eco_playground');

    if (unlocked) {
      const colorfulMat = new THREE.MeshStandardMaterial({ color: 0xec4899 });
      const slide = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.2, 0.8), colorfulMat);
      slide.position.set(-1, 0.6, 0);
      group.add(slide);

      const swingMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6 });
      const swing = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.1, 8, 16), swingMat);
      swing.position.set(1.2, 0.8, 0);
      group.add(swing);
    } else {
      this.createBlueprintStand(group, 0xec4899);
    }
    this.registerSlot('eco_playground', new THREE.Vector3(x, 1.5, z), group);
  }

  // Translucent glowing foundation for unbuilt items
  private createBlueprintStand(parent: THREE.Group, glowColor: number) {
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(1.2, 1.3, 0.15, 16),
      new THREE.MeshStandardMaterial({
        color: 0x334155,
        transparent: true,
        opacity: 0.6,
      })
    );
    base.position.y = 0.08;
    parent.add(base);

    const wire = new THREE.Mesh(
      new THREE.RingGeometry(1.0, 1.2, 16),
      new THREE.MeshBasicMaterial({ color: glowColor, side: THREE.DoubleSide })
    );
    wire.rotation.x = Math.PI / 2;
    wire.position.y = 0.18;
    parent.add(wire);
  }

  public focusOnDistrict(districtId: string) {
    const loc = this.districtLocations.get(districtId);
    if (loc) {
      this.desiredLookTarget.copy(loc);
    }
  }

  public updateDistrictState(districts: CityDistrict[]) {
    this.districtsData = districts;
    this.updateAtmosphere();

    // Rebuild all district groups
    this.districtGroups.forEach((g) => this.scene.remove(g));
    this.districtGroups.clear();
    this.districtLocations.clear();
    this.buildDistrictSlots();

    // Update ground & water freshness based on % of total items built
    const builtCount = districts.filter((d) => d.unlocked).length;
    const progress = Math.min(1, builtCount / 12);
    if (this.groundMesh) {
      (this.groundMesh.material as THREE.MeshStandardMaterial).color.setHex(
        progress > 0.35 ? 0x16a34a : 0x475569
      );
    }
    if (this.riverMesh) {
      (this.riverMesh.material as THREE.MeshStandardMaterial).color.setHex(
        progress > 0.25 ? 0x06b6d4 : 0x713f12
      );
    }
  }

  private setupInteractions() {
    const dom = this.renderer.domElement;

    dom.addEventListener('pointerdown', (e) => {
      this.isDragging = true;
      this.prevMouseX = e.clientX;
      this.prevMouseY = e.clientY;
    });

    window.addEventListener('pointermove', (e) => {
      if (!this.isDragging) return;
      const dx = e.clientX - this.prevMouseX;
      const dy = e.clientY - this.prevMouseY;
      this.prevMouseX = e.clientX;
      this.prevMouseY = e.clientY;

      this.cameraAngle -= dx * 0.007;
      this.cameraPitch = Math.max(0.2, Math.min(1.2, this.cameraPitch + dy * 0.005));
      this.updateCameraPosition();
    });

    window.addEventListener('pointerup', () => {
      this.isDragging = false;
    });

    dom.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.cameraDistance = Math.max(22, Math.min(70, this.cameraDistance + e.deltaY * 0.04));
      this.updateCameraPosition();
    });

    window.addEventListener('resize', this.onResize);
  }

  private updateCameraPosition() {
    const x = this.lookTarget.x + Math.sin(this.cameraAngle) * Math.cos(this.cameraPitch) * this.cameraDistance;
    const y = this.lookTarget.y + Math.sin(this.cameraPitch) * this.cameraDistance;
    const z = this.lookTarget.z + Math.cos(this.cameraAngle) * Math.cos(this.cameraPitch) * this.cameraDistance;

    this.camera.position.set(x, y, z);
    this.camera.lookAt(this.lookTarget);
  }

  private animate = () => {
    if (this.isDestroyed) return;

    const delta = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    // Smoothly lerp camera look target toward desired focus location
    this.lookTarget.lerp(this.desiredLookTarget, 0.05);

    // 1. Rotate wind turbine rotors
    this.turbineRotors.forEach((rotor) => {
      rotor.rotation.z += delta * 4;
    });

    // 2. Animate wave buoys bobbing on river
    this.waveBuoys.forEach((b, idx) => {
      b.position.y = 0.2 + Math.sin(elapsedTime * 2.5 + idx * 1.5) * 0.12;
    });

    // 3. Gentle swaying of sky blimp
    if (this.blimpMesh) {
      this.blimpMesh.position.y = 7.5 + Math.sin(elapsedTime * 1.2) * 0.3;
      this.blimpMesh.rotation.y = Math.sin(elapsedTime * 0.5) * 0.15;
    }

    // 4. Animate monorail around circle track
    if (this.monorailTrain) {
      this.monorailAngle += delta * 0.45;
      const r = 20;
      this.monorailTrain.position.x = Math.sin(this.monorailAngle) * r;
      this.monorailTrain.position.z = Math.cos(this.monorailAngle) * r;
      this.monorailTrain.rotation.y = this.monorailAngle + Math.PI / 2;
    }

    // 5. Gentle auto-rotation if not dragging
    if (!this.isDragging) {
      this.cameraAngle += delta * 0.04;
    }

    this.updateCameraPosition();
    this.renderer.render(this.scene, this.camera);

    if (this.isSoftwareGl) {
      window.setTimeout(this.animate, 60);
    } else {
      this.frameId = requestAnimationFrame(this.animate);
    }
  };

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
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
      clearTimeout(this.frameId);
    }
    this.renderer.dispose();
  }
}
