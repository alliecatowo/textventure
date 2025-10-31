# TextVenture - AI-Powered Procedural Dungeon Crawler

A hybrid text-based RPG with 3D visualization, powered by AI and procedural generation.

## Features

### 🎮 Core Gameplay
- **Free-form text commands** - Type natural language actions like "attack the goblin" or "go through the left door"
- **AI-powered narrative** - Gemini 2.5 Flash generates dynamic events, combat narration, and NPC dialogue
- **First-person 3D view** - See your equipped items and the dungeon ahead using React Three Fiber

### 🏗️ Procedural Generation
- **Infinite dungeon** - Tile-based rooms generated using Perlin noise (Minecraft-style)
- **Dynamic loot** - Borderlands-esque prefix/suffix system with rarities (Common → Legendary)
  - "Swift Dagger of Piercing" (+8 ATK, +3 DEF)
  - "Ancient Claymore of the Dragon" (+15 ATK, +5 DEF)
- **Procedural enemies** - Monster stats scale with player level
- **Room types** - Combat, treasure, merchant, event, and empty rooms

### 📊 RPG Systems
- **Stats & Leveling** - HP, Attack, Defense, XP progression
- **Inventory & Equipment** - Collect weapons, armor, and consumables
- **Combat System** - Turn-based with damage calculations and loot drops
- **Economy** - Gold, merchants, and item values

### 🗺️ Navigation
- **Minimap** - Track explored rooms
- **Multiple doors** - Left, right, and forward exits
- **Persistent world** - Rooms remain consistent when revisited

### 🎨 UI/UX
- **HUD** - HP bar, XP bar, stats, equipped gear
- **Event log** - Scrollable narrative text
- **Inventory panel** - Color-coded rarity items
- **Retro aesthetic** - Terminal-inspired green monospace theme

## Tech Stack

- **Next.js 15** - React framework with App Router
- **React Three Fiber** - 3D rendering with Three.js
- **@react-three/drei** - R3F helpers and utilities
- **Vercel AI SDK** - Model-agnostic AI integration
- **Google Gemini 2.5 Flash** - LLM for game master
- **Zustand** - State management
- **Tailwind CSS** - Styling

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open browser
http://localhost:3000
```

## Commands

Type natural language commands in the input box:

### Combat
- `attack the goblin`
- `fight`
- `strike with sword`

### Movement
- `go left`
- `enter the right door`
- `head forward`

### Interaction
- `open the chest`
- `loot the treasure`
- `talk to the merchant`
- `examine the room`

### Inventory
- `use potion`
- `equip sword`
- `equip leather armor`
- `check inventory` (or press `I`)

### Info
- `help`
- `status`
- `look around`

## Project Structure

```
textventure/
├── app/
│   ├── page.tsx              # Main game page
│   ├── layout.tsx            # Root layout
│   ├── globals.css           # Global styles
│   └── api/ai/route.ts       # AI endpoint
├── components/
│   ├── Scene.tsx             # R3F Canvas
│   ├── Room.tsx              # Procedural room renderer
│   ├── Entity.tsx            # Monsters/chests/NPCs
│   ├── Player.tsx            # First-person hands
│   ├── Model.tsx             # GLB loader
│   ├── HUD.tsx               # Stats overlay
│   ├── EventLog.tsx          # Narrative feed
│   ├── Minimap.tsx           # Room map
│   ├── Inventory.tsx         # Item management
│   └── TextInput.tsx         # Command input
├── lib/
│   ├── store.ts              # Zustand game state
│   ├── roomGenerator.ts      # Procedural rooms
│   ├── lootGenerator.ts      # Item generation
│   ├── noise.ts              # Perlin noise
│   ├── ai.ts                 # AI utilities
│   └── constants.ts          # Game data
├── types/
│   └── game.ts               # TypeScript types
└── models/                   # 3D assets (GLB)
```

## Models

The game uses 3D models from:
- **Modular Dungeons Pack** - Walls, floors, doors, props
- **Ultimate RPG Items Bundle** - Weapons, armor, consumables
- **Ultimate Monsters Bundle** - Enemy creatures
- **Character models** - Hooded Adventurer, King, Witch

## Environment Variables

Create `.env.local`:

```
GOOGLE_API_KEY=your_gemini_api_key
```

## Game Design

### Procedural Room Generation
- Uses Perlin noise to determine room type and layout
- Tile-based grid (16x16 tiles per room)
- Doors placed using noise thresholds
- Decorations (torches, barrels, columns) procedurally placed

### Loot System
- Base items (Dagger, Sword, Axe, Armor types)
- Prefixes modify stats (Rusty, Sharp, Brutal, Ancient, etc.)
- Suffixes add bonuses (of Power, of the Dragon, of Speed, etc.)
- Rarity multipliers (1.0x → 3.0x)
- Level scaling for balanced progression

### Combat
- Dice roll system with hit chance
- Attack - Defense = Base Damage + Random (1-5)
- Defend action reduces damage by 50%
- XP and gold rewards on victory
- Random loot drops from monster loot table

## Future Enhancements

- [ ] Animations for character hands and monsters
- [ ] Sound effects and music
- [ ] Boss rooms and special events
- [ ] Crafting system
- [ ] Save/load game state
- [ ] Multiplayer co-op
- [ ] More room types and biomes

## License

MIT
