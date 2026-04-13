# Steamheart

**Gamedev.js Jam 2026 Entry** | Theme: *Machines*

---

## Overview

Steamheart is a steampunk machine-building puzzle/arcade game made for Gamedev.js Jam 2026.

The player assembles working contraptions from gears, pipes, pistons, and other machine parts on a grid. Parts arrive from a feed queue. The goal is to route motion from a power source to a target mechanism and bring the machine to life — spinning, hissing, and producing steam.

---

## Jam Context

- **Jam:** Gamedev.js Jam 2026
- **Theme:** Machines
- **Duration:** 13 days (solo developer)
- **Platform requirement:** Runs in browser, no plugins
- **Default language:** English
- **New project:** Built from scratch for this jam

---

## Core Idea

You are given a machine frame with a power source on one side and a target mechanism on the other. Parts stream in from a queue. You place them on the grid, connecting gears to axles, pipes to valves, belts to flywheels. When you hit Activate — if the machine is correctly assembled — it roars to life. If not, something jams, overheats, or explodes.

---

## High-Level Features

- Grid-based part placement (no free-form physics)
- Motion transmission chain: source → parts → target
- Part queue / feed system
- Pressure / boiler stress as a risk/fail mechanic
- Visual activation payoff: spinning gears, steam bursts, animated gauges
- ~10 handcrafted levels with escalating complexity
- Steampunk visual aesthetic
- Sound design that sells the machine feel

---

## Tech Assumptions

> See `docs/TECH_NOTES.md` for full technical breakdown.

- **Framework:** Phaser 3 (browser-native, no plugins)
- **Language:** JavaScript (or TypeScript — TBD)
- **Build tool:** TBD (Vite likely)
- **Assets:** Custom or CC0-licensed art and audio
- **AI tools:** May be used for asset generation; all content must be original or license-clear

---

## Development Philosophy

| Principle | What it means in practice |
|---|---|
| **Jam-first** | Ship something playable and fun, not technically perfect |
| **Scope control** | Cut features early, not late |
| **Browser-first** | Every decision made with browser build in mind |
| **English-first** | All text, labels, and UI default to English |
| **MVP discipline** | Core loop must work before any polish begins |

---

## Documentation Index

| File | Purpose |
|---|---|
| `docs/GAME_CONCEPT.md` | Pitch, genre, player fantasy |
| `docs/GAMEPLAY_LOOP.md` | Core loop, win/lose, pacing |
| `docs/CORE_MECHANICS.md` | System rules, MUST HAVE vs NICE TO HAVE |
| `docs/PARTS_AND_SYSTEMS.md` | Part catalog with roles and difficulty |
| `docs/LEVEL_STRUCTURE.md` | Campaign structure, level progression |
| `docs/ART_DIRECTION.md` | Visual style, FX, animation priorities |
| `docs/AUDIO_DIRECTION.md` | Sound design, SFX list, priorities |
| `docs/JAM_RULES_AND_COMPLIANCE.md` | Jam rules, compliance checklist |
| `docs/PRODUCTION_PLAN.md` | Timeline, milestones, scope control |
| `docs/TECH_NOTES.md` | Architecture, scenes, state management |

---

## Recommended MVP

> See `docs/RECOMMENDED_MVP.md` for the minimal shippable version.
