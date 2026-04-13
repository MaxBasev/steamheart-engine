import Phaser from 'phaser';
import { Grid } from '../objects/Grid';
import { GridConfig } from '../types';

// ── Grid constants ────────────────────────────────────────────────────────────
// These will later come from level data. Hardcoded here for Day 1–2.
const CELL_SIZE  = 64;
const GRID_COLS  = 10;
const GRID_ROWS  = 8;

// Source is mid-left, target is mid-right — canonical layout for all levels.
const SOURCE_COL = 0;
const SOURCE_ROW = Math.floor(GRID_ROWS / 2);
const TARGET_COL = GRID_COLS - 1;
const TARGET_ROW = Math.floor(GRID_ROWS / 2);

// ── Hover colors ──────────────────────────────────────────────────────────────
const HOVER_VALID_COLOR   = 0xffaa00;  // amber — cell can be placed on
const HOVER_INVALID_COLOR = 0x666666;  // grey  — cell is occupied/locked
const HOVER_ALPHA         = 0.85;

export class GameScene extends Phaser.Scene {
  private grid!: Grid;
  private hoverGraphics!: Phaser.GameObjects.Graphics;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    const { width, height } = this.scale;

    const gridPixelW = GRID_COLS * CELL_SIZE;
    const gridPixelH = GRID_ROWS * CELL_SIZE;

    const config: GridConfig = {
      cols:    GRID_COLS,
      rows:    GRID_ROWS,
      cellSize: CELL_SIZE,
      originX: Math.floor((width  - gridPixelW) / 2),
      originY: Math.floor((height - gridPixelH) / 2),
    };

    this.grid = new Grid(this, config);

    // Mark source and target cells
    this.grid.setCell(SOURCE_COL, SOURCE_ROW, 'source');
    this.grid.setCell(TARGET_COL, TARGET_ROW, 'target');

    // Separate graphics layer for hover — never triggers a full grid redraw
    this.hoverGraphics = this.add.graphics();

    this.setupInput();
    this.addHUD();
  }

  // update() left empty intentionally — no game loop logic in Day 1–2

  // ── Input ──────────────────────────────────────────────────────────────────

  private setupInput(): void {
    this.input.on(
      Phaser.Input.Events.POINTER_MOVE,
      (pointer: Phaser.Input.Pointer) => this.onHover(pointer),
    );

    this.input.on(
      Phaser.Input.Events.POINTER_DOWN,
      (pointer: Phaser.Input.Pointer) => this.onClickDown(pointer),
    );
  }

  private onHover(pointer: Phaser.Input.Pointer): void {
    this.hoverGraphics.clear();

    const coord = this.grid.worldToCell(pointer.x, pointer.y);
    if (!coord) return;

    const cell = this.grid.getCell(coord.col, coord.row);
    if (!cell) return;

    const color = cell.state === 'empty' ? HOVER_VALID_COLOR : HOVER_INVALID_COLOR;
    const { x, y } = this.grid.cellToWorld(coord.col, coord.row);
    const s = this.grid.cellSize;

    this.hoverGraphics.lineStyle(2, color, HOVER_ALPHA);
    this.hoverGraphics.strokeRect(x + 2, y + 2, s - 4, s - 4);
  }

  private onClickDown(pointer: Phaser.Input.Pointer): void {
    const coord = this.grid.worldToCell(pointer.x, pointer.y);
    if (!coord) return;

    const placed = this.grid.placeAt(coord.col, coord.row);
    if (placed) {
      // Placement confirmed — hover redraws on next mousemove automatically
      console.log(`[Grid] placed at (${coord.col}, ${coord.row})`);
    }
  }

  // ── HUD (Day 1–2 debug overlay) ────────────────────────────────────────────

  private addHUD(): void {
    const style = { fontSize: '13px', color: '#666666', fontFamily: 'monospace' };
    this.add.text(12, 12, 'STEAMHEART  v0.1  —  day 1/2 grid test', style);
    this.add.text(12, 30, 'click any empty cell to place a placeholder part', {
      ...style, color: '#444444',
    });
  }
}
