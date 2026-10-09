import { GameCamera } from './camera';
import { GameRenderer } from './renderer';
import {
  PlayerState,
  NPC,
  InteractiveProp,
  Particle,
  SavedGame,
  GameSettings,
  CaptainBossState,
  MiningNode,
  FarmPlot,
  Item,
  Quest,
  CraftingRecipe,
  Portal,
  Animal,
  Enemy,
  Vehicle,
  KingdomState,
  FactionWarState,
  ExplorationData,
  InteractiveTarget,
  KingdomBuildingType,
  MagicalCatCompanion,
  KingState,
  KingdomVillager,
} from './types';
import {
  INITIAL_PLAYER_STATS,
  INITIAL_PLAYER_POS,
  INITIAL_NPCS,
  INITIAL_PROPS,
  WORLD_COLLIDERS,
  WORLD_WIDTH,
  WORLD_HEIGHT,
  MINE_CAVERN_WIDTH,
  MINE_CAVERN_HEIGHT,
  ITEMS,
  INITIAL_MINING_NODES,
  INITIAL_FARM_PLOTS,
  INITIAL_QUESTS,
} from './constants';
import {
  INITIAL_PORTALS,
  INITIAL_ANIMALS,
  INITIAL_ENEMIES,
  INITIAL_VEHICLES,
  INITIAL_KINGDOM,
  INITIAL_FACTION_WAR,
  STAGE3_ZONE_NPCS,
  STAGE3_ZONE_COLLIDERS,
  WORLD_DIMENSIONS,
} from './stage3_data';
import {
  CharacterPower,
  INITIAL_CHARACTER_POWERS,
  SummonTemplate,
  INITIAL_SUMMON_TEMPLATES,
  ActiveSummon,
  CityDefender,
  InvadingUnit,
  DynamicWarEvent,
  INITIAL_DYNAMIC_WAR,
  CityCivilian,
  INITIAL_CITY_CIVILIANS,
} from './stage4_data';
import {
  STAGE5_ENEMIES,
  INITIAL_MAGICAL_CAT,
  INITIAL_KING,
  INITIAL_KINGDOM_VILLAGERS,
} from './stage5_data';
import { HOUSES, HouseStructure } from './constants';
import { soundManager } from './audio';
import { WeatherSystem } from './weather';

export interface InputState {
  moveX: number; // -1 to 1
  moveY: number; // -1 to 1
  jump: boolean;
  attack: boolean;
  interact: boolean;
  sprint: boolean;
}

export class GameEngine {
  public player: PlayerState;
  public npcs: NPC[];
  public props: InteractiveProp[];
  public miningNodes: MiningNode[];
  public farmPlots: FarmPlot[];
  public portals: Portal[];
  public animals: Animal[];
  public enemies: Enemy[];
  public vehicles: Vehicle[];
  public kingdom: KingdomState;
  public factionWar: FactionWarState;
  public exploration: ExplorationData;
  public powers: CharacterPower[];
  public summonTemplates: SummonTemplate[];
  public activeSummons: ActiveSummon[];
  public cityDefenders: CityDefender[];
  public invadingUnits: InvadingUnit[];
  public dynamicWar: DynamicWarEvent;
  public cityCivilians: CityCivilian[];
  public houses: (HouseStructure & { level: number })[];
  public particles: Particle[];
  public camera: GameCamera;
  public renderer: GameRenderer | null = null;

  // Stage 5 Living Kingdom & Magical Cat Companion
  public king: KingState;
  public villagers: KingdomVillager[];
  public catCompanion: MagicalCatCompanion;
  public isKingAudienceOpen: boolean = false;
  public isCompanionOpen: boolean = false;
  public isPowersOpen: boolean = false;
  public isPortalMapOpen: boolean = false;
  public activeVillager: KingdomVillager | null = null;

  // Weather System (Clear, Rain, Snow periodic states & particles)
  public weatherSystem: WeatherSystem;

  public hoveredInteractive: InteractiveTarget | null = null;
  public activeDialogueNpc: NPC | null = null;
  public activeSignText: string | null = null;
  public notificationText: string | null = null;
  public notificationTimer: number = 0;

  // Modals state
  public isShopOpen: boolean = false;
  public isCraftingOpen: boolean = false;
  public isInventoryOpen: boolean = false;
  public isQuestLogOpen: boolean = false;
  public isKingdomOpen: boolean = false;
  public isFactionWarOpen: boolean = false;
  public isWorldMapOpen: boolean = false;
  public isPowerMenuOpen: boolean = false;
  public isSummonMenuOpen: boolean = false;
  public activeShopNpc: NPC | null = null;

  // Day & Night Cycle: 0 to 1440 minutes, starts at 8:00 AM (480 mins)
  public gameTime: number = 480;

  public isPaused: boolean = false;
  public isDuelActive: boolean = false;
  public boss: CaptainBossState = {
    isActive: false,
    name: 'Guard Captain Roderick',
    title: 'Mine Commander & Weapon Master',
    hp: 240,
    maxHp: 240,
    x: 1960,
    y: 400,
    vx: 0,
    vy: 0,
    width: 48,
    height: 62,
    facing: 'left',
    state: 'idle',
    stateTimer: 0,
    attackCooldown: 1.0,
    walkFrame: 0,
    damage: 18,
    recoil: 0,
  };

  public settings: GameSettings = {
    virtualControls: 'auto',
    soundEnabled: true,
    musicEnabled: true,
    volume: 0.7,
    cameraSmoothness: 'smooth',
  };

  private lastTime: number = performance.now();
  private footstepTimer: number = 0;
  private dummyDefeatedCount: number = 0;

  constructor() {
    this.player = {
      x: INITIAL_PLAYER_POS.x,
      y: INITIAL_PLAYER_POS.y,
      vx: 0,
      vy: 0,
      width: 28,
      height: 48,
      facing: 'right',
      isGrounded: true,
      isJumping: false,
      jumpZ: 0,
      vz: 0,
      isRunning: false,
      isAttacking: false,
      attackTimer: 0,
      attackCombo: 0,
      walkFrame: 0,
      stats: { ...INITIAL_PLAYER_STATS },
      gold: 50,
      inventory: [
        { item: ITEMS.food_bread, quantity: 2 },
        { item: ITEMS.potion_heal, quantity: 1 },
        { item: ITEMS.tool_pickaxe, quantity: 1 },
      ],
      equipped: {
        weapon: null,
        shield: null,
        armor: null,
      },
      quests: JSON.parse(JSON.stringify(INITIAL_QUESTS)),
      currentZone: 'overworld',
      activeVehicleId: null,
    };

    const allNpcs = [
      ...INITIAL_NPCS,
      ...STAGE3_ZONE_NPCS.modern_city,
      ...STAGE3_ZONE_NPCS.magic_realm,
      ...STAGE3_ZONE_NPCS.ancient_ruins,
    ];
    this.npcs = JSON.parse(JSON.stringify(allNpcs));
    this.props = JSON.parse(JSON.stringify(INITIAL_PROPS));
    this.miningNodes = JSON.parse(JSON.stringify(INITIAL_MINING_NODES));
    this.farmPlots = JSON.parse(JSON.stringify(INITIAL_FARM_PLOTS));
    this.portals = JSON.parse(JSON.stringify(INITIAL_PORTALS));
    this.animals = JSON.parse(JSON.stringify(INITIAL_ANIMALS));
    this.enemies = JSON.parse(JSON.stringify([...INITIAL_ENEMIES, ...STAGE5_ENEMIES]));
    this.vehicles = JSON.parse(JSON.stringify(INITIAL_VEHICLES));
    this.kingdom = JSON.parse(JSON.stringify(INITIAL_KINGDOM));
    this.factionWar = JSON.parse(JSON.stringify(INITIAL_FACTION_WAR));
    this.exploration = {
      visitedZones: ['overworld'],
      discoveredPortals: ['portal_overworld_to_mine', 'portal_mine_to_overworld'],
      defeatedBosses: [],
      tamedAnimalsCount: 0,
    };
    this.powers = JSON.parse(JSON.stringify(INITIAL_CHARACTER_POWERS));
    this.summonTemplates = JSON.parse(JSON.stringify(INITIAL_SUMMON_TEMPLATES));
    this.activeSummons = [];
    this.king = JSON.parse(JSON.stringify(INITIAL_KING));
    this.villagers = JSON.parse(JSON.stringify(INITIAL_KINGDOM_VILLAGERS));
    this.catCompanion = JSON.parse(JSON.stringify(INITIAL_MAGICAL_CAT));
    this.cityDefenders = [
      {
        id: 'def_1',
        name: 'Alden Vanguard Guard',
        type: 'infantry',
        x: 1720,
        y: 1080,
        vx: 0,
        vy: 0,
        facing: 'left',
        hp: 150,
        maxHp: 150,
        attack: 24,
        state: 'guard',
        targetEnemyId: null,
        walkFrame: 0,
      },
      {
        id: 'def_2',
        name: 'Heartland Sentry',
        type: 'archer',
        x: 1800,
        y: 1160,
        vx: 0,
        vy: 0,
        facing: 'right',
        hp: 120,
        maxHp: 120,
        attack: 20,
        state: 'patrol',
        targetEnemyId: null,
        walkFrame: 0,
      },
      {
        id: 'def_3',
        name: 'North Gate Sentinel',
        type: 'infantry',
        x: 1400,
        y: 920,
        vx: 0,
        vy: 0,
        facing: 'left',
        hp: 150,
        maxHp: 150,
        attack: 24,
        state: 'guard',
        targetEnemyId: null,
        walkFrame: 0,
      },
    ];
    this.invadingUnits = [];
    this.dynamicWar = JSON.parse(JSON.stringify(INITIAL_DYNAMIC_WAR));
    this.cityCivilians = JSON.parse(JSON.stringify(INITIAL_CITY_CIVILIANS));
    this.houses = HOUSES.map((h) => ({ ...h, level: 1 }));

    this.particles = [];
    this.camera = new GameCamera(this.player.x, this.player.y);

    this.initAmbientParticles();

    // Weather System Initialization
    this.weatherSystem = new WeatherSystem();
    this.weatherSystem.onWeatherChange = (_w, msg) => {
      this.showNotification(msg);
      soundManager.playWeatherShift?.();
    };
  }

  public setRenderer(renderer: GameRenderer) {
    this.renderer = renderer;
  }

  public resetGame() {
    this.player.x = INITIAL_PLAYER_POS.x;
    this.player.y = INITIAL_PLAYER_POS.y;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.jumpZ = 0;
    this.player.vz = 0;
    this.player.isGrounded = true;
    this.player.stats = { ...INITIAL_PLAYER_STATS };
    this.player.gold = 50;
    this.player.inventory = [
      { item: ITEMS.food_bread, quantity: 2 },
      { item: ITEMS.potion_heal, quantity: 1 },
      { item: ITEMS.tool_pickaxe, quantity: 1 },
    ];
    this.player.equipped = { weapon: null, shield: null, armor: null };
    this.player.quests = JSON.parse(JSON.stringify(INITIAL_QUESTS));
    this.player.currentZone = 'overworld';
    this.player.activeVehicleId = null;

    const allNpcs = [
      ...INITIAL_NPCS,
      ...STAGE3_ZONE_NPCS.modern_city,
      ...STAGE3_ZONE_NPCS.magic_realm,
      ...STAGE3_ZONE_NPCS.ancient_ruins,
    ];
    this.npcs = JSON.parse(JSON.stringify(allNpcs));
    this.props = JSON.parse(JSON.stringify(INITIAL_PROPS));
    this.miningNodes = JSON.parse(JSON.stringify(INITIAL_MINING_NODES));
    this.farmPlots = JSON.parse(JSON.stringify(INITIAL_FARM_PLOTS));
    this.portals = JSON.parse(JSON.stringify(INITIAL_PORTALS));
    this.animals = JSON.parse(JSON.stringify(INITIAL_ANIMALS));
    this.enemies = JSON.parse(JSON.stringify([...INITIAL_ENEMIES, ...STAGE5_ENEMIES]));
    this.vehicles = JSON.parse(JSON.stringify(INITIAL_VEHICLES));
    this.kingdom = JSON.parse(JSON.stringify(INITIAL_KINGDOM));
    this.factionWar = JSON.parse(JSON.stringify(INITIAL_FACTION_WAR));
    this.exploration = {
      visitedZones: ['overworld'],
      discoveredPortals: ['portal_overworld_to_mine', 'portal_mine_to_overworld'],
      defeatedBosses: [],
      tamedAnimalsCount: 0,
    };
    this.powers = JSON.parse(JSON.stringify(INITIAL_CHARACTER_POWERS));
    this.summonTemplates = JSON.parse(JSON.stringify(INITIAL_SUMMON_TEMPLATES));
    this.activeSummons = [];
    this.king = JSON.parse(JSON.stringify(INITIAL_KING));
    this.villagers = JSON.parse(JSON.stringify(INITIAL_KINGDOM_VILLAGERS));
    this.catCompanion = JSON.parse(JSON.stringify(INITIAL_MAGICAL_CAT));
    this.cityDefenders = [
      {
        id: 'def_1',
        name: 'Alden Vanguard Guard',
        type: 'infantry',
        x: 1720,
        y: 1080,
        vx: 0,
        vy: 0,
        facing: 'left',
        hp: 150,
        maxHp: 150,
        attack: 24,
        state: 'guard',
        targetEnemyId: null,
        walkFrame: 0,
      },
      {
        id: 'def_2',
        name: 'Heartland Sentry',
        type: 'archer',
        x: 1800,
        y: 1160,
        vx: 0,
        vy: 0,
        facing: 'right',
        hp: 120,
        maxHp: 120,
        attack: 20,
        state: 'patrol',
        targetEnemyId: null,
        walkFrame: 0,
      },
      {
        id: 'def_3',
        name: 'North Gate Sentinel',
        type: 'infantry',
        x: 1400,
        y: 920,
        vx: 0,
        vy: 0,
        facing: 'left',
        hp: 150,
        maxHp: 150,
        attack: 24,
        state: 'guard',
        targetEnemyId: null,
        walkFrame: 0,
      },
    ];
    this.invadingUnits = [];
    this.dynamicWar = JSON.parse(JSON.stringify(INITIAL_DYNAMIC_WAR));
    this.cityCivilians = JSON.parse(JSON.stringify(INITIAL_CITY_CIVILIANS));
    this.houses = HOUSES.map((h) => ({ ...h, level: 1 }));

    this.particles = [];
    this.initAmbientParticles();
    this.camera = new GameCamera(this.player.x, this.player.y);
    this.activeDialogueNpc = null;
    this.activeSignText = null;
    this.isDuelActive = false;
    this.boss.isActive = false;
    this.boss.hp = this.boss.maxHp;
    this.boss.state = 'idle';
    this.gameTime = 480;
    this.showNotification('Welcome to Oakhaven! Stage 4: Powers, Summoning, City Improvements & Dynamic Wars active.');
  }

