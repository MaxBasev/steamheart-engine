import Phaser from 'phaser';

const BG   = 0x0c0906;
const GOLD = '#b87820';
const MID  = '#888888';
const DIM  = '#444444';

export class EndScene extends Phaser.Scene {
  constructor() {
    super({ key: 'EndScene' });
  }

  create(): void {
    const { width, height } = this.scale;
    const cx = width / 2;

    this.cameras.main.fadeIn(900);

    this.add.rectangle(0, 0, width, height, BG).setOrigin(0);
    this.drawDecorativeGears(cx, height / 2);

    // Chapter complete header
    this.add.text(cx, height / 2 - 190, '★  CHAPTER ONE COMPLETE  ★', {
      fontSize: '22px', fontFamily: 'monospace', fontStyle: 'bold', color: GOLD,
    }).setOrigin(0.5);

    this.add.text(cx, height / 2 - 158, 'Training Programme Finished  ·  20 puzzles solved', {
      fontSize: '12px', fontFamily: 'monospace', color: DIM,
    }).setOrigin(0.5);

    // Divider
    this.add.graphics()
      .lineStyle(1, 0x3a2808, 0.6)
      .lineBetween(cx - 260, height / 2 - 132, cx + 260, height / 2 - 132);

    // Body text
    const bodyLines = [
      { y: -96,  text: 'You have mastered the fundamentals',  color: MID,  size: '15px' },
      { y: -70,  text: 'of steam-powered machinery.',         color: MID,  size: '15px' },
      { y: -28,  text: 'The real machines await.',            color: GOLD, size: '17px' },
      { y:  -4,  text: 'Harder. Larger. Unforgiving.',        color: MID,  size: '13px' },
    ];

    for (const line of bodyLines) {
      this.add.text(cx, height / 2 + line.y, line.text, {
        fontSize: line.size, fontFamily: 'monospace', color: line.color,
      }).setOrigin(0.5);
    }

    // To be continued
    this.add.graphics()
      .lineStyle(1, 0x3a2808, 0.6)
      .lineBetween(cx - 260, height / 2 + 34, cx + 260, height / 2 + 34);

    this.add.text(cx, height / 2 + 56, '— To be continued —', {
      fontSize: '14px', fontFamily: 'monospace', fontStyle: 'italic', color: '#5a4010',
    }).setOrigin(0.5);

    this.add.graphics()
      .lineStyle(1, 0x3a2808, 0.6)
      .lineBetween(cx - 260, height / 2 + 80, cx + 260, height / 2 + 80);

    // Buttons
    const btnY = height / 2 + 124;
    this.addButton(cx - 110, btnY, '[SPACE]  PLAY AGAIN', () => this.playAgain());
    this.addButton(cx + 110, btnY, '[ESC]  MAIN MENU',   () => this.mainMenu());

    this.input.keyboard!.on('keydown-SPACE', () => this.playAgain());
    this.input.keyboard!.on('keydown-ESC',   () => this.mainMenu());
  }

  private playAgain(): void {
    this.scene.start('GameScene', { levelIndex: 0 });
  }

  private mainMenu(): void {
    this.scene.start('MainMenuScene');
  }

  private addButton(x: number, y: number, label: string, cb: () => void): void {
    const btn = this.add.text(x, y, label, {
      fontSize: '13px', fontFamily: 'monospace', color: '#333333',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btn.on('pointerover',  () => btn.setColor('#b87820'));
    btn.on('pointerout',   () => btn.setColor('#333333'));
    btn.on('pointerdown',  cb);
  }

  private drawDecorativeGears(cx: number, cy: number): void {
    const g = this.add.graphics().setAlpha(0.06);
    const drawGear = (x: number, y: number, r: number, teeth: number) => {
      g.lineStyle(2, 0xb87820, 1);
      g.strokeCircle(x, y, r);
      g.strokeCircle(x, y, r * 0.42);
      for (let i = 0; i < teeth; i++) {
        const a  = (i / teeth) * Math.PI * 2;
        g.lineBetween(
          x + Math.cos(a) * r,       y + Math.sin(a) * r,
          x + Math.cos(a) * (r + 9), y + Math.sin(a) * (r + 9),
        );
      }
    };
    drawGear(cx - 280, cy - 100, 100, 20);
    drawGear(cx + 300, cy + 80,  120, 24);
    drawGear(cx - 360, cy + 180,  65, 13);
    drawGear(cx + 180, cy - 180,  75, 15);
  }
}
