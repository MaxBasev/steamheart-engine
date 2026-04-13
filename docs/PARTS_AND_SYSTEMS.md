# Parts and Systems

---

## Overview

Parts are the building blocks of every machine. Each part occupies one grid cell, has specific connection rules, and contributes to motion, pressure, or both.

**Part properties:**
- **Name** — identifier
- **Purpose** — what it does in the machine
- **Gameplay role** — how the player uses it to solve puzzles
- **Behavior rules** — exact interaction logic
- **Implementation difficulty** — estimated solo-dev cost (Low / Medium / High)

---

## TIER 1 — Must Have for MVP

These parts are required for the core game to work.

---

### Gear

**Purpose:** Primary motion carrier. The workhorse of every machine.

**Gameplay role:** Connect gears edge-to-edge to transmit rotation from source toward target. The most common part in the queue.

**Behavior rules:**
- Transmits rotation to all adjacent meshed gears
- Reverses rotation direction on each mesh
- Can mesh with up to 4 neighbors
- Does not transmit to non-gear, non-axle parts by default

**Visual:** Toothed wheel, brass/copper. Visible spinning animation on activation.

**Implementation difficulty:** Low — simple adjacency check and state propagation

---

### Axle

**Purpose:** Carries rotation in a straight line without reversing direction.

**Gameplay role:** Used to bridge gaps or pass motion through a cell that shouldn't be a gear. Often placed in narrow corridors.

**Behavior rules:**
- Has two connection points: one input side, one output side (defined by orientation)
- Passes rotation through without reversal
- Cannot mesh with gears on its perpendicular sides — only on its aligned axis

**Visual:** Horizontal or vertical rod with a center hub. Spins along its axis on activation.

**Implementation difficulty:** Low — directional connection with orientation check

---

### Pipe Segment

**Purpose:** Carries pressure between connected cells.

**Gameplay role:** Routes steam from boiler to valves, vents, and pressure-sensitive parts. Building a valid pressure path is often as important as building a motion path.

**Behavior rules:**
- Connects to adjacent pipe, boiler, valve, or vent cells
- Does not transmit motion
- Contributes to global pressure level when connected to a boiler
- A dead-end pipe (no vent exit) causes pressure to build faster

**Visual:** Riveted copper tube with end caps. Wobbles or shakes slightly under high pressure.

**Implementation difficulty:** Low — pipe connection is a subset of adjacency logic already used for gears

---

### Boiler

**Purpose:** Pressure source. Generates steam passively once placed.

**Gameplay role:** A boiler is usually pre-placed by the level — the player builds pipes around it. On rare occasions, a boiler arrives in the queue as a required part.

**Behavior rules:**
- Generates +X pressure per second (or per turn, depending on implementation)
- Must be connected to at least one pipe segment to distribute pressure
- Cannot transmit motion
- Visual state changes at 50%, 80%, 100% pressure

**Visual:** Riveted cylindrical tank with a pressure gauge on top. Shakes visibly near critical pressure.

**Implementation difficulty:** Low — it's essentially a timer that modifies the global pressure variable

---

### Valve

**Purpose:** Controls pressure flow. Can be opened or closed by the player.

**Gameplay role:** The player uses valves to route or block pressure, protecting critical parts from overpressure, or directing flow toward a specific machine subsystem.

**Behavior rules:**
- Two states: open (pressure flows through) or closed (pressure blocked)
- Player can toggle valve state at any time before activation
- Does not transmit motion
- When closed, acts as a pressure dead-end for the connected side

**Visual:** T-shaped pipe fitting with a visible handle. Handle position indicates open/closed state.

**Implementation difficulty:** Low — binary toggle state, affects pressure routing flag

---

### Vent

**Purpose:** Releases pressure. Prevents overload.

**Gameplay role:** The player places vents at pipe dead-ends or strategic points to bleed off pressure and keep the machine safe. Essential for boiler management.

**Behavior rules:**
- When connected to a pressurized pipe, releases pressure at a fixed rate
- Cannot be closed (always venting)
- Does not transmit motion
- Visual: emits a small steam puff particle at intervals

**Visual:** Pipe end with a flared opening. Emits small steam wisps when active.

**Implementation difficulty:** Low — reduces global pressure by a fixed delta per tick

---

### Jammed Part / Scrap

**Purpose:** Obstacle. Breaks motion chains.

**Gameplay role:** Scrap parts appear in the queue and must be placed somewhere harmless (off the motion path) or discarded. If placed in the chain, they block motion and cause activation failure.

**Behavior rules:**
- Occupies a grid cell like any other part
- Does NOT transmit motion in any direction
- Does NOT transmit pressure
- Visually distinct — rusty, broken, clearly non-functional
- If placed on the motion path, triggers "jam" failure state on activation

**Visual:** Crumpled, rusty piece of metal. Maybe a broken gear with a crack through it.

**Implementation difficulty:** Very Low — it's a cell state with no transmission logic at all

