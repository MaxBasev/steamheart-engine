# Implementation Plan — Day 1–2: Foundation

**Goal:** `npm run dev` opens a browser showing a dark grid. Clicking a cell places a colored placeholder. Nothing else.

---

## Why TypeScript

- Phaser 3 ships with first-class `@types/phaser` — no extra install
- Typed `Cell` and `GridConfig` interfaces catch mistakes before runtime
- Vite handles TS natively — zero config overhead
- Worth it for a 13-day project; too painful to add later

---

## Step 1 — Project Setup

### 1.1 Create the project manually (no scaffolding wizard)

```bash
mkdir -p src/scenes src/objects src/types public/assets
```

Install dependencies (run once):

```bash
npm install
```

Required files: `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`.  
See file contents below.

### 1.2 Verify it works

```bash
npm run dev
# → opens http://localhost:5173
# → should show a black Phaser canvas
```

### 1.3 Verify browser build works

```bash
npm run build
# → /dist folder appears
# serve /dist with any static server and confirm it loads
```

---

## Step 2 — Folder Structure

```
steamheart-engine/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── src/
│   ├── main.ts               ← Phaser config + game boot
│   ├── types/
│   │   └── index.ts          ← Shared interfaces (Cell, GridConfig, etc.)
│   ├── scenes/
│   │   ├── BootScene.ts      ← One job: go to PreloadScene
│   │   ├── PreloadScene.ts   ← One job: load assets, go to GameScene
│   │   └── GameScene.ts      ← Grid + input
│   └── objects/
│       └── Grid.ts           ← Grid data model + Phaser rendering
├── public/
│   └── assets/               ← Empty for now; sprites/audio go here later
└── docs/
    └── ...
```

No `components/`, no `utils/`, no `stores/`. Add folders only when a second file needs to live there.

---

## Step 3 — Scene Setup

Three scenes, each with exactly one job:

| Scene | Job | Transitions to |
|---|---|---|
| `BootScene` | Nothing — just jump forward | `PreloadScene` |
| `PreloadScene` | `this.load.*` calls (empty now) | `GameScene` |
| `GameScene` | Grid + input | — |

Scenes are registered in `main.ts` in the array `[BootScene, PreloadScene, GameScene]`. Phaser starts the first one automatically.

---

## Step 4 — Grid Implementation

### Data model

The grid is a 2D array of `Cell` objects. No Phaser dependency — pure data.

```
Grid (10 cols × 8 rows, 64px cells)
│
├── cells: Cell[][]    ← source of truth
├── graphics           ← Phaser Graphics for drawing
└── methods:
    ├── worldToCell()  ← pixel coords → col/row
    ├── cellToWorld()  ← col/row → pixel coords
    ├── placeAt()      ← set a cell to 'occupied'
    └── draw()         ← redraw everything from cells[][]
```

### Rendering approach

`draw()` is called once after any state change. It:
1. Clears the Graphics object
2. Fills each cell with a color based on `cell.state`
3. Draws grid lines on top

This is simple and fast enough for a 10×8 grid. No dirty-rectangle optimization needed.

### Cell states for Day 1–2

```
'empty'    → dark grey background
'occupied' → warm brown (placeholder part color)
'source'   → dark green (power source indicator)
'target'   → dark red (target mechanism indicator)
'locked'   → near-black (obstacle, not interactive)
```

---

## Step 5 — Input Handling

Two input events in `GameScene`:

1. **`pointermove`** — draw a hover highlight rectangle on the cell under the cursor  
2. **`pointerdown`** — call `grid.placeAt(col, row)` if the cell is empty

```
Pointer position (px, py)
   ↓
worldToCell(px, py)
   ↓ null if outside grid bounds
   ↓ { col, row } if inside
       ↓
       placeAt(col, row)
          ↓ false if not empty (source/target/occupied/locked)
          ↓ true  → cell.state = 'occupied', redraw
```

The hover highlight lives in a **separate** `hoverGraphics` object that is cleared and redrawn every `pointermove`. This way the main grid graphics are not touched on hover — only on actual placement.

---

## Working Code

All source files are in the project. Run `npm run dev` to start.

### Key decisions embedded in code

| Decision | Reason |
|---|---|
| `Phaser.AUTO` renderer | Let Phaser pick WebGL or Canvas; don't force either |
| `Scale.FIT + CENTER_BOTH` | Game scales to window without letterbox distortion |
| Grid origin computed from canvas center | Grid is always centered regardless of window size |
| `draw()` redraws the full grid | Simple; 10×8 = 80 cells is trivial for Phaser Graphics |
| `hoverGraphics` separate from `graphics` | Hover doesn't invalidate grid draw |
| No game loop logic in Day 1–2 | `update()` left empty intentionally |

---

## Day 1–2 Done Criteria

- [ ] `npm run dev` opens browser with no errors
- [ ] Dark grid is visible, centered in the window
- [ ] Source cell (green) and target cell (red) are visible
- [ ] Hovering over a cell shows an amber outline
- [ ] Clicking an empty cell turns it to occupied (warm brown)
- [ ] Clicking source/target/occupied does nothing
- [ ] `npm run build` produces a `/dist` folder that works in a browser
- [ ] No TypeScript errors (`tsc --noEmit`)
