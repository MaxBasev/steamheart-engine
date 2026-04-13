import Phaser from 'phaser';
import { Grid } from '../objects/Grid';
import { GridConfig, LevelData, PartType } from '../types';
import { validateChain, ChainResult } from '../systems/validateChain';
import { LEVELS } from '../data/levels';

// Cell size is fixed across all levels. Increase for small grids, decrease for large ones.
// Current sweet spot: 64px works for grids up to 12×9 on a 1280×720 canvas.
const CELL_SIZE = 64;

// ── Colors ────────────────────────────────────────────────────────────────────
const HOVER_VALID_COLOR   = 0xffaa00;
const HOVER_INVALID_COLOR = 0x666666;
const HOVER_ALPHA         = 0.85;

const DBG_REACHABLE_COLOR = 0x44aa22;
const DBG_REACHABLE_ALPHA = 0.30;
const DBG_VALID_COLOR     = 0x88ff44;
const DBG_VALID_ALPHA     = 0.50;
const DBG_INVALID_COLOR   = 0xff3322;
const DBG_INVALID_ALPHA   = 0.35;

const WIN_PANEL_COLOR   = 0x1a331a;
const FAIL_PANEL_COLOR  = 0x331a1a;
const WIN_BORDER_COLOR  = 0x44cc44;
const FAIL_BORDER_COLOR = 0xcc4444;
const OVERLAY_DIM_ALPHA = 0.60;
const PANEL_FILL_ALPHA  = 0.92;

// ── Game state ────────────────────────────────────────────────────────────────
interface GameState {
  isActivated: boolean;
  isWon:       boolean;
  isFailed:    boolean;
  queue:       PartType[];  // queue[0] = part in hand; shift() on placement
}

function freshState(level: LevelData): GameState {
  return {
    isActivated: false,
    isWon:       false,
    isFailed:    false,
    queue:       [...level.queue],
  };
}

// ─────────────────────────────────────────────────────────────────────────────

export class GameScene extends Phaser.Scene {
  private grid!: Grid;
  private hoverGraphics!: Phaser.GameObjects.Graphics;
  private debugGraphics!: Phaser.GameObjects.Graphics;
  private resultGraphics!: Phaser.GameObjects.Graphics;

  private queueText!:      Phaser.GameObjects.Text;
  private statusText!:     Phaser.GameObjects.Text;
  private resultHeadline!: Phaser.GameObjects.Text;
  private resultSubtext!:  Phaser.GameObjects.Text;

  // Persists across scene.restart() because restart reuses the same instance.
  // Must be reset explicitly in create().
  private currentLevelIndex = 0;
  private state: GameState  = freshState(LEVELS[0]);

  constructor() {
    super({ key: 'GameScene' });
  }

  // Phaser passes the data object from scene.restart(data) here.
  create(data?: { levelIndex?: number }): void {
    this.currentLevelIndex = data?.levelIndex ?? 0;
    const level = LEVELS[this.currentLevelIndex];

    this.state = freshState(level);

    const { width, height } = this.scale;
    const originX = Math.floor((width  - level.cols * CELL_SIZE) / 2);
    const originY = Math.floor((height - level.rows * CELL_SIZE) / 2);

    const config: GridConfig = {
      cols: level.cols, rows: level.rows, cellSize: CELL_SIZE, originX, originY,
    };

    this.grid = new Grid(this, config);

    // Apply level cells: source, target, then locked cells
    this.grid.setCell(level.sourceCol, level.sourceRow, 'source');
    this.grid.setCell(level.targetCol, level.targetRow, 'target');
    for (const lc of level.lockedCells) {
      this.grid.setCell(lc.col, lc.row, 'locked');
    }

    // Z-order: grid → debug → hover → result overlay (last = on top)
    this.debugGraphics = this.add.graphics();
    this.hoverGraphics = this.add.graphics();
    this.resultGraphics = this.add.graphics();

    this.resultHeadline = this.add
      .text(width / 2, height / 2 - 22, '', {
        fontSize: '26px', fontFamily: 'monospace', fontStyle: 'bold', color: '#ffffff',
      })
      .setOrigin(0.5)
      .setVisible(false);

    this.resultSubtext = this.add
      .text(width / 2, height / 2 + 22, '', {
        fontSize: '13px', fontFamily: 'monospace', color: '#aaaaaa',
      })
      .setOrigin(0.5)
      .setVisible(false);

    this.setupInput();
    this.addHUD(level);
    this.updateQueueHUD();
  }

