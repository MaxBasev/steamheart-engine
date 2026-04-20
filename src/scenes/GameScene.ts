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

  private queueText!:      Phaser.GameObjects.Text;  // invisible placeholder (used by showResult)
  private queueGraphics!:  Phaser.GameObjects.Graphics;
  private statusText!:     Phaser.GameObjects.Text;
  private pressureText!:   Phaser.GameObjects.Text;
  private resultHeadline!: Phaser.GameObjects.Text;
  private resultSubtext!:  Phaser.GameObjects.Text;

  // Graphical pressure bar — only created when the level has pressure enabled
  private pressureBarBg?:       Phaser.GameObjects.Image;
  private pressureBarFill?:     Phaser.GameObjects.Image;
  private pressureBarFillOrigW  = 0;
  private pressureBarFillOrigH  = 0;

  // Persists across scene.restart() because restart reuses the same instance.
  // Must be reset explicitly in create().
  private currentLevelIndex = 0;
  private currentLevel!:    LevelData;
  private state: GameState  = freshState(LEVELS[0]);
  private soundMuted           = false;
  private isTouchDevice        = false;
  private mobileBtnRotate?:    Phaser.GameObjects.Text;
  private mobileBtnAction?:    Phaser.GameObjects.Text;

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

    // Apply level cells: source, target, locked, then pre-placed parts
    this.grid.setCell(level.sourceCol, level.sourceRow, 'source');
    this.grid.setCell(level.targetCol, level.targetRow, 'target');
    for (const lc of level.lockedCells) {
      this.grid.setCell(lc.col, lc.row, 'locked');
    }
    for (const pp of level.prePlacedParts ?? []) {
      this.grid.setCell(pp.col, pp.row, 'occupied', pp.part);
    }

    // Floor tiles read final cell states — must come after all setCell() calls
    this.grid.buildFloorTiles();

    // Z-order: grid → debug → hover → queueIcons → result overlay (last = on top)
    this.debugGraphics = this.add.graphics();
    this.hoverGraphics = this.add.graphics();
    this.queueGraphics = this.add.graphics().setDepth(9);
    this.resultGraphics = this.add.graphics().setDepth(10);

    this.resultHeadline = this.add
      .text(width / 2, 72, '', {
        fontSize: '26px', fontFamily: 'monospace', fontStyle: 'bold', color: '#ffffff',
      })
      .setOrigin(0.5)
      .setVisible(false)
      .setDepth(11);

    this.resultSubtext = this.add
      .text(width / 2, 108, '', {
        fontSize: '13px', fontFamily: 'monospace', color: '#aaaaaa',
      })
      .setOrigin(0.5)
      .setVisible(false)
      .setDepth(11);

    this.isTouchDevice = this.sys.game.device.input.touch;

    this.addBackground();
    this.startMusic();
    this.setupInput();
    this.addHUD(level);
    this.addMobileControls();
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

    // For axle / corner: show orientation preview
    const cx = x + s / 2;
    const cy = y + s / 2;
    if (canPlace && this.state.queue[0] === 'axle') {
      const horiz = this.state.rotation % 2 === 0;
      this.hoverGraphics.fillStyle(color, 0.28);
      if (horiz) {
        this.hoverGraphics.fillRect(x + 8, cy - 4, s - 16, 8);
      } else {
        this.hoverGraphics.fillRect(cx - 4, y + 8, 8, s - 16);
      }
    }
    if (canPlace && this.state.queue[0] === 'corner') {
      const rot  = this.state.rotation;
      const arm  = s / 2 - 8;
      this.hoverGraphics.fillStyle(color, 0.28);
      // Horizontal arm
      if (rot === 0 || rot === 3) this.hoverGraphics.fillRect(cx,     cy - 4, arm, 8);
      else                         this.hoverGraphics.fillRect(x + 8,  cy - 4, arm, 8);
      // Vertical arm
      if (rot === 0 || rot === 1) this.hoverGraphics.fillRect(cx - 4, cy,     8, arm);
      else                         this.hoverGraphics.fillRect(cx - 4, y + 8,  8, arm);
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
      this.sound.play('sfx-place', { volume: 0.6, mute: this.soundMuted });
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
    this.grid.animateGearSpeed(result.valid);

    if (result.valid) {
      this.cameras.main.flash(350, 160, 255, 160);
      this.sound.play('sfx-gears', { volume: 0.55, loop: false, mute: this.soundMuted });
      this.grid.setTargetActivated();
      this.time.delayedCall(600, () => this.showResult(true));
    } else {
      this.cameras.main.shake(380, 0.013);
      this.showResult(false);
    }

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
    this.cameras.main.shake(500, 0.018);
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

    // Invisible placeholder — only used by showResult() to clear queue display
    this.queueText = this.add.text(0, 0, '').setVisible(false);

    // Dynamic action hint — sits below the queue icon strip (icons end ~y=78)
    this.statusText = this.add.text(12, 82, '', {
      ...dimmer, color: '#555555',
    });

    // Pressure gauge — graphical bar for levels that have pressure
    if (level.pressure?.enabled) {
      const barX  = 12;
      const barCY = 108;
      const barW  = 280;

      this.add.text(barX, barCY - 13, 'STEAM PRESSURE', {
        fontSize: '9px', fontFamily: 'monospace', color: '#555555',
      });

      const bg = this.add.image(barX, barCY, 'pressure-bar-bg').setOrigin(0, 0.5);
      bg.setScale(barW / bg.width).setDepth(5);
      this.pressureBarBg = bg;

      const fill = this.add.image(barX + 5, barCY, 'pressure-bar-fill').setOrigin(0, 0.5);
      fill.setScale(barW / bg.width).setDepth(6);
      this.pressureBarFillOrigW = fill.width;
      this.pressureBarFillOrigH = fill.height;
      fill.setCrop(0, 0, 0, this.pressureBarFillOrigH);
      this.pressureBarFill = fill;

      this.pressureText = this.add.text(barX + barW + 8, barCY, '', {
        fontSize: '11px', fontFamily: 'monospace', color: '#888888',
      }).setOrigin(0, 0.5).setDepth(6);
    } else {
      // Invisible placeholder so updatePressureHUD() can always reference the field
      this.pressureText = this.add.text(0, 0, '').setVisible(false);
      this.pressureBarBg   = undefined;
      this.pressureBarFill = undefined;
    }

    // Sound toggle button
    this.addSoundToggle();
  }

  private addSoundToggle(): void {
    const label = () => this.soundMuted ? '♪  OFF' : '♪  ON';
    const { width } = this.scale;

    const btn = this.add.text(width - 12, 12, label(), {
      fontSize: '12px', fontFamily: 'monospace', color: '#444444',
    }).setOrigin(1, 0);

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

  private addMobileControls(): void {
    if (!this.isTouchDevice) return;

    const { width, height } = this.scale;
    const BW = 150, BH = 54, DEPTH = 15;
    const by = height - 72;  // raised so browser chrome doesn't clip them

    const makeBtn = (bx: number, label: string, cb: () => void): Phaser.GameObjects.Text => {
      this.add.rectangle(bx, by, BW, BH, 0x1a1410, 0.90)
        .setDepth(DEPTH).setInteractive()
        .on('pointerdown', cb);
      const g = this.add.graphics().setDepth(DEPTH + 1);
      g.lineStyle(1, 0x8a6010, 0.8);
      g.strokeRoundedRect(bx - BW / 2, by - BH / 2, BW, BH, 8);
      return this.add.text(bx, by, label, {
        fontSize: '18px', fontFamily: 'monospace', color: '#b87820',
      }).setOrigin(0.5).setDepth(DEPTH + 2);
    };

    this.mobileBtnRotate = makeBtn(BW / 2 + 12,         '⟳  ROTATE', () => this.onRKey());
    this.mobileBtnAction = makeBtn(width - BW / 2 - 12, '▶  GO',     () => this.onSpaceKey());
  }

  private updateMobileButtons(): void {
    if (!this.mobileBtnRotate || !this.mobileBtnAction) return;

    if (!this.state.isActivated) {
      this.mobileBtnRotate.setText('⟳  ROTATE');
      this.mobileBtnAction.setText('▶  GO');
    } else if (this.state.isWon) {
      this.mobileBtnRotate.setText('↺  RETRY');
      this.mobileBtnAction.setText(this.isFinalLevel() ? '↺  AGAIN' : '→  NEXT');
    } else {
      // failed
      this.mobileBtnRotate.setText('↺  RETRY');
      this.mobileBtnAction.setText('—');
    }
  }

  private updateQueueHUD(): void {
    const { queue, rotation } = this.state;
    this.queueGraphics.clear();

    if (queue.length === 0) {
      this.statusText.setText('[SPACE] activate');
      return;
    }

    const BIG  = 42;   // current-part slot size
    const SM   = 28;   // next-part slot size
    const GAP  = 6;
    const originX = 12;
    const originY = 44;

    // Current part — big highlighted slot
    this.drawPartIcon(originX, originY, BIG, queue[0], rotation, true);

    // Next 3 parts — smaller dimmed slots
    for (let i = 1; i <= 3; i++) {
      if (!queue[i]) break;
      const sx = originX + BIG + GAP + (i - 1) * (SM + GAP);
      const sy = originY + Math.floor((BIG - SM) / 2);
      this.drawPartIcon(sx, sy, SM, queue[i], 0, false);
    }

    // Remaining count
    this.queueGraphics.fillStyle(0x444444, 1);
    // (no text in graphics — statusText handles hints below)

    const CORNER_SYMBOLS = ['↘', '↙', '↖', '↗'];
    const rotHint = queue[0] === 'axle'
      ? `  ${rotation % 2 === 0 ? '↔' : '↕'}`
      : queue[0] === 'corner'
        ? `  ${CORNER_SYMBOLS[rotation]}`
        : '';
    this.statusText.setText(`[SPACE] activate   [R] rotate${rotHint}   (${queue.length} left)`);
  }

  private drawPartIcon(x: number, y: number, size: number, part: PartType, rotation: number, active: boolean): void {
    const g  = this.queueGraphics;
    const cx = x + size / 2;
    const cy = y + size / 2;

    // Slot background
    g.fillStyle(0x161616, 1);
    g.fillRoundedRect(x, y, size, size, 4);
    // Border
    g.lineStyle(active ? 2 : 1, active ? 0xb87820 : 0x2e2e2e, 1);
    g.strokeRoundedRect(x, y, size, size, 4);

    const r = size * 0.30;

    if (part === 'gear') {
      // Teeth — small squares around perimeter
      const teeth = 8;
      g.fillStyle(active ? 0xb87820 : 0x6a4810, 1);
      for (let i = 0; i < teeth; i++) {
        const a  = (i / teeth) * Math.PI * 2 - Math.PI / 8;
        const tx = cx + Math.cos(a) * (r + 2);
        const ty = cy + Math.sin(a) * (r + 2);
        g.fillRect(tx - 1.5, ty - 1.5, 3, 3);
      }
      // Outer circle
      g.fillStyle(active ? 0xb87820 : 0x6a4810, 1);
      g.fillCircle(cx, cy, r);
      // Inner hole
      g.fillStyle(0x161616, 1);
      g.fillCircle(cx, cy, r * 0.44);
      // Hub
      g.fillStyle(active ? 0xd8a840 : 0x8a6820, 1);
      g.fillCircle(cx, cy, r * 0.18);

    } else if (part === 'axle') {
      const horiz  = rotation % 2 === 0;
      const barLen = size * 0.74;
      const barThk = size * 0.17;
      g.fillStyle(active ? 0x7a5a20 : 0x4a3a10, 1);
      if (horiz) {
        g.fillRoundedRect(cx - barLen / 2, cy - barThk / 2, barLen, barThk, 2);
        // End gears
        g.fillStyle(active ? 0xa07830 : 0x6a5020, 1);
        g.fillCircle(cx - barLen / 2, cy, barThk * 0.75);
        g.fillCircle(cx + barLen / 2, cy, barThk * 0.75);
      } else {
        g.fillRoundedRect(cx - barThk / 2, cy - barLen / 2, barThk, barLen, 2);
        g.fillStyle(active ? 0xa07830 : 0x6a5020, 1);
        g.fillCircle(cx, cy - barLen / 2, barThk * 0.75);
        g.fillCircle(cx, cy + barLen / 2, barThk * 0.75);
      }
      // Center bolt
      g.fillStyle(active ? 0xc89a40 : 0x8a6820, 1);
      g.fillCircle(cx, cy, barThk * 0.55);

    } else if (part === 'corner') {
      const thick = size * 0.17;
      const arm   = size * 0.33;
      g.fillStyle(active ? 0xc86010 : 0x7a3808, 1);
      // 0=right+down  1=down+left  2=left+up  3=up+right
      if (rotation === 0) {
        g.fillRect(cx - thick / 2, cy - thick / 2, arm + thick / 2, thick);
        g.fillRect(cx - thick / 2, cy - thick / 2, thick, arm + thick / 2);
      } else if (rotation === 1) {
        g.fillRect(cx - arm, cy - thick / 2, arm + thick / 2, thick);
        g.fillRect(cx - thick / 2, cy - thick / 2, thick, arm + thick / 2);
      } else if (rotation === 2) {
        g.fillRect(cx - arm, cy - thick / 2, arm + thick / 2, thick);
        g.fillRect(cx - thick / 2, cy - arm, thick, arm + thick / 2);
      } else {
        g.fillRect(cx - thick / 2, cy - thick / 2, arm + thick / 2, thick);
        g.fillRect(cx - thick / 2, cy - arm, thick, arm + thick / 2);
      }
      // Hub
      g.fillStyle(active ? 0xe07828 : 0x9a5010, 1);
      g.fillCircle(cx, cy, thick * 0.65);
    }
  }

  private updatePressureHUD(): void {
    const cfg = this.currentLevel.pressure;
    if (!cfg?.enabled) return;

    const pct = Math.min(this.state.pressure / cfg.failAt, 1);

    // Update graphical bar fill
    if (this.pressureBarFill) {
      this.pressureBarFill.setCrop(
        0, 0,
        this.pressureBarFillOrigW * pct,
        this.pressureBarFillOrigH,
      );
      // Red tint at critical level to accentuate danger
      if (pct >= PRESSURE_CRITICAL_PCT) {
        this.pressureBarFill.setTint(0xff2200);
      } else {
        this.pressureBarFill.clearTint();
      }
    }

    // Numeric label
    let color: string;
    if (pct >= PRESSURE_CRITICAL_PCT)  color = '#ff4422';
    else if (pct >= PRESSURE_WARN_PCT) color = '#cc9922';
    else                               color = '#888888';

    this.pressureText
      .setText(`${Math.floor(this.state.pressure)}/${cfg.failAt}`)
      .setColor(color);
  }

  // ── Result overlay ─────────────────────────────────────────────────────────

  private showResult(valid: boolean, isPressureFail = false): void {
    const { width, height } = this.scale;
    const g = this.resultGraphics;
    g.clear();

    const panelW = 460;
    const panelH = 100;
    const panelX = (width  - panelW) / 2;
    const panelY = 40;

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
    this.queueGraphics.clear();
    this.updateMobileButtons();
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
