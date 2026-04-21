# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Commands

```bash
npm run dev       # Vite dev server at localhost:5173
npm run build     # tsc --noEmit then Vite production build → /dist
npm run preview   # Serve /dist locally to verify the production bundle
```

There are no tests and no linter configured yet.

---

## Project Context

**Steamheart** is a steampunk machine-building puzzle game built for Gamedev.js Jam 2026 (theme: *Machines*). Solo developer, 13-day jam.

The game is **Phaser 3 + TypeScript + Vite**, output is a static browser bundle deployed to itch.io.

---

## Architecture

### Scene pipeline

`BootScene` → `PreloadScene` → `GameScene` (registered in `src/main.ts` in that order; Phaser starts the first automatically).

- **BootScene** — no logic, immediately transitions forward
- **PreloadScene** — loads all sprites and SFX; background music and floor tiles are lazy-loaded after scene start to avoid blocking
- **GameScene** — owns the `Grid` instance, input handling, HUD, and result overlay

### Grid system

`src/objects/Grid.ts` is the core data structure — **pure data model + renderer**, no Phaser scene dependency beyond the `Graphics` object injected at construction.

Key design decisions:
- `cells: Cell[][]` is the single source of truth. `draw()` is a full redraw after any mutation.
- `hoverGraphics` in `GameScene` is a **separate** `Graphics` object from the grid's own graphics.
- `worldToCell()` returns `null` for out-of-bounds — always check before using.
- `placeAt()` enforces `state === 'empty'` — callers don't need to guard separately.
- `getTargetCells()` returns all cells with `state === 'target'` (supports multi-target levels).

### Level data

Levels are defined in `src/data/levels.ts` as a `LEVELS: LevelData[]` array. `GameScene.create()` reads `data?.levelIndex` passed via `scene.restart()`.

`LevelData` schema (see `src/types/index.ts`):
- `cols / rows` — grid dimensions (vary per level, up to 14×11)
- `sourceCol/Row`, `targetCol/Row` — primary source and target
- `extraTargets?` — additional targets; ALL must be reached to win
- `lockedCells` — impassable wall cells
- `prePlacedParts?` — parts placed before play (e.g. pre-placed H-axle chokepoints)
- `queue` — ordered list of `PartType` the player receives
- `pressure?` — optional pressure config (enabled on levels 4–14)
- `instruction?` — hint shown in the HUD

### Part types

Three types in `src/types/index.ts`:
- **gear** — connects all 4 sides; rotation irrelevant for connectivity
- **axle** — connects 2 opposite sides only; even rotation = horizontal, odd = vertical
- **corner** — connects exactly 2 adjacent sides in an L-shape; rotation 0–3 clockwise: `0=right+down`, `1=down+left`, `2=left+up`, `3=up+right`

### Chain validation

`src/systems/validateChain.ts` — BFS from source through placed parts to all target cells. Returns `{ valid, reachable, reachedTargets }`. Win requires `reachedTargets.length === targets.length`.

### Mobile support

- `Phaser.Scale.FIT` for responsive canvas
- `POINTER_DOWN` / `POINTER_MOVE` handle both mouse and touch
- On-screen ROTATE / GO buttons added when `this.sys.game.device.input.touch`
- Portrait mode blocked via CSS `@media (orientation: portrait)` overlay in `index.html`

---

## Jam constraints

- Browser build must work with no plugins — always verify `npm run build` + `npm run preview`
- Default language is English — no i18n layer
- All assets are AI-generated (art: AI tools; audio: Gemini + Suno AI) — documented in `CREDITS.md`
