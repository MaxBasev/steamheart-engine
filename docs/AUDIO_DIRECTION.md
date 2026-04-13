# Audio Direction

---

## Audio Style and Mood

**Style:** Industrial mechanical ambience with steampunk character.

**Mood:** Purposeful and rhythmic. The sound of a machine should feel satisfying — every click, hiss, and clank has weight. Not chaotic, not cute. Mechanical.

**Influences (mood, not sample sources):** Steam locomotives, factory floors, clockwork mechanisms, Victorian industrial machinery.

**Key audio qualities:**
- Rhythmic and repetitive (machines run in cycles)
- Textured metal: clanks, ticks, rattles
- Steam: hisses, puffs, pressure releases
- A tonal warmth from brass and wood resonance

---

## Essential SFX List

### Placement and Interaction

| Sound | Description | Priority |
|---|---|---|
| `part_place` | Short metallic clank, satisfying — placing a part on the grid | MVP |
| `part_rotate` | Quick ratchet click — rotating a part | MVP |
| `part_discard` | Clunk into a scrap bin | MVP |
| `button_click` | Heavy lever-throw or button press | MVP |
| `hover_tick` | Subtle tick when cursor moves between grid cells | Nice to have |

### Machine Running (Activation Success)

| Sound | Description | Priority |
|---|---|---|
| `activate_start` | The moment the ACTIVATE button fires — a buildup sound, a deep mechanical whomp | MVP |
| `gear_loop` | Continuous ticking/spinning loop while machine runs | MVP |
| `steam_hiss_short` | A brief steam vent puff — fires per-vent on activation | MVP |
| `steam_hiss_loop` | Sustained hiss for ongoing steam output (ambient during run) | Nice to have |
| `machine_run_loop` | Background rumble/rhythm loop while machine runs | Nice to have |
| `win_fanfare` | Short victory sound — a satisfying mechanical resolution, not a trumpet | MVP |

### Pressure System

| Sound | Description | Priority |
|---|---|---|
| `pressure_warning` | Ticking or beeping that ramps up as pressure approaches critical | MVP |
| `valve_open` | Valve click — open/close toggle | MVP |
| `vent_release` | Pressure bleeding off — hiss + relief | Nice to have |
| `pressure_burst` | BOOM — pipe bursts, pressure explosion | MVP |
| `pressure_critical` | Loud, rapid ticking — imminent burst warning | MVP |

### Failure States

| Sound | Description | Priority |
|---|---|---|
| `jam_grind` | Gear grinding sound — for a jammed part in the motion chain | MVP |
| `chain_break` | Metallic snap — motion chain broken on activation | MVP |
| `explosion_small` | Burst / bang for pressure failure | MVP |

### UI / Menus

| Sound | Description | Priority |
|---|---|---|
| `menu_navigate` | Subtle tick/click for menu cursor movement | Nice to have |
| `menu_select` | Satisfying click for menu selection | Nice to have |
| `level_start` | Short flourish — level begins | Nice to have |
| `level_complete` | Victory confirmation — level card appears | MVP |

---

## Music

**Approach for jam:** Minimal or optional. Music is risky under time pressure because:
- Copyright-free music that fits the mood is hard to source quickly
- Custom music composition is a time sink
- Looping seamlessly requires care

**Recommended approach:**
1. **No music** — let SFX carry the atmosphere
2. **Or:** a single ambient industrial track (short, loopable, no melody — just rhythmic ambience) playing in background
3. If AI-generated music is used: verify license explicitly, document it in credits

**If you add music**, it should be:
- Slow, rhythmic, mechanical
- Not melodic or upbeat — subtle underscore only
- Under 60 seconds, loopable

---

## Audio Implementation Notes

### Web Audio Considerations
- Use Phaser's built-in audio manager (Web Audio API)
- Preload all SFX in the loading scene
- Use audio sprites for small SFX to reduce HTTP requests
- Test on Chrome and Firefox — Web Audio behavior can differ

### Looping Sounds
- Gear spin loop: should start/stop cleanly on activation/deactivation
- Pressure warning: pitch or volume ramp as pressure value changes (simple lerp)
- Machine run loop: fade in on activation, fade out on win screen

### Volume Guidelines
- SFX should be prominent (0.6–0.8 normalized)
- Ambient loops should be subtle (0.2–0.4)
- Failure sounds should punch through — slightly louder than placement SFX

---

## What to Fake If Time Is Short

If audio time is scarce, fake it in this order:

1. **Reuse and pitch-shift:** One metallic clank pitched up/down covers many variation needs
2. **One steam sound:** A single hiss SFX played at different volumes/pitches covers all steam scenarios
3. **Skip music entirely:** No music is better than bad music or a copyright risk
4. **One failure sound:** A single "crunch + buzz" sound covers jam, burst, and chain-break
5. **Skip ambient loops:** Static SFX only, no looping machine ambience

The single most impactful audio moment is the **activation sequence** — the startup whomp + gear spin beginning + steam puff. This should be the last audio piece cut and the first one polished.

---

## Asset Sources (if not creating originals)

- **Freesound.org:** CC0 / CC licensed mechanical SFX. Good for clunks, steam, metallic sounds.
- **OpenGameArt.org:** CC0 audio assets. Check license per file.
- **AI-generated SFX:** Permissible per jam rules, but must be verified copyright-clear. Document the tool used in credits.

**Do not use:** Any commercial sound library samples without explicit license. Do not use in-game audio sourced from movies, other games, or YouTube.
