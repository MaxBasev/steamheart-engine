# Art Direction

---

## Visual Identity

**Style:** Steampunk industrial — worn brass, aged copper, riveted iron, amber glass.

**Mood:** A cluttered but beloved workshop. This machine has been worked on for years. Everything is functional, slightly battered, and full of character.

**Tone:** Warm, amber-tinted. Not dark or grimy — more like gaslight warmth than coal-mine soot.

**Reference mood keywords:** Antiqued brass, tarnished copper, riveted steel, amber gauges, hissing steam, Victorian industrial.

---

## Color Palette

| Role | Color Description |
|---|---|
| Primary metal | Warm brass / aged bronze (#B8860B, #CD7F32 range) |
| Secondary metal | Copper pipe tones (#B87333) |
| Background / frame | Dark iron, deep charcoal (#2C2C2C, #3A3A3A) |
| Highlight / glow | Amber and orange (#FF8C00, #FFA500) |
| Steam / mist | Off-white to pale blue-grey |
| Danger / pressure | Deep red → bright red (#8B0000 → #FF2200) |
| Safe / active | Warm green (#4CAF50, slightly desaturated) |
| UI backgrounds | Dark leather / worn parchment tone |

Keep the palette tight. 4–6 main tones, not a rainbow.

---

## UI Style

- **HUD elements:** Brass-framed panels. Gauges and dials rather than progress bars.
- **Buttons:** Riveted metal buttons or lever switches. Not glossy. Not flat.
- **Typography:** A readable display font with a slightly mechanical or serif feel. Legibility over style — this is a jam, not a font showcase.
- **Queue display:** A pipe/chute on screen edge, with the upcoming part visible at the "mouth."
- **Pressure gauge:** A large analog dial, center-right or corner. Needle moves. Color changes by zone.
- **Discard count:** A small scrap bin icon with a number.
- **ACTIVATE button:** Large, prominent, satisfying to press. Should feel like throwing a lever.

---

## Grid Visual

- Grid lines: subtle, thin, dark — visible but not dominant
- Cell highlight on hover: soft amber glow
- Locked cells: slightly darker metal texture, no interaction glow
- Source cell: marked with a rotating crank or power symbol
- Target cell: marked with the target mechanism icon (fan blade, press arm, etc.)
- Occupied cells: show the placed part sprite; no grid line visible underneath
- Placement preview: ghost/silhouette of the part at cursor position before click

---

## Part Sprites

Each part should read clearly at grid cell scale (probably 64×64 or 80×80 px).

| Part | Key visual feature |
|---|---|
| Gear | Toothed wheel, brass, center hub |
| Axle | Horizontal/vertical rod with a round cross-section |
| Pipe Segment | Thick copper tube with end flanges, bolt rings |
| Boiler | Cylindrical tank, riveted, pressure gauge on top |
| Valve | T-junction pipe with a visible handle |
| Vent | Pipe end with a flared opening / cowl |
| Jammed / Scrap | Crumpled or cracked rusty part, distinctly broken-looking |

**Rotation:** All parts must be drawable in 4 rotations. Design sprites with 4-way symmetry where possible to reduce asset count.

---

## Animation Priorities

Prioritize these in order. Stop early if needed — partial animation is better than no animation.

### Priority 1 (MVP — must ship)
- **Gear spin** on activation — gears rotate continuously, speed appropriate
- **Steam puff** from vent cells on activation
- **Pressure gauge needle** moves up and down in real time
- **Failure animation** — at minimum, a screen shake + red flash

### Priority 2 (if time allows)
- **Boiler shaking** under high pressure
- **Pipe wobble** under pressure
- **Target mechanism animation** (unique per machine type — fan spinning, press slamming, etc.)
- **Part placement animation** — slight bounce/settle when placed on grid

### Priority 3 (polish, only if ahead of schedule)
- **Queue chute animation** — part slides in from pipe opening
- **Gauge needle flicker** at high pressure
- **Particle steam trails** along pipe path when activated
- **Screen vibration** during machine operation

---

## Environment / Frame

- The game is played inside a **workshop frame** — a visual border around the grid that looks like a heavy steel/brass machine housing
- Frame includes: rivets, bolts, pipes running around the edge, a nameplate for the level title
- Background behind the frame: a dark workshop wall, maybe a hint of brick or timber
- Level title as a stamped metal plate or engraved brass label

---

## FX Priorities

| FX | Priority | Notes |
|---|---|---|
| Steam burst (vent) | MVP | Particle or spritesheet, plays on activation |
| Spark / jam | MVP | Small spark burst at jam location |
| Screen shake | MVP | On failure event |
| Red flash overlay | MVP | On pressure burst |
| Gear spin trail | MVP | Rotation animation |
| Steam cloud (big burst on failure) | Medium | More elaborate particle burst |
| Ambient steam wisps | Low | Background idle steam on boiler cells |
| Gauge glow on green | Low | Soft green glow when machine runs successfully |

---

## Placeholder Strategy

What can be a basic placeholder early in dev without blocking progress:

| Asset | Acceptable placeholder |
|---|---|
| Grid cell | Colored rectangle |
| Gear sprite | Circle with evenly-spaced tick marks |
| Pipe | Thick colored line |
| Boiler | Rounded rectangle |
| Pressure gauge | Canvas-drawn arc with a line needle |
| Steam puff | White circle that fades out |
| Background frame | Solid dark rectangle border |
| UI buttons | Standard Phaser text buttons |

**Start with placeholders. Replace as art is ready.** Do not block gameplay coding on final art.

---

## What Matters Most for Screenshots and Presentation

The jam submission page will have screenshots. The one image that must look great:

> **The machine running** — gears spinning, steam venting, target mechanism animated, pressure gauge in the green, the whole grid alive at once.

Design the activation payoff specifically to be screenshot-worthy. This is the key marketing moment for the jam entry.

Secondary screenshot: the placement phase — showing the grid partially filled, queue visible, a gear hovering over a cell.
