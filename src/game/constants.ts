import {
  NPC,
  InteractiveProp,
  RectCollider,
  PlayerStats,
  Item,
  MiningNode,
  FarmPlot,
  Quest,
  CraftingRecipe,
} from './types';
import { STAGE3_ITEMS, STAGE3_RECIPES } from './stage3_data';

export const WORLD_WIDTH = 3200;
export const WORLD_HEIGHT = 2200;

export const MINE_CAVERN_WIDTH = 1400;
export const MINE_CAVERN_HEIGHT = 900;

export const INITIAL_PLAYER_STATS: PlayerStats = {
  name: 'Kaelen',
  level: 1,
  hp: 100,
  maxHp: 100,
  stamina: 80,
  maxStamina: 80,
  mana: 100,
  maxMana: 100,
  exp: 0,
  maxExp: 100,
  attackPower: 15,
  defense: 4,
  summonCapacity: 1,
  powerPoints: 1,
};

export const INITIAL_PLAYER_POS = {
  x: 1250,
  y: 1140,
};

// ==========================================
// STAGE 2 ITEMS CATALOG
// ==========================================
export const ITEMS: Record<string, Item> = {
  // Ores & Minerals
  ore_coal: {
    id: 'ore_coal',
    name: 'Lump of Coal',
    type: 'ore',
    description: 'High-temperature fuel mined from the deep mountain veins.',
    value: 6,
    icon: 'coal',
  },
  ore_copper: {
    id: 'ore_copper',
    name: 'Copper Ore',
    type: 'ore',
    description: 'Raw malleable copper ore, suitable for alloy smelting.',
    value: 12,
    icon: 'copper',
  },
  ore_iron: {
    id: 'ore_iron',
    name: 'Iron Ore',
    type: 'ore',
    description: 'Dense dark iron chunk, vital for weapons and armor forging.',
    value: 20,
    icon: 'iron',
  },
  ore_gold: {
    id: 'ore_gold',
    name: 'Gold Ore',
    type: 'ore',
    description: 'Gleaming raw gold ore with rich mineral flecks.',
    value: 45,
    icon: 'gold',
  },
  ore_crystal: {
    id: 'ore_crystal',
    name: 'Sky Crystal',
    type: 'ore',
    description: 'A luminous, rare resonant crystal found in cavern fissures.',
    value: 80,
    icon: 'crystal',
  },

  // Crops & Food
  crop_wheat: {
    id: 'crop_wheat',
    name: 'Golden Wheat',
    type: 'crop',
    description: 'Sun-dried grain harvested from the village farmland.',
    value: 8,
    icon: 'wheat',
    statBonus: { hp: 10 },
  },
  crop_carrot: {
    id: 'crop_carrot',
    name: 'Sweet Carrot',
    type: 'crop',
    description: 'Crisp root vegetable grown by Farmer Leah.',
    value: 10,
    icon: 'carrot',
    statBonus: { hp: 20 },
  },
  crop_pumpkin: {
    id: 'crop_pumpkin',
    name: 'Hearth Pumpkin',
    type: 'crop',
    description: 'Plump autumn pumpkin, hearty and nourishing.',
    value: 18,
    icon: 'pumpkin',
    statBonus: { hp: 35 },
  },
  food_bread: {
    id: 'food_bread',
    name: 'Fresh Village Bread',
    type: 'food',
    description: 'Crusty loaf freshly baked with Oakhaven wheat.',
    value: 15,
    icon: 'bread',
    statBonus: { hp: 45 },
  },
  food_stew: {
    id: 'food_stew',
    name: "Wayfarer's Stew",
    type: 'food',
    description: 'Simmered broth packed with root vegetables and wild mushrooms.',
    value: 30,
    icon: 'stew',
    statBonus: { hp: 80 },
  },

  // Tools & Materials
  tool_pickaxe: {
    id: 'tool_pickaxe',
    name: "Sturdy Miner's Pickaxe",
    type: 'tool',
    description: 'Reinforced iron pick that strikes mining veins with heavy force.',
    value: 45,
    icon: 'pickaxe',
    statBonus: { attack: 4 },
  },
  mat_wood: {
    id: 'mat_wood',
    name: 'Oak Timber',
    type: 'material',
    description: 'Solid felled log harvested from the Whispering Woods.',
    value: 8,
    icon: 'wood',
  },
  quest_item_pickaxe: {
    id: 'quest_item_pickaxe',
    name: "Douglas's Lost Pickaxe",
    type: 'tool',
    description: 'Miner Douglas left his cherished grandfather pickaxe in the shaft.',
    value: 20,
    icon: 'quest_pickaxe',
  },

  // Potions & Healing
  potion_heal: {
    id: 'potion_heal',
    name: 'Herbal Salve',
    type: 'potion',
    description: 'Soothing poultice brewed with moon-ferns by Alchemist Fiona.',
    value: 25,
    icon: 'potion',
    statBonus: { hp: 60 },
  },
  potion_elixir: {
    id: 'potion_elixir',
    name: 'Vitality Elixir',
    type: 'potion',
    description: 'Potent restorative tonic restoring health and battle focus.',
    value: 55,
    icon: 'elixir',
    statBonus: { hp: 120 },
  },

  // Equipment: Weapons
  eq_iron_sword: {
    id: 'eq_iron_sword',
    name: 'Forged Iron Blade',
    type: 'equipment',
    description: 'Balanced steel-edged short sword crafted by Torin.',
    value: 70,
    icon: 'sword_iron',
    slot: 'weapon',
    statBonus: { attack: 12 },
  },
  eq_steel_sword: {
    id: 'eq_steel_sword',
    name: 'Alden Claymore',
    type: 'equipment',
    description: 'Two-handed tempered steel blade delivering sweeping cleaves.',
    value: 150,
    icon: 'sword_steel',
    slot: 'weapon',
    statBonus: { attack: 24 },
  },
  eq_wood_axe: {
    id: 'eq_wood_axe',
    name: "Woodcutter's Hatchet",
    type: 'equipment',
    description: 'Sharp felling axe capable of hewing timber and foes alike.',
    value: 55,
    icon: 'axe_wood',
    slot: 'weapon',
    statBonus: { attack: 9 },
  },
  eq_battle_axe: {
    id: 'eq_battle_axe',
    name: 'Iron Battle Axe',
    type: 'equipment',
    description: 'Heavy double-bearded axe built for crushing blows.',
    value: 135,
    icon: 'axe_battle',
    slot: 'weapon',
    statBonus: { attack: 21 },
  },

  // Equipment: Shields
  eq_oak_shield: {
    id: 'eq_oak_shield',
    name: 'Oak Round Shield',
    type: 'equipment',
    description: 'Reinforced timber buckler bound with bronze bands.',
    value: 45,
    icon: 'shield_oak',
    slot: 'shield',
    statBonus: { defense: 6, maxHp: 15 },
  },
  eq_iron_shield: {
    id: 'eq_iron_shield',
    name: 'Iron Kite Shield',
    type: 'equipment',
    description: 'Heavy knightly shield offering superior guarding protection.',
    value: 110,
    icon: 'shield_iron',
    slot: 'shield',
    statBonus: { defense: 14, maxHp: 35 },
  },

  // Equipment: Armor
  eq_leather_armor: {
    id: 'eq_leather_armor',
    name: 'Traveler Leather Tunic',
    type: 'equipment',
    description: 'Tough boiled leather vest lined with wool padding.',
    value: 60,
    icon: 'armor_leather',
    slot: 'armor',
    statBonus: { defense: 8, maxHp: 25 },
  },
  eq_iron_armor: {
    id: 'eq_iron_armor',
    name: 'Garrison Steel Hauberk',
    type: 'equipment',
    description: 'Riveted steel chainmail with breastplate reinforcements.',
    value: 160,
    icon: 'armor_steel',
    slot: 'armor',
    statBonus: { defense: 18, maxHp: 65 },
  },
  ...STAGE3_ITEMS,
};

