export type GameState = 'MENU' | 'PLAYING' | 'PAUSED';

export interface PlayerStats {
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  stamina: number;
  maxStamina: number;
  mana: number;
  maxMana: number;
  exp: number;
  maxExp: number;
  attackPower: number;
  defense: number;
  summonCapacity: number;
  powerPoints: number;
}

export type ItemType = 'ore' | 'food' | 'tool' | 'equipment' | 'crop' | 'potion' | 'material';

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  description: string;
  value: number; // gold price
  icon: string;
  statBonus?: {
    attack?: number;
    hp?: number;
    maxHp?: number;
    defense?: number;
  };
  slot?: 'weapon' | 'shield' | 'armor';
}

export interface InventoryItem {
  item: Item;
  quantity: number;
}

export interface EquippedGear {
  weapon: Item | null;
  shield: Item | null;
  armor: Item | null;
}

export interface QuestObjective {
  id: string;
  description: string;
  current: number;
  required: number;
  isDone: boolean;
}

export interface Quest {
  id: string;
  title: string;
  giver: string;
  description: string;
  objectives: QuestObjective[];
  reward: {
    gold: number;
    exp: number;
    itemReward?: { id: string; name: string; quantity: number };
  };
  status: 'available' | 'active' | 'completed';
}

export interface MiningNode {
  id: string;
  resourceType: 'coal' | 'copper' | 'iron' | 'gold' | 'crystal';
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  depleted: boolean;
  respawnTimer: number;
  color: string;
}

export interface FarmPlot {
  id: string;
  x: number;
  y: number;
  cropType: 'wheat' | 'pumpkin' | 'carrot';
  state: 'growing' | 'ripe';
  timer: number;
}

export interface CraftingRecipe {
  id: string;
  resultItem: Item;
  requiredGold: number;
  requiredMaterials: { item: Item; quantity: number }[];
}

export type WorldZone = 'overworld' | 'mine_cavern' | 'modern_city' | 'magic_realm' | 'ancient_ruins';

export interface Portal {
  id: string;
  name: string;
  sourceZone: WorldZone;
  x: number;
  y: number;
  width: number;
  height: number;
  targetZone: WorldZone;
  targetX: number;
  targetY: number;
  color: string;
  discovered: boolean;
  isLocked: boolean;
  unlockRequirement?: string;
  lore: string;
}

export type AnimalSpecies =
  | 'cat'
  | 'dog'
  | 'deer'
  | 'wolf'
  | 'bear'
  | 'hawk'
  | 'mana_stag'
  | 'cyber_hound';

export type AnimalPersonality = 'skittish' | 'playful' | 'aggressive' | 'protective' | 'regal' | 'loyal';

export interface Animal {
  id: string;
  name: string;
  species: AnimalSpecies;
  zone: WorldZone;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  facing: 'left' | 'right';
  health: number;
  maxHealth: number;
  personality: AnimalPersonality;
  trust: number; // 0 - 100
  isInjured: boolean;
  favoriteFood: string;
  behaviorState: 'idle' | 'wander' | 'flee' | 'alert' | 'follow' | 'attack' | 'sleep';
  stateTimer: number;
  walkFrame: number;
  isCompanion: boolean;
}

export type EnemyTier = 'weak' | 'normal' | 'strong' | 'rare' | 'boss';
export type EnemyFaction = 'wild' | 'modern_military' | 'arcane_cult' | 'shadow_raiders' | 'witch_coven';
export type EnemyCategory =
  | 'human_soldier'
  | 'bandit'
  | 'warrior'
  | 'archer'
  | 'knight'
  | 'monster'
  | 'hostile_animal'
  | 'magical_creature'
  | 'flying_creature'
  | 'bat'
  | 'witch'
  | 'elite'
  | 'boss';

export interface Enemy {
  id: string;
  name: string;
  tier: EnemyTier;
  category?: EnemyCategory;
  faction: EnemyFaction;
  zone: WorldZone;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  facing: 'left' | 'right';
  hp: number;
  maxHp: number;
  attackPower: number;
  defense: number;
  speed: number;
  aiState: 'patrol' | 'chase' | 'attack' | 'hurt' | 'retreat' | 'defeated';
  stateTimer: number;
  attackCooldown: number;
  walkFrame: number;
  specialAbility?:
    | 'laser'
    | 'fireball'
    | 'shield'
    | 'charge'
    | 'hex_bolt'
    | 'summon_bats'
    | 'teleport'
    | 'dive_slash'
    | 'sonic_screech';
  loot: { itemId: string; chance: number; amount: number }[];
  expReward: number;