---

## TIER 2 — Good Additions If Time Allows

These parts add variety and deeper puzzle design, but the game works without them.

---

### Belt

**Purpose:** Transmits rotation across a distance, including through non-adjacent cells.

**Gameplay role:** Connects two distant gears or axles. Useful when the grid has gaps that can't be filled with gears. Does not reverse direction (unlike a direct gear mesh).

**Behavior rules:**
- Connects two anchor cells (both must have a gear or axle)
- Passes motion without direction reversal
- The cells between the anchors are "spanned" — no part can be placed in a spanned cell
- Only works in straight lines (horizontal or vertical)

**Visual:** A thick rubber/leather belt stretched between two wheels.

**Implementation difficulty:** Medium — requires span-reservation logic on the grid

---

### Flywheel

**Purpose:** Stores and smooths rotational energy. Acts as a motion buffer.

**Gameplay role:** In levels with intermittent motion sources (e.g. a piston), the flywheel keeps motion going between pulses. Also useful as a target mechanism visual.

**Behavior rules:**
- Requires motion input to "charge up" (2–3 ticks)
- Once charged, continues to transmit motion for a short time even if input is interrupted
- Not a chain link on its own — acts as a buffer/node

**Visual:** Large, heavy wheel. Spinning animation noticeably heavier/slower than a gear.

**Implementation difficulty:** Medium — requires a small state machine (idle / charging / spinning / coast)

---

### Piston

**Purpose:** Converts pressure into linear motion.

**Gameplay role:** Introduces linear motion type. Can power a target that requires a push/pull stroke rather than rotation. Bridges the pressure and motion systems.

**Behavior rules:**
- Requires both motion input AND pressure above a threshold to fire
- Fires in the direction it is oriented
- Connected to a pipe on one side (pressure input) and transmits linear motion on the other
- Can drive a rack or push a switch-type target

**Visual:** Cylinder and rod. Rod extends/retracts on activation.

**Implementation difficulty:** Medium-High — requires linear motion propagation, a second motion type

---

### Pressure Regulator

**Purpose:** Caps pressure output from a boiler/pipe section.

**Gameplay role:** Placed between a boiler and downstream pipes to limit max pressure to a safe level. Useful in later levels with multiple boilers.

**Behavior rules:**
- Passes pressure through, but caps it at a configurable maximum value
- Any pressure above the cap is vented automatically
- Does not transmit motion

**Visual:** Gauge-topped cylinder in line with pipe. Gauge needle visible.

**Implementation difficulty:** Low — simple math on the pressure delta calculation

---

### Rack / Gear Track (linear connector)

**Purpose:** Converts rotation to linear motion, or vice versa.

**Gameplay role:** Allows a motion chain to "turn a corner" from rotational to linear or to drive a piston-type target.

**Behavior rules:**
- One side connects to a rotating gear/axle
- Other side outputs linear motion
- Orientation matters — must be placed correctly to connect properly

**Visual:** A toothed rail with a small gear engaging it.

**Implementation difficulty:** Medium — requires linear motion type support

---

## TIER 3 — Too Ambitious / Post-Jam Ideas

Do not implement during the jam. Document for later.

---

### Governor / Speed Regulator

Controls rotational speed — only relevant if gear ratios are implemented. Post-jam.

### Steam Turbine

A large part that converts high-pressure steam directly into motion, bypassing gears entirely. Interesting mechanic but adds a third motion type.

### Multi-cell Parts

Parts that span 2×1 or 2×2 cells. Breaks the grid invariant, adds significant placement and collision complexity.

### Conveyor Part

A belt that moves objects along a row. Would require an entirely new "cargo" system.

### Clockwork Timer

A gear-based timer that delays motion transmission. Interesting puzzle design space but requires simulation of timing — not a jam feature.

### Explosive Vent

A one-time pressure burst part that can destroy adjacent jammed parts. Fun idea but requires destruction/mutation of the grid.

### Part Upgrade System

Upgrading parts between levels. Post-jam progression layer.

---

## Summary Table

| Part | Tier | Motion | Pressure | Difficulty |
|---|---|---|---|---|
| Gear | MVP | Yes | No | Low |
| Axle | MVP | Yes | No | Low |
| Pipe Segment | MVP | No | Yes | Low |
| Boiler | MVP | No | Yes (source) | Low |
| Valve | MVP | No | Yes (control) | Low |
| Vent | MVP | No | Yes (sink) | Low |
| Jammed / Scrap | MVP | No | No | Very Low |
| Belt | Tier 2 | Yes | No | Medium |
| Flywheel | Tier 2 | Yes (buffer) | No | Medium |
| Piston | Tier 2 | Yes (linear) | Yes (required) | Medium-High |
| Pressure Regulator | Tier 2 | No | Yes (limit) | Low |
| Rack / Gear Track | Tier 2 | Yes (converts) | No | Medium |
