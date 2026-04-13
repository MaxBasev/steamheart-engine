# Tech Notes

---

## Technical Assumptions

> Some items below are marked **[TBD]** — finalize on Day 1.

| Item | Decision | Notes |
|---|---|---|
| **Framework** | Phaser 3 | Mature, browser-native, large community |
| **Language** | JavaScript or TypeScript | **[TBD]** — TS adds type safety, JS is faster to start |
| **Build tool** | Vite | Fast dev server, simple static build output |
| **Hosting** | itch.io (static file upload) | Standard jam platform |
| **Browser targets** | Chrome (latest), Firefox (latest) | Test both; Safari optional |
| **Resolution** | 1280×720 base | Scale to fill window; maintain aspect ratio |
| **Renderer** | WebGL (Phaser default) with Canvas fallback | Let Phaser decide; don't force either |
| **Audio** | Web Audio API via Phaser | Preload all SFX in loading scene |
| **State persistence** | None required for MVP | Level progress not saved between sessions |

---

## Recommended Architecture

Keep it flat and simple. Do not over-engineer. This is a jam.

```
/src
  /scenes          ← Phaser scenes
  /objects         ← Phaser GameObjects or plain classes
  /data            ← Level JSON files and config
  /systems         ← Pure logic (no Phaser dependency)
  /assets          ← Source assets (pre-build)
/public
  /assets          ← Compiled/final assets (post-build, served)
index.html
vite.config.js
```

---

## Scene Breakdown

### BootScene
- Loads minimal assets needed for the loading bar
- Sets up display scale and renderer config
- Transitions to PreloadScene

### PreloadScene
- Loads all game assets (sprites, audio, level JSON files)
- Shows a loading bar with a steampunk visual
- Transitions to MenuScene

### MenuScene
- Title card
- "Play" button → LevelSelectScene or directly to Level 1
- Optional: Credits button
- Optional: How to Play modal

### LevelSelectScene (optional for jam)
- Grid or list of level thumbnails
- Show completed levels
- For MVP: skip this and just play levels in sequence

### GameScene
- The core game loop
- Manages: grid, parts, queue, pressure, activation
- Emits events to UILayer (gauge updates, score, etc.)
- Transitions to WinScene or calls restart on fail

### UILayer (as a separate Scene running in parallel)
- HUD: pressure gauge, discard count, queue preview
- ACTIVATE button
- Level title
- Keep UI in its own scene to avoid mixing game-world and UI coordinate systems

### WinScene (or overlay on GameScene)
- Machine runs animation plays
- Stars / score if implemented
- "Next Level" and "Retry" buttons

### FailScene (or overlay on GameScene)
- Failure animation
- Clear indication of what went wrong
- "Retry" button — this should be instant, no delay

### CreditsScene
- Simple scrolling or static credits
- Third-party assets and licenses

---

## Grid System (Data Model)

```
Grid {
  width: number          // cells wide
  height: number         // cells tall
  cells: Cell[][]        // 2D array
}

Cell {
  x: number
  y: number
  state: 'empty' | 'occupied' | 'locked' | 'source' | 'target'
  part: Part | null
  pressurized: boolean   // is this cell in a connected pipe network?
}

Part {
  type: PartType         // 'gear' | 'axle' | 'pipe' | 'boiler' | 'valve' | 'vent' | 'scrap'
  rotation: 0 | 1 | 2 | 3  // 0=0°, 1=90°, 2=180°, 3=270°
  isJammed: boolean
}
```

---

## Motion Transmission (Logic)

Motion propagation is a graph traversal — not a simulation.

**Algorithm:**
1. Start at source cell
2. BFS/DFS across adjacent cells
3. At each step: check if the adjacent part type + orientation is compatible with the current part's output direction
4. If a valid connection exists: mark cell as "in motion chain"
5. If target cell is reached and marked: valid chain exists

**This runs once on ACTIVATE** (not every frame). No continuous simulation needed.

```
function validateChain(grid, sourceCell, targetCell): boolean
  // BFS from source
  // Returns true if targetCell is reachable through valid connections
```

---

## Pressure System (Logic)

Pressure is a **single global number** per level, not per-pipe simulation.

```
PressureSystem {
  value: number           // 0–100 (percentage)
  maxValue: 100
  boilerRate: number      // pressure added per second by active boilers
  ventRate: number        // pressure removed per second by active vents
  warningThreshold: 80
  criticalThreshold: 100
}

update(deltaMs) {
  const netRate = (connectedBoilers * boilerRate) - (activeVents * ventRate)
  this.value = clamp(this.value + netRate * (deltaMs / 1000), 0, 110)
  if (this.value >= criticalThreshold) triggerBurst()
}
```

Valves affect whether their downstream pipe cells count as "connected" to the vent network. A closed valve means vents downstream of it don't contribute to pressure relief.

---

## Level Data Format (JSON)

```json
{
  "id": "level_01",
  "title": "The Fan",
  "grid": {
    "width": 6,
    "height": 5
  },
  "lockedCells": [
    { "x": 0, "y": 2, "state": "source", "part": null },
    { "x": 5, "y": 2, "state": "target", "targetType": "fan" },
    { "x": 2, "y": 0, "state": "locked", "part": { "type": "pipe", "rotation": 0 } }
  ],
  "queue": ["gear", "gear", "axle", "scrap", "gear"],
  "discardTokens": 2,
  "pressure": {
    "enabled": false,
    "boilerRate": 0,
    "ventRate": 0
  },
  "challengeGoal": null
}
```

Level files live in `/src/data/levels/` and are loaded during PreloadScene.

---

## State Management

For a jam game, keep state simple:

```
GameState {
  currentLevel: string       // level id
  grid: Grid                 // full grid state
  queue: PartType[]          // remaining queue
  currentPart: PartType      // part in hand
  discardTokensLeft: number
  pressure: PressureSystem
  isActivated: boolean
  isWon: boolean
  isFailed: boolean
  failReason: string | null
}
```

**Do not use a complex state machine framework.** A plain object with flags and a few methods is sufficient for a jam game.

State is reset on level load and on retry. No persistence between sessions needed for MVP.

---

## Input Handling

| Input | Action |
|---|---|
| Left-click on empty cell | Place current part |
| Left-click on part | Select / interact (toggle valve) |
| R key | Rotate current part |
| Right-click or Backspace | Discard current part |
| ACTIVATE button | Trigger activation check |
| Escape | Pause / menu |

Mouse/touch: Phaser's pointer system handles both. Use Phaser's interactive game objects for click targets. Do not manage raw browser events.

---

## Particle Effects

Use Phaser's built-in particle system for:
- Steam puff (on vent activation)
- Spark burst (on jam/failure)
- Pressure burst (on pipe explosion)

For MVP, use simple one-shot emitters. Do not build a custom particle engine.

---

## Performance Notes

- Target 60fps; this game has very low computational demands
- Grid operations are O(W×H) — trivial for any expected grid size
- BFS path check: O(W×H) once per activation — not per frame
- Particle effects: keep emitter particle counts low (< 50 per burst for safety)
- Audio: preload everything in PreloadScene; do not lazy-load SFX

---

## Build and Deployment

```bash
# Dev
npm run dev          # Vite dev server

# Build
npm run build        # Output to /dist

# Deploy
# Upload /dist contents to itch.io as HTML game
# Set index.html as the entry point
```

Confirm the built bundle runs correctly in a plain browser (open `/dist/index.html` via a local static server, not just file://). itch.io serves files via HTTPS — test for any mixed-content issues.
