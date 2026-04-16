import { LevelData, PressureConfig } from '../types';

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
];
