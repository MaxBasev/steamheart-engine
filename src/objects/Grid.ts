import Phaser from 'phaser';
import { Cell, CellState, Part, GridConfig } from '../types';

// Base fill colors by cell state
const STATE_COLORS: Record<CellState, number> = {
  empty:    0x2a2a2a,
  occupied: 0x2a2a2a,  // overridden by part type in getCellColor()
  locked:   0x181818,
  source:   0x1a3d1a,
  target:   0x3d1a1a,
};

// Per-part-type fill color
const PART_COLORS: Record<string, number> = {
  gear: 0xb87820,  // brass
  axle: 0x7a5a20,  // darker brass
};

const GRID_LINE_COLOR = 0x444444;
const GRID_LINE_ALPHA = 0.7;
const CELL_PAD        = 2;

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

  // ── Public API ─────────────────────────────────────────────────────────────

  /** Place a part in an empty cell. Returns false if cell is not empty. */
  placeAt(col: number, row: number, part: Part): boolean {
    const cell = this.getCell(col, row);
    if (!cell || cell.state !== 'empty') return false;
    cell.state = 'occupied';
    cell.part  = part;
    this.draw();
    return true;
  }

  /** Force-set state (and optionally a part) on any cell. Used by level loader. */
  setCell(col: number, row: number, state: CellState, part: Part | null = null): void {
    const cell = this.getCell(col, row);
    if (!cell) return;
    cell.state = state;
    cell.part  = part;
    this.draw();
  }

  getCell(col: number, row: number): Cell | null {
    return this.cells[row]?.[col] ?? null;
  }

  getSourceCell(): Cell | null {
    return this.findFirst('source');
  }

  getTargetCell(): Cell | null {
    return this.findFirst('target');
  }

  /** Pixel → grid coordinate. Returns null if outside grid bounds. */
  worldToCell(worldX: number, worldY: number): { col: number; row: number } | null {
    const { cellSize, originX, originY, cols, rows } = this.config;
    const col = Math.floor((worldX - originX) / cellSize);
    const row = Math.floor((worldY - originY) / cellSize);
    if (col < 0 || col >= cols || row < 0 || row >= rows) return null;
    return { col, row };
  }

  /** Top-left pixel coordinate of a cell. */
  cellToWorld(col: number, row: number): { x: number; y: number } {
    const { cellSize, originX, originY } = this.config;
    return {
      x: originX + col * cellSize,
      y: originY + row * cellSize,
    };
  }

  get cellSize(): number { return this.config.cellSize; }
  get cols(): number     { return this.config.cols; }
  get rows(): number     { return this.config.rows; }

  // ── Rendering ──────────────────────────────────────────────────────────────

  draw(): void {
    const { cols, rows, cellSize, originX, originY } = this.config;
    const g = this.graphics;
    g.clear();

    // 1. Cell fills
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const cell = this.cells[row][col];
        const { x, y } = this.cellToWorld(col, row);

        g.fillStyle(this.getCellColor(cell), 1);
        g.fillRect(x + CELL_PAD, y + CELL_PAD, cellSize - CELL_PAD * 2, cellSize - CELL_PAD * 2);

        // Gear: hub circle
        if (cell.part?.type === 'gear') {
          const cx = x + cellSize / 2;
          const cy = y + cellSize / 2;
          g.fillStyle(0x7a5010, 1);
          g.fillCircle(cx, cy, cellSize * 0.18);
        }

        // Axle: horizontal rod or vertical rod — orientation comes from rotation
        if (cell.part?.type === 'axle') {
          const cx       = x + cellSize / 2;
          const cy       = y + cellSize / 2;
          const horiz    = cell.part.rotation % 2 === 0;
          const thick    = 10;
          const margin   = CELL_PAD + 4;
          g.fillStyle(0x5a4010, 1);
          if (horiz) {
            g.fillRect(x + margin, cy - thick / 2, cellSize - margin * 2, thick);
          } else {
            g.fillRect(cx - thick / 2, y + margin, thick, cellSize - margin * 2);
          }
          // Small center hub so the axle reads clearly
          g.fillStyle(0x3a2808, 1);
          g.fillCircle(cx, cy, thick * 0.45);
        }

        // Source / target: small inner highlight square
        if (cell.state === 'source' || cell.state === 'target') {
          const color = cell.state === 'source' ? 0x44ff44 : 0xff4444;
          g.fillStyle(color, 0.5);
          const inset = CELL_PAD + 4;
          g.fillRect(x + inset, y + inset, cellSize - inset * 2, cellSize - inset * 2);
        }
      }
    }

    // 2. Grid lines
    g.lineStyle(1, GRID_LINE_COLOR, GRID_LINE_ALPHA);
    for (let col = 0; col <= cols; col++) {
      const x = originX + col * cellSize;
      g.lineBetween(x, originY, x, originY + rows * cellSize);
    }
    for (let row = 0; row <= rows; row++) {
      const y = originY + row * cellSize;
      g.lineBetween(originX, y, originX + cols * cellSize, y);
    }
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private getCellColor(cell: Cell): number {
    if (cell.state === 'occupied' && cell.part) {
      return PART_COLORS[cell.part.type] ?? STATE_COLORS.occupied;
    }
    return STATE_COLORS[cell.state];
  }

  private findFirst(state: CellState): Cell | null {
    for (const row of this.cells) {
      for (const cell of row) {
        if (cell.state === state) return cell;
      }
    }
    return null;
  }

  private buildCells(): Cell[][] {
    const { cols, rows } = this.config;
    return Array.from({ length: rows }, (_, row) =>
      Array.from({ length: cols }, (_, col) => ({
        col,
        row,
        state: 'empty' as CellState,
        part: null,
      })),
    );
  }
}
