# Production Plan

---

## Overview

**Jam duration:** 13 days  
**Team size:** 1 (solo developer)  
**Daily commitment:** Estimate honestly — 4–6 hrs/day is realistic; 8+ is unsustainable over 13 days  
**Philosophy:** Build the smallest playable version first. Polish only what's working.

---

## Milestone Breakdown

### Day 1–2: Foundation
**Goal:** Project compiles and runs in browser. Core grid exists.

- [ ] Set up Phaser 3 project with build tooling (Vite recommended)
- [ ] Confirm browser build works end-to-end (localhost → built bundle → hosted URL)
- [ ] Implement grid rendering (cells, dimensions, states)
- [ ] Implement basic part sprite rendering on grid
- [ ] Implement click-to-place (placeholder parts)
- [ ] Basic scene structure (Boot → Preload → Menu → Game → Result)

**Deliverable:** You can see a grid and click on it.

---

### Day 3–4: Core Mechanics
**Goal:** Motion transmission chain works. Activation can succeed or fail.

- [ ] Implement gear part with adjacency meshing logic
- [ ] Implement source cell and target cell
- [ ] Implement path validation (BFS/DFS from source → target)
- [ ] Implement ACTIVATE button with pass/fail check
- [ ] Implement axle part
- [ ] Placeholder success and failure visual states

**Deliverable:** You can build a working gear chain and activate it.

---

### Day 5–6: Queue System + Pressure
**Goal:** The part feed and pressure system are functional.

- [ ] Implement queue data structure (ordered list per level)
- [ ] Implement queue UI (current part + 2 preview slots)
- [ ] Implement part rotation (R key or button)
- [ ] Implement discard system with limited tokens
- [ ] Implement pressure global variable
- [ ] Implement boiler (pressure source), vent (pressure sink)
- [ ] Implement pressure gauge UI
- [ ] Implement valve (open/close toggle)
- [ ] Pressure failure condition (burst at 100%)
- [ ] Jammed/scrap part type

**Deliverable:** Full core loop playable. One rough level is completable.

---

### Day 7: Level 1–3 + Data Format
**Goal:** First 3 levels authored, level loading is data-driven.

- [ ] Define level JSON schema
- [ ] Author Level 1 (fan tutorial), Level 2 (queue intro), Level 3 (axle intro)
- [ ] Implement level loader from JSON data
- [ ] Implement level transition (win → next level)
- [ ] Implement retry (fail → restart same level)

**Deliverable:** 3 playable levels in sequence.

---

### Day 8: Levels 4–6 + Feedback Polish
**Goal:** Mid-game levels in place. Core feedback loops feel good.

- [ ] Author Level 4 (pipes), Level 5 (valve + pressure), Level 6 (scrap management)
- [ ] Implement gear spin animation on activation
- [ ] Implement steam puff particle on vent cells
- [ ] Implement activation startup sound + gear loop sound
- [ ] Implement failure sound + screen shake
- [ ] Pressure warning sound / visual

**Deliverable:** 6 levels. The game feels like a game.

---

### Day 9: Levels 7–10
**Goal:** All 10 levels authored.

- [ ] Author Levels 7–10 (belt if implemented, multi-boiler, dense grid, grand finale)
- [ ] Implement belt if time allows (otherwise substitute a different mechanic)
- [ ] Tune difficulty ramp
- [ ] Fix level-loading edge cases

**Deliverable:** Full campaign, all 10 levels.

---

### Day 10: Art Pass
**Goal:** Replace placeholder art with final or near-final sprites.

- [ ] Final gear, axle, pipe, boiler, valve, vent, scrap sprites
- [ ] Workshop frame / border art
- [ ] HUD art (pressure gauge, discard bin, queue chute)
- [ ] Activation win animation (per-machine target mechanism)
- [ ] Failure animation polish

**Deliverable:** Game looks like a real steampunk game, not a prototype.

---

### Day 11: Audio Pass
**Goal:** All MVP audio in place.

- [ ] `part_place`, `part_rotate`, `part_discard` SFX
- [ ] `activate_start`, `gear_loop`, `steam_hiss_short` SFX
- [ ] `pressure_warning`, `pressure_burst` SFX
- [ ] `jam_grind`, `win_fanfare` SFX
- [ ] Audio balance pass — nothing too loud/quiet
- [ ] Optional: background ambient track

**Deliverable:** Game sounds industrial and satisfying.

---

### Day 12: Testing + Bug Fix
**Goal:** No blocking bugs. Playtest the full campaign.

- [ ] Playtest all 10 levels start to finish
- [ ] Fix any progression blockers
- [ ] Fix any visual glitches
- [ ] Test browser build in Chrome and Firefox
- [ ] Test on a machine that isn't your dev machine (different OS/browser)
- [ ] Write in-game "How to Play" text / tutorial callouts

**Deliverable:** A releasable build exists.

---

### Day 13: Submission
**Goal:** Submit before the deadline.

- [ ] Final build deployed to itch.io or equivalent
- [ ] Build URL is public and working
- [ ] Submission page has: title, description, 2–3 screenshots, tags
- [ ] CREDITS.md / credits screen complete
- [ ] Write a one-paragraph jam description
- [ ] Submit

---

## Scope Control Advice

### Cut this first (if behind schedule)

In order — cut from the bottom up:

1. Belt part → replace with a wider gear chain or pre-filled axle corridor
2. Levels 9 and 10 → ship 8 levels instead
3. Per-target activation animations → use a single generic "machine runs" animation
4. Pressure warning sounds → just screen color change
5. Level score/rating → just win/fail, no star rating
6. Menu animations → static menu

**Never cut:**
- The gear spin animation — this is the payoff
- The pressure gauge — this is the core feedback element
- The activation startup sequence — first impression
- Level 10 (the finale) — even if it's simple, players need an ending

### Polish this last (if ahead of schedule)

Add these only after all levels are done and the build is stable:

1. Per-level target machine animations (fan, press, lift)
2. Ambient background steam particles on boiler cells
3. Level score system with a star rating
4. Leaderboard or time-to-activate scoring (probably out of scope)
5. Screen transitions between levels
6. Settings screen (volume sliders, etc.)

---

## Risk Register

| Risk | Likelihood | Mitigation |
|---|---|---|
| Grid/path logic bugs take longer than expected | Medium | Build path validation first; test with simple cases |
| Art takes too long | High | Start with placeholders; art pass is Day 10 for a reason |
| Level design is harder than expected | Medium | Design levels on paper first; use data format early |
| Audio asset sourcing is slow | Medium | Source SFX before Day 11; use Freesound early in the jam |
| Browser build has issues | Low | Test browser build on Day 1 and Day 12 |
| Scope creep on Tier 2 parts | High | Defer belt and piston to Day 7 check-in; implement only if on schedule |
