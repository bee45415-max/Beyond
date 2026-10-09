import { Item } from './types';

// ==========================================
// CHARACTER POWERS SYSTEM
// ==========================================
export interface CharacterPower {
  id: string;
  name: string;
  description: string;
  icon: string;
  level: number;
  maxLevel: number;
  manaCost: number;
  cooldown: number; // in seconds
  currentCooldown: number;
  damage: number;
  range: number;
  type: 'attack' | 'aoe' | 'defense' | 'dash' | 'heal';
  isUnlocked: boolean;
  unlockRequirement: string;
  upgradeCost: { exp: number; gold: number; crystals?: number; techScrap?: number };
}

export const INITIAL_CHARACTER_POWERS: CharacterPower[] = [
  {
    id: 'power_dash_strike',
    name: 'Thunder Dash Strike',
    description: 'Surge forward at blinding speed, phasing through foes and leaving a concussive shockwave.',
    icon: 'zap',
    level: 1,
    maxLevel: 5,
    manaCost: 20,
    cooldown: 4.0,
    currentCooldown: 0,
    damage: 35,
    range: 160,
    type: 'dash',
    isUnlocked: true, // Starting unlocked power!
    unlockRequirement: 'Innate martial reflex.',
    upgradeCost: { exp: 60, gold: 50 },
  },
  {
    id: 'power_astral_wave',
    name: 'Astral Starlight Wave',
    description: 'Unleash a wide crescent of concentrated celestial energy that cuts through multiple foes.',
    icon: 'sparkles',
    level: 1,
    maxLevel: 5,
    manaCost: 35,
    cooldown: 6.0,
    currentCooldown: 0,
    damage: 55,
    range: 220,
    type: 'aoe',
    isUnlocked: false,
    unlockRequirement: 'Discover the Aetherian Magic Realm or defeat Outlaw Grimjaw.',
    upgradeCost: { exp: 120, gold: 90, crystals: 2 },
  },
  {
    id: 'power_sanctuary_ward',
    name: 'Aegis Sanctuary Ward',
    description: 'Project a shimmering hexagonal barrier that deflects all damage and rapidly regenerates HP.',
    icon: 'shield',
    level: 1,
    maxLevel: 5,
    manaCost: 40,
    cooldown: 12.0,
    currentCooldown: 0,
    damage: 0,
    range: 80,
    type: 'defense',
    isUnlocked: false,
    unlockRequirement: 'Reach Player Level 3 and upgrade the Town Hall.',
    upgradeCost: { exp: 150, gold: 110, crystals: 3 },
  },
  {
    id: 'power_plasma_burst',
    name: 'Veridian Plasma Surge',
    description: 'Discharge an explosive modern kinetic charge that detonates in a fiery blast, heavily staggering enemies.',
    icon: 'flame',
    level: 1,
    maxLevel: 5,
    manaCost: 50,
    cooldown: 8.5,
    currentCooldown: 0,
    damage: 80,
    range: 180,
    type: 'attack',
    isUnlocked: false,
    unlockRequirement: 'Visit Neo-Veridia or fabricate modern tech electronic scrap.',
    upgradeCost: { exp: 200, gold: 150, techScrap: 4 },
  },
  {
    id: 'power_meteor_strike',
    name: 'Celestial Comet Impact',
    description: 'Call down an astral comet from the heavens upon target area, dealing cataclysmic damage.',
    icon: 'sun',
    level: 1,
    maxLevel: 5,
    manaCost: 75,
    cooldown: 16.0,
    currentCooldown: 0,
    damage: 130,
    range: 260,
    type: 'aoe',
    isUnlocked: false,
    unlockRequirement: 'Conquer the Colossus of Eternity or High Spellweaver Sylas.',
    upgradeCost: { exp: 350, gold: 280, crystals: 6 },
  },
];

