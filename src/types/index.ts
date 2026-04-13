// Cell state drives both rendering color and placement rules.
// 'locked' = pre-set by level, not interactable.
// 'source' / 'target' = special cells, always pre-set.
export type CellState = 'empty' | 'occupied' | 'locked' | 'source' | 'target';

export interface Cell {
  col: number;
  row: number;
  state: CellState;
}

export interface GridConfig {
  cols: number;
  rows: number;
  cellSize: number;  // pixels per cell (square)
  originX: number;   // pixel x of the top-left corner of the grid
  originY: number;   // pixel y of the top-left corner of the grid
}
