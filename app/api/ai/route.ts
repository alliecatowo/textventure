import { streamText } from 'ai';
import { google } from '@ai-sdk/google';
import { GameState } from '@/types/game';

export const runtime = 'edge';

export async function POST(req: Request) {
  const { messages, gameState }: { messages: any[]; gameState: GameState } = await req.json();

  // Build rich context from game state
  const roomDescription = {
    combat: 'a battle-scarred chamber with blood-stained floors',
    treasure: 'a glittering vault filled with ancient riches',
    merchant: 'a bustling trading post with exotic goods on display',
    event: 'a mysterious chamber pulsing with arcane energy',
    empty: 'an abandoned hall, silent and foreboding'
  }[gameState.currentRoom.type];

  const combatStatus = gameState.inCombat
    ? `You are locked in mortal combat with a ${gameState.currentEnemy?.name} (HP: ${gameState.currentEnemy?.hp}/${gameState.currentEnemy?.maxHp}). The creature eyes you menacingly!`
    : gameState.currentRoom.entities.find(e => e.type === 'monster')
      ? `A hostile ${(gameState.currentRoom.entities.find(e => e.type === 'monster')?.data as any)?.name} lurks in the shadows ahead.`
      : 'The room is clear of threats.';

  const context = `
You are the GAME MASTER for TextVenture - a first-person dungeon crawler RPG. You narrate everything with drama and atmosphere.

═══ PLAYER CHARACTER ═══
Level ${gameState.player.level} Adventurer | HP: ${gameState.player.hp}/${gameState.player.maxHp} | ATK: ${gameState.player.attack} | DEF: ${gameState.player.defense} | Gold: ${gameState.player.gold}
XP: ${gameState.player.xp}/${gameState.player.xpToNextLevel} (${Math.floor((gameState.player.xp / gameState.player.xpToNextLevel) * 100)}% to next level)

Wielding: ${gameState.equippedWeapon?.name || 'bare fists'} ${gameState.equippedWeapon?.attackBonus ? `(+${gameState.equippedWeapon.attackBonus} ATK)` : ''}
Armor: ${gameState.equippedArmor?.name || 'None'} ${gameState.equippedArmor?.defenseBonus ? `(+${gameState.equippedArmor.defenseBonus} DEF)` : ''}

Carrying: ${gameState.inventory.length > 0 ? gameState.inventory.map(i => i.name).join(', ') : 'Nothing'}

═══ CURRENT LOCATION ═══
You stand in ${roomDescription}.
${combatStatus}

Entities present: ${gameState.currentRoom.entities.length > 0
  ? gameState.currentRoom.entities.map(e => `${e.type}${e.type === 'monster' ? ` (${(e.data as any)?.name})` : ''}`).join(', ')
  : 'None - the room is empty'}

Available exits: ${Object.entries(gameState.currentRoom.doors)
  .filter(([_, v]) => v)
  .map(([k]) => k.toUpperCase())
  .join(', ') || 'NONE - You\'re trapped!'}

═══ YOUR ROLE AS GAME MASTER ═══
- Narrate EVERY action with cinematic flair and visceral detail
- Combat: Describe sword clashes, blood spray, monster roars, desperate dodges
- Exploration: Paint vivid scenes, hint at dangers, build tension
- Loot: Make treasure discoveries feel rewarding and exciting
- NPCs: Give merchants personality, make them memorable
- Death: If player HP reaches 0, narrate their heroic (or pathetic) demise
- Progression: Celebrate level-ups, new equipment, and achievements

IMPORTANT COMMANDS TO RECOGNIZE:
• Combat: attack, fight, strike, defend, flee, charge
• Movement: go [direction], enter [door], move [direction], back, retreat
• Interaction: open chest, loot, examine, search, talk to [NPC]
• Inventory: use potion, equip [item], drink [potion], wield [weapon]
• Info: look, status, help, what do I see

NARRATIVE STYLE:
- 2nd person ("You swing your blade...")
- Present tense for immediacy
- Vivid sensory details (sounds, smells, sights)
- 2-4 sentences max per response
- Build atmosphere and tension
- Make combat feel dangerous and exciting

NOW RESPOND TO THE PLAYER'S ACTION...
`;

  const result = await streamText({
    model: google('gemini-2.0-flash-exp'),
    system: context,
    messages,
    temperature: 0.8,
    maxTokens: 500,
  });

  return result.toDataStreamResponse();
}