// Blacksmith Crafting Recipes
export const BLACKSMITH_RECIPES: CraftingRecipe[] = [
  {
    id: 'craft_iron_sword',
    resultItem: ITEMS.eq_iron_sword,
    requiredGold: 35,
    requiredMaterials: [
      { item: ITEMS.ore_iron, quantity: 4 },
      { item: ITEMS.ore_coal, quantity: 2 },
    ],
  },
  {
    id: 'craft_steel_sword',
    resultItem: ITEMS.eq_steel_sword,
    requiredGold: 75,
    requiredMaterials: [
      { item: ITEMS.ore_iron, quantity: 8 },
      { item: ITEMS.ore_coal, quantity: 5 },
      { item: ITEMS.ore_gold, quantity: 1 },
    ],
  },
  {
    id: 'craft_battle_axe',
    resultItem: ITEMS.eq_battle_axe,
    requiredGold: 65,
    requiredMaterials: [
      { item: ITEMS.ore_iron, quantity: 6 },
      { item: ITEMS.mat_wood, quantity: 3 },
      { item: ITEMS.ore_coal, quantity: 3 },
    ],
  },
  {
    id: 'craft_oak_shield',
    resultItem: ITEMS.eq_oak_shield,
    requiredGold: 25,
    requiredMaterials: [
      { item: ITEMS.mat_wood, quantity: 4 },
      { item: ITEMS.ore_copper, quantity: 2 },
    ],
  },
  {
    id: 'craft_iron_shield',
    resultItem: ITEMS.eq_iron_shield,
    requiredGold: 60,
    requiredMaterials: [
      { item: ITEMS.ore_iron, quantity: 6 },
      { item: ITEMS.ore_copper, quantity: 3 },
    ],
  },
  {
    id: 'craft_iron_armor',
    resultItem: ITEMS.eq_iron_armor,
    requiredGold: 90,
    requiredMaterials: [
      { item: ITEMS.ore_iron, quantity: 10 },
      { item: ITEMS.ore_coal, quantity: 5 },
    ],
  },
  {
    id: 'craft_pickaxe',
    resultItem: ITEMS.tool_pickaxe,
    requiredGold: 20,
    requiredMaterials: [
      { item: ITEMS.ore_iron, quantity: 3 },
      { item: ITEMS.mat_wood, quantity: 2 },
    ],
  },
  ...STAGE3_RECIPES,
];

// Merchant Shop Catalog (Merchant Elian)
export const MERCHANT_SHOP_ITEMS: Item[] = [
  ITEMS.food_bread,
  ITEMS.food_stew,
  ITEMS.crop_carrot,
  ITEMS.crop_pumpkin,
  ITEMS.potion_heal,
  ITEMS.potion_elixir,
  ITEMS.tool_pickaxe,
  ITEMS.eq_leather_armor,
  ITEMS.eq_wood_axe,
];