  // Stage 5 Flying, Witch & Bat Enhancements
  isFlying?: boolean;
  flightAltitude?: number; // visual float height above ground (e.g. 25-50px)
  flightOscillation?: number;
  isDiving?: boolean;
  diveSpeed?: number;
  batVariant?: 'small' | 'large' | 'elite' | 'giant_boss';
  witchLevel?: 'beginner' | 'advanced' | 'elite' | 'commander' | 'boss';
  magicShieldHp?: number;
  magicShieldMax?: number;
  hasMagicShield?: boolean;
  teleportCooldown?: number;
  summonBatCooldown?: number;
  detectionRange?: number;
  attackRange?: number;
  difficultyLevel?: number;
  intelligence?: 'basic' | 'cautious' | 'tactical' | 'archmage';
  canCoordinate?: boolean;
  targetAllyId?: string | null;
}

// ==========================================
// STAGE 5: MAGICAL CAT COMPANION
// ==========================================
export interface MagicalCatCompanion {
  id: string;
  name: string;
  title: string;
  trust: number; // 0 - 100
  trustLevel: 'cautious' | 'curious' | 'supportive' | 'celestial_guardian';
  zone: WorldZone;
  x: number;
  y: number;
  vx: number;
  vy: number;
  facing: 'left' | 'right';
  health: number;
  maxHealth: number;
  isInjured: boolean;
  isFollowing: boolean;
  walkFrame: number;
  auraColor: string;
  favoriteFoods: string[];
  powersUnlocked: {
    alertDanger: boolean;       // Alerts with warning bubble & sound
    detectTreasure: boolean;    // Spots hidden chests & rare portals
    healingAura: boolean;       // Restores player HP over time
    swiftPaws: boolean;         // Grants player +25% move speed boost
    magicShield: boolean;       // Shimmers barrier deflecting 35 damage
    starlightClaws: boolean;    // Attacks hostile foes with starlight bursts
  };
  healAuraTimer: number;
  shieldCooldown: number;
  starlightAttackTimer: number;
  purrTimer: number;
  statusSpeech?: string;
  statusSpeechTimer?: number;

  // Convenient companion attributes
  isMagicalCat?: boolean;
  level?: number;
  currentAction?: 'following' | 'waiting' | 'scouting';
  specialAbilities?: {
    id: string;
    name: string;
    desc: string;
    unlocked: boolean;
    reqTrust: number;
  }[];
}

// ==========================================
// STAGE 5: LIVING KINGDOM, KING & VILLAGERS
// ==========================================
export interface KingDecree {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  effect: string;
  benefit?: string;
}

export interface KingState {
  id: string;
  name: string;
  title: string;
  zone: WorldZone;
  x: number;
  y: number;
  width?: number;
  height?: number;
  facing: 'left' | 'right';
  treasuryGold: number;
  foodStock: number;
  foodPerDay: number;
  foodConsumption: number;
  taxPolicy: 'low' | 'moderate' | 'high';
  settlementMorale: number; // 0 to 100
  populationGrowthTrend: 'growing' | 'stable' | 'declining';
  knightRank: string; // 'Apprentice' | 'Knight-Errant' | 'Crown Defender' | 'High Marshal'
  decrees: KingDecree[];
  royalDialogue: string[];
  dialogueIndex: number;

  // Convenient aliases for UI
  isSovereign?: boolean;
  treasury?: number;
  foodReserves?: number;
  securityMorale?: number;
}

export type VillagerProfession =
  | 'farmer'
  | 'merchant'
  | 'stonemason'
  | 'blacksmith'
  | 'guard'
  | 'scholar'
  | 'woodcutter'
  | 'baker';

export interface KingdomVillager {
  id: string;
  name: string;
  profession: VillagerProfession;
  personality: string;
  homeX: number;
  homeY: number;
  workplaceX: number;
  workplaceY: number;
  workplaceName: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  vx: number;
  vy: number;
  facing: 'left' | 'right';
  state: 'walking_to_work' | 'working' | 'walking_home' | 'resting' | 'fleeing';
  walkFrame: number;
  scheduleTimer: number;
  dailyProduction: string;
  speechBubble?: string;
  speechTimer?: number;

  // Living Kingdom narrative fields
  happiness?: number;
  home?: string;
  workplace?: string;
  schedule?: string;
  dialogue?: string;
  currentTask?: string;
  dailyContribution?: string;
}

export interface Vehicle {
  id: string;
  name: string;
  type: 'scout_buggy' | 'armored_apc' | 'mana_skiff';
  zone: WorldZone;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  facing: 'left' | 'right';
  speedBonus: number;
  defenseBonus: number;
  isMounted: boolean;
  color: string;
}

export type WarStatus = 'peace' | 'tension' | 'conflict' | 'war' | 'ceasefire';

export interface FactionWarState {
  status: WarStatus;
  tensionLevel: number; // 0 to 100
  modernMorale: number; // 0 to 100
  magicMorale: number;  // 0 to 100
  playerFactionAlignment: 'neutral' | 'modern' | 'magic';
  warNotice: string;
  activeSkirmishes: {
    zone: WorldZone;
    x: number;
    y: number;
    modernUnits: number;
    magicUnits: number;
  }[];
}

