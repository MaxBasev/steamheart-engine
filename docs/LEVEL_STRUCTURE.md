# Level Structure

---

## Campaign Overview

The jam version targets **10 levels** total. This is achievable for a solo developer while providing enough content to feel like a complete experience. Each level is a hand-authored puzzle with a fixed grid and deterministic part queue.

- **Total play time target (first run):** 30–60 minutes
- **Average level length:** 2–5 minutes
- **Retry budget:** Most players will retry at least 2–3 levels

---

## Suggested Level Count

| Phase | Levels | Focus |
|---|---|---|
| Tutorial | 1–2 | Teach grid, gears, activation |
| Basic Machines | 3–5 | Add pipes, valves, jammed parts |
| Intermediate | 6–8 | Add belts/axles, pressure management |
| Complex / Finale | 9–10 | Multi-system machines, tight grids |

---

## Mechanic Introduction Order

Introduce exactly one new mechanic per level, never two:

| Level | New Mechanic | Notes |
|---|---|---|
| 1 | Grid + Gear placement + Activation | No queue, pre-filled; just tap ACTIVATE to understand win state |
| 2 | Queue feed + Discard | Simple gear chain; player must place from queue |
| 3 | Axle part | Straight-line transmission corridor |
| 4 | Pipe segment + Vent | Introduce pressure visually; no fail yet |
| 5 | Valve + Pressure buildup | First level where pressure can cause failure |
| 6 | Jammed / Scrap part | Appears in queue; must be managed |
| 7 | Belt (if implemented) | Cross-grid connection |
| 8 | Multi-source pressure | Two boilers, harder venting puzzle |
| 9 | Tight grid + Blocked zones | Obstacle cells, less room to work |
| 10 | Full machine — all systems | Grand finale machine; all learned parts in play |

---

## Example Level Progression

### Level 1 — The Fan (Tutorial)
- **Machine:** A simple ventilation fan
- **Grid:** 4×4, mostly pre-filled
- **Task:** Place 2 gears to complete the chain from source to fan blade
- **Queue:** N/A — parts are pre-placed for player; just learn to activate
- **Goal:** Understand what activation looks like
- **New mechanic:** Grid, basic gear connection, ACTIVATE button

### Level 2 — The Bellows
- **Machine:** A bellows pumping air into a forge
- **Grid:** 5×4
- **Task:** Place gears from the queue to connect crank to bellows
- **Queue:** 5 gears, 1 scrap part (scrap can be placed off the path or discarded)
- **Goal:** Build a working rotation chain
- **New mechanic:** Queue feed, discard token

### Level 3 — The Watermill (no water, just axles)
- **Machine:** A millstone
- **Grid:** 6×5
- **Task:** Route motion through a narrow corridor using axles
- **Queue:** Mix of gears and axles
- **Goal:** Learn axle directionality
- **New mechanic:** Axle

### Level 4 — The Cooling Tower
- **Machine:** A large fan with steam pipes
- **Grid:** 6×5
- **Task:** Build motion chain + route pipes from boiler to vent
- **Queue:** Gears + pipe segments + 1 vent
- **Goal:** First exposure to pressure — low stakes, no fail condition yet
- **New mechanic:** Pipe, boiler (pre-placed), vent

### Level 5 — The Steam Gate
- **Machine:** A pressure-operated gate/lock
- **Grid:** 7×5
- **Task:** Connect motion + manage pressure so it doesn't burst before activation
- **Queue:** Mix including valve
- **Goal:** First level where overpressure = failure
- **New mechanic:** Valve, pressure buildup failure

### Level 6 — The Sorting Machine
- **Machine:** A conveyor-style part sorter (visual only — not a real conveyor mechanic)
- **Grid:** 7×6
- **Task:** Build gear chain while navigating jammed parts in the queue
- **Queue:** High proportion of scrap parts; limited discards
- **Goal:** Teach scrap management
- **New mechanic:** Jammed/scrap queue pressure

### Level 7 — The Drawbridge (Belt level)
- **Machine:** A bridge-lifting mechanism
- **Grid:** 8×5 with a central gap
- **Task:** Use a belt to span a gap in the gear chain
- **Queue:** Gears + belt + axles
- **Goal:** Teach belt usage
- **New mechanic:** Belt (Tier 2 — include if belt is implemented, otherwise skip)

### Level 8 — The Refinery Manifold
- **Machine:** A multi-boiler chemical processor (visual only)
- **Grid:** 8×6
- **Task:** Manage two boiler pressure sources, route motion, prevent burst
- **Queue:** Heavy mix; limited vents
- **Goal:** Multi-system pressure management
- **New mechanic:** Two independent pressure zones converging

### Level 9 — The Crusher
- **Machine:** A press/crusher
- **Grid:** 10×7 with many blocked cells
- **Task:** Navigate tight grid; route through obstacles; manage pressure
- **Queue:** Broad mix; limited discards
- **Goal:** Test full player mastery under constraint
- **New mechanic:** Dense obstacle grid

### Level 10 — The Grand Engine
- **Machine:** The full workshop centrepiece — a multi-piston, multi-gear, steam-powered engine
- **Grid:** 10×8
- **Task:** All systems — rotation chain, pressure routing, valve management, junk avoidance
- **Queue:** Large and varied
- **Goal:** Victory condition for the whole campaign
- **New mechanic:** Scale and spectacle — the machine is the biggest and most animated yet

---

## Difficulty Ramp Guidelines

- Early levels (1–3): Only one thing can go wrong. Player should succeed on attempt 2 at worst.
- Mid levels (4–7): 2–3 things can go wrong. Retry is expected.
- Late levels (8–10): 4+ interacting systems. Players may spend 5–10 minutes total including retries.

**Never punish the player for experimenting.** Retry should be instant.

---

## Machine Theme Ideas (for level variety)

| Machine | Visual Concept | Dominant System |
|---|---|---|
| Fan / Ventilator | Spinning blades | Motion chain |
| Forge Bellows | Pumping air | Gear chain |
| Watermill | Rotating millstone | Axle routing |
| Steam Gate | Pressure-operated lock | Pressure management |
| Printing Press | Rotating drum + arm | Belt / piston |
| Clocktower | Large gear assembly | Complex gear routing |
| Lifting Crane | Drum winding cable | Motion + belt |
| Pipe Organ | Steam valves + pipes | Pressure routing |
| Grand Engine | Everything | All systems |

---

## Level Data Format (suggested)

Each level is defined in a JSON/data config file containing:
- Grid dimensions
- Locked cell list with part types
- Source cell location + motion type
- Target cell location + activation type
- Part queue array (ordered list of part types)
- Discard token count
- Pressure settings (if applicable)
- Optional: challenge condition string

This data-driven approach means levels can be authored and tuned without touching engine code.