// ==========================================
// STAGE 2 QUEST SYSTEM
// ==========================================
export const INITIAL_QUESTS: Quest[] = [
  {
    id: 'quest_iron_forge',
    title: 'Iron for the Anvil',
    giver: 'Torin Ironhand',
    description: 'Blacksmith Torin requires quality iron ore to forge blades for the frontier sentries.',
    objectives: [
      {
        id: 'obj_iron',
        description: 'Mine and deliver 5 Iron Ore to Torin',
        current: 0,
        required: 5,
        isDone: false,
      },
    ],
    reward: {
      gold: 60,
      exp: 45,
      itemReward: { id: 'eq_iron_sword', name: 'Forged Iron Blade', quantity: 1 },
    },
    status: 'available',
  },
  {
    id: 'quest_lost_pickaxe',
    title: 'The Lost Mining Tool',
    giver: 'Miner Douglas',
    description: "Douglas misplaced his grandfather's heirloom pickaxe in the deep mine cavern. Retrieve it for him.",
    objectives: [
      {
        id: 'obj_find_pickaxe',
        description: "Find Douglas's Pickaxe inside the mine cavern",
        current: 0,
        required: 1,
        isDone: false,
      },
    ],
    reward: {
      gold: 50,
      exp: 40,
      itemReward: { id: 'tool_pickaxe', name: "Sturdy Miner's Pickaxe", quantity: 1 },
    },
    status: 'available',
  },
  {
    id: 'quest_farm_rations',
    title: 'Harvest for the Hearth',
    giver: 'Farmer Barnaby',
    description: 'Help the village farmers harvest fresh crops from the field.',
    objectives: [
      {
        id: 'obj_harvest_crops',
        description: 'Harvest 4 crops from the village farm plots',
        current: 0,
        required: 4,
        isDone: false,
      },
    ],
    reward: {
      gold: 40,
      exp: 35,
      itemReward: { id: 'food_bread', name: 'Fresh Village Bread', quantity: 2 },
    },
    status: 'available',
  },
  {
    id: 'quest_builder_timber',
    title: 'Timber for the Homestead',
    giver: 'Mason Cedric',
    description: 'Builder Cedric is framing a new frontier cottage and needs sturdy oak timber.',
    objectives: [
      {
        id: 'obj_wood',
        description: 'Collect 4 Oak Timber from Silas or the forest',
        current: 0,
        required: 4,
        isDone: false,
      },
    ],
    reward: {
      gold: 55,
      exp: 40,
    },
    status: 'available',
  },
  {
    id: 'quest_sentry_rations',
    title: 'Warm Meal for the Sentry',
    giver: 'Sentry Jarek',
    description: 'Guard Jarek has been standing post since dawn and would appreciate warm stew.',
    objectives: [
      {
        id: 'obj_stew',
        description: "Deliver 1 Wayfarer's Stew to Sentry Jarek",
        current: 0,
        required: 1,
        isDone: false,
      },
    ],
    reward: {
      gold: 45,
      exp: 30,
    },
    status: 'available',
  },
];

