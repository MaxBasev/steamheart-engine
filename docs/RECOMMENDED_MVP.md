# Recommended MVP

---

## What the MVP Is

The Minimum Viable Version of Steamheart is a browser-playable puzzle game with:

- A working grid-based part placement system
- A deterministic queue feed with discard tokens
- Gear-to-gear motion transmission + path validation
- A pressure system with a global gauge, boiler, vent, and valve
- A jammed/scrap part that can break the chain
- Activation with success and failure states
- 6 handcrafted levels that teach mechanics one at a time
- Visible gear spin animation and steam puff on activation
- Basic win and fail feedback (animation + sound)
- A working browser build, submitted to the jam

**That is a complete game.** It fits the theme. It is playable. It has a beginning, middle, and end.

---

## The Exact Must-Have Systems

| System | What it must do |
|---|---|
| **Grid renderer** | Draw a grid of cells; show locked, empty, occupied, source, target states |
| **Part placement** | Player places the current part on an empty cell; part snaps to grid |
| **Part rotation** | Player can rotate part 90° before placement |
| **Queue system** | Ordered list of parts (deterministic per level); shows current + 2 upcoming |
| **Discard** | Player can discard the current part, limited tokens per level |
| **Gear part** | Placed gear meshes with adjacent gears; transmits rotation |
| **Axle part** | Transmits rotation in one axis without reversing direction |
| **Pipe part** | Carries pressure between adjacent pipe/boiler/valve/vent cells |
| **Boiler** | Passive pressure source; increases global pressure over time |
| **Vent** | Passive pressure sink; reduces global pressure over time |
| **Valve** | Player-toggled open/close; controls whether downstream vents are active |
| **Scrap/jammed part** | Placed on grid; blocks motion transmission if in the chain |
| **Path validator** | BFS from source to target through compatible parts; returns valid/invalid |
| **Pressure tracker** | Global numeric value; rises from boilers; falls from vents; bursts at 100% |
| **ACTIVATE** | Runs path check + pressure check; triggers success or fail outcome |
| **Win state** | Gears spin, steam puffs, win screen appears |
| **Fail state** | Screen shake, error visual, retry button |
| **Level data** | JSON-driven level config; grid dimensions, locked cells, queue, pressure config |
| **Level sequence** | Levels 1–6 playable in sequence; win → advance, fail → retry |
| **Browser build** | Vite static bundle; loads and runs in Chrome and Firefox |

---

## What Can Be Safely Postponed

These are good features but do not block submission. Defer all of these if behind schedule:

| Feature | Why it can wait |
|---|---|
| Belt part | Gears + axles already solve the motion routing problem |
| Piston / linear motion | Adds a whole second motion type — significant scope |
| Per-cell pressure visualization | Global gauge is enough to communicate pressure state |
| Part removal / undo | Retry is free; undo is a quality-of-life addition |
| Level 7–10 | 6 levels is a complete jam experience; add more only if ahead |
| Star/score rating per level | Win/fail is sufficient feedback |
| Level select screen | Linear sequence is simpler and sufficient |
| Settings / volume controls | Browser defaults are fine for a jam build |
| Per-target machine animations | One generic "machine runs" animation covers all targets |
| Ambient background particles | Visual polish, not gameplay |
| Music | SFX alone is enough; music adds copyright risk and time cost |
| Credits scene | A text file in the submission page is acceptable |

---

## MVP Completion Test

Before considering the game "done enough to submit," verify:

- [ ] I can open the game in Chrome from a public URL
- [ ] I can play from Level 1 to Level 6 without crashing
- [ ] The gear spin plays when the machine activates
- [ ] The screen shakes when the machine fails
- [ ] The pressure gauge moves and changes color
- [ ] A jammed part correctly prevents activation
- [ ] I can discard parts and run out of discard tokens
- [ ] The game tells me what went wrong when I fail
- [ ] There are no JavaScript console errors during normal play
- [ ] The CREDITS attribution covers all third-party assets

If all of the above are true: **submit.**

Then, if time remains before the deadline, add polish in this order:

1. Levels 7–10
2. Per-target machine animations
3. Audio polish pass
4. Belt part
5. Any remaining Tier 2 features
