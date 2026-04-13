import Phaser from 'phaser';
import { Cell, CellState, GridConfig } from '../types';

// Cell fill colors per state
const CELL_COLORS: Record<CellState, number> = {
  empty:    0x2a2a2a,
  occupied: 0x7a5228,  // warm copper-brown placeholder
  locked:   0x181818,
  source:   0x1a3d1a,  // dark green
  target:   0x3d1a1a,  // dark red
};

const GRID_LINE_COLOR  = 0x444444;
const GRID_LINE_ALPHA  = 0.7;
const CELL_PADDING     = 2;  // pixels of gap between cells

export class Grid {
  private readonly scene: Phaser.Scene;
  private readonly config: GridConfig;
  private readonly cells: Cell[][];
  private readonly graphics: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, config: GridConfig) {
    this.scene    = scene;
    this.config   = config;
    this.cells    = this.buildCells();
    this.graphics = scene.add.graphics();
    this.draw();
  }

  // ── Public API ────────────────────────────────────────────────────────────

  /** Place a part in an empty cell. Returns false if the cell is not empty. */
  placeAt(col: number, row: number): boolean {
    const cell = this.getCell(col, row);
    if (!cell || cell.state !== 'empty') return false;
    cell.state = 'occupied';
    this.draw();
    return true;
  }

  /** Force-set any cell to a given state (used by level loader). */
  setCell(col: number, row: number, state: CellState): void {
    const cell = this.getCell(col, row);
    if (!cell) return;
    cell.state = state;
    this.draw();
  }

  getCell(col: number, row: number): Cell | null {
    return this.cells[row]?.[col] ?? null;
  }

  /**
   * Convert a world (pixel) position to a grid coordinate.
   * Returns null if the position is outside the grid bounds.
   */
  worldToCell(worldX: number, worldY: number): { col: number; row: number } | null {
    const { cellSize, originX, originY, cols, rows } = this.config;
    const col = Math.floor((worldX - originX) / cellSize);
    const row = Math.floor((worldY - originY) / cellSize);
    if (col < 0 || col >= cols || row < 0 || row >= rows) return null;
    return { col, row };
  }

  /** Returns the top-left pixel coordinate of a grid cell. */
  cellToWorld(col: number, row: number): { x: number; y: number } {
    const { cellSize, originX, originY } = this.config;
    return {
      x: originX + col * cellSize,
      y: originY + row * cellSize,
    };
  }

  get cellSize(): number {
    return this.config.cellSize;
  }

  // ── Rendering ─────────────────────────────────────────────────────────────

  /** Full redraw from cell state data. Called after every state change. */
  draw(): void {
    const { cols, rows, cellSize, originX, originY } = this.config;
    const g = this.graphics;
    g.clear();

    // 1. Cell fill
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const cell = this.cells[row][col];
        const { x, y } = this.cellToWorld(col, row);
        g.fillStyle(CELL_COLORS[cell.state], 1);
        g.fillRect(
          x + CELL_PADDING,
          y + CELL_PADDING,
          cellSize - CELL_PADDING * 2,
          cellSize - CELL_PADDING * 2,
        );
      }
    }

    // 2. Grid lines (drawn after fills so they sit on top)
    g.lineStyle(1, GRID_LINE_COLOR, GRID_LINE_ALPHA);
    for (let col = 0; col <= cols; col++) {
      const x = originX + col * cellSize;
      g.lineBetween(x, originY, x, originY + rows * cellSize);
    }
    for (let row = 0; row <= rows; row++) {
      const y = originY + row * cellSize;
      g.lineBetween(originX, y, originX + cols * cellSize, y);
    }

    // 3. Source / target labels (tiny text markers)
    this.drawMarkers();
  }

  private drawMarkers(): void {
    const { cols, rows, cellSize } = this.config;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const cell = this.cells[row][col];
        if (cell.state !== 'source' && cell.state !== 'target') continue;
        const { x, y } = this.cellToWorld(col, row);
        const label = cell.state === 'source' ? 'SRC' : 'TGT';
        const color = cell.state === 'source' ? 0x44ff44 : 0xff4444;
        this.graphics.fillStyle(color, 0.6);
        this.graphics.fillRect(
          x + CELL_PADDING + 2,
          y + CELL_PADDING + 2,
          cellSize - (CELL_PADDING * 2) - 4,
          cellSize - (CELL_PADDING * 2) - 4,
        );
        // We use existing graphics; text labels added by GameScene overlay if needed
        void label; // suppress unused warning — text done in scene
      }
    }
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  private buildCells(): Cell[][] {
    const { cols, rows } = this.config;
    return Array.from({ length: rows }, (_, row) =>
      Array.from({ length: cols }, (_, col) => ({
        col,
        row,
        state: 'empty' as CellState,
      })),
    );
  }
}