// ==========================================
// STAGE 2 EXPANDED LIVING VILLAGERS
// ==========================================
export const INITIAL_NPCS: NPC[] = [
  // 1. Village Elder
  {
    id: 'npc_elder',
    name: 'Elder Brandon',
    role: 'Village Elder',
    job: 'Community Leader',
    personality: 'Wise, observant, and patient.',
    dailyActivity: 'Overseeing the village square and blessing travelers.',
    x: 1220,
    y: 1040,
    width: 38,
    height: 52,
    avatarColor: '#64748b',
    facing: 'right',
    waypoints: [
      { x: 1220, y: 1040, pauseDuration: 8 },
      { x: 1310, y: 1070, pauseDuration: 6 },
      { x: 1260, y: 1120, pauseDuration: 7 },
    ],
    currentWaypointIndex: 0,
    waypointTimer: 0,
    dialogue: [
      "Greetings, traveler Kaelen. Oakhaven breathes with life today.",
      "Our farmers tend the southern fields, miners delve into the cavern, and Merchant Elian trades at the square.",
      "Find honest work, aid our folk with quests, and grow your strength."
    ],
    currentDialogueIndex: 0,
  },

  // 2. Blacksmith
  {
    id: 'npc_smith',
    name: 'Torin Ironhand',
    role: 'Village Blacksmith',
    job: 'Weapon & Armor Smelter',
    personality: 'Gruff, hearty, and values true craftsmanship.',
    dailyActivity: 'Stoking the forge hearth and hammering glowing ingots.',
    x: 1460,
    y: 930,
    width: 44,
    height: 54,
    avatarColor: '#b45309',
    facing: 'left',
    isBlacksmith: true,
    questId: 'quest_iron_forge',
    waypoints: [
      { x: 1460, y: 930, pauseDuration: 12 },
      { x: 1480, y: 900, pauseDuration: 6 },
    ],
    currentWaypointIndex: 0,
    waypointTimer: 0,
    dialogue: [
      "Clang! The iron sings when the bellows run hot. Welcome to my smithy, wanderer.",
      "Bring me mined iron, copper, and coal. I'll pay honest Gold for metals or forge you sharp steel blades and shields!",
      "I have a quest if your arms are strong enough: I need 5 iron ores from the mountain cavern."
    ],
    currentDialogueIndex: 0,
  },

  // 3. Merchant
  {
    id: 'npc_merchant',
    name: 'Merchant Elian',
    role: 'Market Trader',
    job: 'General Merchant',
    personality: 'Cheerful, sharp-eyed, and always ready to barter.',
    dailyActivity: 'Managing the colorful village marketplace stall.',
    x: 1330,
    y: 1170,
    width: 40,
    height: 52,
    avatarColor: '#d97706',
    facing: 'left',
    isMerchant: true,
    waypoints: [
      { x: 1330, y: 1170, pauseDuration: 10 },
      { x: 1360, y: 1190, pauseDuration: 7 },
    ],
    currentWaypointIndex: 0,
    waypointTimer: 0,
    dialogue: [
      "Finest goods in the valley! Fresh baked loaves, mining tools, and healing salves!",
      "I buy any surplus ores, crops, or timber you gather on your journeys. Fair prices guaranteed!",
      "Browse my wares whenever your coin pouch jingles."
    ],
    currentDialogueIndex: 0,
  },

  // 4. Farmer Barnaby (Senior Farmer)
  {
    id: 'npc_farmer_barnaby',
    name: 'Farmer Barnaby',
    role: 'Elder Farmer',
    job: 'Crop Cultivator',
    personality: 'Humble, weather-worn, and grateful for good rain.',
    dailyActivity: 'Tending the wheat fields with his trusty wooden rake.',
    x: 880,
    y: 1480,
    width: 40,
    height: 52,
    avatarColor: '#65a30d',
    facing: 'right',
    questId: 'quest_farm_rations',
    waypoints: [
      { x: 880, y: 1480, pauseDuration: 6 },
      { x: 940, y: 1490, pauseDuration: 7 },
      { x: 910, y: 1530, pauseDuration: 6 },
    ],
    currentWaypointIndex: 0,
    waypointTimer: 0,
    dialogue: [
      "Good morning, son! Soil is rich this season.",
      "Our wheat and carrots nourish the whole valley. Feel free to harvest ripe crops when you pass by.",
      "If you lend a hand gathering 4 crops, I'll reward you with warm bread and shiny coin!"
    ],
    currentDialogueIndex: 0,
  },

  // 5. Farmer Leah (Vegetable Grower)
  {
    id: 'npc_farmer_leah',
    name: 'Farmer Leah',
    role: 'Produce Tender',
    job: 'Vegetable Grower',
    personality: 'Energetic, cheerful, and loves growing pumpkins.',
    dailyActivity: 'Watering sweet carrots and inspecting ripe pumpkin patches.',
    x: 1030,
    y: 1510,
    width: 36,
    height: 50,
    avatarColor: '#84cc16',
    facing: 'left',
    waypoints: [
      { x: 1030, y: 1510, pauseDuration: 6 },
      { x: 990, y: 1540, pauseDuration: 7 },
      { x: 1060, y: 1500, pauseDuration: 6 },
    ],
    currentWaypointIndex: 0,
    waypointTimer: 0,
    dialogue: [
      "Watch your step around the pumpkin vines! They grow wild and sweet.",
      "Raw vegetables give an adventurer quick stamina and vitality on long treks.",
      "Elian pays good gold for fresh farm produce at the market square!"
    ],
    currentDialogueIndex: 0,
  },

  // 6. Miner Douglas (Veteran Miner)
  {
    id: 'npc_miner_douglas',
    name: 'Miner Douglas',
    role: 'Senior Excavator',
    job: 'Deep-Vein Miner',
    personality: 'Rugged, superstitious about cavern echoes, but generous.',
    dailyActivity: 'Sorting raw ores and checking mine cart rails.',
    x: 1810,
    y: 430,
    width: 42,
    height: 54,
    avatarColor: '#78716c',
    facing: 'left',
    questId: 'quest_lost_pickaxe',
    waypoints: [
      { x: 1810, y: 430, pauseDuration: 8 },
      { x: 1860, y: 390, pauseDuration: 6 },
      { x: 1830, y: 450, pauseDuration: 7 },
    ],
    currentWaypointIndex: 0,
    waypointTimer: 0,
    dialogue: [
      "Watch the cavern ceiling, friend! The Alden shaft runs deep into granite bedrock.",
      "You can enter the mine cavern right here! Swing your strikes at the ore nodes to break off coal, copper, iron, and gold.",
      "Blast it all... I dropped my grandfather's heirloom pickaxe deeper down the tunnel. If you recover it, I'll reward you handsomely!"
    ],
    currentDialogueIndex: 0,
  },

  // 7. Miner Cole (Inside Cavern Sentry)
  {
    id: 'npc_miner_cole',
    name: 'Miner Cole',
    role: 'Shaft Prospector',
    job: 'Gem Sifter',
    personality: 'Quiet, observant, and fascinated by rare glowing crystals.',
    dailyActivity: 'Tapping cavern walls for hollow crystal chambers.',
    x: 480,
    y: 320, // Located inside mine cavern zone!
    width: 40,
    height: 52,
    avatarColor: '#57534e',
    facing: 'right',
    dialogue: [
      "Echoes down here never sleep. See those glowing purple shards in the rocks? Rare Sky Crystals.",
      "They sell for a fortune to merchants and alchemists alike.",
      "Keep an eye out for coal and iron as well. Break the veins and collect your reward."
    ],
    currentDialogueIndex: 0,
  },

  // 8. Woodcutter Silas
  {
    id: 'npc_woodcutter',
    name: 'Silas Broadaxe',
    role: 'Lumberjack',
    job: 'Forest Woodcutter',
    personality: 'Stoic, burly, and respects the ancient woods.',
    dailyActivity: 'Cleaving fallen logs into sturdy building timber.',
    x: 2020,
    y: 1190,
    width: 44,
    height: 56,
    avatarColor: '#854d0e',
    facing: 'left',
    waypoints: [
      { x: 2020, y: 1190, pauseDuration: 8 },
      { x: 2050, y: 1220, pauseDuration: 7 },
    ],
    currentWaypointIndex: 0,
    waypointTimer: 0,
    dialogue: [
      "Timber! Only hew the dry pine and deadwood—the Whispering Woods do not forgive greed.",
      "I supply oak timber to Mason Cedric and Blacksmith Torin. Sturdy wood makes solid shields.",
      "Feel free to collect loose wood logs stacked by my chopping block."
    ],
    currentDialogueIndex: 0,
  },

  // 9. Fisherman Ronen
  {
    id: 'npc_fisherman',
    name: 'Fisherman Ronen',
    role: 'River Angler',
    job: 'Freshwater Fisherman',
    personality: 'Relaxed, hums quiet river tunes, and loves peace.',
    dailyActivity: 'Casting lines into the village pond by the southern willow.',
    x: 1140,
    y: 1550,
    width: 38,
    height: 52,
    avatarColor: '#0284c7',
    facing: 'right',
    waypoints: [
      { x: 1140, y: 1550, pauseDuration: 12 },
      { x: 1170, y: 1570, pauseDuration: 8 },
    ],
    currentWaypointIndex: 0,
    waypointTimer: 0,
    dialogue: [
      "Patience, young wanderer... the silver trout bite best when the ripples are calm.",
      "The cool breeze off the pond cleanses the spirit after a long day of road walking.",
      "A peaceful community like Oakhaven is rare in these troubled times."
    ],
    currentDialogueIndex: 0,
  },

  // 10. Builder Cedric
  {
    id: 'npc_builder',
    name: 'Mason Cedric',
    role: 'Master Builder',
    job: 'Village Carpenter & Mason',
    personality: 'Pragmatic, ambitious, and proud of his stone walls.',
    dailyActivity: 'Framing roof beams and setting stone footings.',
    x: 1540,
    y: 1340,
    width: 42,
    height: 54,
    avatarColor: '#d97706',
    facing: 'left',
    questId: 'quest_builder_timber',
    waypoints: [
      { x: 1540, y: 1340, pauseDuration: 8 },
      { x: 1570, y: 1310, pauseDuration: 6 },
    ],
    currentWaypointIndex: 0,
    waypointTimer: 0,
    dialogue: [
      "Level and true—that is how we build in Alden. A house must weather winter frost.",
      "We're erecting a new storehouse for the autumn harvest.",
      "I am in dire need of 4 Oak Timbers. Bring them to me and I will pay you 55 Gold and valuable building experience!"
    ],
    currentDialogueIndex: 0,
  },

  // 11. Alchemist Fiona
  {
    id: 'npc_healer',
    name: 'Alchemist Fiona',
    role: 'Village Apothecary',
    job: 'Herbal Healer',
    personality: 'Gentle, scholarly, and fascinated by rare flora.',
    dailyActivity: 'Grinding herbs in a stone mortar and boiling restorative teas.',
    x: 960,
    y: 910,
    width: 36,
    height: 50,
    avatarColor: '#9333ea',
    facing: 'right',
    waypoints: [
      { x: 960, y: 910, pauseDuration: 10 },
      { x: 990, y: 940, pauseDuration: 7 },
    ],
    currentWaypointIndex: 0,
    waypointTimer: 0,
    dialogue: [
      "A wounded fighter is no use to the realm. Rest here a moment, Kaelen.",
      "I blend wild herbs and spring water into restorative salves. Keep a potion handy when delving into dark shafts.",
      "The old village well also radiates miraculous healing energy. Never forget to drink deeply!"
    ],
    currentDialogueIndex: 0,
  },

  // 12. Sentry Jarek (Village Patrol)
  {
    id: 'npc_sentry_jarek',
    name: 'Sentry Jarek',
    role: 'Patrol Guard',
    job: 'Town Watchman',
    personality: 'Vigilant, hungry on long shifts, and loyal.',
    dailyActivity: 'Patrolling the southern boundary road and village crossroads.',
    x: 1280,
    y: 1280,
    width: 40,
    height: 54,
    avatarColor: '#2563eb',
    facing: 'right',
    questId: 'quest_sentry_rations',
    waypoints: [
      { x: 1280, y: 1280, pauseDuration: 5 },
      { x: 1390, y: 1140, pauseDuration: 6 },
      { x: 1220, y: 1240, pauseDuration: 5 },
    ],
    currentWaypointIndex: 0,
    waypointTimer: 0,
    dialogue: [
      "All clear along the southern perimeter. Keep moving, citizen.",
      "Captain Roderick has us on double watch since the tremors began.",
      "A warm hunter's stew would do wonders for my stamina right now..."
    ],
    currentDialogueIndex: 0,
  },

  // 13. Wayfarer Corin (Traveler)
  {
    id: 'npc_traveler',
    name: 'Wayfarer Corin',
    role: 'Wandering Bard',
    job: 'Traveler & Chronicler',
    personality: 'Curious, cheerful, and loves sharing tales of distant kingdoms.',
    dailyActivity: 'Resting by the tavern porch, tuning his traveler lute.',
    x: 1060,
    y: 1270,
    width: 38,
    height: 52,
    avatarColor: '#ec4899',
    facing: 'right',
    waypoints: [
      { x: 1060, y: 1270, pauseDuration: 10 },
      { x: 1010, y: 1230, pauseDuration: 6 },
    ],
    currentWaypointIndex: 0,
    waypointTimer: 0,
    dialogue: [
      "Ah, a fellow wanderer with the road in their eyes! Greetings, Kaelen.",
      "Beyond this quiet valley lies the vast continent of Alden—grand fortresses, royal knights, and ancient ruins.",
      "Treasure this peaceful village stage; true martial tests await in the chapters to come."
    ],
    currentDialogueIndex: 0,
  },

  // 14. Guard Kael (Mine Sentry)
  {
    id: 'npc_guard',
    name: 'Guard Kael',
    role: 'Mine Sentry',
    job: 'Mountain Watch',
    personality: 'Cautious and dutiful.',
    dailyActivity: 'Guarding the rocky approach to the Alden Mine.',
    x: 1840,
    y: 410,
    width: 40,
    height: 54,
    avatarColor: '#3b82f6',
    facing: 'right',
    waypoints: [
      { x: 1840, y: 410, pauseDuration: 8 },
      { x: 1880, y: 430, pauseDuration: 6 },
    ],
    currentWaypointIndex: 0,
    waypointTimer: 0,
    dialogue: [
      "Halt! Beyond these timbers lies the Old Alden Mine.",
      "The lower shafts were reinforced with torches and rail ties. Step into the portal arch if you dare explore the cavern!",
      "Captain Roderick is stationed right beside the arch. Speak with him if you seek trial by combat!"
    ],
    currentDialogueIndex: 0,
  },

  // 15. Guard Captain Roderick (Mine Commander)
  {
    id: 'npc_captain',
    name: 'Guard Captain Roderick',
    role: 'Mine Commander & Weapon Master',
    job: 'Garrison Commander',
    personality: 'Proud, martial, and respects courage.',
    dailyActivity: 'Inspecting the barricade and testing young warriors in honorable duels.',
    x: 1960,
    y: 400,
    width: 48,
    height: 62,
    avatarColor: '#991b1b',
    facing: 'left',
    canDuel: true,
    dialogue: [
      "Halt, wanderer! I am Guard Captain Roderick, commander of the Alden frontier garrison.",
      "These mountain shafts harbor rich ore and ancient stone. Only those who can withstand my heavy steel blade may claim mastery over the frontier.",
      "Draw your stance, Kaelen! Let us test your fighting spirit in an honorable duel!"
    ],
    currentDialogueIndex: 0,
  },

  // 16. Mira the Forager
  {
    id: 'npc_mira',
    name: 'Mira the Forager',
    role: 'Herbalist & Scout',
    job: 'Wildland Forager',
    personality: 'Keen senses and attuned to nature.',
    dailyActivity: 'Gathering wild mint and inspecting pine thickets.',
    x: 2060,
    y: 1120,
    width: 36,
    height: 50,
    avatarColor: '#15803d',
    facing: 'left',
    waypoints: [
      { x: 2060, y: 1120, pauseDuration: 7 },
      { x: 2110, y: 1150, pauseDuration: 6 },
    ],
    currentWaypointIndex: 0,
    waypointTimer: 0,
    dialogue: [
      "Shh... listen to the pines. The Whispering Forest is alive today.",
      "I gather moon-ferns and wild mint along this road. Be mindful if you stray into the thickets.",
      "If you ever run low on vitality, drink from the old stone well in the village square."
    ],
    currentDialogueIndex: 0,
  },
];

