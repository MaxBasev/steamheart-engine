import { LevelData } from '../types';

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
];
