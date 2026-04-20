import Phaser from 'phaser';

const BAR_W  = 400;
const BAR_H  = 10;
const BG_CLR = 0x0c0906;
const BAR_BG = 0x1e1810;
const BAR_FG = 0xb87820;  // brass

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload(): void {
    this.buildLoadingScreen();

    for (let i = 1; i <= 7; i++) {
      const pad = i.toString().padStart(3, '0');
      this.load.image(`gear-${i}`, `assets/parts/gear-${pad}.png`);
    }

    this.load.image('axle',             'assets/parts/axle.png');
    this.load.image('corner',           'assets/parts/corner.png');
    this.load.image('pressure-bar-bg',  'assets/parts/pressure-bar-bg.png');
    this.load.image('pressure-bar-fill','assets/parts/pressure-bar-fill.png');

    for (let i = 1; i <= 5; i++) {
      this.load.image(`floor-${i}`, `assets/floor/floor-00${i}.png`);
    }
    // Background tiles are lazy-loaded in GameScene (decorative only)

    this.load.image('floor-block-1', 'assets/floor/floor-block-001.png');
    this.load.image('floor-block-2', 'assets/floor/floor-block-002.png');
    this.load.image('source-tile',   'assets/floor/source-base-tile.png');
    this.load.image('target-tile',   'assets/floor/source-output-tile.png');

    for (let i = 1; i <= 8; i++) {
      const pad = i.toString().padStart(2, '0');
      this.load.image(`source-anim-${i}`, `assets/floor/input/input-${pad}.png`);
      this.load.image(`target-anim-${i}`, `assets/floor/output/output-${pad}.png`);
    }

    this.load.audio('sfx-place', 'assets/audio/Gear-Installed.mp3');
    this.load.audio('sfx-gears', 'assets/audio/Rotating-Gears.mp3');

    // Music is loaded lazily in GameScene to keep the preload bar fast
  }

  create(): void {
    this.anims.create({
      key:       'source-spin',
      frames:    Array.from({ length: 8 }, (_, i) => ({ key: `source-anim-${i + 1}` })),
      frameRate: 12,
      repeat:    -1,
    });

    this.anims.create({
      key:       'target-pulse',
      frames:    Array.from({ length: 8 }, (_, i) => ({ key: `target-anim-${i + 1}` })),
      frameRate: 12,
      repeat:    -1,
    });

    this.scene.start('GameScene');
  }

  // ── Loading screen ──────────────────────────────────────────────────────────

  private buildLoadingScreen(): void {
    const { width, height } = this.scale;
    const cx = width  / 2;
    const cy = height / 2;

    // Background
    this.add.rectangle(0, 0, width, height, BG_CLR).setOrigin(0);

    // Title
    this.add.text(cx, cy - 60, 'STEAMHEART', {
      fontSize: '32px', fontFamily: 'monospace', fontStyle: 'bold',
      color: '#b87820',
    }).setOrigin(0.5);

    this.add.text(cx, cy - 26, 'a machine-building puzzle', {
      fontSize: '12px', fontFamily: 'monospace', color: '#444444',
    }).setOrigin(0.5);

    // Bar background
    const barX = cx - BAR_W / 2;
    const barY = cy + 10;
    this.add.rectangle(barX, barY, BAR_W, BAR_H, BAR_BG).setOrigin(0);

    // Bar fill — updated by progress event
    const fill = this.add.rectangle(barX, barY, 0, BAR_H, BAR_FG).setOrigin(0);

    // Percentage text
    const pct = this.add.text(cx, barY + BAR_H + 14, '0%', {
      fontSize: '11px', fontFamily: 'monospace', color: '#444444',
    }).setOrigin(0.5);

    this.load.on('progress', (value: number) => {
      fill.width = BAR_W * value;
      pct.setText(`${Math.floor(value * 100)}%`);
    });
  }
}
