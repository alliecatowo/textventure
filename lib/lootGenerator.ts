import { Item } from '@/types/game';

// Weapon/item rarities with stat multipliers
export const RARITIES = {
  common: { multiplier: 1.0, color: '#FFFFFF', chance: 0.50 },
  uncommon: { multiplier: 1.3, color: '#1EFF00', chance: 0.30 },
  rare: { multiplier: 1.6, color: '#0070DD', chance: 0.15 },
  epic: { multiplier: 2.0, color: '#A335EE', chance: 0.04 },
  legendary: { multiplier: 3.0, color: '#FF8000', chance: 0.01 },
} as const;

export type Rarity = keyof typeof RARITIES;

// Prefix modifiers (first word)
const PREFIXES = [
  { name: 'Rusty', attackMod: -2, defenseMod: 0, valueMod: 0.5 },
  { name: 'Sharp', attackMod: 3, defenseMod: 0, valueMod: 1.5 },
  { name: 'Heavy', attackMod: 5, defenseMod: -1, valueMod: 1.8 },
  { name: 'Light', attackMod: 1, defenseMod: 2, valueMod: 1.3 },
  { name: 'Brutal', attackMod: 7, defenseMod: 0, valueMod: 2.0 },
  { name: 'Swift', attackMod: 2, defenseMod: 3, valueMod: 1.7 },
  { name: 'Mighty', attackMod: 6, defenseMod: 2, valueMod: 2.2 },
  { name: 'Deadly', attackMod: 8, defenseMod: -2, valueMod: 2.5 },
  { name: 'Ancient', attackMod: 4, defenseMod: 4, valueMod: 3.0 },
  { name: 'Cursed', attackMod: 10, defenseMod: -5, valueMod: 1.5 },
];

// Suffix modifiers (last word)
const SUFFIXES = [
  { name: 'of Power', attackMod: 4, defenseMod: 0, valueMod: 1.5 },
  { name: 'of Defense', attackMod: 0, defenseMod: 4, valueMod: 1.5 },
  { name: 'of Piercing', attackMod: 6, defenseMod: -1, valueMod: 1.8 },
  { name: 'of Fury', attackMod: 8, defenseMod: -3, valueMod: 2.0 },
  { name: 'of Protection', attackMod: -2, defenseMod: 6, valueMod: 1.7 },
  { name: 'of Speed', attackMod: 3, defenseMod: 3, valueMod: 1.6 },
  { name: 'of the Bear', attackMod: 5, defenseMod: 5, valueMod: 2.5 },
  { name: 'of the Dragon', attackMod: 10, defenseMod: 3, valueMod: 3.5 },
  { name: 'of Destruction', attackMod: 12, defenseMod: 0, valueMod: 3.0 },
  { name: 'of Shadows', attackMod: 7, defenseMod: 2, valueMod: 2.2 },
];

// Base item templates
const BASE_WEAPONS = [
  { name: 'Dagger', baseAttack: 3, baseValue: 20, model: 'Dagger.glb' },
  { name: 'Sword', baseAttack: 5, baseValue: 50, model: 'Claymore.glb' },
  { name: 'Axe', baseAttack: 7, baseValue: 75, model: 'Axe Double.glb' },
  { name: 'Hammer', baseAttack: 8, baseValue: 90, model: 'Doublesided Hammer.glb' },
  { name: 'Knife', baseAttack: 2, baseValue: 15, model: 'Knife.glb' },
];

const BASE_ARMOR = [
  { name: 'Leather Armor', baseDefense: 3, baseValue: 40, model: 'Armor Leather.glb' },
  { name: 'Metal Armor', baseDefense: 6, baseValue: 80, model: 'Armor Metal.glb' },
  { name: 'Golden Armor', baseDefense: 10, baseValue: 150, model: 'Armor Golden.glb' },
];

