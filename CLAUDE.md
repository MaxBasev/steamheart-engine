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

**Steamheart** is a steampunk machine-building puzzle game built for Gamedev.js Jam 2026 (theme: *Machines*). Solo developer, 13-day jam. Full design documentation is in `docs/` — read `docs/RECOMMENDED_MVP.md` for scope constraints before adding features.

The game is **Phaser 3 + TypeScript + Vite**, output is a static browser bundle deployed to itch.io.

---

## Architecture

### Scene pipeline

`BootScene` → `PreloadScene` → `GameScene` (registered in `src/main.ts` in that order; Phaser starts the first automatically).

- **BootScene** — no logic, immediately transitions forward
- **PreloadScene** — all `this.load.*` calls go here; transitions when done
- **GameScene** — owns the `Grid` instance and all input handling

A separate UI scene running in parallel (not yet created) will own the HUD once it grows beyond a debug label.

### Grid system

`src/objects/Grid.ts` is the core data structure. It is a **pure data model + renderer** — no Phaser scene dependency beyond the `Graphics` object injected at construction.

Key design decisions:
- `cells: Cell[][]` is the single source of truth. `draw()` is a full redraw called after any mutation — fine for a 10×8 grid.
- `hoverGraphics` in `GameScene` is a **separate** Phaser `Graphics` object from the grid's own graphics, so hover redraws don't invalidate grid state.
- `worldToCell()` returns `null` for out-of-bounds positions — always check before using the result.
- `placeAt()` enforces `state === 'empty'` — callers do not need to guard separately.

### Types

All shared interfaces live in `src/types/index.ts`:
- `CellState` — drives both rendering color and placement rules
- `Cell` — grid coordinate + state
- `GridConfig` — grid dimensions and pixel origin (computed once in `GameScene.create()` to center the grid)

### Level data (not yet implemented)

Levels will be JSON files in `src/data/levels/`. The planned schema is documented in `docs/TECH_NOTES.md`. `GameScene.create()` currently hardcodes grid dimensions and source/target positions — these will move to the level loader.

### Planned additions (see `docs/CORE_MECHANICS.md` for rules)

When implementing gameplay systems, the intended layering is:
1. **Part types** — extend `CellState` and add part metadata (type, rotation) to `Cell`
2. **Queue system** — a `currentPart` + queue array managed in `GameScene`
3. **Motion validation** — BFS from source cell to target cell through compatible parts (pure logic, no Phaser dependency)
4. **Pressure system** — a global numeric value modified by boiler/vent part counts per tick
5. **Activation** — runs motion validation + pressure check, triggers success or fail state

---

## Jam constraints to keep in mind

- Browser build must work with no plugins — always verify `npm run build` + `npm run preview` before considering anything done
- Default language is English — no i18n layer
- All third-party assets (art, audio, fonts) must be CC0/MIT/OFL or equivalent — document them in a CREDITS file before submission
- AI-generated assets are allowed but the tool's license terms must permit game jam use
