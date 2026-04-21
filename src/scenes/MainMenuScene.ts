import Phaser from 'phaser';
import { LEVELS } from '../data/levels';

const BG   = 0x0c0906;
const GOLD  = '#b87820';
const DIM   = '#444444';
const DARK  = '#222222';

function countCompleted(): number {
  return LEVELS.filter(l => localStorage.getItem(`steamheart_completed_${l.id}`) !== null).length;
}

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create(): void {
    const { width, height } = this.scale;
    const cx = width / 2;

    this.add.rectangle(0, 0, width, height, BG).setOrigin(0);

    this.spawnAnimatedGears(cx, height / 2);

    // Title
    this.add.text(cx, height / 2 - 140, 'STEAMHEART', {
      fontSize: '52px', fontFamily: 'monospace', fontStyle: 'bold', color: GOLD,
    }).setOrigin(0.5);

    this.add.text(cx, height / 2 - 88, 'E N G I N E', {
      fontSize: '16px', fontFamily: 'monospace', color: '#7a5010', letterSpacing: 8,
    }).setOrigin(0.5);

    this.add.text(cx, height / 2 - 62, 'a machine-building puzzle', {
      fontSize: '12px', fontFamily: 'monospace', color: DIM,
    }).setOrigin(0.5);

    // Progress counter
    const done = countCompleted();
    if (done > 0) {
      this.add.text(cx, height / 2 - 34, `${done} / ${LEVELS.length} levels completed`, {
        fontSize: '11px', fontFamily: 'monospace', color: done === LEVELS.length ? '#5a9a5a' : '#3a3a3a',
      }).setOrigin(0.5);
    }

    // Buttons
    const btnY  = height / 2 + 14;
    const btnGap = 56;
    this.addButton(cx, btnY,              '▶  NEW GAME',     () => this.scene.start('GameScene', { levelIndex: 0 }));
    this.addButton(cx, btnY + btnGap,     '≡  LEVEL SELECT', () => this.scene.start('LevelSelectScene'));
    this.addButton(cx, btnY + btnGap * 2, '✦  CREDITS',      () => this.scene.start('CreditsScene'));

    // Bottom note
    this.add.text(cx, height - 20, 'Gamedev.js Jam 2026  ·  theme: Machines', {
      fontSize: '10px', fontFamily: 'monospace', color: '#2a2a2a',
    }).setOrigin(0.5);
  }

  private addButton(x: number, y: number, label: string, cb: () => void): void {
    const btn = this.add.text(x, y, label, {
      fontSize: '18px', fontFamily: 'monospace', color: DARK,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btn.on('pointerover',  () => { btn.setColor(GOLD); btn.setScale(1.04); });
    btn.on('pointerout',   () => { btn.setColor(DARK); btn.setScale(1.0);  });
    btn.on('pointerdown',  cb);
  }

  private spawnAnimatedGears(cx: number, cy: number): void {
    // Each gear is its own Graphics object centered at the gear's position,
    // drawn around origin 0,0 so Phaser's angle tween rotates it in place.
    const gears = [
      { x: cx - 260, y: cy - 80,   r: 90,  teeth: 18, speed: 14000, dir:  1 },
      { x: cx + 280, y: cy + 60,   r: 110, teeth: 22, speed: 18000, dir: -1 },
      { x: cx - 340, y: cy + 160,  r: 60,  teeth: 12, speed:  9000, dir:  1 },
      { x: cx + 160, y: cy - 160,  r: 70,  teeth: 14, speed: 11000, dir: -1 },
    ];

    for (const spec of gears) {
      const g = this.add.graphics();
      g.setPosition(spec.x, spec.y);
      g.setAlpha(0.08);

      g.lineStyle(2, 0xb87820, 1);
      g.strokeCircle(0, 0, spec.r);
      g.strokeCircle(0, 0, spec.r * 0.42);
      for (let i = 0; i < spec.teeth; i++) {
        const a = (i / spec.teeth) * Math.PI * 2;
        g.lineBetween(
          Math.cos(a) * spec.r,        Math.sin(a) * spec.r,
          Math.cos(a) * (spec.r + 10), Math.sin(a) * (spec.r + 10),
        );
      }

      this.tweens.add({
        targets:  g,
        angle:    spec.dir * 360,
        duration: spec.speed,
        repeat:   -1,
        ease:     'Linear',
      });
    }
  }
}