  // ── Input ──────────────────────────────────────────────────────────────────

  private setupInput(): void {
    this.input.on(Phaser.Input.Events.POINTER_MOVE,
      (p: Phaser.Input.Pointer) => this.onHover(p));

    this.input.on(Phaser.Input.Events.POINTER_DOWN,
      (p: Phaser.Input.Pointer) => this.onClickDown(p));

    // Space: activate before activation, advance to next level after a win
    this.input.keyboard!.on('keydown-SPACE', () => this.onSpaceKey());
    this.input.keyboard!.on('keydown-R',     () => this.onRetry());
  }

  private onHover(pointer: Phaser.Input.Pointer): void {
    if (this.state.isActivated) return;
    this.hoverGraphics.clear();

    const coord = this.grid.worldToCell(pointer.x, pointer.y);
    if (!coord) return;
    const cell = this.grid.getCell(coord.col, coord.row);
    if (!cell) return;

    const hasPartsLeft = this.state.queue.length > 0;
    const canPlace     = hasPartsLeft && cell.state === 'empty';
    const color = canPlace ? HOVER_VALID_COLOR : HOVER_INVALID_COLOR;

    const { x, y } = this.grid.cellToWorld(coord.col, coord.row);
    const s = this.grid.cellSize;
    this.hoverGraphics.lineStyle(2, color, HOVER_ALPHA);
    this.hoverGraphics.strokeRect(x + 2, y + 2, s - 4, s - 4);
  }

  private onClickDown(pointer: Phaser.Input.Pointer): void {
    if (this.state.isActivated) return;

    const currentPart = this.state.queue[0] ?? null;
    if (!currentPart) return;

    const coord = this.grid.worldToCell(pointer.x, pointer.y);
    if (!coord) return;

    const placed = this.grid.placeAt(coord.col, coord.row, { type: currentPart });
    if (placed) {
      this.state.queue.shift();
      this.debugGraphics.clear();
      this.updateQueueHUD();
      console.log(
        `[Queue] ${currentPart} placed at (${coord.col}, ${coord.row})` +
        ` — ${this.state.queue.length} left`,
      );
    }
  }

  private onSpaceKey(): void {
    if (!this.state.isActivated) {
      this.onActivate();
    } else if (this.state.isWon && !this.isFinalLevel()) {
      this.onNextLevel();
    }
    // After a fail or on the final win, Space does nothing — use R.
  }

  private onActivate(): void {
    const result = validateChain(this.grid);

    this.state.isActivated = true;
    this.state.isWon       = result.valid;
    this.state.isFailed    = !result.valid;

    this.hoverGraphics.clear();
    this.drawChainDebug(result);
    this.showResult(result.valid);

    console.log(result.valid ? 'VALID' : 'INVALID');
  }

  private onNextLevel(): void {
    this.scene.restart({ levelIndex: this.currentLevelIndex + 1 });
  }

  private onRetry(): void {
    if (!this.state.isActivated) return;
    // Restart the same level index — queue and grid are rebuilt from level data.
    this.scene.restart({ levelIndex: this.currentLevelIndex });
  }

  private isFinalLevel(): boolean {
    return this.currentLevelIndex >= LEVELS.length - 1;
  }

  // ── HUD ────────────────────────────────────────────────────────────────────

