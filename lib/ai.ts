import { GameState, Monster } from '@/types/game';

export interface CommandIntent {
  action: 'attack' | 'move' | 'interact' | 'inventory' | 'examine' | 'help' | 'unknown';
  target?: string;
  direction?: 'left' | 'right' | 'forward' | 'back';
  item?: string;
}

// Parse player command to extract intent
export function parseCommand(command: string, gameState: GameState): CommandIntent {
  const lower = command.toLowerCase().trim();

  // Combat commands
  if (lower.match(/\b(attack|fight|strike|hit|slash|stab)\b/)) {
    // Extract target if specified
    const monsterMatch = lower.match(/(?:attack|fight|hit|strike|slash|stab)\s+(?:the\s+)?(\w+)/);
    return {
      action: 'attack',
      target: monsterMatch ? monsterMatch[1] : undefined,
    };
  }

  // Movement commands
  if (lower.match(/\b(go|move|enter|walk|head)\b.*(left|right|forward|ahead|back|backward|behind)/)) {
    const dirMatch = lower.match(/\b(left|right|forward|ahead|back|backward|behind)\b/);
    const dir = dirMatch?.[1];
    return {
      action: 'move',
      direction: (dir === 'ahead' ? 'forward' : dir === 'backward' || dir === 'behind' ? 'back' : dir) as any,
    };
  }

  // Interaction commands
  if (lower.match(/\b(open|unlock|loot)\b.*\b(chest|box|container)\b/)) {
    return { action: 'interact', target: 'chest' };
  }

  if (lower.match(/\b(talk|speak|chat)\b.*(merchant|trader|npc)/)) {
    return { action: 'interact', target: 'merchant' };
  }

  if (lower.match(/\b(examine|look|inspect|search)\b/)) {
    return { action: 'examine' };
  }

  // Inventory commands
  if (lower.match(/\b(use|drink|consume)\b.*(potion|elixir)/)) {
    return { action: 'inventory', item: 'potion' };
  }

  if (lower.match(/\b(equip|wear|wield)\b\s+(\w+)/)) {
    const itemMatch = lower.match(/\b(equip|wear|wield)\b\s+(\w+)/);
    return { action: 'inventory', item: itemMatch?.[2] };
  }

  // Help
  if (lower.match(/\b(help|commands|how|what can i)\b/)) {
    return { action: 'help' };
  }

  return { action: 'unknown' };
}

// Calculate combat result
export function resolveCombat(
  playerAttack: number,
  playerDefense: number,
  enemy: Monster,
  playerAction: 'attack' | 'defend' = 'attack'
): {
  playerDamage: number;
  enemyDamage: number;
  playerHit: boolean;
  enemyHit: boolean;
} {
  const playerHit = Math.random() > 0.3; // 70% hit chance
  const enemyHit = Math.random() > 0.3;

  let playerDamage = 0;
  let enemyDamage = 0;

  if (playerHit && playerAction === 'attack') {
    const baseDamage = playerAttack - enemy.defense;
    playerDamage = Math.max(1, baseDamage + Math.floor(Math.random() * 5));
  }

  if (enemyHit) {
    const baseDamage = enemy.attack - playerDefense;
    const actualDefense = playerAction === 'defend' ? playerDefense * 1.5 : playerDefense;
    enemyDamage = Math.max(1, Math.floor((baseDamage + Math.floor(Math.random() * 5)) * (playerAction === 'defend' ? 0.5 : 1)));
  }

  return { playerDamage, enemyDamage, playerHit, enemyHit };
}

// Generate dynamic event text
export function generateEventText(type: 'treasure' | 'empty' | 'combat' | 'merchant' | 'event'): string {
  const events = {
    treasure: [
      'You spot a glimmering chest in the corner of the room.',
      'An ornate chest sits before you, its lock already broken.',
      'A treasure chest emanates a faint magical glow.',
    ],
    empty: [
      'The room is eerily quiet, with nothing but shadows and dust.',
      'Cobwebs hang from the ceiling. This room has been undisturbed for ages.',
      'You find yourself in an empty chamber. The air feels heavy.',
    ],
    combat: [
      'You hear a growl echoing through the chamber...',
      'Something stirs in the darkness ahead!',
      'A hostile presence reveals itself!',
    ],
    merchant: [
      'A traveling merchant has set up shop here, their wares spread across a wooden table.',
      'You encounter a hooded figure surrounded by various goods and trinkets.',
      'A friendly merchant greets you with a wave.',
    ],
    event: [
      'You notice something unusual about this room...',
      'The atmosphere here feels different somehow.',
      'An strange energy fills this chamber.',
    ],
  };

  const options = events[type];
  return options[Math.floor(Math.random() * options.length)];
}