// ==========================================
// STAGE 2 MINING NODES (Inside Mine Cavern)
// ==========================================
export const INITIAL_MINING_NODES: MiningNode[] = [
  {
    id: 'node_coal_1',
    resourceType: 'coal',
    name: 'Coal Deposit',
    x: 240,
    y: 320,
    width: 46,
    height: 42,
    hp: 40,
    maxHp: 40,
    depleted: false,
    respawnTimer: 0,
    color: '#334155',
  },
  {
    id: 'node_copper_1',
    resourceType: 'copper',
    name: 'Copper Vein',
    x: 460,
    y: 240,
    width: 48,
    height: 44,
    hp: 55,
    maxHp: 55,
    depleted: false,
    respawnTimer: 0,
    color: '#b45309',
  },
  {
    id: 'node_iron_1',
    resourceType: 'iron',
    name: 'Iron Bedrock Vein',
    x: 720,
    y: 360,
    width: 52,
    height: 48,
    hp: 75,
    maxHp: 75,
    depleted: false,
    respawnTimer: 0,
    color: '#94a3b8',
  },
  {
    id: 'node_iron_2',
    resourceType: 'iron',
    name: 'Iron Seam',
    x: 910,
    y: 480,
    width: 50,
    height: 46,
    hp: 75,
    maxHp: 75,
    depleted: false,
    respawnTimer: 0,
    color: '#94a3b8',
  },
  {
    id: 'node_gold_1',
    resourceType: 'gold',
    name: 'Gilded Ore Seam',
    x: 1040,
    y: 280,
    width: 48,
    height: 44,
    hp: 90,
    maxHp: 90,
    depleted: false,
    respawnTimer: 0,
    color: '#eab308',
  },
  {
    id: 'node_crystal_1',
    resourceType: 'crystal',
    name: 'Sky Crystal Cluster',
    x: 1200,
    y: 380,
    width: 52,
    height: 52,
    hp: 110,
    maxHp: 110,
    depleted: false,
    respawnTimer: 0,
    color: '#c084fc',
  },
];