  private addHUD(level: LevelData): void {
    const dim    = { fontSize: '13px', color: '#777777', fontFamily: 'monospace' };
    const dimmer = { fontSize: '12px', color: '#555555', fontFamily: 'monospace' };

    // Level title — top-left, slightly brighter
    this.add.text(12, 12, level.title, {
      fontSize: '14px', color: '#999999', fontFamily: 'monospace',
    });

    // Optional instruction — below title
    if (level.instruction) {
      this.add.text(12, 30, level.instruction, dimmer);
    }

    // Dynamic queue status
    this.queueText = this.add.text(12, 52, '', dim);

    // Dynamic action hint
    this.statusText = this.add.text(12, 68, '', {
      ...dimmer, color: '#555555',
    });
  }

  private updateQueueHUD(): void {
    const { queue } = this.state;

    if (queue.length === 0) {
      this.queueText.setText('Queue: empty');
      this.statusText.setText('[SPACE] activate — no parts remaining');
    } else {
      const current    = queue[0].toUpperCase();
      const remaining  = queue.length;
      const preview    = queue.slice(1, 4).map(p => p[0].toUpperCase()).join(' ');
      const previewStr = preview.length > 0 ? `   next: ${preview}` : '';
      this.queueText.setText(`In hand: ${current}  (${remaining} left)${previewStr}`);
      this.statusText.setText('[SPACE] activate   [R] retry');
    }
  }

  // ── Result overlay ─────────────────────────────────────────────────────────

  private showResult(valid: boolean): void {
    const { width, height } = this.scale;
    const g = this.resultGraphics;
    g.clear();

    g.fillStyle(0x000000, OVERLAY_DIM_ALPHA);
    g.fillRect(0, 0, width, height);

    const panelW = 460;
    const panelH = 100;
    const panelX = (width  - panelW) / 2;
    const panelY = (height - panelH) / 2;

    g.fillStyle(valid ? WIN_PANEL_COLOR : FAIL_PANEL_COLOR, PANEL_FILL_ALPHA);
    g.fillRoundedRect(panelX, panelY, panelW, panelH, 6);

    g.lineStyle(1, valid ? WIN_BORDER_COLOR : FAIL_BORDER_COLOR, 0.7);
    g.strokeRoundedRect(panelX, panelY, panelW, panelH, 6);

    const headline = valid ? '✓  MACHINE ACTIVATED' : '✗  ACTIVATION FAILED';
    let subline: string;
    let statusLine: string;

    if (valid) {
      if (this.isFinalLevel()) {
        subline    = 'all machines complete!  —  [R] play again';
        statusLine = 'ALL DONE — [R] play again';
      } else {
        subline    = 'chain complete  —  [SPACE] next level   [R] retry';
        statusLine = 'ACTIVATED — [SPACE] next level   [R] retry';
      }
    } else {
      subline    = 'no valid chain to target  —  [R] retry';
      statusLine = 'FAILED — [R] retry';
    }

    const headColor = valid ? '#88ff88' : '#ff8888';
    this.resultHeadline.setText(headline).setColor(headColor).setVisible(true);
    this.resultSubtext.setText(subline).setVisible(true);
    this.statusText.setText(statusLine);
    this.queueText.setText('');
  }

  // ── Chain debug overlay ────────────────────────────────────────────────────

  private drawChainDebug(result: ChainResult): void {
    this.debugGraphics.clear();
    const s     = this.grid.cellSize;
    const inset = 2;

    this.debugGraphics.fillStyle(DBG_REACHABLE_COLOR, DBG_REACHABLE_ALPHA);
    for (const cell of result.reachable) {
      const { x, y } = this.grid.cellToWorld(cell.col, cell.row);
      this.debugGraphics.fillRect(x + inset, y + inset, s - inset * 2, s - inset * 2);
    }

    const target = this.grid.getTargetCell();
    if (target) {
      const { x, y } = this.grid.cellToWorld(target.col, target.row);
      const color = result.valid ? DBG_VALID_COLOR  : DBG_INVALID_COLOR;
      const alpha = result.valid ? DBG_VALID_ALPHA  : DBG_INVALID_ALPHA;
      this.debugGraphics.fillStyle(color, alpha);
      this.debugGraphics.fillRect(x + inset, y + inset, s - inset * 2, s - inset * 2);
    }
  }
}
