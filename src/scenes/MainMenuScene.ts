import Phaser from 'phaser';

const BG  = 0x0c0906;
const GOLD = '#b87820';
const DIM  = '#444444';
const DARK = '#222222';

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create(): void {
    const { width, height } = this.scale;
    const cx = width / 2;

    // Background
    this.add.rectangle(0, 0, width, height, BG).setOrigin(0);

    // Decorative gear rings — purely visual
    this.drawDecorativeGears(cx, height / 2);

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

    // Menu buttons
    const btnY  = height / 2 + 10;
    const btnGap = 56;

    this.addButton(cx, btnY,             '▶  NEW GAME',     () => this.startNewGame());
    this.addButton(cx, btnY + btnGap,    '≡  LEVEL SELECT', () => this.scene.start('LevelSelectScene'));
    this.addButton(cx, btnY + btnGap * 2,'✦  CREDITS',      () => this.scene.start('CreditsScene'));

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

  private startNewGame(): void {
    this.scene.start('GameScene', { levelIndex: 0 });
  }

  private drawDecorativeGears(cx: number, cy: number): void {
    const g = this.add.graphics().setAlpha(0.07);

    const drawGear = (x: number, y: number, r: number, teeth: number) => {
      g.lineStyle(2, 0xb87820, 1);
      g.strokeCircle(x, y, r);
      g.strokeCircle(x, y, r * 0.42);
      for (let i = 0; i < teeth; i++) {
        const a  = (i / teeth) * Math.PI * 2;
        const x1 = x + Math.cos(a) * r;
        const y1 = y + Math.sin(a) * r;
        const x2 = x + Math.cos(a) * (r + 10);
        const y2 = y + Math.sin(a) * (r + 10);
        g.lineBetween(x1, y1, x2, y2);
      }
    };

    drawGear(cx - 260, cy - 80,  90, 18);
    drawGear(cx + 280, cy + 60, 110, 22);
    drawGear(cx - 340, cy + 160, 60, 12);
    drawGear(cx + 160, cy - 160, 70, 14);
  }
}
