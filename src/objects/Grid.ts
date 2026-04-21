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

// Per-part-type fill color (used when no sprite is available)
const PART_COLORS: Record<string, number> = {
  gear:   0xb87820,  // brass
  axle:   0x7a5a20,  // darker brass
  corner: 0xc86010,  // copper-orange
};

// ── Gear specs ────────────────────────────────────────────────────────────────
// All gears must extend past the cell boundary so teeth physically overlap with
// neighbours. BASE_DIAMETER > cellSize guarantees this for every size tier.
// The per-spec SIZE_SCALE then adds subtle size variation on top:
//   small (12t):  cellSize * 1.05  →  ~67 px
//   medium (16t): cellSize * 1.12  →  ~72 px
//   large (20t):  cellSize * 1.20  →  ~77 px
//
// Phase offset = 180 / toothCount so adjacent teeth interlock on placement.
const GEAR_SIZE_SMALL  = 1.05;
const GEAR_SIZE_MEDIUM = 1.12;
const GEAR_SIZE_LARGE  = 1.20;

interface GearSpec {
  textureKey: string;
  toothCount: number;
  sizeScale:  number;   // multiplier on cellSize for render diameter
}

// Sprites ordered small → large. Chosen by (col*7 + row*13) % GEAR_SPECS.length.
const GEAR_SPECS: GearSpec[] = [
  { textureKey: 'gear-1', toothCount: 12, sizeScale: GEAR_SIZE_SMALL  },
  { textureKey: 'gear-7', toothCount: 12, sizeScale: GEAR_SIZE_SMALL  },
  { textureKey: 'gear-6', toothCount: 14, sizeScale: GEAR_SIZE_MEDIUM },
  { textureKey: 'gear-2', toothCount: 16, sizeScale: GEAR_SIZE_MEDIUM },
  { textureKey: 'gear-5', toothCount: 16, sizeScale: GEAR_SIZE_MEDIUM },
  { textureKey: 'gear-4', toothCount: 20, sizeScale: GEAR_SIZE_LARGE  },
  { textureKey: 'gear-3', toothCount: 20, sizeScale: GEAR_SIZE_LARGE  },
];

const GEAR_DEG_PER_SEC = 90;

const GRID_LINE_COLOR = 0x444444;
const GRID_LINE_ALPHA = 0.7;
const CELL_PAD        = 2;

export class Grid {
  private readonly scene: Phaser.Scene;
  private readonly config: GridConfig;
  private readonly cells: Cell[][];
  private readonly graphics: Phaser.GameObjects.Graphics;
  // Sprite pool keyed by "col,row" — one Image per occupied cell that has a texture
  private readonly sprites    = new Map<string, Phaser.GameObjects.Image>();
  // Accumulated rotation angle (degrees) per gear cell
  private readonly gearAngles = new Map<string, number>();
  // All game objects created by buildFloorTiles() — destroyed explicitly on destroy()
  private readonly floorObjects: Phaser.GameObjects.GameObject[] = [];
  // All target floor tiles — tinted green on successful activation
  private targetFloorImages: Phaser.GameObjects.Image[] = [];
  // Speed multiplier applied to gear rotation — tweened on win/fail
  private gearSpeedMult = 1.0;

  constructor(scene: Phaser.Scene, config: GridConfig) {
    this.scene    = scene;
    this.config   = config;
    this.cells    = this.buildCells();

    this.graphics = scene.add.graphics();
    this.graphics.setDepth(1);
    this.draw();
  }

  /** Destroy all game objects owned by this Grid. Call before discarding the instance. */
  destroy(): void {
    this.graphics.destroy();
    for (const img of this.sprites.values()) img.destroy();
    this.sprites.clear();
    this.gearAngles.clear();
    for (const obj of this.floorObjects) obj.destroy();
    this.floorObjects.length = 0;
  }

  // ── Floor tile layer ───────────────────────────────────────────────────────

