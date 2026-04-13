export type CellState = 'empty' | 'occupied' | 'locked' | 'source' | 'target';

// Extend this union as new parts are added (axle, pipe, etc.)
export type PartType = 'gear';

export interface Part {
  type: PartType;
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