// ==========================================
// STAGE 2 FARM PLOTS (Village South-West)
// ==========================================
export const INITIAL_FARM_PLOTS: FarmPlot[] = [
  {
    id: 'plot_wheat_1',
    x: 860,
    y: 1440,
    cropType: 'wheat',
    state: 'ripe',
    timer: 0,
  },
  {
    id: 'plot_wheat_2',
    x: 940,
    y: 1440,
    cropType: 'wheat',
    state: 'ripe',
    timer: 0,
  },
  {
    id: 'plot_carrot_1',
    x: 1020,
    y: 1440,
    cropType: 'carrot',
    state: 'ripe',
    timer: 0,
  },
  {
    id: 'plot_carrot_2',
    x: 900,
    y: 1510,
    cropType: 'carrot',
    state: 'ripe',
    timer: 0,
  },
  {
    id: 'plot_pumpkin_1',
    x: 980,
    y: 1510,
    cropType: 'pumpkin',
    state: 'ripe',
    timer: 0,
  },
  {
    id: 'plot_pumpkin_2',
    x: 1060,
    y: 1510,
    cropType: 'pumpkin',
    state: 'ripe',
    timer: 0,
  },
];

// ==========================================
// INTERACTIVE PROPS
// ==========================================
export const INITIAL_PROPS: InteractiveProp[] = [
  {
    id: 'prop_dummy',
    type: 'dummy',
    name: 'Training Dummy',
    x: 1640,
    y: 1090,
    width: 40,
    height: 60,
    hitHp: 100,
    maxHitHp: 100,
    recoil: 0,
    text: 'A sturdy straw-and-timber combat dummy. Test your attacks here!',
  },
  {
    id: 'prop_well',
    type: 'well',
    name: 'Oakhaven Spring Well',
    x: 1280,
    y: 1080,
    width: 50,
    height: 50,
    text: 'Cold, restorative spring water. Drink to replenish full HP and Stamina!',
  },
  {
    id: 'prop_chest',
    type: 'chest',
    name: "Traveler's Stash",
    x: 1040,
    y: 1330,
    width: 42,
    height: 36,
    isOpen: false,
    text: 'An unlocked wooden chest left near the tavern.',
  },
  {
    id: 'prop_sign_center',
    type: 'sign',
    name: 'Crossroads Signpost',
    x: 1400,
    y: 1140,
    width: 32,
    height: 48,
    text: '← Oakhaven Village Square | Whispering Woods → | North Mine Pass ↑ | South Farmland ↓',
  },
  {
    id: 'prop_mine_sign',
    type: 'sign',
    name: 'Mine Caution Notice',
    x: 1840,
    y: 430,
    width: 32,
    height: 48,
    text: 'ALDEN MINE SHAFT 1: Active excavation. Wear helmet. Step into portal arch to enter cavern.',
  },
  {
    id: 'prop_mine_entrance',
    type: 'mine_gate',
    name: 'Mine Shaft Cavern Entrance',
    x: 1910,
    y: 350,
    width: 60,
    height: 50,
    text: 'Portal into the subterranean Alden Mine Cavern. Step in to mine ore!',
  },
  {
    id: 'prop_mine_exit',
    type: 'mine_exit',
    name: 'Mine Shaft Exit Portal',
    x: 80,
    y: 420,
    width: 50,
    height: 50,
    text: 'Return to the surface village of Oakhaven.',
  },
  {
    id: 'prop_quest_pickaxe',
    type: 'sign',
    name: "Douglas's Lost Pickaxe",
    x: 680,
    y: 520, // inside mine cavern!
    width: 32,
    height: 32,
    text: "Douglas's heirloom mining tool. Pick it up to complete his quest!",
  },
];