  public startCaptainDuel() {
    this.isDuelActive = true;
    this.boss.isActive = true;
    this.boss.hp = this.boss.maxHp;
    this.boss.x = 1960;
    this.boss.y = 400;
    this.boss.state = 'idle';
    this.boss.stateTimer = 1.0;
    this.boss.attackCooldown = 1.2;
    this.boss.recoil = 0;
    this.activeDialogueNpc = null;

    soundManager.playSwordClash();
    this.camera.triggerShake(8, 0.3);
    this.showNotification('⚔ Combat Trial Commenced! Face Guard Captain Roderick!');
  }

  public saveGame(): boolean {
    try {
      const chestProp = this.props.find((p) => p.id === 'prop_chest');
      const saved: SavedGame = {
        player: {
          x: this.player.x,
          y: this.player.y,
          stats: { ...this.player.stats },
          gold: this.player.gold,
          inventory: [...this.player.inventory],
          equipped: { ...this.player.equipped },
          currentZone: this.player.currentZone,
        },
        chestOpened: !!chestProp?.isOpen,
        dummyDefeatedCount: this.dummyDefeatedCount,
        quests: this.player.quests,
        discoveredPortals: this.portals.filter((p) => p.discovered).map((p) => p.id),
        kingdom: this.kingdom,
        warState: this.factionWar,
        king: this.king,
        villagers: this.villagers,
        catCompanion: this.catCompanion,
        exploration: this.exploration,
        unlockedPowerIds: this.powers.filter((p) => p.isUnlocked).map((p) => p.id),
        unlockedSummonIds: this.summonTemplates.filter((s) => s.isUnlocked).map((s) => s.id),
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem('alden_rpg_stage5_save', JSON.stringify(saved));
      this.showNotification('👑 Living Kingdom, King decrees, Cat companion & Adventure saved!');
      return true;
    } catch {
      return false;
    }
  }

  public hasSavedGame(): boolean {
    return (
      !!localStorage.getItem('alden_rpg_stage5_save') ||
      !!localStorage.getItem('alden_rpg_stage3_save') ||
      !!localStorage.getItem('alden_rpg_stage2_save') ||
      !!localStorage.getItem('alden_rpg_stage1_save')
    );
  }

  public loadGame(): boolean {
    try {
      let dataStr = localStorage.getItem('alden_rpg_stage5_save');
      if (!dataStr) {
        dataStr = localStorage.getItem('alden_rpg_stage3_save');
      }
      if (!dataStr) {
        dataStr = localStorage.getItem('alden_rpg_stage2_save');
      }
      if (!dataStr) {
        dataStr = localStorage.getItem('alden_rpg_stage1_save');
      }
      if (!dataStr) return false;
      const data: SavedGame = JSON.parse(dataStr);

      this.player.x = data.player.x;
      this.player.y = data.player.y;
      this.player.stats = { ...data.player.stats };

      if (data.player.gold !== undefined) this.player.gold = data.player.gold;
      if (data.player.inventory) this.player.inventory = data.player.inventory;
      if (data.player.equipped) this.player.equipped = data.player.equipped;
      if (data.player.currentZone) this.player.currentZone = data.player.currentZone;
      if (data.quests) this.player.quests = data.quests;

      if (data.discoveredPortals) {
        for (const pid of data.discoveredPortals) {
          const portal = this.portals.find((p) => p.id === pid);
          if (portal) portal.discovered = true;
        }
      }
      if (data.kingdom) this.kingdom = data.kingdom;
      if (data.warState) this.factionWar = data.warState;
      if (data.king) this.king = data.king;
      if (data.villagers && data.villagers.length > 0) this.villagers = data.villagers;
      if (data.catCompanion) this.catCompanion = data.catCompanion;
      if (data.exploration) this.exploration = data.exploration;

      if (data.unlockedPowerIds) {
        for (const p of this.powers) {
          if (data.unlockedPowerIds.includes(p.id)) p.isUnlocked = true;
        }
      }
      if (data.unlockedSummonIds) {
        for (const s of this.summonTemplates) {
          if (data.unlockedSummonIds.includes(s.id)) s.isUnlocked = true;
        }
      }

      const chest = this.props.find((p) => p.id === 'prop_chest');
      if (chest && data.chestOpened) {
        chest.isOpen = true;
      }
      this.dummyDefeatedCount = data.dummyDefeatedCount || 0;

      this.recalculateStats();
      this.showNotification('Kingdom, sovereign decrees, and hero state loaded!');
      return true;
    } catch {
      return false;
    }
  }

  public update(input: InputState) {
    const now = performance.now();
    let dt = (now - this.lastTime) / 1000;
    this.lastTime = now;
    if (dt > 0.1) dt = 0.1;

    if (this.isPaused) return;

    if (this.renderer) {
      this.renderer.updateTime(dt);
    }

    if (this.notificationTimer > 0) {
      this.notificationTimer -= dt;
      if (this.notificationTimer <= 0) {
        this.notificationText = null;
      }
    }

    // Advance Day/Night time: 1 second = 3.5 game minutes
    this.gameTime = (this.gameTime + dt * 3.5) % 1440;

    // 1. Process player movement & input
    this.updatePlayer(input, dt);

    // 2. Resolve solid collisions
    this.resolveCollisions();

    // 3. Update Villagers AI (walking, routines, pausing near player)
    this.updateVillagers(dt);

    // 4. Update Animals AI & Trust System
    this.updateAnimals(dt);

    // 5. Update Magical Cat Companion
    this.updateMagicalCat(dt);

    // 6. Update Character Powers Cooldowns & Active Summons
    this.updatePowersAndSummons(dt);

    // 7. Update Enemies AI & Combat System (Bats, Witches, Ground Foes)
    this.updateEnemies(dt);

    // 8. Update Mining Nodes and Farm Plots
    this.updateWorldEconomy(dt);

    // 9. Update Living Kingdom Economy, Food, Taxes & Decrees
    this.updateKingAndLivingEconomy(dt);

    // 7. Proximity detection
    this.updateHoveredInteractive();

    // 8. Update dummy and props
    this.updateProps(dt);

    // 9. Update Guard Captain combat AI if duel is active
    if (this.isDuelActive && this.boss.isActive) {
      this.updateBoss(dt);
    }

    // 10. Update ambient particles
    this.updateParticles(dt);

    // 11. Camera smooth follow respecting current zone bounds
    const isMoving = Math.abs(this.player.vx) > 5 || Math.abs(this.player.vy) > 5;
    this.camera.followSpeed = this.settings.cameraSmoothness === 'snappy' ? 12 : 7.5;
    const dims = WORLD_DIMENSIONS[this.player.currentZone] || { width: WORLD_WIDTH, height: WORLD_HEIGHT };

    this.camera.update(
      this.player.x + this.player.width / 2,
      this.player.y + this.player.height / 2,
      this.player.facing,
      isMoving,
      dt,
      dims.width,
      dims.height
    );
  }

  private updatePlayer(input: InputState, dt: number) {
    const { player } = this;

    // Check mounted vehicle bonus
    let vehicleSpeedBonus = 0;
    if (player.activeVehicleId) {
      const activeVeh = this.vehicles.find((v) => v.id === player.activeVehicleId);
      if (activeVeh) {
        vehicleSpeedBonus = activeVeh.speedBonus;
        activeVeh.x = player.x - (activeVeh.width - player.width) / 2;
        activeVeh.y = player.y + player.height - activeVeh.height;
        activeVeh.facing = player.facing;
        activeVeh.zone = player.currentZone;
        activeVeh.isMounted = true;
      }
    }

    player.isRunning = input.sprint && (input.moveX !== 0 || input.moveY !== 0);
    const baseSpeed = player.isRunning ? 260 : 175;
    const speed = baseSpeed + vehicleSpeedBonus;

    if (player.isAttacking) {
      player.attackTimer += dt;
      if (player.attackTimer > 0.28) {
        player.isAttacking = false;
        player.attackTimer = 0;
      }
    }

    let targetVx = input.moveX * speed;
    let targetVy = input.moveY * speed;

    if (player.isAttacking) {
      targetVx *= 0.3;
      targetVy *= 0.3;
    }

    const accel = player.activeVehicleId ? 12 : 18;
    player.vx += (targetVx - player.vx) * Math.min(1, dt * accel);
    player.vy += (targetVy - player.vy) * Math.min(1, dt * accel);

    player.x += player.vx * dt;
    player.y += player.vy * dt;

    if (input.moveX > 0.05) {
      player.facing = 'right';
    } else if (input.moveX < -0.05) {
      player.facing = 'left';
    }

    const isMoving = Math.abs(player.vx) > 10 || Math.abs(player.vy) > 10;
    if (isMoving && player.isGrounded) {
      player.walkFrame += dt * (player.isRunning ? 18 : 11);

      this.footstepTimer += dt;
      if (this.footstepTimer > (player.isRunning ? 0.24 : 0.36)) {
        if (!player.activeVehicleId) {
          soundManager.playFootstep();
        }
        this.footstepTimer = 0;
        this.spawnDust(player.x + player.width / 2, player.y + player.height - 2);
      }

      // Ramming damage while driving fast!
      if (player.activeVehicleId && (Math.abs(player.vx) > 150 || Math.abs(player.vy) > 150)) {
        for (const enemy of this.enemies) {
          if (enemy.zone === player.currentZone && enemy.aiState !== 'defeated') {
            const edist = Math.hypot(
              player.x + player.width / 2 - (enemy.x + enemy.width / 2),
              player.y + player.height / 2 - (enemy.y + enemy.height / 2)
            );
            if (edist < 45) {
              const ramDmg = 35;
              enemy.hp = Math.max(0, enemy.hp - ramDmg);
              enemy.aiState = 'hurt';
              enemy.stateTimer = 0.3;
              soundManager.playHit();
              this.camera.triggerShake(7, 0.2);
              this.spawnHitSparks(enemy.x + 20, enemy.y + 20, true);
              this.spawnTextParticle(enemy.x + 20, enemy.y - 20, `RAM: ${ramDmg}!`, '#38bdf8');
              if (enemy.hp <= 0) {
                enemy.aiState = 'defeated';
                this.gainExp(enemy.expReward);
              }
            }
          }
        }
      }
    } else {
      player.walkFrame = 0;
    }

    // Jump Physics (Disabled while driving vehicle for realism)
    if (input.jump && player.isGrounded && !player.isJumping && !player.activeVehicleId) {
      player.isJumping = true;
      player.isGrounded = false;
      player.vz = 220;
      soundManager.playJump();
      this.spawnDust(player.x + player.width / 2, player.y + player.height);
    }

    if (!player.isGrounded) {
      const gravity = 680;
      player.vz -= gravity * dt;
      player.jumpZ += player.vz * dt;

      if (player.jumpZ <= 0) {
        player.jumpZ = 0;
        player.vz = 0;
        player.isGrounded = true;
        player.isJumping = false;
        soundManager.playLand();
        this.spawnDust(player.x + player.width / 2, player.y + player.height);
      }
    }

    // Attack / Mine input
    if (input.attack && !player.isAttacking) {
      this.executePlayerAttack();
    }

    // Stamina regen
    if (!player.isRunning && player.stats.stamina < player.stats.maxStamina) {
      player.stats.stamina = Math.min(player.stats.maxStamina, player.stats.stamina + 20 * dt);
    } else if (player.isRunning && player.stats.stamina > 0 && !player.activeVehicleId) {
      player.stats.stamina = Math.max(0, player.stats.stamina - 15 * dt);
    }

    // World clamping based on zone
    const dims = WORLD_DIMENSIONS[player.currentZone] || { width: WORLD_WIDTH, height: WORLD_HEIGHT };
    player.x = Math.max(45, Math.min(dims.width - player.width - 45, player.x));
    player.y = Math.max(45, Math.min(dims.height - player.height - 45, player.y));
  }

  private updateVillagers(dt: number) {
    const px = this.player.x + this.player.width / 2;
    const py = this.player.y + this.player.height / 2;

    for (const npc of this.npcs) {
      const npcZone = npc.zone || (npc.id === 'npc_miner_cole' ? 'mine_cavern' : 'overworld');
      if (npcZone !== this.player.currentZone) continue;

      // Check distance to player: if player approaches within 55px, pause and face player
      const distToPlayer = Math.hypot(px - (npc.x + npc.width / 2), py - (npc.y + npc.height / 2));
      if (distToPlayer < 55) {
        npc.facing = px > npc.x ? 'right' : 'left';
        npc.walkFrame = 0;
        continue;
      }

      // Waypoint patrol walking
      if (npc.waypoints && npc.waypoints.length > 0) {
        if (npc.currentWaypointIndex === undefined) npc.currentWaypointIndex = 0;
        if (npc.waypointTimer === undefined) npc.waypointTimer = 0;

        const targetWp = npc.waypoints[npc.currentWaypointIndex];
        const dx = targetWp.x - npc.x;
        const dy = targetWp.y - npc.y;
        const distToWp = Math.hypot(dx, dy);

        if (distToWp < 6) {
          // Reached waypoint: pause and do daily activity
          npc.walkFrame = 0;
          npc.waypointTimer += dt;
          if (npc.waypointTimer >= targetWp.pauseDuration) {
            npc.waypointTimer = 0;
            npc.currentWaypointIndex = (npc.currentWaypointIndex + 1) % npc.waypoints.length;
          }
        } else {
          // Walk towards waypoint
          const walkSpeed = 38;
          const stepX = (dx / distToWp) * walkSpeed;
          const stepY = (dy / distToWp) * walkSpeed;

          npc.x += stepX * dt;
          npc.y += stepY * dt;
          npc.facing = stepX > 0 ? 'right' : 'left';
          npc.walkFrame = (npc.walkFrame || 0) + dt * 8;
        }
      }
    }

    // 2. Simulate Living Kingdom Villagers with active professions & workplaces
    if (this.player.currentZone === 'overworld') {
      const timeOfDay = this.getTimeOfDay();
      const isWorkHours = timeOfDay.phase === 'morning' || timeOfDay.phase === 'noon';

      for (const vil of this.villagers) {
        const distToPlayer = Math.hypot(px - vil.x, py - vil.y);
        if (distToPlayer < 55) {
          vil.facing = px > vil.x ? 'right' : 'left';
          vil.walkFrame = 0;
          continue;
        }

        const targetX = isWorkHours ? vil.workplaceX : vil.homeX;
        const targetY = isWorkHours ? vil.workplaceY : vil.homeY;
        const dx = targetX - vil.x;
        const dy = targetY - vil.y;
        const distToTarget = Math.hypot(dx, dy);

        if (distToTarget > 10) {
          vil.state = isWorkHours ? 'walking_to_work' : 'walking_home';
          const walkSpeed = 34;
          vil.x += (dx / distToTarget) * walkSpeed * dt;
          vil.y += (dy / distToTarget) * walkSpeed * dt;
          vil.facing = dx > 0 ? 'right' : 'left';
          vil.walkFrame += dt * 7;
        } else {
          vil.state = isWorkHours ? 'working' : 'resting';
          vil.walkFrame = 0;
        }
      }
    }
  }

  private updateAnimals(dt: number) {
    const px = this.player.x + this.player.width / 2;
    const py = this.player.y + this.player.height / 2;

    for (const animal of this.animals) {
      if (animal.zone !== this.player.currentZone) continue;

      const dx = px - animal.x;
      const dy = py - animal.y;
      const dist = Math.hypot(dx, dy);

      // Performance LOD: skip detailed simulation if beyond 900px
      if (dist > 900) {
        animal.walkFrame = 0;
        continue;
      }

      // 1. Companion / Trust >= 80: Follows player & defends in battle!
      if (animal.isCompanion || animal.trust >= 80) {
        animal.behaviorState = 'follow';

        // Check for nearby hostile enemies to protect player
        let targetEnemy: Enemy | null = null;
        for (const e of this.enemies) {
          if (e.zone === animal.zone && e.aiState !== 'defeated') {
            const ed = Math.hypot(px - (e.x + e.width / 2), py - (e.y + e.height / 2));
            if (ed < 110) {
              targetEnemy = e;
              break;
            }
          }
        }

        if (targetEnemy) {
          const edx = targetEnemy.x - animal.x;
          const edy = targetEnemy.y - animal.y;
          const edist = Math.hypot(edx, edy);
          animal.facing = edx > 0 ? 'right' : 'left';
          if (edist > 30) {
            animal.x += (edx / edist) * 125 * dt;
            animal.y += (edy / edist) * 125 * dt;
            animal.walkFrame += dt * 12;
          } else {
            // Companion strike!
            targetEnemy.hp = Math.max(0, targetEnemy.hp - 20);
            targetEnemy.aiState = 'hurt';
            targetEnemy.stateTimer = 0.2;
            soundManager.playHit();
            this.spawnHitSparks(targetEnemy.x + 15, targetEnemy.y + 15, false);
            this.spawnTextParticle(targetEnemy.x + 15, targetEnemy.y - 15, `${animal.name}: 20`, '#38bdf8');
            if (targetEnemy.hp <= 0) {
              targetEnemy.aiState = 'defeated';
              this.gainExp(targetEnemy.expReward);
              this.showNotification(`🐾 ${animal.name} protected you and defeated ${targetEnemy.name}!`);
            }
          }
        } else if (dist > 45) {
          const speed = dist > 140 ? 210 : 130;
          animal.x += (dx / dist) * speed * dt;
          animal.y += (dy / dist) * speed * dt;
          animal.facing = dx > 0 ? 'right' : 'left';
          animal.walkFrame += dt * 10;
        } else {
          animal.walkFrame = 0;
        }
      } else if (animal.trust <= 20) {
        // 2. Low Trust (0-20): Fearful or Aggressive
        if (animal.personality === 'skittish' && dist < 130) {
          animal.behaviorState = 'flee';
          animal.x -= (dx / dist) * 115 * dt;
          animal.y -= (dy / dist) * 115 * dt;
          animal.facing = dx > 0 ? 'left' : 'right';
          animal.walkFrame += dt * 10;
        } else if (animal.personality === 'aggressive' && dist < 90) {
          animal.behaviorState = 'attack';
          animal.x += (dx / dist) * 95 * dt;
          animal.y += (dy / dist) * 95 * dt;
          animal.facing = dx > 0 ? 'right' : 'left';
          animal.walkFrame += dt * 9;
          if (dist < 34 && animal.stateTimer <= 0) {
            animal.stateTimer = 1.3;
            const dmg = 8;
            this.player.stats.hp = Math.max(0, this.player.stats.hp - dmg);
            soundManager.playPlayerHurt();
            this.camera.triggerShake(5, 0.2);
            this.spawnTextParticle(px, py - 20, `-${dmg}`, '#ef4444');
          }
        }
      } else {
        // 3. Cautious / Tolerates (21-79): Peaceful wander
        animal.behaviorState = 'idle';
        animal.stateTimer -= dt;
        if (animal.stateTimer <= 0) {
          animal.stateTimer = 2.5 + Math.random() * 3.5;
          animal.vx = (Math.random() - 0.5) * 35;
          animal.vy = (Math.random() - 0.5) * 35;
          if (Math.abs(animal.vx) > 5) animal.facing = animal.vx > 0 ? 'right' : 'left';
        }
        if (animal.vx && animal.vy) {
          animal.x += animal.vx * dt;
          animal.y += animal.vy * dt;
          animal.walkFrame += dt * 6;
        } else {
          animal.walkFrame = 0;
        }
      }

      if (animal.stateTimer > 0) animal.stateTimer -= dt;
    }
  }

  private updateEnemies(dt: number) {
    const px = this.player.x + this.player.width / 2;
    const py = this.player.y + this.player.height / 2;

    for (const enemy of this.enemies) {
      if (enemy.zone !== this.player.currentZone || enemy.aiState === 'defeated') continue;

      const dx = px - (enemy.x + enemy.width / 2);
      const dy = py - (enemy.y + enemy.height / 2);
      const dist = Math.hypot(dx, dy);

      // Performance LOD: distant enemies do not compute full physics
      if (dist > 900) continue;

      if (enemy.aiState === 'hurt') {
        enemy.stateTimer -= dt;
        if (enemy.stateTimer <= 0) {
          enemy.aiState = 'chase';
        }
        continue;
      }

      if (enemy.attackCooldown > 0) {
        enemy.attackCooldown -= dt;
      }
      if (enemy.teleportCooldown && enemy.teleportCooldown > 0) {
        enemy.teleportCooldown -= dt;
      }
      if (enemy.summonBatCooldown && enemy.summonBatCooldown > 0) {
        enemy.summonBatCooldown -= dt;
      }

      // Check Combined Enemy Attack Coordination (Witch + Bats + Ground Troops)
      let isCoordinatedRaid = false;
      if (enemy.category === 'bat' || enemy.category === 'bandit' || enemy.category === 'knight') {
        const nearWitch = this.enemies.some(
          (other) =>
            other.category === 'witch' &&
            other.zone === enemy.zone &&
            other.aiState !== 'defeated' &&
            Math.hypot(other.x - enemy.x, other.y - enemy.y) < 320
        );
        if (nearWitch) {
          isCoordinatedRaid = true;
        }
      }

      // 1. Magical Flying Bat logic (Diving, Aerial Retreat when low HP)
      if (enemy.category === 'bat') {
        enemy.walkFrame += dt * 14;

        // Aerial Retreat if badly injured (HP < 30%)
        if (enemy.hp < enemy.maxHp * 0.3) {
          enemy.aiState = 'retreat';
          enemy.isDiving = false;
          enemy.x -= (dx / dist) * enemy.speed * 1.35 * dt;
          enemy.y -= (dy / dist) * enemy.speed * 1.35 * dt;
          enemy.facing = dx > 0 ? 'left' : 'right';
          continue;
        }
      }

      // 2. Flying Witch logic (Panic Teleport, Hex Bolt, Bat Summons)
      if (enemy.category === 'witch') {
        enemy.walkFrame += dt * 6;

        // Panic Teleport when player enters melee range (< 50px)
        if (dist < 50 && (enemy.teleportCooldown || 0) <= 0) {
          enemy.teleportCooldown = 4.5;
          soundManager.playTeleport();
          this.spawnHitSparks(enemy.x, enemy.y, true);
          this.spawnTextParticle(enemy.x, enemy.y - 25, 'TELEPORT!', '#c084fc');
          const teleportAngle = Math.random() * Math.PI * 2;
          enemy.x = Math.max(80, Math.min(2800, enemy.x + Math.cos(teleportAngle) * 140));
          enemy.y = Math.max(80, Math.min(2000, enemy.y + Math.sin(teleportAngle) * 140));
          continue;
        }

        // Summon bats if in combat
        if (
          enemy.specialAbility === 'summon_bats' &&
          (enemy.summonBatCooldown || 0) <= 0 &&
          dist < 220
        ) {
          enemy.summonBatCooldown = 12.0;
          soundManager.playBatScreech();
          this.spawnHitSparks(enemy.x, enemy.y, true);
          this.showNotification(`🦇 ${enemy.name} summoned twilight bats to the skies!`);
          this.enemies.push({
            id: `spawned_bat_${Date.now()}_${Math.random()}`,
            name: 'Summoned Twilight Bat',
            tier: 'weak',
            category: 'bat',
            faction: 'witch_coven',
            zone: enemy.zone,
            x: enemy.x + (Math.random() - 0.5) * 40,
            y: enemy.y + (Math.random() - 0.5) * 40,
            vx: 0,
            vy: 0,
            width: 26,
            height: 22,
            facing: 'left',
            hp: 36,
            maxHp: 36,
            attackPower: 14,
            defense: 2,
            speed: 145,
            aiState: 'chase',
            stateTimer: 0,
            attackCooldown: 1.0,
            walkFrame: 0,
            loot: [{ itemId: 'food_mana_berry', chance: 0.3, amount: 1 }],
            expReward: 20,
            isFlying: true,
            flightAltitude: 32,
            batVariant: 'small',
          });
        }
      }

      const effectiveAggro = isCoordinatedRaid ? 280 : (enemy.tier === 'boss' || enemy.tier === 'strong' ? 240 : 160);
      if (dist < effectiveAggro) {
        enemy.facing = dx > 0 ? 'right' : 'left';

        const isHexWitch = enemy.category === 'witch';
        const hasRanged = enemy.specialAbility === 'laser' || enemy.specialAbility === 'fireball' || isHexWitch;
        const attackRange = hasRanged ? 180 : 45;

        // Bat swoops into dive attack
        if (enemy.category === 'bat') {
          enemy.isDiving = true;
        }

        if (dist <= attackRange && enemy.attackCooldown <= 0) {
          enemy.attackCooldown = isHexWitch ? 1.6 : enemy.specialAbility === 'laser' ? 1.8 : 1.4;
          
          if (isHexWitch) {
            soundManager.playSpellCast();
            for (let i = 0; i < 4; i++) {
              this.particles.push({
                x: enemy.x + (enemy.facing === 'right' ? enemy.width : 0),
                y: enemy.y + enemy.height / 2,
                vx: (dx / dist) * 200,
                vy: (dy / dist) * 200,
                size: 6,
                color: '#c084fc',
                alpha: 1,
                life: 0,
                maxLife: 0.6,
                type: 'spark',
              });
            }
          } else if (hasRanged) {
            soundManager.playTelegraph();
            const projColor = enemy.specialAbility === 'laser' ? '#06b6d4' : '#f97316';
            for (let i = 0; i < 4; i++) {
              this.particles.push({
                x: enemy.x + (enemy.facing === 'right' ? enemy.width : 0),
                y: enemy.y + enemy.height / 2,
                vx: (dx / dist) * 220,
                vy: (dy / dist) * 220,
                size: 5,
                color: projColor,
                alpha: 1,
                life: 0,
                maxLife: 0.5,
                type: 'spark',
              });
            }
          } else if (enemy.category === 'bat') {
            soundManager.playBatScreech();
          }

          // Damage player if not dodging via high jump
          if (this.player.jumpZ > 16) {
            this.spawnTextParticle(px, py - 25, 'DODGED!', '#38bdf8');
          } else {
            let defTotal = this.player.stats.defense;
            if (this.player.activeVehicleId) {
              const v = this.vehicles.find((veh) => veh.id === this.player.activeVehicleId);
              if (v) defTotal += v.defenseBonus;
            }
            const actualDmg = Math.max(3, enemy.attackPower - defTotal + Math.floor(Math.random() * 4));
            this.player.stats.hp = Math.max(0, this.player.stats.hp - actualDmg);

            soundManager.playPlayerHurt();
            this.camera.triggerShake(enemy.tier === 'boss' ? 10 : 5, 0.25);
            this.spawnHitSparks(px, py, true);
            this.spawnTextParticle(px, py - 25, `-${actualDmg}`, '#ef4444');

            if (this.player.stats.hp <= 0) {
              this.player.currentZone = 'overworld';
              this.player.x = 1250;
              this.player.y = 1140;
              this.player.stats.hp = this.player.stats.maxHp;
              this.player.stats.stamina = this.player.stats.maxStamina;
              this.player.activeVehicleId = null;
              this.showNotification(`Fell in combat against ${enemy.name}! Rescued and recovering safely in Oakhaven.`);
            }
          }
        } else if (dist > 40) {
          enemy.aiState = 'chase';
          const speedMultiplier = isCoordinatedRaid ? 1.2 : 1.0;
          enemy.x += (dx / dist) * enemy.speed * speedMultiplier * dt;
          enemy.y += (dy / dist) * enemy.speed * speedMultiplier * dt;
          enemy.walkFrame += dt * 10;
        }
      } else {
        enemy.aiState = 'patrol';
        enemy.isDiving = false;
        enemy.walkFrame = 0;
      }
    }
  }

  // ==========================================
  // STAGE 5: CHARACTER POWERS & ACTIVE SUMMONS
  // ==========================================
  private updatePowersAndSummons(dt: number) {
    // 1. Powers cooldown decrement
    for (const p of this.powers) {
      if (p.currentCooldown > 0) {
        p.currentCooldown = Math.max(0, p.currentCooldown - dt);
      }
    }

    // 2. Active Summons follow and fight
    const px = this.player.x + this.player.width / 2;
    const py = this.player.y + this.player.height / 2;

    for (let i = this.activeSummons.length - 1; i >= 0; i--) {
      const s = this.activeSummons[i];
      s.durationLeft -= dt;
      if (s.durationLeft <= 0 || s.hp <= 0) {
        this.spawnTextParticle(s.x, s.y - 20, 'SUMMON EXPIRED', '#94a3b8');
        this.activeSummons.splice(i, 1);
        continue;
      }

      // Find nearby hostile enemy
      let closestEnemy: Enemy | null = null;
      let closestDist = 180;
      for (const e of this.enemies) {
        if (e.zone === this.player.currentZone && e.aiState !== 'defeated') {
          const ed = Math.hypot(s.x - (e.x + e.width / 2), s.y - (e.y + e.height / 2));
          if (ed < closestDist) {
            closestEnemy = e;
            closestDist = ed;
          }
        }
      }

      if (closestEnemy) {
        const edx = closestEnemy.x - s.x;
        const edy = closestEnemy.y - s.y;
        const edist = Math.hypot(edx, edy);
        s.facing = edx > 0 ? 'right' : 'left';
        if (edist > 35) {
          s.x += (edx / edist) * s.speed * dt;
          s.y += (edy / edist) * s.speed * dt;
          s.walkFrame += dt * 10;
        } else {
          // Summon attacks enemy!
          this.damageEnemy(closestEnemy, s.attack, false);
          soundManager.playHit();
          this.spawnHitSparks(closestEnemy.x + 15, closestEnemy.y + 15, false);
          this.spawnTextParticle(closestEnemy.x + 15, closestEnemy.y - 20, `${s.name}: ${s.attack}`, '#38bdf8');
        }
      } else {
        // Follow player
        const pdx = px - s.x;
        const pdy = py - s.y;
        const pdist = Math.hypot(pdx, pdy);
        if (pdist > 50) {
          s.x += (pdx / pdist) * s.speed * dt;
          s.y += (pdy / pdist) * s.speed * dt;
          s.facing = pdx > 0 ? 'right' : 'left';
          s.walkFrame += dt * 8;
        } else {
          s.walkFrame = 0;
        }
      }
    }
  }

  // ==========================================
  // STAGE 5: MAGICAL CAT COMPANION SIMULATION
  // ==========================================
  private updateMagicalCat(dt: number) {
    const cat = this.catCompanion;
    if (cat.zone !== this.player.currentZone) return;

    const px = this.player.x + this.player.width / 2;
    const py = this.player.y + this.player.height / 2;
    const cdx = px - cat.x;
    const cdy = py - cat.y;
    const distToPlayer = Math.hypot(cdx, cdy);

    if (cat.statusSpeechTimer && cat.statusSpeechTimer > 0) {
      cat.statusSpeechTimer -= dt;
      if (cat.statusSpeechTimer <= 0) {
        cat.statusSpeech = undefined;
      }
    }

    // 1. Follow player if trust >= 25
    if (cat.trust >= 25) {
      cat.isFollowing = true;
      cat.facing = cdx > 0 ? 'right' : 'left';
      if (distToPlayer > 55) {
        const catSpeed = distToPlayer > 130 ? 210 : 130;
        cat.x += (cdx / distToPlayer) * catSpeed * dt;
        cat.y += (cdy / distToPlayer) * catSpeed * dt;
        cat.walkFrame += dt * 9;
      } else {
        cat.walkFrame = 0;
      }
    }

    // 2. Danger Detection & Alert (Trust >= 25)
    if (cat.powersUnlocked.alertDanger) {
      let enemyNearby = false;
      for (const e of this.enemies) {
        if (e.zone === cat.zone && e.aiState !== 'defeated') {
          const ed = Math.hypot(px - (e.x + e.width / 2), py - (e.y + e.height / 2));
          if (ed < 180) {
            enemyNearby = true;
            break;
          }
        }
      }
      if (enemyNearby && !cat.statusSpeech) {
        cat.statusSpeech = '⚠️ Hiss! Hostiles detected nearby!';
        cat.statusSpeechTimer = 3.0;
      }
    }

    // 3. Healing Aura (Trust >= 50)
    if (cat.powersUnlocked.healingAura) {
      cat.healAuraTimer += dt;
      if (cat.healAuraTimer >= 8.5) {
        cat.healAuraTimer = 0;
        if (this.player.stats.hp < this.player.stats.maxHp) {
          const heal = 14;
          this.player.stats.hp = Math.min(this.player.stats.maxHp, this.player.stats.hp + heal);
          soundManager.playPurr();
          this.spawnTextParticle(px, py - 30, `+${heal} HP (Cat Aura)`, '#f472b6');
          cat.statusSpeech = '❤️ Purrr... (Restored HP)';
          cat.statusSpeechTimer = 2.5;
        }
      }
    }

    // 4. Starlight Claws Attack (Trust >= 95)
    if (cat.powersUnlocked.starlightClaws) {
      if (cat.starlightAttackTimer > 0) {
        cat.starlightAttackTimer -= dt;
      } else {
        for (const e of this.enemies) {
          if (e.zone === cat.zone && e.aiState !== 'defeated') {
            const ed = Math.hypot(cat.x - (e.x + e.width / 2), cat.y - (e.y + e.height / 2));
            if (ed < 90) {
              cat.starlightAttackTimer = 3.5;
              this.damageEnemy(e, 32, true);
              soundManager.playSpellCast();
              this.spawnHitSparks(e.x + 15, e.y + 15, true);
              this.spawnTextParticle(e.x + 15, e.y - 25, 'STARLIGHT CLAWS: 32', '#c084fc');
              break;
            }
          }
        }
      }
    }
  }

  // ==========================================
  // STAGE 5: LIVING KINGDOM ECONOMY & DECREES
  // ==========================================
  private updateKingAndLivingEconomy(dt: number) {
    // Daily economic turnover at in-game 06:00 (360 mins)
    const currentMins = Math.floor(this.gameTime);
    if (currentMins === 360 && dt > 0.01) {
      const king = this.king;

      // 1. Food Production by Farmers & Baker
      let foodProduced = king.foodPerDay;
      const granaryDecree = king.decrees.find((d) => d.id === 'decree_granary' && d.isActive);
      if (granaryDecree) foodProduced += 6;

      // 2. Food Consumption by Population
      const foodConsumed = king.foodConsumption;
      king.foodStock = Math.max(0, king.foodStock + foodProduced - foodConsumed);

      // 3. Tax Collection
      let taxGain = king.taxPolicy === 'high' ? 95 : king.taxPolicy === 'moderate' ? 55 : 25;
      king.treasuryGold += taxGain;
      this.player.gold += Math.round(taxGain * 0.4); // Player receives royal stipend

      // 4. Population Growth & Settlement Morale
      if (king.foodStock > 40) {
        king.settlementMorale = Math.min(100, king.settlementMorale + 5);
        king.populationGrowthTrend = 'growing';
        this.kingdom.population += 1;
        this.showNotification('🌾 Daily Harvest: Oakhaven granaries replenished! Settlement population growing.');
      } else if (king.foodStock <= 0) {
        king.settlementMorale = Math.max(20, king.settlementMorale - 15);
        king.populationGrowthTrend = 'declining';
        this.showNotification('⚠️ Food Shortage! Kingdom granaries depleted. Provide crops to avoid unrest.');
      }
    }
  }

  // ==========================================
  // DAMAGE ENEMY HELPER (Supports Magic Shield & Drops)
  // ==========================================
  public damageEnemy(enemy: Enemy, damage: number, isCrit: boolean = false) {
    if (enemy.aiState === 'defeated') return;

    // 1. Absorb into Magic Shield if active
    if (enemy.hasMagicShield && (enemy.magicShieldHp || 0) > 0) {
      enemy.magicShieldHp = Math.max(0, (enemy.magicShieldHp || 0) - damage);
      this.spawnHitSparks(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, true);
      this.spawnTextParticle(enemy.x + enemy.width / 2, enemy.y - 20, `SHIELD: -${damage}`, '#38bdf8');
      if (enemy.magicShieldHp <= 0) {
        enemy.hasMagicShield = false;
        soundManager.playShieldUp();
        this.spawnTextParticle(enemy.x + enemy.width / 2, enemy.y - 25, 'SHIELD BROKEN!', '#38bdf8');

        // Witch panic teleport on shield break
        if (enemy.category === 'witch') {
          soundManager.playTeleport();
          const angle = Math.random() * Math.PI * 2;
          enemy.x = Math.max(80, Math.min(2800, enemy.x + Math.cos(angle) * 140));
          enemy.y = Math.max(80, Math.min(2000, enemy.y + Math.sin(angle) * 140));
        }
      }
      return;
    }

    // 2. Damage HP
    enemy.hp = Math.max(0, enemy.hp - damage);
    enemy.aiState = 'hurt';
    enemy.stateTimer = 0.25;

    if (enemy.hp <= 0) {
      enemy.aiState = 'defeated';
      enemy.stateTimer = 0;
      soundManager.playBossDefeated();
      this.gainExp(enemy.expReward);

      // Loot drops
      for (const drop of enemy.loot) {
        if (Math.random() <= drop.chance) {
          const lootItem = ITEMS[drop.itemId];
          if (lootItem) {
            this.addItem(lootItem, drop.amount);
            this.showNotification(`Looted ${drop.amount}x ${lootItem.name}!`);
          }
        }
      }

      // Unlock eligible summons
      if (enemy.category === 'bat') {
        const batSummon = this.summonTemplates.find((s) => s.id === 'summon_forest_prowler');
        if (batSummon) batSummon.isUnlocked = true;
      } else if (enemy.category === 'witch') {
        const mageSummon = this.summonTemplates.find((s) => s.id === 'summon_battle_mage');
        if (mageSummon) mageSummon.isUnlocked = true;
      }

      if (enemy.tier === 'boss') {
        if (!this.exploration.defeatedBosses.includes(enemy.id)) {
          this.exploration.defeatedBosses.push(enemy.id);
        }
        this.showNotification(`🏆 BOSS OVERTHROWN: ${enemy.name}!`);
        this.camera.triggerShake(14, 0.45);
      }
    }
  }

  // ==========================================
  // STAGE 5: CHARACTER POWER CASTING & SUMMONING
  // ==========================================
  public castPower(powerId: string): boolean {
    const power = this.powers.find((p) => p.id === powerId);
    if (!power || !power.isUnlocked) {
      this.showNotification('Power is locked!');
      return false;
    }
    if (power.currentCooldown > 0) {
      this.showNotification(`Cooldown remaining: ${Math.ceil(power.currentCooldown)}s`);
      return false;
    }
    if (this.player.stats.stamina < power.manaCost) {
      this.showNotification('Insufficient stamina / energy!');
      return false;
    }

    this.player.stats.stamina -= power.manaCost;
    power.currentCooldown = power.cooldown;

    const px = this.player.x + this.player.width / 2;
    const py = this.player.y + this.player.height / 2;

    if (power.type === 'dash') {
      const dir = this.player.facing === 'right' ? 1 : -1;
      this.player.x += dir * power.range;
      soundManager.playJump();
      this.camera.triggerShake(8, 0.2);
      this.spawnHitSparks(this.player.x, this.player.y, true);
      this.spawnTextParticle(this.player.x, this.player.y - 25, `${power.name}!`, '#38bdf8');

      for (const e of this.enemies) {
        if (e.zone === this.player.currentZone && e.aiState !== 'defeated') {
          const edist = Math.hypot(this.player.x - e.x, this.player.y - e.y);
          if (edist < 85) {
            this.damageEnemy(e, power.damage, true);
          }
        }
      }
    } else if (power.type === 'aoe' || power.type === 'attack') {
      soundManager.playSpellCast();
      this.camera.triggerShake(9, 0.28);
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI) / 4;
        this.particles.push({
          x: px,
          y: py,
          vx: Math.cos(angle) * 190,
          vy: Math.sin(angle) * 190,
          size: 6,
          color: '#c084fc',
          alpha: 1,
          life: 0,
          maxLife: 0.45,
          type: 'spark',
        });
      }
      this.spawnTextParticle(px, py - 30, `${power.name}!`, '#c084fc');

      for (const e of this.enemies) {
        if (e.zone === this.player.currentZone && e.aiState !== 'defeated') {
          const edist = Math.hypot(px - (e.x + e.width / 2), py - (e.y + e.height / 2));
          if (edist < power.range) {
            this.damageEnemy(e, power.damage, true);
          }
        }
      }
    } else if (power.type === 'defense') {
      soundManager.playShieldUp();
      this.player.stats.hp = Math.min(this.player.stats.maxHp, this.player.stats.hp + 60);
      this.spawnTextParticle(px, py - 30, '+60 HP SANCTUARY!', '#22c55e');
      this.camera.triggerShake(6, 0.2);
    }