// ==========================================
// SUMMONING SYSTEM (Fallen Warriors & Creatures)
// ==========================================
export interface SummonTemplate {
  id: string;
  name: string;
  sourceEnemyId: string;
  icon: string;
  tier: 'common' | 'rare' | 'epic' | 'boss';
  color: string;
  baseHp: number;
  baseAttack: number;
  baseDefense: number;
  baseSpeed: number;
  manaCost: number;
  duration: number; // in seconds
  specialAbility: string;
  level: number;
  exp: number;
  isUnlocked: boolean;
  unlockHint: string;
}

export const INITIAL_SUMMON_TEMPLATES: SummonTemplate[] = [
  {
    id: 'summon_forest_prowler',
    name: 'Phantom Forest Prowler',
    sourceEnemyId: 'enemy_goblin_1',
    icon: 'swords',
    tier: 'common',
    color: '#84cc16',
    baseHp: 65,
    baseAttack: 16,
    baseDefense: 6,
    baseSpeed: 120,
    manaCost: 30,
    duration: 65,
    specialAbility: 'Swift Ambush Flurry',
    level: 1,
    exp: 0,
    isUnlocked: true, // Starting summon unlocked upon early combat!
    unlockHint: 'Defeat wild forest prowlers in the whispering woods.',
  },
  {
    id: 'summon_timber_wolf',
    name: 'Spectral Timber Alpha',
    sourceEnemyId: 'wild_wolf_grey',
    icon: 'paw-print',
    tier: 'common',
    color: '#94a3b8',
    baseHp: 95,
    baseAttack: 22,
    baseDefense: 10,
    baseSpeed: 140,
    manaCost: 40,
    duration: 75,
    specialAbility: 'Howl of Haste (+20% Speed)',
    level: 1,
    exp: 0,
    isUnlocked: false,
    unlockHint: 'Befriend or defeat the wild timber wolf pack.',
  },
  {
    id: 'summon_recon_drone',
    name: 'Veridian Cyber-Drone',
    sourceEnemyId: 'enemy_drone_1',
    icon: 'radio',
    tier: 'rare',
    color: '#06b6d4',
    baseHp: 110,
    baseAttack: 26,
    baseDefense: 14,
    baseSpeed: 150,
    manaCost: 50,
    duration: 80,
    specialAbility: 'Ranged Pulse Laser Barrage',
    level: 1,
    exp: 0,
    isUnlocked: false,
    unlockHint: 'Defeat modern recon drones in Neo-Veridia.',
  },
  {
    id: 'summon_battle_mage',
    name: 'Arcane Starlight Apparition',
    sourceEnemyId: 'enemy_battle_mage',
    icon: 'sparkles',
    tier: 'rare',
    color: '#a855f7',
    baseHp: 130,
    baseAttack: 34,
    baseDefense: 12,
    baseSpeed: 115,
    manaCost: 60,
    duration: 85,
    specialAbility: 'Homing Mana Orbs',
    level: 1,
    exp: 0,
    isUnlocked: false,
    unlockHint: 'Defeat arcane spell-slingers in Aetheria.',
  },
  {
    id: 'summon_stone_sentinel',
    name: 'Ancient Precursor Automaton',
    sourceEnemyId: 'enemy_ruin_sentinel',
    icon: 'shield',
    tier: 'epic',
    color: '#f59e0b',
    baseHp: 240,
    baseAttack: 42,
    baseDefense: 28,
    baseSpeed: 85,
    manaCost: 80,
    duration: 95,
    specialAbility: 'Titan Shockwave Ground Slam',
    level: 1,
    exp: 0,
    isUnlocked: false,
    unlockHint: 'Defeat stone automatons in the Ancient Ruins.',
  },
  {
    id: 'summon_colossus_avatar',
    name: 'Avatar of the Eternal Colossus',
    sourceEnemyId: 'enemy_boss_colossus',
    icon: 'crown',
    tier: 'boss',
    color: '#e11d48',
    baseHp: 420,
    baseAttack: 62,
    baseDefense: 38,
    baseSpeed: 80,
    manaCost: 110,
    duration: 110,
    specialAbility: 'Cataclysmic Quake & Aura of Might',
    level: 1,
    exp: 0,
    isUnlocked: false,
    unlockHint: 'Overthrow the legendary Colossus of Eternity in the ruins nexus.',
  },
];

