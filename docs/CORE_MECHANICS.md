# Core Mechanics

---

## Grid System

- The play area is a **fixed rectangular grid** (e.g. 8×6 or 10×8 cells depending on level)
- Each cell holds exactly **one part** or is **empty**
- Some cells are **locked** (pre-filled by level design: walls, obstacles, fixed parts)
- The grid has **no physics** — motion is logical, not simulated
- Parts snap to cells; no sub-cell positioning

### Grid Cell States
| State | Description |
|---|---|
| `empty` | Available for placement |
| `occupied` | Has a player-placed part |
| `locked` | Pre-set by level (obstacle, fixture, decoration) |
| `source` | Power origin (always pre-set) |
| `target` | Win-condition mechanism (always pre-set) |

---

## Motion Transmission

Motion is a **discrete signal** that propagates across the grid according to connection rules.

- **Source** emits motion (rotational or linear, depending on level)
- Motion travels to adjacent cells if the parts are **compatible and correctly oriented**
- A **valid chain** = unbroken path of compatible parts from source to target
- Motion does not wrap around edges; it strictly follows cell adjacency (up/down/left/right)

### Transmission Rules
- Motion can be transferred between compatible parts that share an edge
- Rotation direction can be preserved or inverted depending on part type
- A single broken link in the chain = no activation
- Multiple paths to target are allowed (redundant connections are valid)

### Motion Types
- **Rotational** — gear-to-gear, belt-driven
- **Linear** — piston stroke, rack-and-pinion (optional / later levels)

---

## Gear Interaction Rules

Gears are the primary transmission part.

- Two adjacent gears **mesh** if they share an edge (horizontally or vertically adjacent)
- Meshed gears transfer rotation; direction reverses on each mesh
- A gear can mesh with up to 4 neighbors (one per side)
- **Size rule (simplified):** All gears in MVP are the same functional size; visual variety is cosmetic only (jam-realistic simplification)
- A gear with no incoming motion and no connection to source does not spin
- A **jammed part** in between two gears breaks the chain at that point

---

## Pressure / Boiler Stress System

Pressure is a **secondary resource** that adds risk management.

### Pressure Sources
- Boiler parts and certain pipe segments generate pressure passively
- Pressure increases over time once a boiler is placed and connected
- Pipes carry pressure from boiler to other connected cells

### Pressure States
| Level | Effect |
|---|---|
| 0–50% | Safe — no effect |
| 50–80% | Warning — gauges flash, steam vents audibly |
| 80–100% | Critical — machine may burst if activated or if no vent relief |
| 100%+ | Failure event — pipe burst, boiler explosion animation |

### Pressure Management
- **Valve parts** can be opened/closed to route or block pressure flow
- **Vent parts** release pressure passively when placed; release rate is fixed
- Player must ensure pressure is below critical before or at activation
- Some levels reward **high-pressure activation** (faster machine, bonus score)

### Simplification for MVP
- Pressure is per-level, not per-pipe-segment (global pressure gauge)
- No fluid simulation — pressure is a single numeric value that rises and falls based on connected parts
- Visual representation: one large pressure gauge in the HUD + color state on boiler/pipe cells

---

## Part Placement Rules

- Parts come from the **queue** one at a time
- The player must **place or discard** the current part before the next appears
- Parts can be **rotated** (90° steps) before placement
- Once placed, a part **cannot be moved** (MVP rule — simplifies undo logic)
- A placed part can be **removed** at the cost of a scrap token (limited per level)
- Parts cannot be placed on locked, occupied, source, or target cells

### Queue Rules
- Queue shows **3 upcoming parts** (current + 2 preview)
- Queue order is fixed per level (deterministic, not random — this is a puzzle game)
- Discarding costs 1 discard token; each level has a limited supply (e.g. 2–3)

---

## Activation Rules

The player manually triggers **ACTIVATE** at any time.

### Activation Check Sequence
1. Is there a valid motion chain from source to target?
2. Are all required pressure connections in a safe state?
3. Are there no jammed parts in the chain path?

If **all pass**: success — machine runs.  
If **any fail**: fail state triggers with visual indication of the specific broken link.

### Partial Activation
- Not in MVP — the machine either works or it doesn't
- Post-jam idea: partial runs where some subsystems work but target is not reached

---

## Failure Conditions

| Condition | Trigger | Visual |
|---|---|---|
| Broken chain | No path from source to target | Sparks at the broken link, gear freezes |
| Pressure burst | Pressure reaches 100%+ | Pipe explosion animation, steam burst |
| Jam | Jammed part is in the motion path | Grinding sound, gear seize |
| Discard overflow | Too many discards used | Scrap pile overflows, level fails |

All failures include a **clear visual explanation** of what went wrong.

---

## Simplifications for Jam Realism

These are intentional scope reductions that keep the game buildable in 13 days:

| Simplified rule | Why it's fine |
|---|---|
| No gear sizes / ratio logic | Visual variety without mechanical complexity |
| Global pressure (not per-pipe) | One gauge is readable; per-pipe fluid sim is a full system |
| No part movement after placement | Eliminates undo/move state complexity |
| Deterministic queue | Makes puzzle design and difficulty control predictable |
| No diagonal connections | Grid stays readable and rules stay simple |
| Fixed grid per level | No procedural generation needed |
| Linear success check only | No partial/intermediate states to simulate |

---

## MUST HAVE (MVP)

- [ ] Grid rendering with cell states
- [ ] Part placement on grid (with rotation)
- [ ] Queue system (3 visible, deterministic)
- [ ] Discard with limited tokens
- [ ] Gear-to-gear motion transmission
- [ ] Source → Target path validation
- [ ] Activation trigger + success/fail outcome
- [ ] Pressure system (global gauge, boiler, vent, valve)
- [ ] Jammed/scrap part type
- [ ] At least 6 playable levels

---

## NICE TO HAVE

- [ ] Belt part type
- [ ] Piston / linear motion type
- [ ] Per-cell pressure visualization
- [ ] Part removal with scrap token cost
- [ ] Optional challenge goals per level
- [ ] Slow pressure timer on later levels
- [ ] Level score / rating system

---

## POST-JAM / TOO AMBITIOUS NOW

- [ ] Per-pipe pressure fluid simulation
- [ ] Gear ratio / speed mechanics
- [ ] Procedural level generation
- [ ] Partial machine activation states
- [ ] Freeform (non-grid) part placement
- [ ] Multiplayer or competitive modes
- [ ] Part crafting / upgrade system
