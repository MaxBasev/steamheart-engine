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
];