  /** Call once from GameScene after all setCell() calls are done. */
  buildFloorTiles(): void {
    const { cols, rows, cellSize } = this.config;
    const tileSize = cellSize - CELL_PAD * 2;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const cell    = this.cells[row][col];
        const { x, y } = this.cellToWorld(col, row);
        const cx      = x + cellSize / 2;
        const cy      = y + cellSize / 2;

        // Pick texture key based on cell state
        const hash   = (col * 7 + row * 13) % 5;
        let key: string;
        if (cell.state === 'source') {
          key = 'source-tile';
        } else if (cell.state === 'target') {
          key = 'target-tile';
        } else if (cell.state === 'locked') {
          key = `floor-block-${((col * 7 + row * 13) % 2) + 1}`;
        } else {
          key = `floor-${hash + 1}`;
        }

        // Fallback: if textures aren't loaded yet just skip
        if (!this.scene.textures.exists(key)) continue;

        const img = this.scene.add.image(cx, cy, key);
        const tex = Math.max(img.width, img.height) || tileSize;
        img.setScale(tileSize / tex);
        img.setDepth(0);
        this.floorObjects.push(img);

        if (cell.state === 'target') this.targetFloorImages.push(img);

        // Source / target: overlay the looping energy animation at ~half tile size
        const animKey  = cell.state === 'source' ? 'source-spin'  : cell.state === 'target' ? 'target-pulse' : null;
        const animTex0 = cell.state === 'source' ? 'source-anim-1': cell.state === 'target' ? 'target-anim-1': null;
        if (animKey && animTex0 && this.scene.anims.exists(animKey)) {
          const anim    = this.scene.add.sprite(cx, cy, animTex0);
          const animTex = Math.max(anim.width, anim.height) || tileSize;
          anim.setScale((tileSize * 0.52) / animTex);
          anim.setDepth(0.5);
          anim.play(animKey);
          this.floorObjects.push(anim);
        }
      }
    }
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  /** Tint all target floor tiles green to signal a successful activation. */
  setTargetActivated(): void {
    for (const img of this.targetFloorImages) img.setTint(0x44ff88);
  }

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

  getTargetCells(): Cell[] {
    const result: Cell[] = [];
    for (const row of this.cells) {
      for (const cell of row) {
        if (cell.state === 'target') result.push(cell);
      }
    }
    return result;
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

  /** Call every frame from GameScene.update() to animate placed parts. */
  update(delta: number): void {
    const dDeg = GEAR_DEG_PER_SEC * this.gearSpeedMult * (delta / 1000);

    for (const [key, img] of this.sprites) {
      // Key formats:
      //   "col,row"       → main gear cell
      //   "e:col,row,N"   → axle end gear (N = 0 or 1)
      //   "h:col,row"     → corner hub gear
      let col: number, row: number, neededType: string;
      if (key.startsWith('e:')) {
        const inner = key.slice(2).split(',');
        col = parseInt(inner[0], 10); row = parseInt(inner[1], 10);
        neededType = 'axle';
      } else if (key.startsWith('h:')) {
        const inner = key.slice(2).split(',');
        col = parseInt(inner[0], 10); row = parseInt(inner[1], 10);
        neededType = 'corner';
      } else {
        const parts = key.split(',').map(Number);
        col = parts[0]; row = parts[1];
        neededType = 'gear';
      }

      const cell = this.cells[row]?.[col];
      if (cell?.part?.type !== neededType) continue;

      // Checkerboard: even sum → clockwise, odd sum → counter-clockwise
      const dir   = (col + row) % 2 === 0 ? 1 : -1;
      const angle = (this.gearAngles.get(key) ?? 0) + dir * dDeg;
      this.gearAngles.set(key, angle);
      img.setAngle(angle);
    }
  }

  /** Brief speed pulse when a part is placed — makes the grid feel alive. */
  pulsePlacement(): void {
    this.scene.tweens.killTweensOf(this);
    this.scene.tweens.chain({
      targets: this,
      tweens: [
        { gearSpeedMult: 2.5, duration: 80,  ease: 'Quad.easeOut' },
        { gearSpeedMult: 1.0, duration: 350, ease: 'Quad.easeIn'  },
      ],
    });
  }

  /** Tween gear speed: win = spin up then settle, fail = slow to stop. */
  animateGearSpeed(valid: boolean): void {
    this.scene.tweens.killTweensOf(this);

    if (valid) {
      // Burst to 4× then settle at 2×
      this.scene.tweens.chain({
        targets: this,
        tweens: [
          { gearSpeedMult: 4.0, duration: 400, ease: 'Quad.easeIn' },
          { gearSpeedMult: 2.0, duration: 600, ease: 'Quad.easeOut' },
        ],
      });
    } else {
      // Decelerate to full stop
      this.scene.tweens.add({
        targets:  this,
        gearSpeedMult: 0,
        duration: 1200,
        ease:     'Quad.easeOut',
      });
    }
  }

  // ── Rendering ──────────────────────────────────────────────────────────────

  draw(): void {
    const { cols, rows, cellSize, originX, originY } = this.config;
    const g = this.graphics;
    g.clear();

    // Track which sprite keys are still needed this frame
    const needed = new Set<string>();

    // 1. Cell fills
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const cell = this.cells[row][col];
        const { x, y } = this.cellToWorld(col, row);
        const cx = x + cellSize / 2;
        const cy = y + cellSize / 2;

        // Pick gear spec for this cell (deterministic by position)
        const specIndex = cell.part?.type === 'gear'
          ? (col * 7 + row * 13) % GEAR_SPECS.length
          : -1;
        const spec      = specIndex >= 0 ? GEAR_SPECS[specIndex] : null;
        const useSprite = !!spec && this.scene.textures.exists(spec.textureKey);

        // Sprite-based part rendering
        if (useSprite && spec) {
          const key = `${col},${row}`;
          needed.add(key);
          let img = this.sprites.get(key);
          if (!img) {
            img = this.scene.add.image(cx, cy, spec.textureKey);
            this.sprites.set(key, img);
            this.gearAngles.set(key, this.computeGearPhase(col, row, spec));
          }
          // Diameter = cellSize * sizeScale so all gears extend past the
          // cell boundary and teeth visually overlap with neighbours.
          const diameter = cellSize * spec.sizeScale;
          const texMax   = Math.max(img.width || diameter, img.height || diameter);
          img.setScale(diameter / texMax);
          img.setPosition(cx, cy);
          img.setDepth(2);
          img.setAngle(this.gearAngles.get(key) ?? 0);
        }

        // Axle — sprite if loaded, otherwise programmatic.
        // Small animated gears are placed at both tips to show where the axle
        // connects to neighbouring cells.
        if (cell.part?.type === 'axle') {
          const isHoriz = cell.part.rotation % 2 === 0;

          if (this.scene.textures.exists('axle')) {
            const key = `${col},${row}`;
            needed.add(key);
            let img = this.sprites.get(key);
            if (!img) {
              img = this.scene.add.image(cx, cy, 'axle');
              this.sprites.set(key, img);
            }
            const scale = (cellSize * 0.92) / img.width;
            img.setScale(scale);
            img.setPosition(cx, cy);
            img.setDepth(2);
            img.setAngle(isHoriz ? 0 : 90);
          } else {
            // Programmatic fallback
            const thick  = 10;
            const margin = CELL_PAD + 4;
            g.fillStyle(0x5a4010, 1);
            if (isHoriz) {
              g.fillRect(x + margin, cy - thick / 2, cellSize - margin * 2, thick);
            } else {
              g.fillRect(cx - thick / 2, y + margin, thick, cellSize - margin * 2);
            }
            g.fillStyle(0x3a2808, 1);
            g.fillCircle(cx, cy, thick * 0.45);
          }

          // End gears at both tips — always rendered (regardless of axle sprite)
          // Keyed as "e:col,row,0" and "e:col,row,1" so the animation loop
          // can distinguish them from main cell sprites.
          const endSpec  = GEAR_SPECS[(col * 7 + row * 13) % GEAR_SPECS.length];
          const endSize  = cellSize * 0.62;   // smaller than a full cell gear
          const endTips  = isHoriz
            ? [{ ex: x,            ey: cy }, { ex: x + cellSize, ey: cy }]
            : [{ ex: cx,           ey: y  }, { ex: cx, ey: y + cellSize }];

          endTips.forEach(({ ex, ey }, i) => {
            if (!this.scene.textures.exists(endSpec.textureKey)) return;

            const eKey = `e:${col},${row},${i}`;
            needed.add(eKey);
            let eImg = this.sprites.get(eKey);
            if (!eImg) {
              eImg = this.scene.add.image(ex, ey, endSpec.textureKey);
              this.sprites.set(eKey, eImg);
              this.gearAngles.set(eKey, (col + row) % 2 === 0 ? 0 : 180 / endSpec.toothCount);
            }
            const texMax = Math.max(eImg.width || endSize, eImg.height || endSize);
            eImg.setScale(endSize / texMax);
            eImg.setPosition(ex, ey);
            eImg.setDepth(3);   // on top of axle shaft
            eImg.setAngle(this.gearAngles.get(eKey) ?? 0);
          });
        }

        // Corner gear — corner.png static (angle shows orientation) + small
        // animated hub gear on top.  Falls back to programmatic L-shape if the
        // 'corner' texture isn't loaded yet.
        // rotation: 0=right+down  1=down+left  2=left+up  3=up+right
        if (cell.part?.type === 'corner') {
          if (this.scene.textures.exists('corner')) {
            // ── Base sprite (static, no spin) ──────────────────────────────
            const cKey = `${col},${row}`;
            needed.add(cKey);
            let cImg = this.sprites.get(cKey);
            if (!cImg) {
              cImg = this.scene.add.image(cx, cy, 'corner');
              this.sprites.set(cKey, cImg);
            }
            const diameter = cellSize * GEAR_SIZE_MEDIUM;
            const texMax   = Math.max(cImg.width || diameter, cImg.height || diameter);
            cImg.setScale(diameter / texMax);
            cImg.setPosition(cx, cy);
            cImg.setDepth(2);
            // Rotate sprite to match orientation (visual hint of which side is active)
            cImg.setAngle(cell.part.rotation * 90);

            // ── Hub gear (animated, on top) ─────────────────────────────────
            const hubSpec = GEAR_SPECS[(col * 7 + row * 13) % GEAR_SPECS.length];
            if (this.scene.textures.exists(hubSpec.textureKey)) {
              const hKey = `h:${col},${row}`;
              needed.add(hKey);
              let hImg = this.sprites.get(hKey);
              if (!hImg) {
                hImg = this.scene.add.image(cx, cy, hubSpec.textureKey);
                this.sprites.set(hKey, hImg);
                this.gearAngles.set(hKey,
                  (col + row) % 2 === 0 ? 0 : 180 / hubSpec.toothCount);
              }
              const hubSize = cellSize * 0.52;
              const hubMax  = Math.max(hImg.width || hubSize, hImg.height || hubSize);
              hImg.setScale(hubSize / hubMax);
              hImg.setPosition(cx, cy);
              hImg.setDepth(3);
              hImg.setAngle(this.gearAngles.get(hKey) ?? 0);
            }
          } else {
            // Programmatic fallback (L-shape arms)
            const rot    = cell.part.rotation;
            const thick  = 10;
            const half   = cellSize / 2;
            const margin = CELL_PAD + 4;
            const arm    = half - margin;
            g.fillStyle(0x9a4808, 1);
            if (rot === 0 || rot === 3) {
              g.fillRect(cx,         cy - thick / 2, arm, thick);
            } else {
              g.fillRect(x + margin, cy - thick / 2, arm, thick);
            }
            if (rot === 0 || rot === 1) {
              g.fillRect(cx - thick / 2, cy,         thick, arm);
            } else {
              g.fillRect(cx - thick / 2, y + margin, thick, arm);
            }
            g.fillStyle(0x6a3005, 1);
            g.fillCircle(cx, cy, thick * 0.7);
            g.fillStyle(0xc86010, 1);
            g.fillCircle(cx, cy, thick * 0.3);
          }
        }

        // Source and target both have dedicated sprites — no overlay needed
      }
    }

    // Remove sprites whose cells are no longer occupied
    for (const [key, img] of this.sprites) {
      if (!needed.has(key)) {
        img.destroy();
        this.sprites.delete(key);
        this.gearAngles.delete(key);
      }
    }

    // 2. Grid lines (drawn on top of fills, under sprites via depth)
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

  /**
   * Compute the initial rotation angle for a newly placed gear so its teeth
   * interlock with any already-placed gear neighbour.
   *
   * If neighbour A has angle θA and NA teeth, and new gear B has NB teeth:
   *   θB = 180/NB − θA × (NA/NB)
   *
   * This ensures a tooth of A aligns with a valley of B at their contact point.
   * Falls back to checkerboard half-pitch offset when no gear neighbour exists yet.
   */
  private computeGearPhase(col: number, row: number, spec: GearSpec): number {
    const dirs = [
      { dc: 1, dr: 0 }, { dc: -1, dr: 0 },
      { dc: 0, dr: 1 }, { dc: 0, dr: -1 },
    ];

    for (const { dc, dr } of dirs) {
      const nc = col + dc;
      const nr = row + dr;
      const neighborCell = this.cells[nr]?.[nc];
      if (neighborCell?.part?.type !== 'gear') continue;

      const neighborAngle = this.gearAngles.get(`${nc},${nr}`);
      if (neighborAngle === undefined) continue;

      const nSpec = GEAR_SPECS[(nc * 7 + nr * 13) % GEAR_SPECS.length];
      return 180 / spec.toothCount - neighborAngle * (nSpec.toothCount / spec.toothCount);
    }

    // No gear neighbour yet — checkerboard half-pitch fallback
    return (col + row) % 2 === 0 ? 0 : 180 / spec.toothCount;
  }

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
