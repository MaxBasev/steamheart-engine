import Phaser from 'phaser';
import { Grid } from '../objects/Grid';
import { GridConfig, LevelData, PartType } from '../types';
import { validateChain, ChainResult } from '../systems/validateChain';
import { LEVELS } from '../data/levels';

// ── Pressure HUD thresholds ───────────────────────────────────────────────────
const PRESSURE_WARN_PCT     = 0.60;   // ≥60%  → amber
const PRESSURE_CRITICAL_PCT = 0.85;   // ≥85%  → red

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
  queue:       PartType[];    // queue[0] = part in hand; shift() on placement
  rotation:    0 | 1 | 2 | 3; // current part-in-hand rotation; resets on retry/next level
  pressure:    number;        // current pressure value; 0 when level has no pressure
}

function freshState(level: LevelData): GameState {
  return {
    isActivated: false,
    isWon:       false,
    isFailed:    false,
    queue:       [...level.queue],
    rotation:    0,
    pressure:    level.pressure?.startValue ?? 0,
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
  private pressureText!:   Phaser.GameObjects.Text;
  private resultHeadline!: Phaser.GameObjects.Text;
  private resultSubtext!:  Phaser.GameObjects.Text;

  // Persists across scene.restart() because restart reuses the same instance.
  // Must be reset explicitly in create().
  private currentLevelIndex = 0;
  private currentLevel!:    LevelData;
  private state: GameState  = freshState(LEVELS[0]);
  private soundMuted        = false;

  constructor() {
    super({ key: 'GameScene' });
  }

  // Phaser passes the data object from scene.restart(data) here.
  create(data?: { levelIndex?: number }): void {
    this.currentLevelIndex = data?.levelIndex ?? 0;
    const level = LEVELS[this.currentLevelIndex];
    this.currentLevel = level;

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

    // Floor tiles read final cell states — must come after all setCell() calls
    this.grid.buildFloorTiles();

    // Z-order: grid → debug → hover → result overlay (last = on top)
    this.debugGraphics = this.add.graphics();
    this.hoverGraphics = this.add.graphics();
    this.resultGraphics = this.add.graphics().setDepth(10);

    this.resultHeadline = this.add
      .text(width / 2, height / 2 - 22, '', {
        fontSize: '26px', fontFamily: 'monospace', fontStyle: 'bold', color: '#ffffff',
      })
      .setOrigin(0.5)
      .setVisible(false)
      .setDepth(11);

    this.resultSubtext = this.add
      .text(width / 2, height / 2 + 22, '', {
        fontSize: '13px', fontFamily: 'monospace', color: '#aaaaaa',
      })
      .setOrigin(0.5)
      .setVisible(false)
      .setDepth(11);

    this.addBackground();
    this.startMusic();
    this.setupInput();
    this.addHUD(level);
    this.updateQueueHUD();
    this.updatePressureHUD();
  }

  // ── Music ─────────────────────────────────────────────────────────────────

  private startMusic(): void {
    // Keep music playing across level restarts — don't restart if already running
    if (this.sound.get('music-bg')) return;

    // Already cached from a previous lazy load — just play
    if (this.cache.audio.exists('music-bg')) {
      this.sound.play('music-bg', { loop: true, volume: 0.5, mute: this.soundMuted });
      return;
    }

    // Lazy-load: start downloading in the background, play when ready
    this.load.audio('music-bg', 'assets/audio/Pressure_and_Pinions.mp3');
    this.load.once('complete', () => {
      if (this.sound.get('music-bg')) return; // guard for quick restarts
      this.sound.play('music-bg', { loop: true, volume: 0.5, mute: this.soundMuted });
    });
    this.load.start();
  }

  // ── Background ────────────────────────────────────────────────────────────

  private addBackground(): void {
    const { width, height } = this.scale;

    // Dark overlay is always drawn immediately (no texture needed)
    this.add.graphics()
      .setDepth(-1)
      .fillStyle(0x000000, 0.7)
      .fillRect(0, 0, width, height);

    // Background tiles: lazy-load and place once ready
    const alreadyLoaded = this.textures.exists('back-1');
    if (alreadyLoaded) {
      this.placeBackgroundTiles();
      return;
    }

    for (let i = 1; i <= 6; i++) {
      this.load.image(`back-${i}`, `assets/background/back-0${i}.png`);
    }
    this.load.once('complete', () => this.placeBackgroundTiles());
    this.load.start();
  }

  private placeBackgroundTiles(): void {
    const { width, height } = this.scale;
    const tileSize = CELL_SIZE * 2;
    const cols = Math.ceil(width  / tileSize) + 1;
    const rows = Math.ceil(height / tileSize) + 1;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const variant = (col * 7 + row * 13) % 6 + 1;
        const key     = `back-${variant}`;
        if (!this.textures.exists(key)) continue;

        const cx  = col * tileSize + tileSize / 2;
        const cy  = row * tileSize + tileSize / 2;
        const img = this.add.image(cx, cy, key);
        const tex = Math.max(img.width, img.height) || tileSize;
        img.setScale(tileSize / tex).setDepth(-2);
      }
    }
  }

  // ── Input ──────────────────────────────────────────────────────────────────

  private setupInput(): void {
    this.input.on(Phaser.Input.Events.POINTER_MOVE,
      (p: Phaser.Input.Pointer) => this.onHover(p));

    this.input.on(Phaser.Input.Events.POINTER_DOWN,
      (p: Phaser.Input.Pointer) => this.onClickDown(p));

    // Space: activate before activation, advance to next level after a win
    this.input.keyboard!.on('keydown-SPACE', () => this.onSpaceKey());
    // R: rotate part-in-hand before activation; retry after activation
    this.input.keyboard!.on('keydown-R',     () => this.onRKey());
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

    // Outline
    this.hoverGraphics.lineStyle(2, color, HOVER_ALPHA);
    this.hoverGraphics.strokeRect(x + 2, y + 2, s - 4, s - 4);

    // For axle: show orientation preview so the player can see which way it faces
    if (canPlace && this.state.queue[0] === 'axle') {
      const horiz = this.state.rotation % 2 === 0;
      const cx = x + s / 2;
      const cy = y + s / 2;
      this.hoverGraphics.fillStyle(color, 0.28);
      if (horiz) {
        this.hoverGraphics.fillRect(x + 8, cy - 4, s - 16, 8);
      } else {
        this.hoverGraphics.fillRect(cx - 4, y + 8, 8, s - 16);
      }
    }
  }

  private onClickDown(pointer: Phaser.Input.Pointer): void {
    if (this.state.isActivated) return;

    const currentPart = this.state.queue[0] ?? null;
    if (!currentPart) return;

    const coord = this.grid.worldToCell(pointer.x, pointer.y);
    if (!coord) return;

    const placed = this.grid.placeAt(coord.col, coord.row, { type: currentPart, rotation: this.state.rotation });
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

  private onRKey(): void {
    if (!this.state.isActivated) {
      this.onRotate();
    } else {
      this.onRetry();
    }
  }

  private onRotate(): void {
    this.state.rotation = ((this.state.rotation + 1) % 4) as 0 | 1 | 2 | 3;
    this.updateQueueHUD();
    // Clear hover so it redraws immediately with the new orientation preview
    this.hoverGraphics.clear();
  }

  private onNextLevel(): void {
    this.grid.destroy();
    this.scene.restart({ levelIndex: this.currentLevelIndex + 1 });
  }

  private onRetry(): void {
    this.grid.destroy();
    this.scene.restart({ levelIndex: this.currentLevelIndex });
  }

  // ── Game loop ──────────────────────────────────────────────────────────────

  update(_time: number, delta: number): void {
    this.grid.update(delta);


    if (this.state.isActivated) return;

    const cfg = this.currentLevel.pressure;
    if (!cfg?.enabled) return;

    this.state.pressure += cfg.risePerSecond * (delta / 1000);
    if (this.state.pressure >= cfg.failAt) {
      this.state.pressure = cfg.failAt;
      this.onPressureFailure();
      return;
    }

    this.updatePressureHUD();
  }

  private onPressureFailure(): void {
    this.state.isActivated = true;
    this.state.isFailed    = true;
    this.hoverGraphics.clear();
    this.showResult(false, true);
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

    // Pressure gauge — only visible for levels that have pressure enabled
    this.pressureText = this.add.text(12, 88, '', {
      fontSize: '13px', fontFamily: 'monospace', color: '#888888',
    }).setVisible(!!level.pressure?.enabled);

    // Sound toggle button
    this.addSoundToggle();
  }

  private addSoundToggle(): void {
    const label = () => this.soundMuted ? '♪  OFF' : '♪  ON';

    const btn = this.add.text(12, 112, label(), {
      fontSize: '12px', fontFamily: 'monospace', color: '#444444',
    });

    btn.setInteractive({ useHandCursor: true })
      .on('pointerover',  () => btn.setColor('#888888'))
      .on('pointerout',   () => btn.setColor(this.soundMuted ? '#333333' : '#444444'))
      .on('pointerdown',  () => {
        this.soundMuted = !this.soundMuted;
        this.sound.mute = this.soundMuted;
        btn.setText(label());
        btn.setColor(this.soundMuted ? '#333333' : '#444444');
      });
  }

  private updateQueueHUD(): void {
    const { queue, rotation } = this.state;

    if (queue.length === 0) {
      this.queueText.setText('Queue: empty');
      this.statusText.setText('[SPACE] activate — no parts remaining');
      return;
    }

    const current    = queue[0];
    const remaining  = queue.length;
    const preview    = queue.slice(1, 4).map(p => p[0].toUpperCase()).join(' ');
    const previewStr = preview.length > 0 ? `   next: ${preview}` : '';

    // Show orientation indicator only for axle — gear rotation has no gameplay effect
    const rotLabel = current === 'axle'
      ? ` [${rotation % 2 === 0 ? '↔' : '↕'}]`
      : '';

    this.queueText.setText(
      `In hand: ${current.toUpperCase()}${rotLabel}  (${remaining} left)${previewStr}`
    );
    this.statusText.setText('[SPACE] activate   [R] rotate');
  }

  private updatePressureHUD(): void {
    const cfg = this.currentLevel.pressure;
    if (!cfg?.enabled) return;

    const pct = this.state.pressure / cfg.failAt;
    const bar = Math.round(pct * 20);
    const filled   = '█'.repeat(bar);
    const unfilled = '░'.repeat(20 - bar);
    const label    = `Pressure: [${filled}${unfilled}] ${Math.floor(this.state.pressure)}/${cfg.failAt}`;

    let color: string;
    if (pct >= PRESSURE_CRITICAL_PCT) {
      color = '#ff4422';
    } else if (pct >= PRESSURE_WARN_PCT) {
      color = '#cc9922';
    } else {
      color = '#888888';
    }

    this.pressureText.setText(label).setColor(color);
  }

  // ── Result overlay ─────────────────────────────────────────────────────────

  private showResult(valid: boolean, isPressureFail = false): void {
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

    let headline: string;
    let subline: string;
    let statusLine: string;

    if (valid) {
      headline = '✓  MACHINE ACTIVATED';
      if (this.isFinalLevel()) {
        subline    = 'all machines complete!  —  [R] play again';
        statusLine = 'ALL DONE — [R] play again';
      } else {
        subline    = 'chain complete  —  [SPACE] next level   [R] retry';
        statusLine = 'ACTIVATED — [SPACE] next level   [R] retry';
      }
    } else if (isPressureFail) {
      headline   = '✗  PRESSURE OVERLOAD';
      subline    = 'boiler pressure exceeded limit  —  [R] retry';
      statusLine = 'OVERLOAD — [R] retry';
    } else {
      headline   = '✗  ACTIVATION FAILED';
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
