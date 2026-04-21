import { LevelData, PressureConfig, PrePlacedPart } from '../types';

// All levels in play order.
// queue[0] is the first part the player receives; the array is consumed left-to-right.
// lockedCells are set before play begins and cannot be placed on or traversed.

export const LEVELS: LevelData[] = [
  // ── Level 1 ─────────────────────────────────────────────────────────────────
  // Straight shot. No obstacles. Source and target are on the same row.
  // 8 gears for a 6-cell gap — 2 spares so early mistakes aren't punishing.
  {
    id:        'level_01',
    title:     'Level 1 — The Fan',
    cols:      8,
    rows:      6,
    sourceCol: 0,
    sourceRow: 3,
    targetCol: 7,
    targetRow: 3,
    lockedCells: [],
    queue:     ['gear', 'gear', 'gear', 'gear', 'gear', 'gear', 'gear', 'gear'],
    instruction: 'Connect the source to the target using gears.',
  },

  // ── Level 2 ─────────────────────────────────────────────────────────────────
  // A vertical barrier blocks the direct path at column 4 (rows 2–4).
  // Minimum solution routes above or below the barrier: 12 cells.
  // 14 gears in the queue — 2 spares.
  //
  // One valid path (above):
  //   (1,3)→(2,3)→(3,3)→(3,2)→(3,1)→(4,1)→(5,1)→(5,2)→(5,3)→(6,3)→(7,3)→(8,3)
  {
    id:        'level_02',
    title:     'Level 2 — The Blocked Path',
    cols:      10,
    rows:      7,
    sourceCol: 0,
    sourceRow: 3,
    targetCol: 9,
    targetRow: 3,
    lockedCells: [
      { col: 4, row: 2 },
      { col: 4, row: 3 },
      { col: 4, row: 4 },
    ],
    queue: [
      'gear', 'gear', 'gear', 'gear', 'gear', 'gear', 'gear',
      'gear', 'gear', 'gear', 'gear', 'gear', 'gear', 'gear',
    ],
    instruction: 'Blocked cells obstruct the direct path — route around them.',
  },

  // ── Level 3 ─────────────────────────────────────────────────────────────────
  // Introduces the axle. The grid is only 3 rows tall — no room for detours.
  // 4 gears + 1 axle = exactly 5 parts for a 5-cell straight path.
  // The axle MUST be placed horizontally (rotation 0 or 2).
  // A vertical axle at any position in the path severs the chain.
  //
  // Queue order: gear gear [AXLE] gear gear
  // The axle arrives mid-sequence so the player has already started building
  // when the orientation decision hits.
  {
    id:        'level_03',
    title:     'Level 3 — The Shaft',
    cols:      7,
    rows:      3,
    sourceCol: 0,
    sourceRow: 1,
    targetCol: 6,
    targetRow: 1,
    lockedCells: [],
    queue: ['gear', 'gear', 'axle', 'gear', 'gear'],
    instruction: 'Axles only transmit along their axis. Press [R] to rotate before placing.',
  },

  // ── Level 4 ─────────────────────────────────────────────────────────────────
  // Introduces pressure. Straight-ish 8×5 grid with a detour around one
  // locked cell. Minimum path: 8 cells. Queue: 8 gears — no spares.
  // Pressure rises at 5/s → 100 in 20 seconds. The player must place quickly
  // and activate before the boiler overloads.
  //
  // Locked cell at (4,2) forces a row detour. One valid path (above blocker):
  //   (1,2)→(2,2)→(3,2)→(3,1)→(4,1)→(5,1)→(5,2)→(6,2)
  {
    id:        'level_04',
    title:     'Level 4 — The Boiler',
    cols:      8,
    rows:      5,
    sourceCol: 0,
    sourceRow: 2,
    targetCol: 7,
    targetRow: 2,
    lockedCells: [
      { col: 4, row: 2 },
    ],
    queue: ['gear', 'gear', 'gear', 'gear', 'gear', 'gear', 'gear', 'gear'],
    instruction: 'Pressure rises — activate before it reaches 100!',
    pressure: {
      enabled:       true,
      startValue:    0,
      risePerSecond: 5,
      failAt:        100,
    } satisfies PressureConfig,
  },

  // ── Level 5 ─────────────────────────────────────────────────────────────────
  // "The S-Bend" — two staggered walls create an S-shaped corridor.
  // Wall A blocks the top half of col 3 (rows 0–2).
  // Wall B blocks the bottom half of col 5 (rows 4–6).
  // The only crossing point is row 3 where both walls are absent.
  //
  // Grid 9×7. Source top-left, target bottom-right.
  // Valid path (one of several): go down col 0 to row 3, cross right along
  // row 3 past both walls, then go down col 8 to target.
  //   length ≈ 13 cells → 15 gears in queue (2 spares).
  {
    id:        'level_05',
    title:     'Level 5 — The S-Bend',
    cols:      9,
    rows:      7,
    sourceCol: 0,
    sourceRow: 0,
    targetCol: 8,
    targetRow: 6,
    lockedCells: [
      { col: 3, row: 0 }, { col: 3, row: 1 }, { col: 3, row: 2 },
      { col: 5, row: 4 }, { col: 5, row: 5 }, { col: 5, row: 6 },
    ],
    queue: [
      'gear','gear','gear','gear','gear','gear','gear',
      'gear','gear','gear','gear','gear','gear','gear','gear',
    ],
    instruction: 'The walls are staggered — find the crossing point.',
  },

  // ── Level 6 ─────────────────────────────────────────────────────────────────
  // "The Workshop" — introduces pre-placed gears.
  // Some gears are already bolted to the floor. Player gets fewer parts and
  // must route through the existing machinery.
  //
  // Grid 8×5. Pre-placed gears form a diagonal scaffold.
  // Player gets 5 gears to complete the chain.
  // Valid path: source(0,2)→pre(1,1)→pre(2,2)→pre(3,1)→pre(4,2)→pre(5,1)→(6,1)→...→target(7,2)
  {
    id:        'level_06',
    title:     'Level 6 — The Workshop',
    cols:      8,
    rows:      5,
    sourceCol: 0,
    sourceRow: 2,
    targetCol: 7,
    targetRow: 2,
    lockedCells: [],
    prePlacedParts: [
      { col: 2, row: 1, part: { type: 'gear', rotation: 0 } },
      { col: 4, row: 1, part: { type: 'gear', rotation: 0 } },
      { col: 2, row: 3, part: { type: 'gear', rotation: 0 } },
      { col: 4, row: 3, part: { type: 'gear', rotation: 0 } },
    ] satisfies PrePlacedPart[],
    queue: ['gear','gear','gear','gear','gear','gear'],
    instruction: 'Some gears are already in place — route through them.',
  },

  // ── Level 7 ─────────────────────────────────────────────────────────────────
  // "The Shaft Room" — axles required in tight corridors.
  // A horizontal wall of locked cells forces the chain through a 1-cell-wide
  // vertical gap. Only an axle (vertical) can bridge it — a gear connects all
  // four sides but the gap cell is locked above and below, so only V-axle works.
  //
  // Grid 7×5. Locked wall across row 2 except col 3 (the gap).
  // Both sides of the gap are open vertically — axle V at (3,2) bridges it.
  // Queue: gear gear gear [axle] gear gear gear — axle arrives mid-sequence.
  {
    id:        'level_07',
    title:     'Level 7 — The Shaft Room',
    cols:      7,
    rows:      5,
    sourceCol: 3,
    sourceRow: 0,
    targetCol: 3,
    targetRow: 4,
    lockedCells: [
      { col: 0, row: 2 }, { col: 1, row: 2 }, { col: 2, row: 2 },
      { col: 4, row: 2 }, { col: 5, row: 2 }, { col: 6, row: 2 },
    ],
    queue: ['gear','gear','axle','gear','gear'],
    instruction: 'Only a vertical axle can bridge the gap.',
  },

  // ── Level 8 ─────────────────────────────────────────────────────────────────
  // "Steam Corridor" — pressure + axles + narrow path.
  // A long grid with a locked centre column except one gap.
  // Player must place axle correctly AND fast before pressure hits 100.
  // 20 seconds at 5/s. No spares.
  //
  // Grid 10×4. Locked col 5 rows 0–2 (gap at row 3).
  {
    id:        'level_08',
    title:     'Level 8 — Steam Corridor',
    cols:      10,
    rows:      4,
    sourceCol: 0,
    sourceRow: 1,
    targetCol: 9,
    targetRow: 1,
    lockedCells: [
      { col: 5, row: 0 },
      { col: 5, row: 2 },
      { col: 5, row: 3 },
    ],
    queue: ['gear','gear','gear','gear','axle','gear','gear','gear','gear'],
    instruction: 'Find the gap — and hurry, pressure is rising!',
    pressure: {
      enabled:       true,
      startValue:    0,
      risePerSecond: 5,
      failAt:        100,
    } satisfies PressureConfig,
  },

  // ── Level 9 ─────────────────────────────────────────────────────────────────
  // "The Boiler Room" — pre-placed gears + pressure + tight routing.
  // Grid 9×6. Two locked walls + 3 pre-placed gears all on the critical path.
  //
  // Walls: col 3 (rows 1-3), col 6 (rows 2-4).
  // Pre-placed: (2,0), (5,1), (8,2) — form stepping stones across the top.
  //
  // Critical path (exactly 9 player pieces):
  //   S(0,2)→(0,1)→(0,0)→(1,0)→PRE(2,0)→(3,0)→(4,0)→(4,1)→PRE(5,1)
  //   →(6,1)→(7,1)→(8,1)→PRE(8,2)→T(8,3)
  //   Player places: 9 pieces — no spares, must route correctly.
  //
  // Pressure starts at 20, rises 7/s → ~11s before overload.
  {
    id:        'level_09',
    title:     'Level 9 — The Boiler Room',
    cols:      9,
    rows:      6,
    sourceCol: 0,
    sourceRow: 2,
    targetCol: 8,
    targetRow: 3,
    lockedCells: [
      { col: 3, row: 1 }, { col: 3, row: 2 }, { col: 3, row: 3 },
      { col: 6, row: 2 }, { col: 6, row: 3 }, { col: 6, row: 4 },
    ],
    prePlacedParts: [
      { col: 2, row: 0, part: { type: 'gear', rotation: 0 } },
      { col: 5, row: 1, part: { type: 'gear', rotation: 0 } },
      { col: 8, row: 2, part: { type: 'gear', rotation: 0 } },
    ] satisfies PrePlacedPart[],
    queue: ['gear','gear','axle','gear','gear','gear','gear','gear','gear'],
    instruction: 'No spare parts — route through the fixed gears fast.',
    pressure: {
      enabled:       true,
      startValue:    20,
      risePerSecond: 7,
      failAt:        100,
    } satisfies PressureConfig,
  },

  // ── Level 10 ─────────────────────────────────────────────────────────────────
  // "The Grand Machine" — everything combined.
  // Grid 11×7. Two tall walls force the path through the top row.
  // Four pre-placed gears form stepping stones across the ceiling.
  //
  // Walls:
  //   col 3, rows 1–4  (left wall — cross at row 0)
  //   col 7, rows 2–5  (right wall — cross at row 0 or 1)
  //
  // Pre-placed gears: (2,0), (5,0), (8,0), (9,2)
  // All four sit directly on the critical path.
  //
  // Critical path (exactly 11 player pieces, 1 spare in queue):
  //   S(0,3)→(0,2)→(0,1)→(0,0)→(1,0)→PRE(2,0)→(3,0)→(4,0)→PRE(5,0)
  //   →(6,0)→(7,0)→PRE(8,0)→(9,0)→(9,1)→PRE(9,2)→(10,2)→T(10,3)
  //   Player places: 11 pieces, queue has 12 (1 spare).
  //
  // Pressure: 0 start, 5/s → 20 seconds.
  {
    id:        'level_10',
    title:     'Level 10 — The Grand Machine',
    cols:      11,
    rows:      7,
    sourceCol: 0,
    sourceRow: 3,
    targetCol: 10,
    targetRow: 3,
    lockedCells: [
      { col: 3, row: 1 }, { col: 3, row: 2 }, { col: 3, row: 3 }, { col: 3, row: 4 },
      { col: 7, row: 2 }, { col: 7, row: 3 }, { col: 7, row: 4 }, { col: 7, row: 5 },
    ],
    prePlacedParts: [
      { col: 2, row: 0, part: { type: 'gear', rotation: 0 } },
      { col: 5, row: 0, part: { type: 'gear', rotation: 0 } },
      { col: 8, row: 0, part: { type: 'gear', rotation: 0 } },
      { col: 9, row: 2, part: { type: 'gear', rotation: 0 } },
    ] satisfies PrePlacedPart[],
    queue: [
      'gear','gear','axle','gear','gear',
      'gear','gear','gear','gear','gear','gear','gear',
    ],
    instruction: 'The ceiling is the only way through. Plan fast.',
    pressure: {
      enabled:       true,
      startValue:    0,
      risePerSecond: 5,
      failAt:        100,
    } satisfies PressureConfig,
  },

  // ── Level 11 ─────────────────────────────────────────────────────────────────
  // "The Pockets" — source and target are each trapped in a side pocket by
  // a vertical wall. The only escape is through row 0 (top).
  // Row 4 (bottom) looks tempting but needs 11 pieces — one more than the queue.
  //
  // Grid 9×5.
  // Wall A: col 1, rows 1–3  (traps source in left pocket)
  // Wall B: col 7, rows 1–3  (traps target in right pocket)
  // Pre-placed gears at (3,0) and (5,0) hint at the top route.
  //
  // TOP path (only valid route, 9 player pieces, 1 spare):
  //   S(0,2)→(0,1)→(0,0)→(1,0)→(2,0)→PRE(3,0)→(4,0)→PRE(5,0)→(6,0)→(7,0)→(8,0)→(8,1)→T(8,2)
  //
  // BOTTOM path (impossible — needs 11 pieces, queue only has 10):
  //   S(0,2)→(0,3)→(0,4)→…→(7,4)→(8,4)→(8,3)→T(8,2)
  //
  // Pressure: 20 start, 6/s → ~13 seconds. Must recognise the top route fast.
  {
    id:        'level_11',
    title:     'Level 11 — The Pockets',
    cols:      9,
    rows:      5,
    sourceCol: 0,
    sourceRow: 2,
    targetCol: 8,
    targetRow: 2,
    lockedCells: [
      { col: 1, row: 1 }, { col: 1, row: 2 }, { col: 1, row: 3 },
      { col: 7, row: 1 }, { col: 7, row: 2 }, { col: 7, row: 3 },
    ],
    prePlacedParts: [
      { col: 3, row: 0, part: { type: 'gear', rotation: 0 } },
      { col: 5, row: 0, part: { type: 'gear', rotation: 0 } },
    ] satisfies PrePlacedPart[],
    queue: ['gear','gear','gear','axle','gear','gear','gear','gear','gear','gear'],
    instruction: 'The direct path is walled off. Find the escape route.',
    pressure: {
      enabled:       true,
      startValue:    20,
      risePerSecond: 6,
      failAt:        100,
    } satisfies PressureConfig,
  },

  // ── Level 12 ─────────────────────────────────────────────────────────────────
  // "The Twist" — two wall blocks cut off every obvious route.
  // Wall A blocks the top-left (col 3 rows 0–2).
  // Wall B blocks the right side (col 6 rows 0–4) except the very bottom (row 5).
  //
  // The only valid path loops down and right along the bottom, crosses wall B
  // at row 5, then rises through a pre-placed VERTICAL AXLE at (7,3).
  // The V-axle can only be entered from above (7,2) or below (7,4) — not sideways.
  //
  // Grid 10×6. Source (0,3), Target (9,2).
  //
  // Critical path (9 player pieces, 1 spare):
  //   S(0,3)→(1,3)→PRE-G(2,3)→(3,3)→(4,3)→(4,4)→PRE-G(4,5)→(5,5)→PRE-G(6,5)
  //   →(7,5)→(7,4)→PRE-VA(7,3)→(7,2)→(8,2)→T(9,2)
  //
  // Alternative via col 8 (no V-axle): needs 10 pieces — possible but 0 spares.
  //   …→(7,5)→(8,5)→(8,4)→(8,3)→(8,2)→T(9,2)
  //
  // Pressure: 15 start, 7/s → ~12 seconds. Must plan before placing anything.
  {
    id:        'level_12',
    title:     'Level 12 — The Twist',
    cols:      10,
    rows:      6,
    sourceCol: 0,
    sourceRow: 3,
    targetCol: 9,
    targetRow: 2,
    lockedCells: [
      { col: 3, row: 0 }, { col: 3, row: 1 }, { col: 3, row: 2 },
      { col: 6, row: 0 }, { col: 6, row: 1 }, { col: 6, row: 2 },
      { col: 6, row: 3 }, { col: 6, row: 4 },
    ],
    prePlacedParts: [
      { col: 2, row: 3, part: { type: 'gear', rotation: 0 } },
      { col: 4, row: 5, part: { type: 'gear', rotation: 0 } },
      { col: 6, row: 5, part: { type: 'gear', rotation: 0 } },
      { col: 7, row: 3, part: { type: 'axle', rotation: 1 } },  // V-axle: rotation 1 = vertical
    ] satisfies PrePlacedPart[],
    queue: ['gear','gear','gear','axle','gear','gear','gear','gear','gear','gear'],
    instruction: 'The axle in the wall only connects up and down — plan your approach.',
    pressure: {
      enabled:       true,
      startValue:    15,
      risePerSecond: 7,
      failAt:        100,
    } satisfies PressureConfig,
  },

  // ── Level 13 ─────────────────────────────────────────────────────────────────
  // "The Elbow" — first encounter with the corner gear.
  //
  // Grid 8×5. Source bottom-left (0,4), Target top-right (7,0).
  // Manhattan = 11 → exactly 10 intermediate cells needed.
  // Queue = 9 gears + 1 corner = 10 pieces (0 spares, every piece must be placed).
  //
  // Two guiding walls clip the dead-end extremes:
  //   • Bottom row blocked right of col 4: (5,4),(6,4),(7,4)
  //     → player cannot run too far right along the bottom before turning up.
  //   • Top row blocked left of col 3: (0,0),(1,0),(2,0)
  //     → player cannot start going right along the top too early.
  // These walls don't dictate a single path — the player still chooses WHERE
  // along the bottom to place the corner (col 1–4) and in which column to rise.
  //
  // Example valid path (corner at the natural elbow position):
  //   S(0,4)→(1,4)→(2,4)→(3,4)→CORNER(4,4,rot=2 left+up)
  //   →(4,3)→(4,2)→(4,1)→(4,0)→(5,0)→(6,0)→T(7,0)
  //
  // The L-arm visual on the corner clearly shows which two sides connect.
  // Press [R] to rotate until the arms point in the right direction.
  {
    id:        'level_13',
    title:     'Level 13 — The Elbow',
    cols:      8,
    rows:      5,
    sourceCol: 0,
    sourceRow: 4,
    targetCol: 7,
    targetRow: 0,
    lockedCells: [
      { col: 5, row: 4 }, { col: 6, row: 4 }, { col: 7, row: 4 },
      { col: 0, row: 0 }, { col: 1, row: 0 }, { col: 2, row: 0 },
    ],
    queue: ['gear','gear','gear','gear','corner','gear','gear','gear','gear','gear'],
    instruction: 'The L-arms show which sides connect — rotate with [R] until they point into the path.',
  },

  // ── Level 14 ─────────────────────────────────────────────────────────────────
  // "The Corner Gates" — two pre-placed corners act as directional gates.
  // Each corner only opens on two specific sides; the player must approach from
  // the correct direction. Piece count leaves no room for detours.
  //
  // Grid 10×6. Source (0,2), Target (9,3).
  //
  // Pre-placed corner A at (4,2) rot=0 (right+down):
  //   — accepts entry from below only: (4,3)→(4,2), exits right to (5,2).
  //   — entry from left or above is BLOCKED by rotation.
  //
  // Pre-placed corner B at (7,3) rot=3 (up+right):
  //   — accepts entry from above only: (7,2)→(7,3), exits right to (8,3).
  //   — entry from left or below is BLOCKED by rotation.
  //
  // Locked (5,3) and (6,3): player cannot pass row-3 between the two corners.
  // This forces the path to go through corner A up to row 2, cross row 2,
  // then drop through corner B back to row 3 and on to the target.
  //
  // Critical path (exactly 9 player pieces, 0 spares):
  //   S(0,2)→(0,3)→(1,3)→(2,3)→(3,3)→(4,3)→CORNER-A(4,2)→(5,2)→(6,2)→(7,2)
  //   →CORNER-B(7,3)→(8,3)→T(9,3)
  //
  // Bypass check: skipping corner B (via row-2 to col-9) needs 10 gears — impossible.
  //
  // Pressure: 10 start, 6/s → ~15 s window. Must plan before placing.
  {
    id:        'level_14',
    title:     'Level 14 — The Corner Gates',
    cols:      10,
    rows:      6,
    sourceCol: 0,
    sourceRow: 2,
    targetCol: 9,
    targetRow: 3,
    lockedCells: [
      { col: 5, row: 3 },
      { col: 6, row: 3 },
    ],
    prePlacedParts: [
      { col: 4, row: 2, part: { type: 'corner', rotation: 0 } },
      { col: 7, row: 3, part: { type: 'corner', rotation: 3 } },
    ] satisfies PrePlacedPart[],
    queue: ['gear','gear','gear','gear','gear','gear','gear','gear','gear'],
    instruction: 'Pre-placed corners only open on two sides — approach from the correct direction.',
    pressure: {
      enabled:       true,
      startValue:    10,
      risePerSecond: 6,
      failAt:        100,
    } satisfies PressureConfig,
  },

  // ── Level 15 ─────────────────────────────────────────────────────────────────
  // "Twin Outputs" — first level with two targets.
  // Both outputs must be connected to the source simultaneously.
  // The player must create a branching gear path — a single linear chain
  // cannot reach two targets at opposite corners.
  //
  // Grid 7×5. Source center-left (0,2).
  // TARGET A: top-right    (6,0)
  // TARGET B: bottom-right (6,4)
  //
  // Locked col 3, rows 1–3: forces the branch to happen in the left half.
  // Both outputs sit at the far right, so the player must route two arms
  // around the wall and up/down to reach each corner.
  //
  // One valid solution:
  //   Branch at (1,2): arm up → (1,1)→(1,0)→(2,0)→(3,0)→(4,0)→(5,0)→(6,0) T_A
  //                    arm down→ (1,3)→(1,4)→(2,4)→(3,4)→(4,4)→(5,4)→(6,4) T_B
  //   + (1,2) itself = 1 + 6 + 6 = 13 placed gears; queue has 14 (1 spare).
  {
    id:          'level_15',
    title:       'Level 15 — Twin Outputs',
    cols:        7,
    rows:        5,
    sourceCol:   0,
    sourceRow:   2,
    targetCol:   6,
    targetRow:   0,
    extraTargets: [{ col: 6, row: 4 }],
    lockedCells: [
      { col: 3, row: 1 },
      { col: 3, row: 2 },
      { col: 3, row: 3 },
    ],
    queue: [
      'gear','gear','gear','gear','gear','gear','gear',
      'gear','gear','gear','gear','gear','gear','gear',
    ],
    instruction: 'Both outputs must activate at the same time — you need to branch.',
  },

  // ── Level 16 ─────────────────────────────────────────────────────────────────
  // "The Right Angle" — single target off-axis; introduces corner pieces.
  //
  // Source and target are on different rows, so the path must change direction.
  // Gears connect all 4 sides and CAN turn — but with 0 spares the 2 corners in
  // the queue have no room to go on straight cells (a corner on a straight segment
  // breaks the chain because it only exposes 2 adjacent ports). They MUST land on
  // the two cells where the path bends 90°, and each bend requires a specific rotation.
  //
  // Grid 9×8.  Source (0,4).  Target (8,0).
  // No locked cells — the open grid lets the player experiment freely.
  //
  // One minimal solution (many equivalent paths exist):
  //   (1,4)→(2,4)→(3,4) → CORNER(4,4, rot=2 left+up)
  //   → (4,3)→(4,2)→(4,1) → CORNER(4,0, rot=0 right+down)
  //   → (5,0)→(6,0)→(7,0) → TARGET(8,0)
  //   = 9 gears + 2 corners = 11 pieces, 0 spares.
  //
  //   rot=2 (left+up): accepts from right "left" port, exits up ✓
  //   rot=0 (right+down): accepts from below "down" port, exits right ✓
  {
    id:          'level_16',
    title:       'Level 16 — The Right Angle',
    cols:        9,
    rows:        8,
    sourceCol:   0,
    sourceRow:   4,
    targetCol:   8,
    targetRow:   0,
    lockedCells: [],
    queue: [
      'gear', 'gear', 'gear', 'gear',
      'corner',
      'gear', 'gear', 'gear',
      'corner',
      'gear', 'gear',
    ], // 9 gears + 2 corners = 11 pieces, zero spares
    instruction: 'New piece: the corner gear. It only connects two sides — rotation matters.',
  },

  // ── Level 17 ─────────────────────────────────────────────────────────────────
  // "The Serpentine" — two outputs, FOUR corners (all different rotations),
  //                    zero spares, no pressure.
  //
  // Each arm of the path must make TWO 90° turns. A corner with the wrong
  // rotation severs the chain. All four corners have different rotations, so
  // guessing doesn't help — the player must reason from the wall geometry.
  //
  // Grid 10×8. Source (0,3). TARGET A (9,1). TARGET B (9,6).
  //
  // Wall A (col 2): rows 0-2 and 4-7 locked — pre-placed H-axle at (2,3) is
  //                 the only passage; all traffic must cross horizontally.
  // Wall B (col 5): rows 2-5 locked — paths cross col 5 only at rows 0-1 or 6-7.
  // Wall C (col 7): rows 2-5 locked — same constraint at col 7.
  //
  // Unique-structure solution (multiple arm routings possible, all use same pattern):
  //
  //   Shared trunk (3 gears):
  //     (1,3) → H-AXLE(2,3) → (3,3) → (4,3)  ← branch here
  //
  //   TOP ARM — goes up, turns right, turns down, arrives at TARGET A (9,1):
  //     (4,2)→(4,1)→(4,0)  → CORNER-1(4,0, rot=0 right+down)
  //                            [accepts from below "down" port, exits right "right" port]
  //     (5,0)→(6,0)→(7,0)  → CORNER-2(7,0, rot=1 down+left)
  //                            [accepts from left "left" port, exits down "down" port]
  //     (7,1)→(8,1) → TARGET A(9,1)
  //     → 8 gears + 2 corners
  //
  //   BOTTOM ARM — goes down, turns right, turns up, arrives at TARGET B (9,6):
  //     (4,4)→(4,5)→(4,6)→(4,7) → CORNER-3(4,7, rot=3 up+right)
  //                                  [accepts from above "up" port, exits right "right" port]
  //     (5,7)→(6,7)→(7,7)         → CORNER-4(7,7, rot=2 left+up)
  //                                  [accepts from left "left" port, exits up "up" port]
  //     (7,6)→(8,6) → TARGET B(9,6)
  //     → 9 gears + 2 corners
  //
  //   Total player pieces: 3 + 8 + 9 = 20 gears + 4 corners = 24, zero spares.
  //
  //   All 4 corners use DIFFERENT rotations (0, 1, 2, 3) — the player cannot
  //   copy-paste the same rotation and must reason about each turn independently.
  {
    id:          'level_17',
    title:       'Level 17 — The Serpentine',
    cols:        10,
    rows:        8,
    sourceCol:   0,
    sourceRow:   3,
    targetCol:   9,
    targetRow:   1,
    extraTargets: [{ col: 9, row: 6 }],
    lockedCells: [
      // Wall A: col 2 fully blocked except row 3
      { col: 2, row: 0 }, { col: 2, row: 1 }, { col: 2, row: 2 },
      { col: 2, row: 4 }, { col: 2, row: 5 }, { col: 2, row: 6 }, { col: 2, row: 7 },
      // Wall B: col 5 center band
      { col: 5, row: 2 }, { col: 5, row: 3 }, { col: 5, row: 4 }, { col: 5, row: 5 },
      // Wall C: col 7 center band
      { col: 7, row: 2 }, { col: 7, row: 3 }, { col: 7, row: 4 }, { col: 7, row: 5 },
    ],
    prePlacedParts: [
      { col: 2, row: 3, part: { type: 'axle', rotation: 0 } },
    ] satisfies PrePlacedPart[],
    // Corners arrive at queue positions 5, 10, 16, 21 — staggered so both
    // arms need to be planned before the first corner is placed.
    queue: [
      'gear', 'gear', 'gear', 'gear',
      'corner',
      'gear', 'gear', 'gear', 'gear',
      'corner',
      'gear', 'gear', 'gear', 'gear', 'gear',
      'corner',
      'gear', 'gear', 'gear', 'gear',
      'corner',
      'gear', 'gear', 'gear',
    ], // 20 gears + 4 corners = 24 pieces, zero spares
    instruction: 'Four corners — four different rotations. One wrong turn and the whole machine fails.',
  },

  // ── Level 18 ─────────────────────────────────────────────────────────────────
  // "The Trinity Engines" — THREE outputs, four corners (all different rotations),
  //                          one axle, zero spares, no pressure.
  //
  // Three arms branch from a shared trunk: top arm curves up-right to TARGET A,
  // center arm goes straight to TARGET B, bottom arm curves down-right to TARGET C.
  // Both curved arms make two 90° turns each — four corners total, all different rotations.
  // The axle in the queue must be correctly oriented for wherever the player places it.
  //
  // Grid 11×9. Source (0,4).
  //   TARGET A: (10,1)   TARGET B: (10,4)   TARGET C: (10,7)
  //
  // Wall A (col 2): rows 0-3 and 5-8 locked — pre-placed H-axle at (2,4) is
  //                 the sole passage; entire flow must cross at row 4.
  // Wall B (col 5): rows 1-3 and 5-7 locked — arms cross at rows 0, 4, 8 only.
  // Wall C (col 8): rows 2-3 and 5-6 locked — arms cross at rows 0,1,4,7,8.
  // Wall D (col 9): rows 0, 8 locked — prevents bypassing corner at col 8 top/bottom.
  // Wall E: (7,1) and (7,7) locked — seals alternate route around col-8 corners.
  //
  // Unique solution:
  //   Shared trunk:  (1,4) → H-AXLE(2,4) → (3,4) → (4,4)  ← three-way branch
  //
  //   TOP ARM:   (4,3)→(4,2)→(4,1) → CORNER-1(4,0, rot=0 right+down)
  //              → (5,0)→(6,0)→(7,0) → CORNER-2(8,0, rot=1 down+left)
  //              → (8,1)→(9,1) → TARGET A(10,1)
  //              [rot=0: enters from below "down", exits right "right"  ✓]
  //              [rot=1: enters from left "left",  exits down "down"     ✓]
  //
  //   CENTER ARM: (5,4)→(6,4)→(7,4)→(8,4)→(9,4) → TARGET B(10,4)
  //
  //   BOTTOM ARM: (4,5)→(4,6)→(4,7) → CORNER-3(4,8, rot=3 up+right)
  //               → (5,8)→(6,8)→(7,8) → CORNER-4(8,8, rot=2 left+up)
  //               → (8,7)→(9,7) → TARGET C(10,7)
  //               [rot=3: enters from above "up",  exits right "right"  ✓]
  //               [rot=2: enters from left "left",  exits up "up"        ✓]
  //
  //   All four corners use DIFFERENT rotations (0, 1, 3, 2).
  //   Player pieces: 3 shared + 8 top + 5 center + 8 bottom = 24 positions
  //   = 23 gears + 4 corners + 1 axle = 28 pieces, zero spares.
  //   (One gear from the trunk/arms is replaced by the queue axle — any straight cell.)
  {
    id:          'level_18',
    title:       'Level 18 — The Trinity Engines',
    cols:        11,
    rows:        9,
    sourceCol:   0,
    sourceRow:   4,
    targetCol:   10,
    targetRow:   1,
    extraTargets: [{ col: 10, row: 4 }, { col: 10, row: 7 }],
    lockedCells: [
      // Wall A: col 2 fully blocked except row 4 (H-axle lives there)
      { col: 2, row: 0 }, { col: 2, row: 1 }, { col: 2, row: 2 }, { col: 2, row: 3 },
      { col: 2, row: 5 }, { col: 2, row: 6 }, { col: 2, row: 7 }, { col: 2, row: 8 },
      // Wall B: col 5 center band — rows 1-3 and 5-7 locked
      { col: 5, row: 1 }, { col: 5, row: 2 }, { col: 5, row: 3 },
      { col: 5, row: 5 }, { col: 5, row: 6 }, { col: 5, row: 7 },
      // Wall C: col 8 partial — rows 2-3 and 5-6 locked
      { col: 8, row: 2 }, { col: 8, row: 3 },
      { col: 8, row: 5 }, { col: 8, row: 6 },
      // Wall D: col 9 top and bottom — prevents corner bypass
      { col: 9, row: 0 }, { col: 9, row: 8 },
      // Wall E: seals alternate shortcut around the col-8 corners
      { col: 7, row: 1 }, { col: 7, row: 7 },
    ],
    prePlacedParts: [
      { col: 2, row: 4, part: { type: 'axle', rotation: 0 } }, // H-axle chokepoint
    ] satisfies PrePlacedPart[],
    // Corners arrive staggered; axle appears mid-queue.
    // Both arms must be mentally mapped before the first corner is placed.
    queue: [
      'gear', 'gear', 'gear', 'gear',
      'corner',
      'gear', 'gear', 'gear', 'gear',
      'corner',
      'gear', 'gear', 'gear',
      'axle',
      'gear', 'gear', 'gear',
      'corner',
      'gear', 'gear', 'gear', 'gear',
      'corner',
      'gear', 'gear', 'gear', 'gear', 'gear',
    ], // 23 gears + 4 corners + 1 axle = 28 pieces, zero spares
    instruction: 'Three engines, four turns — plan all three arms before you place the first corner.',
  },

  // ── Level 19 ─────────────────────────────────────────────────────────────────
  // "The Four Chambers" — FOUR outputs, SIX corners, one axle, zero spares.
  //
  // Source at row 5 (center). Four arms reach targets at rows 1, 4, 6, 9.
  // Outer arms (rows 1 and 9) each turn once at column 4 then go straight.
  // Inner arms (rows 4 and 6) must detour around Wall B (col 7 rows 3-7),
  // each making two 90° turns — six corners total across all four arms.
  //
  // Grid 11×11. Source (0,5). Pre-placed H-axle at (2,5).
  //   TARGET A: (10,1)   TARGET B: (10,4)   TARGET C: (10,6)   TARGET D: (10,9)
  //
  // Wall A (col 2): rows 0-4 and 6-10 locked — axle at (2,5) is the sole passage.
  // Wall B (col 7): rows 3-7 locked — forces inner arms to detour via rows 2 and 8.
  //
  // Solution:
  //   Shared trunk: (1,5) → H-AXLE(2,5) → (3,5) → (4,5)
  //
  //   ARM A (TARGET row 1): up through col 4 → CORNER-A1(4,1, rot=0 right+down)
  //                         → row 1 right → (9,1) → TARGET A(10,1)
  //   ARM B (TARGET row 4): right to (5,4) → CORNER-B1(6,4, rot=2 left+up)
  //                         → up through col 6 → (6,2) → (7,2) → CORNER-B2(8,2, rot=1 down+left)
  //                         → down to (8,4) → (9,4) → TARGET B(10,4)
  //   ARM C (TARGET row 6): right to (5,6) → CORNER-C1(6,6, rot=1 down+left)
  //                         → down through col 6 → (6,8) → (7,8) → CORNER-C2(8,8, rot=2 left+up)
  //                         → up to (8,6) → (9,6) → TARGET C(10,6)
  //   ARM D (TARGET row 9): down through col 4 → CORNER-D1(4,9, rot=3 up+right)
  //                         → row 9 right → (9,9) → TARGET D(10,9)
  //
  //   All 4 rotations appear (0,1,2,3); inner arms are mirror-symmetric.
  //   Pieces: 3 shared + 8+1c A + 7+2c B + 7+2c C + 8+1c D
  //         = 33 gears + 6 corners → replace 1 gear with queue axle
  //         = 32 gears + 6 corners + 1 axle = 39 pieces, zero spares.
  {
    id:          'level_19',
    title:       'Level 19 — The Four Chambers',
    cols:        11,
    rows:        11,
    sourceCol:   0,
    sourceRow:   5,
    targetCol:   10,
    targetRow:   1,
    extraTargets: [{ col: 10, row: 4 }, { col: 10, row: 6 }, { col: 10, row: 9 }],
    lockedCells: [
      // Wall A: col 2 fully blocked except row 5 (axle)
      { col: 2, row: 0 }, { col: 2, row: 1 }, { col: 2, row: 2 }, { col: 2, row: 3 }, { col: 2, row: 4 },
      { col: 2, row: 6 }, { col: 2, row: 7 }, { col: 2, row: 8 }, { col: 2, row: 9 }, { col: 2, row: 10 },
      // Wall B: col 7 center band — forces inner arms to detour
      { col: 7, row: 3 }, { col: 7, row: 4 }, { col: 7, row: 5 },
      { col: 7, row: 6 }, { col: 7, row: 7 },
    ],
    prePlacedParts: [
      { col: 2, row: 5, part: { type: 'axle', rotation: 0 } },
    ] satisfies PrePlacedPart[],
    // Corners arrive every ~6 pieces; axle appears mid-queue.
    queue: [
      'gear', 'gear', 'gear', 'gear', 'gear',
      'corner',
      'gear', 'gear', 'gear', 'gear', 'gear',
      'corner',
      'gear', 'gear', 'gear', 'gear', 'gear',
      'corner',
      'gear', 'gear', 'gear', 'gear', 'gear',
      'corner',
      'axle',
      'gear', 'gear', 'gear', 'gear', 'gear',
      'corner',
      'gear', 'gear', 'gear', 'gear', 'gear',
      'corner',
      'gear', 'gear',
    ], // 32 gears + 6 corners + 1 axle = 39 pieces, zero spares
    instruction: 'Four engines, six turns — map every arm before the first corner arrives.',
  },

  // ── Level 20 ─────────────────────────────────────────────────────────────────
  // "The Grand Machine" — FOUR outputs, EIGHT corners (all rotations, some repeated),
  //                        one axle, zero spares, no pressure.
  //
  // Every arm makes exactly two 90° turns — the most complex routing in the game.
  // Two wall barriers (col 7 and col 11) force all four arms to detour, and the
  // inner arms meet at a shared junction before diverging to their final targets.
  //
  // Grid 14×11. Source (0,5). Pre-placed H-axle at (2,5).
  //   TARGET A: (13,1)   TARGET B: (13,4)   TARGET C: (13,6)   TARGET D: (13,9)
  //
  // Wall A (col 2): rows 0-4 and 6-10 locked — axle at (2,5) is the sole entry.
  // Wall B (col 7): rows 3-7 locked — outer arms cross at rows 1/9; inner arms detour.
  // Wall C (col 11): rows 1-4 and 6-9 locked — all arms cross via rows 0, 5, or 10.
  //
  // Solution (all arms must be planned before the first corner arrives):
  //
  //   Shared trunk: (1,5) → H-AXLE(2,5) → (3,5) → (4,5)
  //
  //   ARM A (row 1): up col 4 → CORNER-A1(4,1, rot=0 right+down) → row 1 right
  //                  → col10 up to row 0 → (11,0) → CORNER-A2(12,0, rot=1 down+left)
  //                  → (12,1) → TARGET A(13,1)
  //
  //   ARM B (row 4): right to (5,4) → CORNER-B1(6,4, rot=2 left+up) → up col 6
  //                  → (7,2) row 2 right → CORNER-B2(10,2, rot=1 down+left)
  //                  → down col 10 → shared junction (10,5)→(11,5)→(12,5)→(12,4)
  //                  → TARGET B(13,4)
  //
  //   ARM C (row 6): right to (5,6) → CORNER-C1(6,6, rot=1 down+left) → down col 6
  //                  → (7,8) row 8 right → CORNER-C2(10,8, rot=2 left+up)
  //                  → up col 10 → shared junction (10,5)→(11,5)→(12,5)→(12,6)
  //                  → TARGET C(13,6)
  //
  //   ARM D (row 9): down col 4 → CORNER-D1(4,9, rot=3 up+right) → row 9 right
  //                  → col10 down to row 10 → (11,10) → CORNER-D2(12,10, rot=2 left+up)
  //                  → (12,9) → TARGET D(13,9)
  //
  //   Arms B and C share junction (10,5)→(11,5)→(12,5) before diverging to rows 4 and 6.
  //   Total: 47 gears + 8 corners + 1 axle = 56 pieces, zero spares.
  {
    id:          'level_20',
    title:       'Level 20 — The Grand Machine',
    cols:        14,
    rows:        11,
    sourceCol:   0,
    sourceRow:   5,
    targetCol:   13,
    targetRow:   1,
    extraTargets: [{ col: 13, row: 4 }, { col: 13, row: 6 }, { col: 13, row: 9 }],
    lockedCells: [
      // Wall A: col 2 fully blocked except row 5 (axle)
      { col: 2, row: 0 }, { col: 2, row: 1 }, { col: 2, row: 2 }, { col: 2, row: 3 }, { col: 2, row: 4 },
      { col: 2, row: 6 }, { col: 2, row: 7 }, { col: 2, row: 8 }, { col: 2, row: 9 }, { col: 2, row: 10 },
      // Wall B: col 7 center band — outer arms pass at rows 1/9; inner arms detour via rows 2/8
      { col: 7, row: 3 }, { col: 7, row: 4 }, { col: 7, row: 5 },
      { col: 7, row: 6 }, { col: 7, row: 7 },
      // Wall C: col 11 — arms must cross at rows 0, 5, or 10 only
      { col: 11, row: 1 }, { col: 11, row: 2 }, { col: 11, row: 3 }, { col: 11, row: 4 },
      { col: 11, row: 6 }, { col: 11, row: 7 }, { col: 11, row: 8 }, { col: 11, row: 9 },
    ],
    prePlacedParts: [
      { col: 2, row: 5, part: { type: 'axle', rotation: 0 } },
    ] satisfies PrePlacedPart[],
    // 8 corners staggered through a long queue — plan the full machine before placing.
    queue: [
      'gear', 'gear', 'gear', 'gear', 'gear', 'gear',
      'corner',
      'gear', 'gear', 'gear', 'gear', 'gear', 'gear',
      'corner',
      'gear', 'gear', 'gear', 'gear', 'gear',
      'axle',
      'gear', 'gear', 'gear', 'gear', 'gear',
      'corner',
      'gear', 'gear', 'gear', 'gear', 'gear', 'gear',
      'corner',
      'gear', 'gear', 'gear', 'gear', 'gear', 'gear',
      'corner',
      'gear', 'gear', 'gear', 'gear', 'gear', 'gear',
      'corner',
      'gear', 'gear', 'gear',
      'corner',
      'gear', 'gear', 'gear',
      'corner',
      'gear',
    ], // 47 gears + 8 corners + 1 axle = 56 pieces, zero spares
    instruction: 'The Grand Machine. Four arms, eight turns, zero margin for error.',
  },
];
