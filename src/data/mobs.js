// MineRogue - Mob Definitions
// All 22+ mob types: passive, hostile, mini-bosses, and final boss

export const MOB_DEFS = [
  // ===== PASSIVE MOBS =====
  {
    type: 'cow',
    name: 'Cow',
    hp: 10,
    damage: 0,
    speed: 1.0,
    hostile: false,
    drops: [
      { item: 'Leather', min: 0, max: 2, chance: 1.0 },
      { item: 'Raw Beef', min: 1, max: 3, chance: 1.0 }
    ],
    aggroRange: 0,
    attackRange: 0,
    attackCooldown: 0,
    behavior: 'wander',
    biome: ['plains', 'forest', 'mountains']
  },
  {
    type: 'pig',
    name: 'Pig',
    hp: 8,
    damage: 0,
    speed: 1.0,
    hostile: false,
    drops: [
      { item: 'Raw Porkchop', min: 1, max: 3, chance: 1.0 }
    ],
    aggroRange: 0,
    attackRange: 0,
    attackCooldown: 0,
    behavior: 'wander',
    biome: ['plains', 'forest']
  },
  {
    type: 'chicken',
    name: 'Chicken',
    hp: 4,
    damage: 0,
    speed: 1.2,
    hostile: false,
    drops: [
      { item: 'Feather', min: 0, max: 2, chance: 1.0 },
      { item: 'Raw Chicken', min: 1, max: 1, chance: 1.0 }
    ],
    aggroRange: 0,
    attackRange: 0,
    attackCooldown: 0,
    behavior: 'wander',
    biome: ['plains', 'forest', 'jungle']
  },
  {
    type: 'sheep',
    name: 'Sheep',
    hp: 8,
    damage: 0,
    speed: 1.0,
    hostile: false,
    drops: [
      { item: 'White Wool', min: 1, max: 1, chance: 1.0 },
      { item: 'Raw Mutton', min: 1, max: 2, chance: 1.0 }
    ],
    aggroRange: 0,
    attackRange: 0,
    attackCooldown: 0,
    behavior: 'wander',
    biome: ['plains', 'forest', 'mountains']
  },
  {
    type: 'fish',
    name: 'Fish',
    hp: 2,
    damage: 0,
    speed: 1.5,
    hostile: false,
    drops: [
      { item: 'Raw Fish', min: 1, max: 1, chance: 1.0 }
    ],
    aggroRange: 0,
    attackRange: 0,
    attackCooldown: 0,
    behavior: 'wander',
    biome: ['ocean', 'river']
  },
  {
    type: 'villager',
    name: 'Villager',
    hp: 20,
    damage: 0,
    speed: 0.8,
    hostile: false,
    drops: [],
    aggroRange: 0,
    attackRange: 0,
    attackCooldown: 0,
    behavior: 'wander',
    biome: ['village']
  },

  // ===== HOSTILE MOBS =====
  {
    type: 'zombie',
    name: 'Zombie',
    hp: 20,
    damage: 2,
    speed: 1.0,
    hostile: true,
    drops: [
      { item: 'Iron Ingot', min: 0, max: 1, chance: 0.05 },
      { item: 'Stick', min: 0, max: 2, chance: 0.1 }
    ],
    aggroRange: 16,
    attackRange: 1.5,
    attackCooldown: 1.5,
    behavior: 'chase',
    biome: ['overworld_night', 'cave', 'dungeon']
  },
  {
    type: 'skeleton',
    name: 'Skeleton',
    hp: 20,
    damage: 3,
    speed: 1.0,
    hostile: true,
    drops: [
      { item: 'Bone', min: 0, max: 2, chance: 1.0 },
      { item: 'Arrow', min: 0, max: 2, chance: 0.5 }
    ],
    aggroRange: 16,
    attackRange: 12,
    attackCooldown: 2.0,
    behavior: 'ranged',
    biome: ['overworld_night', 'cave', 'dungeon']
  },
  {
    type: 'spider',
    name: 'Spider',
    hp: 16,
    damage: 2,
    speed: 1.4,
    hostile: true,
    drops: [
      { item: 'String', min: 0, max: 2, chance: 1.0 }
    ],
    aggroRange: 16,
    attackRange: 1.5,
    attackCooldown: 1.0,
    behavior: 'chase',
    biome: ['overworld_night', 'cave', 'dungeon']
  },
  {
    type: 'creeper',
    name: 'Creeper',
    hp: 20,
    damage: 8,
    speed: 1.0,
    hostile: true,
    drops: [
      { item: 'Gunpowder', min: 0, max: 2, chance: 1.0 }
    ],
    aggroRange: 16,
    attackRange: 3,
    attackCooldown: 1.5,
    behavior: 'chase',
    biome: ['overworld_night', 'cave', 'dungeon'],
    special: 'explosive'
  },
  {
    type: 'enderman',
    name: 'Enderman',
    hp: 40,
    damage: 4,
    speed: 1.2,
    hostile: true,
    drops: [
      { item: 'Ender Pearl', min: 0, max: 1, chance: 0.5 }
    ],
    aggroRange: 32,
    attackRange: 2.0,
    attackCooldown: 1.0,
    behavior: 'chase',
    biome: ['overworld_night', 'end', 'cave'],
    special: 'teleport'
  },
  {
    type: 'witch',
    name: 'Witch',
    hp: 26,
    damage: 3,
    speed: 1.0,
    hostile: true,
    drops: [
      { item: 'Potion of Healing', min: 0, max: 1, chance: 0.2 },
      { item: 'Redstone', min: 0, max: 4, chance: 0.5 },
      { item: 'Glowstone Dust', min: 0, max: 4, chance: 0.5 },
      { item: 'Gunpowder', min: 0, max: 4, chance: 0.5 }
    ],
    aggroRange: 16,
    attackRange: 10,
    attackCooldown: 3.0,
    behavior: 'ranged',
    biome: ['swamp', 'overworld_night'],
    special: 'potions'
  },
  {
    type: 'phantom',
    name: 'Phantom',
    hp: 10,
    damage: 3,
    speed: 1.8,
    hostile: true,
    drops: [
      { item: 'Phantom Membrane', min: 0, max: 1, chance: 0.5 }
    ],
    aggroRange: 32,
    attackRange: 1.5,
    attackCooldown: 1.0,
    behavior: 'fly',
    biome: ['overworld_night'],
    special: 'swooping'
  },
  {
    type: 'slime',
    name: 'Slime',
    hp: 16,
    damage: 4,
    speed: 0.8,
    hostile: true,
    drops: [
      { item: 'Slimeball', min: 0, max: 2, chance: 1.0 }
    ],
    aggroRange: 16,
    attackRange: 1.5,
    attackCooldown: 1.0,
    behavior: 'chase',
    biome: ['swamp', 'cave'],
    special: 'split'
  },
  {
    type: 'husk',
    name: 'Husk',
    hp: 20,
    damage: 3,
    speed: 1.0,
    hostile: true,
    drops: [
      { item: 'Iron Ingot', min: 0, max: 1, chance: 0.05 },
      { item: 'Stick', min: 0, max: 2, chance: 0.1 }
    ],
    aggroRange: 16,
    attackRange: 1.5,
    attackCooldown: 1.5,
    behavior: 'chase',
    biome: ['desert', 'dungeon'],
    special: 'hunger'
  },
  {
    type: 'cave_spider',
    name: 'Cave Spider',
    hp: 12,
    damage: 2,
    speed: 1.5,
    hostile: true,
    drops: [
      { item: 'String', min: 0, max: 2, chance: 1.0 }
    ],
    aggroRange: 16,
    attackRange: 1.5,
    attackCooldown: 0.8,
    behavior: 'chase',
    biome: ['mine', 'dungeon'],
    special: 'poison'
  },
  {
    type: 'mimic',
    name: 'Mimic',
    hp: 30,
    damage: 5,
    speed: 1.0,
    hostile: true,
    drops: [
      { item: 'Diamond', min: 1, max: 3, chance: 0.5 },
      { item: 'Gold Ingot', min: 2, max: 5, chance: 0.8 },
      { item: 'Iron Ingot', min: 2, max: 5, chance: 1.0 }
    ],
    aggroRange: 3,
    attackRange: 1.5,
    attackCooldown: 1.2,
    behavior: 'chase',
    biome: ['dungeon', 'cave'],
    special: 'ambush'
  },
  {
    type: 'crystal_golem',
    name: 'Crystal Golem',
    hp: 50,
    damage: 6,
    speed: 0.7,
    hostile: true,
    drops: [
      { item: 'Crystal', min: 2, max: 5, chance: 1.0 },
      { item: 'Diamond', min: 0, max: 2, chance: 0.3 }
    ],
    aggroRange: 12,
    attackRange: 2.0,
    attackCooldown: 2.0,
    behavior: 'chase',
    biome: ['crystal_caves', 'deep_underground'],
    special: 'damage_reflect'
  },
  {
    type: 'harpy',
    name: 'Harpy',
    hp: 15,
    damage: 3,
    speed: 1.6,
    hostile: true,
    drops: [
      { item: 'Feather', min: 1, max: 3, chance: 1.0 },
      { item: 'String', min: 0, max: 2, chance: 0.5 }
    ],
    aggroRange: 20,
    attackRange: 1.5,
    attackCooldown: 1.0,
    behavior: 'fly',
    biome: ['mountains', 'sky_islands']
  },

  // ===== MINI-BOSSES =====
  {
    type: 'giant_zombie',
    name: 'Giant Zombie',
    hp: 100,
    damage: 8,
    speed: 0.6,
    hostile: true,
    drops: [
      { item: 'Iron Ingot', min: 5, max: 10, chance: 1.0 },
      { item: 'Diamond', min: 1, max: 3, chance: 0.5 },
      { item: 'Soul Shard', min: 1, max: 3, chance: 0.8 }
    ],
    aggroRange: 24,
    attackRange: 3.0,
    attackCooldown: 2.5,
    behavior: 'chase',
    biome: ['dungeon_boss'],
    boss: true
  },
  {
    type: 'spider_queen',
    name: 'Spider Queen',
    hp: 80,
    damage: 5,
    speed: 1.2,
    hostile: true,
    drops: [
      { item: 'String', min: 10, max: 20, chance: 1.0 },
      { item: 'Diamond', min: 1, max: 2, chance: 0.5 },
      { item: 'Soul Shard', min: 1, max: 3, chance: 0.8 }
    ],
    aggroRange: 24,
    attackRange: 2.0,
    attackCooldown: 1.5,
    behavior: 'chase',
    biome: ['dungeon_boss'],
    boss: true,
    special: 'summon_spiders'
  },
  {
    type: 'necromancer',
    name: 'Necromancer',
    hp: 90,
    damage: 4,
    speed: 0.8,
    hostile: true,
    drops: [
      { item: 'Bone', min: 5, max: 15, chance: 1.0 },
      { item: 'Soul Shard', min: 2, max: 5, chance: 1.0 },
      { item: 'Diamond', min: 1, max: 3, chance: 0.5 }
    ],
    aggroRange: 24,
    attackRange: 10,
    attackCooldown: 3.0,
    behavior: 'ranged',
    biome: ['dungeon_boss'],
    boss: true,
    special: 'summon_undead'
  },
  {
    type: 'corrupted_champion',
    name: 'Corrupted Champion',
    hp: 120,
    damage: 7,
    speed: 1.0,
    hostile: true,
    drops: [
      { item: 'Diamond', min: 3, max: 6, chance: 1.0 },
      { item: 'Soul Shard', min: 3, max: 6, chance: 1.0 },
      { item: 'Nether Star', min: 1, max: 1, chance: 0.3 }
    ],
    aggroRange: 24,
    attackRange: 2.5,
    attackCooldown: 1.8,
    behavior: 'chase',
    biome: ['dungeon_boss'],
    boss: true,
    special: 'corruption_aoe'
  },

  // ===== FINAL BOSS =====
  {
    type: 'void_wyrm',
    name: 'Void Wyrm',
    hp: 300,
    damage: 15,
    speed: 1.2,
    hostile: true,
    drops: [
      { item: 'Nether Star', min: 1, max: 2, chance: 1.0 },
      { item: 'Soul Shard', min: 5, max: 10, chance: 1.0 },
      { item: 'Diamond', min: 5, max: 10, chance: 1.0 },
      { item: 'Ender Pearl', min: 3, max: 8, chance: 1.0 },
      { item: 'Void Blade', min: 1, max: 1, chance: 0.15 }
    ],
    aggroRange: 40,
    attackRange: 4.0,
    attackCooldown: 2.0,
    behavior: 'fly',
    biome: ['void_arena'],
    boss: true,
    special: 'void_breath'
  }
];

export function getMobDef(type) {
  return MOB_DEFS.find(m => m.type === type) || null;
}
