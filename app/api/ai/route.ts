import { streamText } from 'ai';
import { google } from '@ai-sdk/google';
import { GameState } from '@/types/game';

export const runtime = 'edge';

export async function POST(req: Request) {
  const { messages, gameState }: { messages: any[]; gameState: GameState } = await req.json();

  // Build context from game state
  const context = `
You are the narrator and game master for TextVenture, an AI-powered dungeon crawler.

Current Game State:
- Player: Level ${gameState.player.level} | HP: ${gameState.player.hp}/${gameState.player.maxHp} | Attack: ${gameState.player.attack} | Defense: ${gameState.player.defense} | Gold: ${gameState.player.gold}
- Location: ${gameState.currentRoom.type} room
- In Combat: ${gameState.inCombat ? `Yes (fighting ${gameState.currentEnemy?.name})` : 'No'}
- Equipped: ${gameState.equippedWeapon?.name || 'None'} ${gameState.equippedArmor ? `and ${gameState.equippedArmor.name}` : ''}
- Inventory: ${gameState.inventory.map(i => i.name).join(', ') || 'Empty'}
- Room Entities: ${gameState.currentRoom.entities.map(e => e.type).join(', ') || 'Empty room'}
- Available Doors: ${Object.entries(gameState.currentRoom.doors).filter(([_, v]) => v).map(([k]) => k).join(', ')}

Your role:
1. Parse player commands in free-form text (e.g., "attack the goblin", "open the chest", "go through the left door")
2. Narrate the results dramatically and immersively
3. Generate dynamic events, NPC dialogue, and flavor text
4. Handle combat narration with vivid descriptions
5. Be creative with room descriptions and encounters

Player commands you should recognize:
- Combat: "attack", "fight", "strike", "defend", "flee"
- Movement: "go left/right/forward", "enter door", "leave room"
- Interaction: "open chest", "talk to merchant", "examine", "look around"
- Inventory: "use potion", "equip sword", "check inventory"
- Misc: "help", "status", "rest"

Respond in character as the narrator. Be concise but atmospheric. Use vivid language.
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