export interface ActiveSummon {
  id: string;
  templateId: string;
  name: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  facing: 'left' | 'right';
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  durationLeft: number;
  maxDuration: number;
  level: number;
  specialAbility: string;
  walkFrame: number;
  targetEnemyId: string | null;
  auraColor: string;
}

// ==========================================
// DYNAMIC WAR & CITY DEFENSE SYSTEM
// ==========================================
export interface CityDefender {
  id: string;
  name: string;
  type: 'infantry' | 'archer' | 'mech_sentry';
  x: number;
  y: number;
  vx: number;
  vy: number;
  facing: 'left' | 'right';
  hp: number;
  maxHp: number;
  attack: number;
  state: 'guard' | 'patrol' | 'combat' | 'resting';
  targetEnemyId: string | null;
  walkFrame: number;
}

export interface InvadingUnit {
  id: string;
  name: string;
  faction: 'shadow_raiders' | 'hostile_syndicate' | 'corrupted_arcane';
  x: number;
  y: number;
  vx: number;
  vy: number;
  facing: 'left' | 'right';
  hp: number;
  maxHp: number;
  attack: number;
  speed: number;
  walkFrame: number;
}

export interface DynamicWarEvent {
  phase: 'peace' | 'tension' | 'alert' | 'war' | 'ceasefire';
  timer: number;
  alertCountdown: number; // e.g. 20s warning before raid waves hit city gates
  warDuration: number;
  peaceDuration: number;
  attackingFaction: string;
  invadersRemaining: number;
  cityDefendersActive: number;
  cityGatesClosed: boolean;
  alertNotice: string | null;
  consequenceNotice: string | null;
  totalRaidsRepelled: number;
  totalLosses: number;
}

export const INITIAL_DYNAMIC_WAR: DynamicWarEvent = {
  phase: 'peace',
  timer: 0,
  alertCountdown: 0,
  warDuration: 0,
  peaceDuration: 180, // 3 minutes peace between possible alert triggers
  attackingFaction: 'Shadow Bandit Vanguard',
  invadersRemaining: 0,
  cityDefendersActive: 4,
  cityGatesClosed: false,
  alertNotice: null,
  consequenceNotice: null,
  totalRaidsRepelled: 0,
  totalLosses: 0,
};

// ==========================================
// CITY CITIZENS & CIVILIANS
// ==========================================
export interface CityCivilian {
  id: string;
  name: string;
  role: 'farmer' | 'builder' | 'merchant' | 'scholar' | 'citizen';
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  facing: 'left' | 'right';
  walkFrame: number;
  state: 'working' | 'walking' | 'trading' | 'fleeing';
  speechBubble?: string;
}

export const INITIAL_CITY_CIVILIANS: CityCivilian[] = [
  {
    id: 'civ_1',
    name: 'Eliza the Weaver',
    role: 'citizen',
    x: 1120,
    y: 1100,
    targetX: 1350,
    targetY: 1120,
    facing: 'right',
    walkFrame: 0,
    state: 'walking',
  },
  {
    id: 'civ_2',
    name: 'Gareth the Stonemason',
    role: 'builder',
    x: 620,
    y: 1120,
    targetX: 680,
    targetY: 1140,
    facing: 'left',
    walkFrame: 0,
    state: 'working',
  },
  {
    id: 'civ_3',
    name: 'Kora the Farmhand',
    role: 'farmer',
    x: 950,
    y: 1380,
    targetX: 1050,
    targetY: 1420,
    facing: 'right',
    walkFrame: 0,
    state: 'working',
  },
  {
    id: 'civ_4',
    name: 'Tobias the Merchant Assistant',
    role: 'merchant',
    x: 1220,
    y: 1040,
    targetX: 1290,
    targetY: 1060,
    facing: 'right',
    walkFrame: 0,
    state: 'trading',
  },
];