export type KingdomBuildingType =
  | 'town_hall'
  | 'workshop'
  | 'arcane_spire'
  | 'granary_farm'
  | 'barracks'
  | 'defense_turret';

export interface KingdomBuilding {
  type: KingdomBuildingType;
  name: string;
  level: number;
  maxLevel: number;
  x: number;
  y: number;
  w: number;
  h: number;
  cost: { wood: number; iron: number; gold: number; crystals?: number; techScrap?: number };
  description: string;
  benefit: string;
}

export interface KingdomState {
  cityName: string;
  level: number;
  wood: number;
  iron: number;
  techScrap: number;
  crystals: number;
  population: number;
  dailyTaxGold: number;
  buildings: KingdomBuilding[];
}

export interface ExplorationData {
  visitedZones: WorldZone[];
  discoveredPortals: string[];
  defeatedBosses: string[];
  tamedAnimalsCount: number;
}

export interface PlayerState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  facing: 'left' | 'right';
  isGrounded: boolean;
  isJumping: boolean;
  jumpZ: number; // visual Z height above ground for 2D top-down/platform hybrid jump
  vz: number;
  isRunning: boolean;
  isAttacking: boolean;
  attackTimer: number;
  attackCombo: number;
  walkFrame: number;
  stats: PlayerStats;
  gold: number;
  inventory: InventoryItem[];
  equipped: EquippedGear;
  quests: Quest[];
  currentZone: WorldZone;
  activeVehicleId?: string | null;
}

export interface Waypoint {
  x: number;
  y: number;
  pauseDuration: number;
}

export interface NPC {
  id: string;
  name: string;
  role: string;
  job: string;
  personality: string;
  dailyActivity: string;
  zone?: WorldZone;
  x: number;
  y: number;
  vx?: number;
  vy?: number;
  width: number;
  height: number;
  avatarColor: string;
  dialogue: string[];
  currentDialogueIndex: number;
  facing: 'left' | 'right';
  canDuel?: boolean;
  isMerchant?: boolean;
  isBlacksmith?: boolean;
  questId?: string;
  waypoints?: Waypoint[];
  currentWaypointIndex?: number;
  waypointTimer?: number;
  walkFrame?: number;
}

export interface CaptainBossState {
  isActive: boolean;
  name: string;
  title: string;
  hp: number;
  maxHp: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  facing: 'left' | 'right';
  state: 'idle' | 'chase' | 'windup' | 'attack' | 'hurt' | 'defeated';
  stateTimer: number;
  attackCooldown: number;
  walkFrame: number;
  damage: number;
  recoil: number;
}

export interface InteractiveProp {
  id: string;
  type: 'sign' | 'chest' | 'dummy' | 'well' | 'mine_gate' | 'mine_exit';
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text?: string;
  isOpen?: boolean;
  hitHp?: number;
  maxHitHp?: number;
  recoil?: number;
}

export type InteractiveTarget =
  | NPC
  | InteractiveProp
  | MiningNode
  | FarmPlot
  | Portal
  | Animal
  | Enemy
  | Vehicle
  | KingdomBuilding
  | MagicalCatCompanion
  | KingState
  | KingdomVillager;

export interface RectCollider {
  x: number;
  y: number;
  w: number;
  h: number;
  zone?: WorldZone;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  type?: 'leaf' | 'smoke' | 'spark' | 'text' | 'dust';
  text?: string;
}

export interface Camera {
  x: number;
  y: number;
  viewportWidth: number;
  viewportHeight: number;
  targetX: number;
  targetY: number;
  zoom: number;
  shakeTimer: number;
  shakeMagnitude: number;
  followSpeed: number;
}

export interface GameSettings {
  virtualControls: 'auto' | 'always' | 'hidden';
  soundEnabled: boolean;
  musicEnabled: boolean;
  volume: number;
  cameraSmoothness: 'smooth' | 'snappy';
}

export type WeatherType = 'clear' | 'rain' | 'snow';

export interface WeatherInfo {
  type: WeatherType;
  name: string;
  icon: string;
  description: string;
}

export interface SavedGame {
  player: {
    x: number;
    y: number;
    stats: PlayerStats;
    gold: number;
    inventory: InventoryItem[];
    equipped: EquippedGear;
    currentZone: WorldZone;
  };
  chestOpened: boolean;
  dummyDefeatedCount: number;
  quests: Quest[];
  discoveredPortals?: string[];
  kingdom?: KingdomState;
  warState?: FactionWarState;
  king?: KingState;
  villagers?: KingdomVillager[];
  catCompanion?: MagicalCatCompanion;
  exploration?: ExplorationData;
  unlockedPowerIds?: string[];
  unlockedSummonIds?: string[];
  weather?: WeatherType;
  savedAt: string;
}
