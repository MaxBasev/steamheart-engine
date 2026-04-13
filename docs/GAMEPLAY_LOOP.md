# Gameplay Loop

---

## Core Loop (One Level)

```
Enter level
  → See the machine frame, power source, target mechanism
  → Parts begin arriving in the queue
  → Place parts on the grid to build a motion chain
  → Manage pressure if needed (open valves, vent steam)
  → Hit ACTIVATE when ready
      → If valid: machine runs, win animation plays
      → If invalid: failure state triggers (jam, burst, overheat)
  → Advance to next level (or retry)
```

---

## Moment-to-Moment Play

Each moment during part placement, the player is making decisions:

1. **Read the board** — What's already placed? Where is the source? Where is the target?
2. **Read the queue** — What part is next? What's coming after?
3. **Place or discard** — Place the current part on the grid, or discard it (limited discards per level)
4. **Rotate** — Parts can be rotated before placement
5. **Plan ahead** — Queue is partially visible, so forward planning is possible
6. **Monitor pressure** — Some parts (boilers, pipes) build pressure over time; the player must manage vents/valves before activating

The turn structure is **not strictly time-pressured** in puzzle levels, but later levels may introduce a slow pressure-build timer that rewards faster decisions.

---

## Win State

The machine is **activated** when:
- A valid motion path exists from the power source to the target mechanism
- All required connections (gear mesh, pipe flow, belt route) are satisfied
- Pressure is within safe limits at activation time

On a valid activation:
- Gears begin spinning
- Steam vents fire
- Gauges animate to the green zone
- Target mechanism executes (fan spins, press slams, lift rises, etc.)
- Victory screen appears with level score/rating

---

## Lose State

Failure can occur in two ways:

### 1. Activation Failure
Player hits ACTIVATE but the machine is not correctly assembled:
- Missing connection in the motion chain
- Mismatched gear sizes causing a jam
- Pipe dead-ends with no vent
- Overpressure at activation

Visual feedback: the machine starts up, then breaks — sparks, a seized gear, a burst pipe, a pressure explosion.

### 2. Passive Failure (pressure-based levels)
- Pressure builds over time if pipes/boilers are blocked
- If pressure reaches critical before player activates, a failure event triggers
- Player can vent manually to buy time

**Retry is always available** — failure is informative, not punishing.

---

## Risk / Reward

| Risk | Reward |
|---|---|
| Using a rare/powerful part early | Solves a hard connection, but it may be needed later |
| Discarding a bad part | Clears queue space, but discards are limited |
| Activating with high pressure | Machine runs faster/scores higher, but margin for error is lower |
| Overfilling a zone with parts | Blocks future placements |

Risk/reward deepens as levels add optional challenge conditions (activate under X pressure, use fewer parts, don't discard any parts).

---

## Progression Structure

### Phase 1: Tutorial (Levels 1–2)
- Introduction to the grid and placement
- Simple gear-to-gear connection
- No pressure system yet
- Win on first correct chain

### Phase 2: Basic Machines (Levels 3–5)
- Introduce axles and belts
- Introduce pipes and valves
- First pressure mechanic (passive buildup)
- Multiple valid solutions possible

### Phase 3: Intermediate Challenges (Levels 6–8)
- Introduce pistons and flywheels
- Blocked zones / pre-filled obstacles on the grid
- Jammed/scrap parts appear in queue
- Time pressure on some levels

### Phase 4: Complex Machines (Levels 9–10)
- Full machine assembly with 4–6 distinct part types
- Multiple pressure sources
- Tight grid with limited placement space
- Optional challenge goals (efficiency, speed, perfect activation)

---

## Design Goals for Feel and Pacing

- **Satisfaction over frustration:** Failure should feel explainable, not arbitrary. The machine tells you what went wrong.
- **Short levels:** Even late levels should be solvable in under 5 minutes once understood.
- **Build curiosity:** Each level hints at what the machine does before activation — players should want to see it run.
- **Activation is the payoff:** Do not underinvest in the activation animation. It is the reward.
- **Retry is fast:** Lose screen → retry in under 2 seconds. No punishment for experimenting.
- **No pixel-hunting:** Grid snapping makes placement always feel clean and intentional.
