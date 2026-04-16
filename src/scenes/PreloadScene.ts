import Phaser from 'phaser';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload(): void {
    for (let i = 1; i <= 7; i++) {
      const pad = i.toString().padStart(3, '0');
      this.load.image(`gear-${i}`, `assets/parts/gear-${pad}.png`);
    }

    for (let i = 1; i <= 5; i++) {
      this.load.image(`floor-${i}`, `assets/floor/floor-00${i}.png`);
    }
    this.load.image('floor-block-1', 'assets/floor/floor-block-001.png');
    this.load.image('floor-block-2', 'assets/floor/floor-block-002.png');
    this.load.image('source-tile',   'assets/floor/source-base-tile.png');
    this.load.image('target-tile',   'assets/floor/source-output-tile.png');

    for (let i = 1; i <= 8; i++) {
      const pad = i.toString().padStart(2, '0');
      this.load.image(`source-anim-${i}`, `assets/floor/input/input-${pad}.png`);
      this.load.image(`target-anim-${i}`, `assets/floor/output/output-${pad}.png`);
    }
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
}
