import Phaser from 'phaser';
import { Grid } from '../objects/Grid';
import { GridConfig } from '../types';
import { validateChain, ChainResult } from '../systems/validateChain';

const CELL_SIZE = 64;
const GRID_COLS = 10;
const GRID_ROWS = 8;

const SOURCE_COL = 0;
const SOURCE_ROW = Math.floor(GRID_ROWS / 2);
const TARGET_COL = GRID_COLS - 1;
const TARGET_ROW = Math.floor(GRID_ROWS / 2);

// Debug overlay colors
const DBG_REACHABLE_COLOR = 0x44aa22;  // green tint over chain cells
const DBG_REACHABLE_ALPHA = 0.30;
const DBG_VALID_COLOR     = 0x88ff44;  // bright green over target when valid
const DBG_VALID_ALPHA     = 0.50;
const DBG_INVALID_COLOR   = 0xff3322;  // red tint over target when invalid
const DBG_INVALID_ALPHA   = 0.35;

// Hover colors
const HOVER_VALID_COLOR   = 0xffaa00;
const HOVER_INVALID_COLOR = 0x666666;
const HOVER_ALPHA         = 0.85;

export class GameScene extends Phaser.Scene {
  private grid!: Grid;
  private hoverGraphics!: Phaser.GameObjects.Graphics;
  private debugGraphics!: Phaser.GameObjects.Graphics;
  private statusText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    const { width, height } = this.scale;

    const gridPixelW = GRID_COLS * CELL_SIZE;
    const gridPixelH = GRID_ROWS * CELL_SIZE;

    const config: GridConfig = {
      cols:     GRID_COLS,
      rows:     GRID_ROWS,
      cellSize: CELL_SIZE,
      originX:  Math.floor((width  - gridPixelW) / 2),
      originY:  Math.floor((height - gridPixelH) / 2),
    };

    this.grid = new Grid(this, config);
    this.grid.setCell(SOURCE_COL, SOURCE_ROW, 'source');
    this.grid.setCell(TARGET_COL, TARGET_ROW, 'target');

    // Debug overlay drawn above the grid, below hover
    this.debugGraphics = this.add.graphics();
    this.hoverGraphics = this.add.graphics();

    this.setupInput();
    this.addHUD();
  }

  // ── Input ──────────────────────────────────────────────────────────────────

  private setupInput(): void {
    this.input.on(Phaser.Input.Events.POINTER_MOVE,
      (p: Phaser.Input.Pointer) => this.onHover(p));

    this.input.on(Phaser.Input.Events.POINTER_DOWN,
      (p: Phaser.Input.Pointer) => this.onClickDown(p));

    // Space → validate chain
    this.input.keyboard!.on('keydown-SPACE', () => this.onActivate());
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
    const placed = this.grid.placeAt(coord.col, coord.row, { type: 'gear' });
    if (placed) {
      // Clear debug overlay so stale chain highlight doesn't linger after placement
      this.debugGraphics.clear();
      this.statusText.setText('SPACE to validate');
      console.log(`[Grid] gear placed at (${coord.col}, ${coord.row})`);
    }
  }

  private onActivate(): void {
    const result = validateChain(this.grid);
    this.drawChainDebug(result);

    if (result.valid) {
      console.log('VALID');
      this.statusText.setText('✓  VALID — chain reaches target');
    } else {
      console.log('INVALID');
      this.statusText.setText('✗  INVALID — chain broken');
    }
  }

  // ── Debug overlay ──────────────────────────────────────────────────────────

  private drawChainDebug(result: ChainResult): void {
    this.debugGraphics.clear();
    const s = this.grid.cellSize;
    const inset = 2;

    // Tint all reachable gear cells green
    this.debugGraphics.fillStyle(DBG_REACHABLE_COLOR, DBG_REACHABLE_ALPHA);
    for (const cell of result.reachable) {
      const { x, y } = this.grid.cellToWorld(cell.col, cell.row);
      this.debugGraphics.fillRect(x + inset, y + inset, s - inset * 2, s - inset * 2);
    }

    // Tint the target to show valid / invalid
    const target = this.grid.getTargetCell();
    if (target) {
      const { x, y } = this.grid.cellToWorld(target.col, target.row);
      const color = result.valid ? DBG_VALID_COLOR   : DBG_INVALID_COLOR;
      const alpha = result.valid ? DBG_VALID_ALPHA   : DBG_INVALID_ALPHA;
      this.debugGraphics.fillStyle(color, alpha);
      this.debugGraphics.fillRect(x + inset, y + inset, s - inset * 2, s - inset * 2);
    }
  }

  // ── HUD ────────────────────────────────────────────────────────────────────

  private addHUD(): void {
    const dim = { fontSize: '13px', color: '#555555', fontFamily: 'monospace' };
    this.add.text(12, 12, 'STEAMHEART — click to place gear  |  SPACE to validate', dim);

    this.statusText = this.add.text(12, 30, 'SPACE to validate', {
      ...dim, color: '#777777',
    });
  }
}
