export type CellState = 'empty' | 'occupied' | 'locked' | 'source' | 'target';

export type PartType = 'gear' | 'axle' | 'corner';

// rotation: 0=0°, 1=90°, 2=180°, 3=270°
// For axle:  even rotation (0,2) = horizontal (left/right)
//            odd  rotation (1,3) = vertical   (up/down)
// For gear:  rotation has no effect on connectivity (connects all 4 sides)
// For corner: connects exactly 2 sides in an L-shape, rotates clockwise:
//   0 = right + down  (SE)
//   1 = down  + left  (SW)
//   2 = left  + up    (NW)
//   3 = up    + right (NE)
export interface Part {
  type:     PartType;
  rotation: 0 | 1 | 2 | 3;
}

export interface Cell {
  col: number;
  row: number;
  state: CellState;
  part: Part | null;
}

export interface GridConfig {
  cols: number;
  rows: number;
  cellSize: number;  // pixels per cell (square)
  originX: number;   // pixel x of the top-left corner of the grid
  originY: number;   // pixel y of the top-left corner of the grid
}

// ── Level data ────────────────────────────────────────────────────────────────

export interface PressureConfig {
  enabled:       boolean;
  startValue:    number;   // initial pressure (0–100)
  risePerSecond: number;   // pressure units added per second
  failAt:        number;   // pressure value that triggers failure
}

export interface PrePlacedPart {
  col:  number;
  row:  number;
  part: Part;
}

export interface LevelData {
  id:             string;
  title:          string;
  cols:           number;
  rows:           number;
  sourceCol:      number;
  sourceRow:      number;
  targetCol:      number;
  targetRow:      number;
  // Optional extra targets — if present, ALL targets must be reached to win.
  // targetCol/targetRow is always included automatically; list only the extras here.
  extraTargets?:  Array<{ col: number; row: number }>;
  lockedCells:    Array<{ col: number; row: number }>;
  prePlacedParts?: PrePlacedPart[];
  queue:          PartType[];
  instruction?:   string;
  pressure?:      PressureConfig;
}