export interface HouseStructure {
  id: string;
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  roofColor: string;
  wallColor: string;
  doorX: number;
  hasChimney: boolean;
}

export const HOUSES: HouseStructure[] = [
  {
    id: 'house_elder',
    name: "Elder's Cottage",
    x: 980,
    y: 840,
    w: 160,
    h: 120,
    roofColor: '#78350f',
    wallColor: '#e2d9cc',
    doorX: 1050,
    hasChimney: true,
  },
  {
    id: 'house_smith',
    name: "Torin's Smithy",
    x: 1430,
    y: 850,
    w: 180,
    h: 130,
    roofColor: '#991b1b',
    wallColor: '#cbd5e1',
    doorX: 1510,
    hasChimney: true,
  },
  {
    id: 'house_tavern',
    name: "Wayfarer's Tavern",
    x: 930,
    y: 1220,
    w: 200,
    h: 140,
    roofColor: '#854d0e',
    wallColor: '#f1f5f9',
    doorX: 1010,
    hasChimney: true,
  },
  {
    id: 'house_cottage',
    name: 'Valley Homestead',
    x: 1510,
    y: 1280,
    w: 150,
    h: 110,
    roofColor: '#1e3a8a',
    wallColor: '#e2e8f0',
    doorX: 1570,
    hasChimney: false,
  },
];