// Seeded random number generator for consistency
function seededRandom(seed: number): number {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

// Roll for rarity based on weighted chances
function rollRarity(seed: number): Rarity {
  const roll = seededRandom(seed);
  let cumulative = 0;

  for (const [rarity, data] of Object.entries(RARITIES)) {
    cumulative += data.chance;
    if (roll <= cumulative) {
      return rarity as Rarity;
    }
  }

  return 'common';
}

// Generate a procedural weapon
export function generateWeapon(seed: number, playerLevel: number = 1): Item {
  const rarity = rollRarity(seed);
  const rarityData = RARITIES[rarity];

  // Pick base weapon
  const baseWeapon = BASE_WEAPONS[Math.floor(seededRandom(seed + 1) * BASE_WEAPONS.length)];

  // Decide if we add prefix and/or suffix based on rarity
  const hasPrefix = seededRandom(seed + 2) > 0.5;
  const hasSuffix = seededRandom(seed + 3) > 0.4;

  const prefix = hasPrefix ? PREFIXES[Math.floor(seededRandom(seed + 4) * PREFIXES.length)] : null;
  const suffix = hasSuffix ? SUFFIXES[Math.floor(seededRandom(seed + 5) * SUFFIXES.length)] : null;

  // Calculate stats
  let attackBonus = Math.floor(
    (baseWeapon.baseAttack +
    (prefix?.attackMod || 0) +
    (suffix?.attackMod || 0)) *
    rarityData.multiplier *
    (1 + playerLevel * 0.1)
  );

  let defenseBonus = Math.floor(
    ((prefix?.defenseMod || 0) + (suffix?.defenseMod || 0)) *
    rarityData.multiplier
  );

  let value = Math.floor(
    baseWeapon.baseValue *
    (prefix?.valueMod || 1) *
    (suffix?.valueMod || 1) *
    rarityData.multiplier *
    (1 + playerLevel * 0.2)
  );

  // Build name
  const nameParts = [];
  if (prefix) nameParts.push(prefix.name);
  nameParts.push(baseWeapon.name);
  if (suffix) nameParts.push(suffix.name);

  return {
    id: `weapon_${seed}`,
    name: nameParts.join(' '),
    type: 'weapon',
    value,
    attackBonus,
    defenseBonus: defenseBonus > 0 ? defenseBonus : undefined,
    modelPath: `/models/Ultimate RPG Items Bundle-glb/${baseWeapon.model}`,
  };
}

// Generate procedural armor
export function generateArmor(seed: number, playerLevel: number = 1): Item {
  const rarity = rollRarity(seed);
  const rarityData = RARITIES[rarity];

  const baseArmor = BASE_ARMOR[Math.floor(seededRandom(seed + 1) * BASE_ARMOR.length)];

  const hasPrefix = seededRandom(seed + 2) > 0.5;
  const hasSuffix = seededRandom(seed + 3) > 0.4;

  const prefix = hasPrefix ? PREFIXES[Math.floor(seededRandom(seed + 4) * PREFIXES.length)] : null;
  const suffix = hasSuffix ? SUFFIXES[Math.floor(seededRandom(seed + 5) * SUFFIXES.length)] : null;

  let defenseBonus = Math.floor(
    (baseArmor.baseDefense +
    (prefix?.defenseMod || 0) +
    (suffix?.defenseMod || 0)) *
    rarityData.multiplier *
    (1 + playerLevel * 0.1)
  );

  let attackBonus = Math.floor(
    ((prefix?.attackMod || 0) + (suffix?.attackMod || 0)) *
    rarityData.multiplier
  );

  let value = Math.floor(
    baseArmor.baseValue *
    (prefix?.valueMod || 1) *
    (suffix?.valueMod || 1) *
    rarityData.multiplier *
    (1 + playerLevel * 0.2)
  );

  const nameParts = [];
  if (prefix) nameParts.push(prefix.name);
  nameParts.push(baseArmor.name);
  if (suffix) nameParts.push(suffix.name);

  return {
    id: `armor_${seed}`,
    name: nameParts.join(' '),
    type: 'armor',
    value,
    attackBonus: attackBonus > 0 ? attackBonus : undefined,
    defenseBonus,
    modelPath: `/models/Ultimate RPG Items Bundle-glb/${baseArmor.model}`,
  };
}

// Generate loot for a room/chest based on seed and player level
export function generateLoot(seed: number, playerLevel: number = 1, count: number = 1): Item[] {
  const loot: Item[] = [];

  for (let i = 0; i < count; i++) {
    const itemSeed = seed + i * 1000;
    const roll = seededRandom(itemSeed);

    if (roll < 0.6) {
      // 60% chance for weapon
      loot.push(generateWeapon(itemSeed, playerLevel));
    } else if (roll < 0.9) {
      // 30% chance for armor
      loot.push(generateArmor(itemSeed, playerLevel));
    } else {
      // 10% chance for potion
      loot.push({
        id: `potion_${itemSeed}`,
        name: 'Health Potion',
        type: 'consumable',
        value: 25,
        hpRestore: 30,
        modelPath: '/models/Ultimate RPG Items Bundle-glb/Potion.glb'
      });
    }
  }

  return loot;
}