    return true;
  }

  public summonWarrior(templateId: string): boolean {
    if (this.activeSummons.length >= 3) {
      this.showNotification('Maximum active summon capacity reached (3)!');
      return false;
    }

    const t = this.summonTemplates.find((tmpl) => tmpl.id === templateId);
    if (!t || !t.isUnlocked) {
      this.showNotification('Summon creature is locked! Defeat beasts to unlock.');
      return false;
    }

    if (this.player.stats.stamina < t.manaCost) {
      this.showNotification('Insufficient stamina / mana to summon!');
      return false;
    }

    this.player.stats.stamina -= t.manaCost;
    soundManager.playSpellCast();
    this.spawnHitSparks(this.player.x, this.player.y, true);

    const active: ActiveSummon = {
      id: `summon_${Date.now()}_${Math.random()}`,
      templateId: t.id,
      name: t.name,
      x: this.player.x + (Math.random() - 0.5) * 40,
      y: this.player.y + (Math.random() - 0.5) * 40,
      vx: 0,
      vy: 0,
      facing: 'right',
      hp: t.baseHp + (t.level - 1) * 20,
      maxHp: t.baseHp + (t.level - 1) * 20,
      attack: t.baseAttack + (t.level - 1) * 5,
      defense: t.baseDefense,
      speed: t.baseSpeed,
      durationLeft: t.duration,
      maxDuration: t.duration,
      level: t.level,
      specialAbility: t.specialAbility,
      walkFrame: 0,
      targetEnemyId: null,
      auraColor: t.color,
    };

    this.activeSummons.push(active);
    this.showNotification(`Conjured ${active.name}! They will fight beside you.`);
    this.spawnTextParticle(active.x, active.y - 25, `${active.name} SUMMONED!`, active.auraColor);
    return true;
  }

  public upgradePower(powerId: string): boolean {
    const power = this.powers.find((p) => p.id === powerId);
    if (!power || !power.isUnlocked) return false;
    if (this.player.stats.exp < power.upgradeCost.exp || this.player.gold < power.upgradeCost.gold) {
      this.showNotification('Not enough EXP or Gold for power upgrade!');
      return false;
    }
    this.player.stats.exp -= power.upgradeCost.exp;
    this.player.gold -= power.upgradeCost.gold;
    power.level += 1;
    power.damage = Math.round(power.damage * 1.3);
    power.cooldown = Math.max(1, power.cooldown * 0.9);
    power.upgradeCost.exp = Math.round(power.upgradeCost.exp * 1.5);
    power.upgradeCost.gold = Math.round(power.upgradeCost.gold * 1.4);
    soundManager.playLevelUp();
    this.showNotification(`⚡ Upgraded ${power.name} to Level ${power.level}!`);
    return true;
  }

  public upgradeSummon(templateId: string): boolean {
    const t = this.summonTemplates.find((s) => s.id === templateId);
    if (!t || !t.isUnlocked) return false;
    if (this.player.gold < 40 || this.player.stats.exp < 50) {
      this.showNotification('Need 40 Gold and 50 EXP to upgrade summon warrior!');
      return false;
    }
    this.player.gold -= 40;
    this.player.stats.exp -= 50;
    t.level += 1;
    t.baseHp += 25;
    t.baseAttack += 6;
    soundManager.playLevelUp();
    this.showNotification(`🌟 ${t.name} upgraded to Level ${t.level}! Attack and HP enhanced.`);
    return true;
  }

  public interactWithCat(action: 'feed' | 'pet' | 'heal', foodItemId?: string): boolean {
    const cat = this.catCompanion;

    if (action === 'feed') {
      const food = foodItemId || 'food_mana_berry';
      if (!this.hasItem(food)) {
        this.showNotification('You do not have that treat in your inventory!');
        return false;
      }
      this.removeItem(food, 1);
      cat.trust = Math.min(100, cat.trust + 20);
      soundManager.playPurr();
      this.spawnTextParticle(cat.x, cat.y - 20, `+20 TRUST ❤️ (${cat.trust}/100)`, '#f472b6');
      this.showNotification(`Fed ${cat.name} a delicious treat! Trust rose to ${cat.trust}/100.`);
    } else if (action === 'heal') {
      if (!this.hasItem('potion_heal') && !this.hasItem('potion_elixir')) {
        this.showNotification('Need a restorative potion in inventory to heal wounds!');
        return false;
      }
      if (!this.removeItem('potion_heal', 1)) {
        this.removeItem('potion_elixir', 1);
      }
      cat.isInjured = false;
      cat.health = cat.maxHealth;
      cat.trust = Math.min(100, cat.trust + 25);
      soundManager.playLevelUp();
      this.spawnTextParticle(cat.x, cat.y - 20, `HEALED! +25 TRUST ❤️ (${cat.trust}/100)`, '#22c55e');
      this.showNotification(`Applied restorative balm to ${cat.name}. Trust is ${cat.trust}/100.`);
    } else {
      // Pet
      cat.trust = Math.min(100, cat.trust + 6);
      soundManager.playCatMeow();
      this.spawnTextParticle(cat.x, cat.y - 20, `+6 TRUST ❤️ (${cat.trust}/100)`, '#f472b6');
      this.showNotification(`Gently stroked ${cat.name}. They purr softly.`);
    }

    // Check unlocks
    if (cat.trust >= 25) cat.powersUnlocked.alertDanger = true;
    if (cat.trust >= 50) cat.powersUnlocked.healingAura = true;
    if (cat.trust >= 70) cat.powersUnlocked.swiftPaws = true;
    if (cat.trust >= 85) cat.powersUnlocked.magicShield = true;
    if (cat.trust >= 95) cat.powersUnlocked.starlightClaws = true;

    if (cat.trust >= 80) cat.trustLevel = 'celestial_guardian';
    else if (cat.trust >= 50) cat.trustLevel = 'supportive';
    else if (cat.trust >= 25) cat.trustLevel = 'curious';
    else cat.trustLevel = 'cautious';

    return true;
  }

  public interactWithKing(action: 'decree' | 'tax' | 'knighthood', extraId?: string) {
    const king = this.king;

    if (action === 'decree' && extraId) {
      const dec = king.decrees.find((d) => d.id === extraId);
      if (dec) {
        dec.isActive = !dec.isActive;
        soundManager.playLevelUp();
        this.showNotification(`Royal Decree: "${dec.name}" is now ${dec.isActive ? 'ACTIVE' : 'INACTIVE'}!`);
      }
    } else if (action === 'tax' && extraId) {
      king.taxPolicy = extraId as 'low' | 'moderate' | 'high';
      soundManager.playCoinSound();
      this.showNotification(`King Alden IV ratified ${king.taxPolicy.toUpperCase()} tax policy.`);
    } else if (action === 'knighthood') {
      soundManager.playQuestComplete();
      this.player.gold += 100;
      this.gainExp(150);
      this.showNotification('Awarded Knighthood Honors by King Alden IV! +100 Gold, +150 EXP.');
    }
  }

  private updateWorldEconomy(dt: number) {
    // 1. Mining nodes respawn
    for (const node of this.miningNodes) {
      if (node.depleted) {
        node.respawnTimer -= dt;
        if (node.respawnTimer <= 0) {
          node.depleted = false;
          node.hp = node.maxHp;
        }
      }
    }

    // 2. Farm plots regrowth
    for (const plot of this.farmPlots) {
      if (plot.state === 'growing') {
        plot.timer -= dt;
        if (plot.timer <= 0) {
          plot.state = 'ripe';
        }
      }
    }

    // 3. Kingdom settlement passive tax generation (every ~180 sec)
    if (Math.floor(this.gameTime) === 0 && dt > 0.01) {
      this.player.gold += this.kingdom.dailyTaxGold;
      this.kingdom.wood += 2;
      this.kingdom.iron += 1;
    }
  }

  private executePlayerAttack() {
    const { player } = this;
    player.isAttacking = true;
    player.attackTimer = 0;
    player.attackCombo = (player.attackCombo + 1) % 3;

    soundManager.playAttack(player.attackCombo);

    const reach = 55;
    const hitX = player.facing === 'right' ? player.x + player.width : player.x - reach;
    const hitY = player.y;
    const hitW = reach;
    const hitH = player.height;

    // 1. Check hit on Mining Nodes (if in mine cavern)
    if (player.currentZone === 'mine_cavern') {
      for (const node of this.miningNodes) {
        if (!node.depleted) {
          const isOverlapping =
            hitX < node.x + node.width &&
            hitX + hitW > node.x &&
            hitY < node.y + node.height &&
            hitY + hitH > node.y;

          if (isOverlapping) {
            // Has pickaxe? Deals +50% damage
            const hasPick = this.hasItem('tool_pickaxe');
            const baseDamage = hasPick ? 28 : 16;
            const damage = baseDamage + Math.floor(Math.random() * 8);

            node.hp = Math.max(0, node.hp - damage);
            soundManager.playMineHit();
            this.camera.triggerShake(4, 0.15);

            const nodeMidX = node.x + node.width / 2;
            const nodeMidY = node.y + node.height / 2;
            this.spawnHitSparks(nodeMidX, nodeMidY, false);
            this.spawnTextParticle(nodeMidX, nodeMidY - 20, `${damage}`, '#e2e8f0');

            if (node.hp <= 0) {
              // Node broken! Yield ores!
              node.depleted = true;
              node.respawnTimer = 25;
              soundManager.playMineBreak();

              let oreItem: Item = ITEMS.ore_iron;
              let expYield = 20;

              if (node.resourceType === 'coal') {
                oreItem = ITEMS.ore_coal;
                expYield = 15;
              } else if (node.resourceType === 'copper') {
                oreItem = ITEMS.ore_copper;
                expYield = 18;
              } else if (node.resourceType === 'iron') {
                oreItem = ITEMS.ore_iron;
                expYield = 25;
              } else if (node.resourceType === 'gold') {
                oreItem = ITEMS.ore_gold;
                expYield = 35;
              } else if (node.resourceType === 'crystal') {
                oreItem = ITEMS.ore_crystal;
                expYield = 50;
              }

              const yieldCount = 2 + Math.floor(Math.random() * 2);
              this.addItem(oreItem, yieldCount);
              this.gainExp(expYield);

              // Update quest progress for Iron
              if (node.resourceType === 'iron') {
                this.updateQuestProgress('quest_iron_forge', 'obj_iron', yieldCount);
              }

              this.spawnTextParticle(nodeMidX, nodeMidY - 35, `+${yieldCount} ${oreItem.name}`, '#facc15');
              this.showNotification(`Mined ${yieldCount}x ${oreItem.name}!`);
            }
          }
        }
      }
    }

    // 2. Check hit on Training Dummy
    if (player.currentZone === 'overworld') {
      const dummy = this.props.find((p) => p.type === 'dummy');
      if (dummy) {
        const isOverlapping =
          hitX < dummy.x + dummy.width &&
          hitX + hitW > dummy.x &&
          hitY < dummy.y + dummy.height &&
          hitY + hitH > dummy.y;

        if (isOverlapping) {
          const baseDmg = player.stats.attackPower + (player.attackCombo === 2 ? 10 : 0);
          const damage = baseDmg + Math.floor(Math.random() * 5);
          const isCrit = player.attackCombo === 2;

          dummy.recoil = player.facing === 'right' ? 0.35 : -0.35;
          if (dummy.hitHp !== undefined) {
            dummy.hitHp = Math.max(0, dummy.hitHp - damage);
            if (dummy.hitHp === 0) {
              dummy.hitHp = dummy.maxHitHp;
              this.dummyDefeatedCount++;
            }
          }

          soundManager.playHit();
          this.camera.triggerShake(isCrit ? 9 : 4, 0.2);

          const impactX = dummy.x + dummy.width / 2;
          const impactY = dummy.y + dummy.height / 2;
          this.spawnHitSparks(impactX, impactY, isCrit);

          this.spawnTextParticle(
            impactX,
            impactY - 20,
            isCrit ? `${damage}! CRIT` : `${damage}`,
            isCrit ? '#38bdf8' : '#f59e0b'
          );

          this.gainExp(12);
        }
      }

      // 3. Check hit on Guard Captain Roderick during duel
      if (this.isDuelActive && this.boss.isActive && this.boss.state !== 'defeated') {
        const boss = this.boss;
        const isOverlapping =
          hitX < boss.x + boss.width &&
          hitX + hitW > boss.x &&
          hitY < boss.y + boss.height &&
          hitY + hitH > boss.y;

        if (isOverlapping) {
          const baseDmg = player.stats.attackPower + (player.attackCombo === 2 ? 14 : 0);
          const damage = baseDmg + Math.floor(Math.random() * 6);
          const isCrit = player.attackCombo === 2;

          boss.hp = Math.max(0, boss.hp - damage);
          boss.recoil = player.facing === 'right' ? 0.35 : -0.35;
          boss.state = 'hurt';
          boss.stateTimer = 0.24;

          soundManager.playSwordClash();
          this.camera.triggerShake(isCrit ? 10 : 5, 0.22);

          const impactX = boss.x + boss.width / 2;
          const impactY = boss.y + boss.height / 2;
          this.spawnHitSparks(impactX, impactY, isCrit);
          this.spawnTextParticle(
            impactX,
            impactY - 25,
            isCrit ? `${damage}! CRIT` : `${damage}`,
            isCrit ? '#f43f5e' : '#f59e0b'
          );

          if (boss.hp <= 0) {
            boss.state = 'defeated';
            boss.stateTimer = 0;
            soundManager.playBossDefeated();
            this.camera.triggerShake(12, 0.4);
            this.gainExp(85);
            this.showNotification('Victory! Captain Roderick acknowledges your blade mastery!');
            this.spawnTextParticle(impactX, impactY - 45, '+85 EXP · CAPTAIN\'S CREST', '#facc15');
          }
        }
      }
    }

    // 4. Check hit on Stage 3 Enemies across all worlds
    for (const enemy of this.enemies) {
      if (enemy.zone !== player.currentZone || enemy.aiState === 'defeated') continue;

      const isOverlapping =
        hitX < enemy.x + enemy.width &&
        hitX + hitW > enemy.x &&
        hitY < enemy.y + enemy.height &&
        hitY + hitH > enemy.y;

      if (isOverlapping) {
        const isCrit = player.attackCombo === 2;
        const baseDmg = player.stats.attackPower + (isCrit ? 14 : 0);
        const damage = Math.max(1, baseDmg - enemy.defense + Math.floor(Math.random() * 6));

        enemy.hp = Math.max(0, enemy.hp - damage);
        enemy.aiState = 'hurt';
        enemy.stateTimer = 0.25;

        soundManager.playSwordClash();
        this.camera.triggerShake(isCrit ? 9 : 4, 0.2);

        const impactX = enemy.x + enemy.width / 2;
        const impactY = enemy.y + enemy.height / 2;
        this.spawnHitSparks(impactX, impactY, isCrit);
        this.spawnTextParticle(
          impactX,
          impactY - 20,
          isCrit ? `${damage}! CRIT` : `${damage}`,
          isCrit ? '#f43f5e' : '#f59e0b'
        );

        if (enemy.hp <= 0) {
          enemy.aiState = 'defeated';
          enemy.stateTimer = 0;
          soundManager.playBossDefeated();
          this.gainExp(enemy.expReward);

          // Drop loot
          for (const drop of enemy.loot) {
            if (Math.random() <= drop.chance) {
              const lootItem = ITEMS[drop.itemId];
              if (lootItem) {
                this.addItem(lootItem, drop.amount);
                this.showNotification(`Looted ${drop.amount}x ${lootItem.name}!`);
              }
            }
          }

          if (enemy.tier === 'boss') {
            if (!this.exploration.defeatedBosses.includes(enemy.id)) {
              this.exploration.defeatedBosses.push(enemy.id);
            }
            this.showNotification(`🏆 BOSS DEFEATED: ${enemy.name}!`);
            this.camera.triggerShake(12, 0.45);
          }
        }
      }
    }
  }

  private updateBoss(dt: number) {
    const { boss, player } = this;
    if (!boss.isActive) return;

    if (boss.recoil) {
      boss.recoil *= Math.pow(0.01, dt);
      if (Math.abs(boss.recoil) < 0.01) boss.recoil = 0;
    }

    if (boss.state === 'defeated') {
      boss.stateTimer += dt;
      if (boss.stateTimer > 4.5) {
        this.isDuelActive = false;
        boss.isActive = false;
        boss.state = 'idle';
        this.showNotification('Duel concluded. Speak with Captain Roderick at the gate.');
      }
      return;
    }

    if (boss.state === 'hurt') {
      boss.stateTimer -= dt;
      if (boss.stateTimer <= 0) {
        boss.state = 'idle';
        boss.stateTimer = 0.5;
        boss.attackCooldown = 0.8;
      }
      return;
    }

    const captainCenterX = boss.x + boss.width / 2;
    const captainCenterY = boss.y + boss.height / 2;
    const playerCenterX = player.x + player.width / 2;
    const playerCenterY = player.y + player.height / 2;

    const dx = playerCenterX - captainCenterX;
    const dy = playerCenterY - captainCenterY;
    const dist = Math.hypot(dx, dy);

    if (dx > 5) boss.facing = 'right';
    else if (dx < -5) boss.facing = 'left';

    if (boss.attackCooldown > 0) {
      boss.attackCooldown -= dt;
    }

    if (boss.state === 'idle') {
      boss.stateTimer -= dt;
      if (boss.stateTimer <= 0) {
        boss.state = 'chase';
      }
    } else if (boss.state === 'chase') {
      boss.walkFrame += dt * 10;
      const speed = 115;

      if (dist < 72 && boss.attackCooldown <= 0) {
        boss.state = 'windup';
        boss.stateTimer = 0.45;
        soundManager.playTelegraph();
        this.spawnHitSparks(captainCenterX, captainCenterY - 30, false);
      } else {
        if (dist > 48) {
          const moveX = (dx / dist) * speed;
          const moveY = (dy / dist) * speed;
          boss.vx = moveX;
          boss.vy = moveY;
          boss.x += moveX * dt;
          boss.y += moveY * dt;
        }
      }
    } else if (boss.state === 'windup') {
      boss.stateTimer -= dt;
      if (boss.stateTimer <= 0) {
        boss.state = 'attack';
        boss.stateTimer = 0.32;
        soundManager.playSwordClash();

        if (dist < 80) {
          if (player.jumpZ > 16) {
            this.spawnTextParticle(playerCenterX, playerCenterY - 30, 'DODGED!', '#38bdf8');
          } else {
            const rawDmg = 18 + Math.floor(Math.random() * 6);
            const actualDmg = Math.max(4, rawDmg - player.stats.defense);
            player.stats.hp = Math.max(0, player.stats.hp - actualDmg);

            soundManager.playPlayerHurt();
            this.camera.triggerShake(9, 0.25);
            this.spawnHitSparks(playerCenterX, playerCenterY, true);
            this.spawnTextParticle(playerCenterX, playerCenterY - 25, `-${actualDmg}`, '#ef4444');

            const knockDir = boss.facing === 'right' ? 1 : -1;
            player.vx = knockDir * 200;

            if (player.stats.hp <= 0) {
              this.showNotification('Captain Roderick: "Yield! Rest at the spring well and hone your strikes."');
              player.x = 1250;
              player.y = 1140;
              player.stats.hp = player.stats.maxHp;
              player.stats.stamina = player.stats.maxStamina;
              this.isDuelActive = false;
              boss.isActive = false;
              boss.state = 'idle';
            }
          }
        }
      }
    } else if (boss.state === 'attack') {
      boss.stateTimer -= dt;
      if (boss.stateTimer <= 0) {
        boss.state = 'idle';
        boss.stateTimer = 0.8;
        boss.attackCooldown = 1.6;
      }
    }
  }

  public triggerInteract() {
    if (!this.hoveredInteractive) return;

    soundManager.playInteract();

    // 0. Sovereign King Alden IV Royal Audience Interaction
    if ('isSovereign' in this.hoveredInteractive || ('id' in this.hoveredInteractive && this.hoveredInteractive.id === 'npc_king_alden')) {
      this.isKingAudienceOpen = true;
      soundManager.playLevelUp();
      this.showNotification('👑 Granted Royal Audience with Sovereign King Alden IV.');
      return;
    }

    // 0.1 Magical Cat Companion Interaction
    if ('isMagicalCat' in this.hoveredInteractive || ('id' in this.hoveredInteractive && this.hoveredInteractive.id === 'cat_companion_starlight')) {
      this.isCompanionOpen = true;
      soundManager.playPurr();
      return;
    }

    // 0.2 Living Kingdom Villager Interaction
    if ('profession' in this.hoveredInteractive) {
      const villager = this.hoveredInteractive as KingdomVillager;
      this.activeVillager = villager;
      soundManager.playInteract();
      return;
    }

    // 1. Portal Warp Interaction
    if ('targetZone' in this.hoveredInteractive) {
      const portal = this.hoveredInteractive as Portal;
      if (portal.isLocked) {
        this.showNotification(`Portal is locked! ${portal.unlockRequirement || 'Exploration required.'}`);
        return;
      }

      portal.discovered = true;
      if (!this.exploration.discoveredPortals.includes(portal.id)) {
        this.exploration.discoveredPortals.push(portal.id);
      }
      if (!this.exploration.visitedZones.includes(portal.targetZone)) {
        this.exploration.visitedZones.push(portal.targetZone);
      }

      this.player.currentZone = portal.targetZone;
      this.player.x = portal.targetX;
      this.player.y = portal.targetY;
      this.player.vx = 0;
      this.player.vy = 0;

      // Transfer mounted vehicle if driving
      if (this.player.activeVehicleId) {
        const activeVeh = this.vehicles.find((v) => v.id === this.player.activeVehicleId);
        if (activeVeh) {
          activeVeh.zone = portal.targetZone;
          activeVeh.x = portal.targetX;
          activeVeh.y = portal.targetY;
        }
      }

      soundManager.playLevelUp();
      const zoneInfo = WORLD_DIMENSIONS[portal.targetZone];
      this.showNotification(`✨ Stepped through portal to ${zoneInfo.name}!`);
      this.spawnTextParticle(portal.targetX, portal.targetY - 25, zoneInfo.name.toUpperCase(), portal.color);
      return;
    }

    // 2. Animal Interaction (Trust & Taming System)
    if ('species' in this.hoveredInteractive) {
      const animal = this.hoveredInteractive as Animal;
      this.interactWithAnimal(animal);
      return;
    }

    // 3. Vehicle Mount / Dismount Interaction
    if ('speedBonus' in this.hoveredInteractive) {
      const vehicle = this.hoveredInteractive as Vehicle;
      if (this.player.activeVehicleId === vehicle.id) {
        this.dismountVehicle();
      } else {
        this.mountVehicle(vehicle.id);
      }
      return;
    }

    // 4. Kingdom Building Upgrade Interaction
    if ('benefit' in this.hoveredInteractive) {
      this.isKingdomOpen = true;
      return;
    }

    // 5. NPC Dialogue Interaction
    if ('dialogue' in this.hoveredInteractive) {
      const npc = this.hoveredInteractive as NPC;
      this.activeDialogueNpc = npc;
      return;
    }

    // 6. Farm Plot Harvest Interaction
    if ('cropType' in this.hoveredInteractive) {
      const plot = this.hoveredInteractive as FarmPlot;
      if (plot.state === 'ripe') {
        plot.state = 'growing';
        plot.timer = 18;

        let cropItem = ITEMS.crop_wheat;
        if (plot.cropType === 'carrot') cropItem = ITEMS.crop_carrot;
        if (plot.cropType === 'pumpkin') cropItem = ITEMS.crop_pumpkin;

        const count = 1 + Math.floor(Math.random() * 2);
        this.addItem(cropItem, count);
        this.gainExp(14);
        soundManager.playHarvest();

        this.updateQuestProgress('quest_farm_rations', 'obj_harvest_crops', count);
        this.spawnTextParticle(plot.x + 20, plot.y - 15, `+${count} ${cropItem.name}`, '#84cc16');
        this.showNotification(`Harvested ${count}x ${cropItem.name}!`);
      }
      return;
    }

    // 7. Mining Node Interaction
    if ('resourceType' in this.hoveredInteractive) {
      const node = this.hoveredInteractive as MiningNode;
      if (!node.depleted) {
        this.executePlayerAttack();
      }
      return;
    }

    // 8. Interactive Props
    const prop = this.hoveredInteractive as InteractiveProp;
    if (prop.type === 'well') {
      this.player.stats.hp = this.player.stats.maxHp;
      this.player.stats.stamina = this.player.stats.maxStamina;
      this.showNotification('Drank cold spring water. Health and stamina fully restored!');
      this.spawnTextParticle(prop.x + 20, prop.y - 15, 'RECOVERED +HP', '#38bdf8');
    } else if (prop.type === 'mine_gate') {
      this.player.currentZone = 'mine_cavern';
      this.player.x = 120;
      this.player.y = 440;
      this.showNotification('Entered Alden Mine Caverns. Rich mineral veins detected!');
      this.spawnTextParticle(this.player.x, this.player.y - 20, 'ALDEN MINE CAVERNS', '#c084fc');
    } else if (prop.type === 'mine_exit') {
      this.player.currentZone = 'overworld';
      this.player.x = 1840;
      this.player.y = 440;
      this.showNotification('Returned to Oakhaven Village.');
      this.spawnTextParticle(this.player.x, this.player.y - 20, 'OAKHAVEN VILLAGE', '#facc15');
    } else if (prop.id === 'prop_quest_pickaxe') {
      this.addItem(ITEMS.quest_item_pickaxe, 1);
      this.updateQuestProgress('quest_lost_pickaxe', 'obj_find_pickaxe', 1);
      this.showNotification("Recovered Douglas's Lost Pickaxe! Return it to Miner Douglas.");
      prop.x = -999;
    } else if (prop.type === 'chest') {
      if (!prop.isOpen) {
        prop.isOpen = true;
        this.player.gold += 50;
        this.gainExp(35);
        this.showNotification('Opened chest! Found 50 Gold coins.');
        soundManager.playCoinSound();
        this.spawnTextParticle(prop.x + 20, prop.y - 15, '+35 EXP · +50 GOLD', '#facc15');
      } else {
        this.showNotification('The chest is empty.');
      }
    } else if (prop.type === 'sign') {
      this.activeSignText = prop.text || 'Signpost';
    } else if (prop.type === 'dummy') {
      this.showNotification('Practice dummy: Strike with [J] or [Attack button] to train combos.');
    }
  }

  public interactWithAnimal(animal: Animal) {
    // Check favorite food
    if (animal.favoriteFood && this.hasItem(animal.favoriteFood)) {
      this.removeItem(animal.favoriteFood, 1);
      animal.trust = Math.min(100, animal.trust + 25);
      soundManager.playHarvest();
      this.spawnTextParticle(animal.x + 10, animal.y - 20, `+25 TRUST ❤️ (${animal.trust}/100)`, '#ec4899');
      this.showNotification(`Fed ${animal.name} their favorite treat! Trust rose to ${animal.trust}/100.`);
    } else if (animal.isInjured && (this.hasItem('potion_heal') || this.hasItem('potion_elixir'))) {
      if (!this.removeItem('potion_heal', 1)) {
        this.removeItem('potion_elixir', 1);
      }
      animal.isInjured = false;
      animal.health = animal.maxHealth;
      animal.trust = Math.min(100, animal.trust + 35);
      soundManager.playLevelUp();
      this.spawnTextParticle(animal.x + 10, animal.y - 20, `HEALED! +35 TRUST ❤️ (${animal.trust}/100)`, '#22c55e');
      this.showNotification(`Tended to ${animal.name}'s wounds with restorative salve! Trust surged to ${animal.trust}/100.`);
    } else {
      animal.trust = Math.min(100, animal.trust + 5);
      soundManager.playInteract();
      this.spawnTextParticle(animal.x + 10, animal.y - 20, `+5 TRUST ❤️ (${animal.trust}/100)`, '#f472b6');
      this.showNotification(`Gently soothed ${animal.name}. Trust is ${animal.trust}/100.`);
    }

    if (animal.trust >= 80 && !animal.isCompanion) {
      animal.isCompanion = true;
      this.exploration.tamedAnimalsCount++;
      soundManager.playQuestComplete();
      this.showNotification(`🌟 ${animal.name} formed a loyal bond! They are now your faithful companion and will fight with you!`);
      this.spawnTextParticle(animal.x + 10, animal.y - 35, 'LOYAL COMPANION UNLOCKED!', '#eab308');
    }
  }

  public mountVehicle(vehicleId: string) {
    const veh = this.vehicles.find((v) => v.id === vehicleId);
    if (!veh) return;
    this.player.activeVehicleId = vehicleId;
    veh.isMounted = true;
    soundManager.playEquipSound();
    this.showNotification(`Mounted ${veh.name}! Movement speed & armor heavily amplified.`);
    this.spawnTextParticle(this.player.x + 10, this.player.y - 25, 'MOUNTED VEHICLE', '#0284c7');
  }

  public dismountVehicle() {
    if (!this.player.activeVehicleId) return;
    const veh = this.vehicles.find((v) => v.id === this.player.activeVehicleId);
    if (veh) veh.isMounted = false;
    this.player.activeVehicleId = null;
    soundManager.playEquipSound();
    this.showNotification('Dismounted vehicle.');
  }

  public fastTravelPortal(portalId: string): boolean {
    const portal = this.portals.find((p) => p.id === portalId);
    if (!portal || !portal.discovered) {
      this.showNotification('Portal is not yet discovered on your map!');
      return false;
    }
    this.player.currentZone = portal.targetZone;
    this.player.x = portal.targetX;
    this.player.y = portal.targetY;
    this.player.vx = 0;
    this.player.vy = 0;
    if (this.player.activeVehicleId) {
      const activeVeh = this.vehicles.find((v) => v.id === this.player.activeVehicleId);
      if (activeVeh) {
        activeVeh.zone = portal.targetZone;
        activeVeh.x = portal.targetX;
        activeVeh.y = portal.targetY;
      }
    }
    soundManager.playLevelUp();
    const zoneInfo = WORLD_DIMENSIONS[portal.targetZone];
    this.showNotification(`Warped to ${zoneInfo.name}!`);
    this.spawnTextParticle(portal.targetX, portal.targetY - 25, zoneInfo.name.toUpperCase(), portal.color);
    return true;
  }

  public upgradeKingdomBuilding(type: KingdomBuildingType): boolean {
    const b = this.kingdom.buildings.find((item) => item.type === type);
    if (!b) return false;
    if (b.level >= b.maxLevel) {
      this.showNotification(`${b.name} has already reached maximum level!`);
      return false;
    }
    const cost = b.cost;
    if (this.kingdom.wood < cost.wood) {
      this.showNotification(`Need ${cost.wood} Timber! (Have: ${this.kingdom.wood})`);
      return false;
    }
    if (this.kingdom.iron < cost.iron) {
      this.showNotification(`Need ${cost.iron} Iron! (Have: ${this.kingdom.iron})`);
      return false;
    }
    if (this.player.gold < cost.gold) {
      this.showNotification(`Need ${cost.gold} Gold! (Have: ${this.player.gold})`);
      return false;
    }
    if (cost.crystals && this.kingdom.crystals < cost.crystals) {
      this.showNotification(`Need ${cost.crystals} Crystals! (Have: ${this.kingdom.crystals})`);
      return false;
    }
    if (cost.techScrap && this.kingdom.techScrap < cost.techScrap) {
      this.showNotification(`Need ${cost.techScrap} Tech Scrap! (Have: ${this.kingdom.techScrap})`);
      return false;
    }

    this.kingdom.wood -= cost.wood;
    this.kingdom.iron -= cost.iron;
    this.player.gold -= cost.gold;
    if (cost.crystals) this.kingdom.crystals -= cost.crystals;
    if (cost.techScrap) this.kingdom.techScrap -= cost.techScrap;

    b.level += 1;
    this.kingdom.level = Math.max(this.kingdom.level, b.level);
    this.kingdom.population += 6;
    this.kingdom.dailyTaxGold += 15;
    soundManager.playLevelUp();
    this.showNotification(`🏰 Upgraded ${b.name} to Level ${b.level}! City population and tax income increased.`);
    return true;
  }

  public setFactionAlignment(alignment: 'neutral' | 'modern' | 'magic') {
    this.factionWar.playerFactionAlignment = alignment;
    if (alignment === 'modern') {
      this.factionWar.modernMorale = Math.min(100, this.factionWar.modernMorale + 10);
      this.showNotification('Aligned with Neo-Veridia! Modern tech forces treat you as a strategic ally.');
    } else if (alignment === 'magic') {
      this.factionWar.magicMorale = Math.min(100, this.factionWar.magicMorale + 10);
      this.showNotification('Aligned with Aetheria! Arcane spellweavers welcome you to the High Spire.');
    } else {
      this.showNotification('Declared Kingdom Neutrality! Equal trade open with all civilizations.');
    }
  }

  public influenceWarDiplomacy(action: 'peace' | 'support_modern' | 'support_magic') {
    if (action === 'peace') {
      this.factionWar.status = 'ceasefire';
      this.factionWar.tensionLevel = Math.max(10, this.factionWar.tensionLevel - 30);
      this.showNotification('🕊 Brokered a diplomatic ceasefire between Neo-Veridia and Aetheria!');
    } else if (action === 'support_modern') {
      this.factionWar.status = 'war';
      this.factionWar.modernMorale = Math.min(100, this.factionWar.modernMorale + 15);
      this.factionWar.tensionLevel = Math.min(100, this.factionWar.tensionLevel + 20);
      this.showNotification('Supplied ammunition & rations to Neo-Veridia! Modern military morale elevated.');
    } else if (action === 'support_magic') {
      this.factionWar.status = 'war';
      this.factionWar.magicMorale = Math.min(100, this.factionWar.magicMorale + 15);
      this.factionWar.tensionLevel = Math.min(100, this.factionWar.tensionLevel + 20);
      this.showNotification('Channeled mana crystals to Aetheria! High Spire forces reinforced.');
    }
  }

  // ==========================================
  // INVENTORY & ECONOMY METHODS
  // ==========================================
  public hasItem(itemId: string, count: number = 1): boolean {
    const entry = this.player.inventory.find((i) => i.item.id === itemId);
    return !!entry && entry.quantity >= count;
  }

  public addItem(item: Item, quantity: number = 1) {
    const existing = this.player.inventory.find((i) => i.item.id === item.id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      this.player.inventory.push({ item, quantity });
    }
  }

  public removeItem(itemId: string, quantity: number = 1): boolean {
    const existing = this.player.inventory.find((i) => i.item.id === itemId);
    if (!existing || existing.quantity < quantity) return false;

    existing.quantity -= quantity;
    if (existing.quantity <= 0) {
      this.player.inventory = this.player.inventory.filter((i) => i.item.id !== itemId);
    }
    return true;
  }

  public buyItem(item: Item): boolean {
    if (this.player.gold < item.value) {
      this.showNotification('Not enough Gold!');
      return false;
    }

    this.player.gold -= item.value;
    this.addItem(item, 1);
    soundManager.playCoinSound();
    this.showNotification(`Purchased ${item.name} for ${item.value} Gold.`);
    return true;
  }

  public sellItem(item: Item, quantity: number = 1): boolean {
    if (!this.removeItem(item.id, quantity)) {
      return false;
    }

    const earnings = Math.round(item.value * 0.8) * quantity;
    this.player.gold += earnings;
    soundManager.playCoinSound();
    this.showNotification(`Sold ${quantity}x ${item.name} for ${earnings} Gold.`);
    return true;
  }

  public craftEquipment(recipe: CraftingRecipe): boolean {
    if (this.player.gold < recipe.requiredGold) {
      this.showNotification('Not enough Gold for forging fee!');
      return false;
    }

    // Check materials
    for (const mat of recipe.requiredMaterials) {
      if (!this.hasItem(mat.item.id, mat.quantity)) {
        this.showNotification(`Missing materials: need ${mat.quantity}x ${mat.item.name}!`);
        return false;
      }
    }

    // Consume materials & gold
    this.player.gold -= recipe.requiredGold;
    for (const mat of recipe.requiredMaterials) {
      this.removeItem(mat.item.id, mat.quantity);
    }

    this.addItem(recipe.resultItem, 1);
    this.gainExp(35);
    soundManager.playSwordClash();
    soundManager.playCoinSound();
    this.showNotification(`Blacksmith Torin forged: ${recipe.resultItem.name}!`);
    return true;
  }

  public useItem(item: Item) {
    if (item.type === 'food' || item.type === 'crop' || item.type === 'potion') {
      if (!this.removeItem(item.id, 1)) return;

      const healAmount = item.statBonus?.hp || 20;
      this.player.stats.hp = Math.min(this.player.stats.maxHp, this.player.stats.hp + healAmount);
      soundManager.playHarvest();
      this.spawnTextParticle(this.player.x + 10, this.player.y - 25, `+${healAmount} HP`, '#22c55e');
      this.showNotification(`Consumed ${item.name}. Restored ${healAmount} HP.`);
    } else if (item.type === 'equipment' && item.slot) {
      // Equip item
      soundManager.playEquipSound();
      const currentSlot = item.slot;
      const currentEquipped = this.player.equipped[currentSlot];

      if (currentEquipped) {
        this.addItem(currentEquipped, 1);
      }
      this.removeItem(item.id, 1);
      this.player.equipped[currentSlot] = item;
      this.recalculateStats();
      this.showNotification(`Equipped ${item.name}!`);
    }
  }

  public unequip(slot: 'weapon' | 'shield' | 'armor') {
    const item = this.player.equipped[slot];
    if (item) {
      this.player.equipped[slot] = null;
      this.addItem(item, 1);
      this.recalculateStats();
      soundManager.playEquipSound();
      this.showNotification(`Unequipped ${item.name}.`);
    }
  }

  public recalculateStats() {
    let atk = INITIAL_PLAYER_STATS.attackPower + (this.player.stats.level - 1) * 5;
    let def = INITIAL_PLAYER_STATS.defense;
    let bonusHp = 0;

    const { weapon, shield, armor } = this.player.equipped;
    if (weapon?.statBonus?.attack) atk += weapon.statBonus.attack;
    if (shield?.statBonus?.defense) def += shield.statBonus.defense;
    if (shield?.statBonus?.maxHp) bonusHp += shield.statBonus.maxHp;
    if (armor?.statBonus?.defense) def += armor.statBonus.defense;
    if (armor?.statBonus?.maxHp) bonusHp += armor.statBonus.maxHp;

    this.player.stats.attackPower = atk;
    this.player.stats.defense = def;
    this.player.stats.maxHp = INITIAL_PLAYER_STATS.maxHp + (this.player.stats.level - 1) * 20 + bonusHp;
  }

  // ==========================================
  // QUEST PROGRESSION METHODS
  // ==========================================
  public updateQuestProgress(questId: string, objectiveId: string, amount: number = 1) {
    const quest = this.player.quests.find((q) => q.id === questId);
    if (!quest || quest.status === 'completed') return;

    const obj = quest.objectives.find((o) => o.id === objectiveId);
    if (obj) {
      obj.current = Math.min(obj.required, obj.current + amount);
      if (obj.current >= obj.required) {
        obj.isDone = true;
      }
    }
  }

  public turnInQuest(questId: string): boolean {
    const quest = this.player.quests.find((q) => q.id === questId);
    if (!quest || quest.status === 'completed') return false;

    // Check all objectives done
    const allDone = quest.objectives.every((o) => o.current >= o.required);
    if (!allDone) {
      this.showNotification('Quest objectives not yet finished!');
      return false;
    }

    // Deduct items if quest required delivery
    if (questId === 'quest_iron_forge') {
      if (!this.removeItem('ore_iron', 5)) {
        this.showNotification('Need 5 Iron Ore in your inventory to turn in!');
        return false;
      }
    } else if (questId === 'quest_lost_pickaxe') {
      this.removeItem('quest_item_pickaxe', 1);
    } else if (questId === 'quest_builder_timber') {
      if (!this.removeItem('mat_wood', 4)) {
        this.showNotification('Need 4 Oak Timber in your inventory to turn in!');
        return false;
      }
    } else if (questId === 'quest_sentry_rations') {
      if (!this.removeItem('food_stew', 1)) {
        this.showNotification("Need 1 Wayfarer's Stew in your inventory to turn in!");
        return false;
      }
    }

    quest.status = 'completed';
    this.player.gold += quest.reward.gold;
    this.gainExp(quest.reward.exp);

    if (quest.reward.itemReward) {
      const rewardItem = ITEMS[quest.reward.itemReward.id];
      if (rewardItem) {
        this.addItem(rewardItem, quest.reward.itemReward.quantity);
      }
    }

    soundManager.playQuestComplete();
    soundManager.playCoinSound();
    this.showNotification(`Quest Completed: ${quest.title}! +${quest.reward.gold} Gold, +${quest.reward.exp} EXP`);
    return true;
  }

  public gainExp(amount: number) {
    const { stats } = this.player;
    stats.exp += amount;

    if (stats.exp >= stats.maxExp) {
      stats.level += 1;
      stats.exp -= stats.maxExp;
      stats.maxExp = Math.round(stats.maxExp * 1.5);
      this.recalculateStats();
      stats.hp = stats.maxHp;

      soundManager.playLevelUp();
      this.camera.triggerShake(10, 0.35);
      this.showNotification(`Level Up! Kaelen reached Level ${stats.level}!`);
      this.spawnTextParticle(this.player.x + 10, this.player.y - 30, 'LEVEL UP!', '#22c55e');
    }
  }

  private resolveCollisions() {
    const p = this.player;
    const px = p.x;
    const py = p.y + p.height - 20;
    const pw = p.width;
    const ph = 20;

    for (const c of WORLD_COLLIDERS) {
      if (c.zone && c.zone !== p.currentZone) continue;

      if (px < c.x + c.w && px + pw > c.x && py < c.y + c.h && py + ph > c.y) {
        const overlapL = px + pw - c.x;
        const overlapR = c.x + c.w - px;
        const overlapT = py + ph - c.y;
        const overlapB = c.y + c.h - py;

        const minOverlap = Math.min(overlapL, overlapR, overlapT, overlapB);

        if (minOverlap === overlapL) {
          p.x = c.x - pw;
          p.vx = 0;
        } else if (minOverlap === overlapR) {
          p.x = c.x + c.w;
          p.vx = 0;
        } else if (minOverlap === overlapT) {
          p.y = c.y - p.height;
          p.vy = 0;
        } else if (minOverlap === overlapB) {
          p.y = c.y + c.h - p.height + 20;
          p.vy = 0;
        }
      }
    }
  }

  private updateHoveredInteractive() {
    const px = this.player.x + this.player.width / 2;
    const py = this.player.y + this.player.height / 2;
    const interactRadius = 80;

    let closest: InteractiveTarget | null = null;
    let closestDist = interactRadius;

    // 1. Check King Alden IV on Royal Throne in overworld
    if (this.player.currentZone === 'overworld' && this.king) {
      const kw = this.king.width || 48;
      const kh = this.king.height || 48;
      const kingDist = Math.hypot(px - (this.king.x + kw / 2), py - (this.king.y + kh / 2));
      if (kingDist < closestDist) {
        closest = this.king;
        closestDist = kingDist;
      }
    }

    // 2. Check Living Kingdom Villagers in overworld
    if (this.player.currentZone === 'overworld' && this.villagers) {
      for (const v of this.villagers) {
        const vw = v.width || 32;
        const vh = v.height || 48;
        const vDist = Math.hypot(px - (v.x + vw / 2), py - (v.y + vh / 2));
        if (vDist < closestDist) {
          closest = v;
          closestDist = vDist;
        }
      }
    }

    // 3. Check Magical Cat Companion
    if (this.catCompanion && this.catCompanion.zone === this.player.currentZone) {
      const catDist = Math.hypot(px - (this.catCompanion.x + 16), py - (this.catCompanion.y + 14));
      if (catDist < closestDist) {
        closest = this.catCompanion;
        closestDist = catDist;
      }
    }

    // 4. Check Portals in current zone
    for (const portal of this.portals) {
      if (portal.sourceZone === this.player.currentZone) {
        const portalDist = Math.hypot(px - (portal.x + portal.width / 2), py - (portal.y + portal.height / 2));
        if (portalDist < closestDist) {
          closest = portal;
          closestDist = portalDist;
        }
      }
    }

    // 5. Check Animals in current zone
    for (const animal of this.animals) {
      if (animal.zone === this.player.currentZone && animal.health > 0) {
        const aDist = Math.hypot(px - (animal.x + animal.width / 2), py - (animal.y + animal.height / 2));
        if (aDist < closestDist) {
          closest = animal;
          closestDist = aDist;
        }
      }
    }

    // 6. Check Vehicles in current zone
    for (const veh of this.vehicles) {
      if (veh.zone === this.player.currentZone && !veh.isMounted) {
        const vDist = Math.hypot(px - (veh.x + 20), py - (veh.y + 20));
        if (vDist < closestDist) {
          closest = veh;
          closestDist = vDist;
        }
      }
    }

    // 7. Check NPCs in current zone
    for (const npc of this.npcs) {
      const isCavern = npc.id === 'npc_miner_cole';
      if (this.player.currentZone === 'mine_cavern' && !isCavern) continue;
      if (this.player.currentZone === 'overworld' && isCavern) continue;

      const dist = Math.hypot(px - (npc.x + npc.width / 2), py - (npc.y + npc.height / 2));
      if (dist < closestDist) {
        closest = npc;
        closestDist = dist;
      }
    }

    // 8. Check Props in current zone
    for (const prop of this.props) {
      const isCavernProp = prop.type === 'mine_exit' || prop.id === 'prop_quest_pickaxe';
      if (this.player.currentZone === 'mine_cavern' && !isCavernProp) continue;
      if (this.player.currentZone === 'overworld' && isCavernProp) continue;

      const dist = Math.hypot(px - (prop.x + prop.width / 2), py - (prop.y + prop.height / 2));
      if (dist < closestDist) {
        closest = prop;
        closestDist = dist;
      }
    }

    // 9. Check Mining Nodes (if in cavern)
    if (this.player.currentZone === 'mine_cavern') {
      for (const node of this.miningNodes) {
        if (!node.depleted) {
          const dist = Math.hypot(px - (node.x + node.width / 2), py - (node.y + node.height / 2));
          if (dist < closestDist) {
            closest = node;
            closestDist = dist;
          }
        }
      }
    }

    // 10. Check Farm Plots (if in overworld)
    if (this.player.currentZone === 'overworld') {
      for (const plot of this.farmPlots) {
        if (plot.state === 'ripe') {
          const dist = Math.hypot(px - (plot.x + 20), py - (plot.y + 20));
          if (dist < closestDist) {
            closest = plot;
            closestDist = dist;
          }
        }
      }
    }

    this.hoveredInteractive = closest;
  }

  private updateProps(dt: number) {
    for (const prop of this.props) {
      if (prop.type === 'dummy' && prop.recoil) {
        prop.recoil *= Math.pow(0.01, dt);
        if (Math.abs(prop.recoil) < 0.01) {
          prop.recoil = 0;
        }
      }
    }
  }

  private initAmbientParticles() {
    for (let i = 0; i < 35; i++) {
      this.particles.push({
        x: Math.random() * WORLD_WIDTH,
        y: Math.random() * WORLD_HEIGHT,
        vx: 15 + Math.random() * 25,
        vy: 10 + Math.random() * 15,
        size: 3 + Math.random() * 3,
        color: Math.random() > 0.5 ? '#84cc16' : '#eab308',
        alpha: 0.3 + Math.random() * 0.4,
        life: Math.random() * 8,
        maxLife: 8,
        type: 'leaf',
      });
    }
  }

  private updateParticles(dt: number) {
    const boundW = this.player.currentZone === 'mine_cavern' ? MINE_CAVERN_WIDTH : WORLD_WIDTH;
    const boundH = this.player.currentZone === 'mine_cavern' ? MINE_CAVERN_HEIGHT : WORLD_HEIGHT;

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      if (p.type === 'leaf') {
        p.vx = 20 + Math.sin(p.life * 2) * 15;
        if (p.x > boundW) p.x = 0;
        if (p.y > boundH) p.y = 0;
      } else {
        p.alpha = Math.max(0, 1 - p.life / p.maxLife);
        if (p.life >= p.maxLife) {
          this.particles.splice(i, 1);
        }
      }
    }
  }

  private spawnDust(x: number, y: number) {
    for (let i = 0; i < 3; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 12,
        y: y + (Math.random() - 0.5) * 4,
        vx: (Math.random() - 0.5) * 20,
        vy: -10 - Math.random() * 10,
        size: 3 + Math.random() * 2,
        color: '#78716c',
        alpha: 0.6,
        life: 0,
        maxLife: 0.35,
        type: 'dust',
      });
    }
  }

  private spawnHitSparks(x: number, y: number, isCrit: boolean) {
    const count = isCrit ? 10 : 6;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 90;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 3,
        color: isCrit ? '#38bdf8' : '#f59e0b',
        alpha: 1,
        life: 0,
        maxLife: 0.25,
        type: 'spark',
      });
    }
  }

  private spawnTextParticle(x: number, y: number, text: string, color: string) {
    this.particles.push({
      x,
      y,
      vx: 0,
      vy: -35,
      size: 16,
      color,
      alpha: 1,
      life: 0,
      maxLife: 0.85,
      type: 'text',
      text,
    });
  }

  public showNotification(text: string) {
    this.notificationText = text;
    this.notificationTimer = 3.5;
  }

  public getTimeOfDay(): { timeString: string; phase: 'morning' | 'noon' | 'sunset' | 'night' } {
    const hours = Math.floor(this.gameTime / 60);
    const mins = Math.floor(this.gameTime % 60);
    const hh = hours.toString().padStart(2, '0');
    const mm = mins.toString().padStart(2, '0');
    const timeString = `${hh}:${mm}`;

    let phase: 'morning' | 'noon' | 'sunset' | 'night' = 'morning';
    if (hours >= 5 && hours < 11) phase = 'morning';
    else if (hours >= 11 && hours < 17) phase = 'noon';
    else if (hours >= 17 && hours < 21) phase = 'sunset';
    else phase = 'night';

    return { timeString, phase };
  }
}