export interface StaticTree {
  x: number;
  y: number;
  radius: number;
  type: 'oak' | 'pine';
}

export const FOREST_TREES: StaticTree[] = [
  { x: 2150, y: 700, radius: 46, type: 'pine' },
  { x: 2280, y: 640, radius: 52, type: 'pine' },
  { x: 2420, y: 720, radius: 48, type: 'oak' },
  { x: 2560, y: 610, radius: 55, type: 'pine' },
  { x: 2700, y: 680, radius: 50, type: 'pine' },
  { x: 2840, y: 740, radius: 58, type: 'oak' },
  { x: 2200, y: 900, radius: 50, type: 'oak' },
  { x: 2360, y: 880, radius: 54, type: 'pine' },
  { x: 2520, y: 940, radius: 52, type: 'oak' },
  { x: 2680, y: 890, radius: 56, type: 'pine' },
  { x: 2860, y: 920, radius: 60, type: 'pine' },
  { x: 2240, y: 1120, radius: 48, type: 'pine' },
  { x: 2400, y: 1140, radius: 54, type: 'oak' },
  { x: 2580, y: 1180, radius: 50, type: 'pine' },
  { x: 2740, y: 1100, radius: 56, type: 'pine' },
  { x: 2900, y: 1150, radius: 52, type: 'oak' },
  { x: 2180, y: 1350, radius: 52, type: 'oak' },
  { x: 2350, y: 1380, radius: 50, type: 'pine' },
  { x: 2540, y: 1420, radius: 58, type: 'pine' },
  { x: 2720, y: 1360, radius: 54, type: 'oak' },
  { x: 2920, y: 1400, radius: 62, type: 'pine' },
  { x: 2300, y: 1600, radius: 55, type: 'pine' },
  { x: 2500, y: 1650, radius: 52, type: 'oak' },
  { x: 2700, y: 1580, radius: 58, type: 'pine' },
  { x: 2880, y: 1660, radius: 60, type: 'pine' },
  { x: 800, y: 800, radius: 46, type: 'oak' },
  { x: 740, y: 960, radius: 48, type: 'oak' },
  { x: 710, y: 1140, radius: 52, type: 'oak' },
  { x: 730, y: 1320, radius: 48, type: 'pine' },
  { x: 780, y: 1480, radius: 50, type: 'oak' },
  { x: 1200, y: 720, radius: 42, type: 'oak' },
  { x: 1340, y: 710, radius: 44, type: 'oak' },
  { x: 1680, y: 760, radius: 46, type: 'pine' },
  { x: 1180, y: 1500, radius: 46, type: 'oak' },
  { x: 1380, y: 1520, radius: 50, type: 'oak' },
  { x: 1560, y: 1530, radius: 48, type: 'pine' },
  { x: 1650, y: 440, radius: 38, type: 'pine' },
  { x: 1720, y: 340, radius: 40, type: 'pine' },
  { x: 2060, y: 350, radius: 42, type: 'pine' },
  { x: 2160, y: 440, radius: 45, type: 'pine' },
  { x: 2280, y: 360, radius: 40, type: 'pine' },
];

export const WORLD_COLLIDERS: RectCollider[] = [
  // World bounds border walls
  { x: 0, y: 0, w: WORLD_WIDTH, h: 40, zone: 'overworld' },
  { x: 0, y: WORLD_HEIGHT - 40, w: WORLD_WIDTH, h: 40, zone: 'overworld' },
  { x: 0, y: 0, w: 40, h: WORLD_HEIGHT, zone: 'overworld' },
  { x: WORLD_WIDTH - 40, y: 0, w: 40, h: WORLD_HEIGHT, zone: 'overworld' },

  // Houses solid base colliders
  { x: 980, y: 880, w: 160, h: 80, zone: 'overworld' },
  { x: 1430, y: 890, w: 180, h: 90, zone: 'overworld' },
  { x: 930, y: 1270, w: 200, h: 90, zone: 'overworld' },
  { x: 1510, y: 1330, w: 150, h: 60, zone: 'overworld' },

  // Mine rock cliff face
  { x: 1680, y: 100, w: 680, h: 220, zone: 'overworld' },

  // Village well base
  { x: 1285, y: 1090, w: 40, h: 40, zone: 'overworld' },

  // Training yard fence
  { x: 1620, y: 1040, w: 140, h: 14, zone: 'overworld' },
  { x: 1750, y: 1040, w: 14, h: 120, zone: 'overworld' },

  // Mine Cavern boundaries
  { x: 0, y: 0, w: MINE_CAVERN_WIDTH, h: 50, zone: 'mine_cavern' },
  { x: 0, y: MINE_CAVERN_HEIGHT - 50, w: MINE_CAVERN_WIDTH, h: 50, zone: 'mine_cavern' },
  { x: 0, y: 0, w: 50, h: MINE_CAVERN_HEIGHT, zone: 'mine_cavern' },
  { x: MINE_CAVERN_WIDTH - 50, y: 0, w: 50, h: MINE_CAVERN_HEIGHT, zone: 'mine_cavern' },
];
