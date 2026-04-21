import Phaser from 'phaser';
import { LEVELS } from '../data/levels';

const COLS   = 5;
const CARD_W = 220;
const CARD_H = 90;
const GAP_X  = 10;
const GAP_Y  = 16;

function bestScore(id: string): number | null {
  const v = localStorage.getItem(`steamheart_best_${id}`);
  return v !== null ? parseInt(v, 10) : null;
}

function isCompleted(id: string): boolean {
  return bestScore(id) !== null;
}

function isUnlocked(index: number): boolean {
  if (index === 0) return true;
  return isCompleted(LEVELS[index - 1].id);
}

export class LevelSelectScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LevelSelectScene' });
  }

  create(): void {
    const { width, height } = this.scale;

    this.add.rectangle(0, 0, width, height, 0x0d0d0d).setOrigin(0);

    this.add.text(width / 2, 34, 'STEAMHEART ENGINE', {
      fontSize: '28px', fontFamily: 'monospace', fontStyle: 'bold', color: '#b87820',
    }).setOrigin(0.5);

    this.add.text(width / 2, 64, 'select a level', {
      fontSize: '12px', fontFamily: 'monospace', color: '#444444',
    }).setOrigin(0.5);

    // Back to main menu
    const back = this.add.text(20, 34, '←', {
      fontSize: '22px', fontFamily: 'monospace', color: '#333333',
    }).setOrigin(0, 0.5).setInteractive({ useHandCursor: true });
    back.on('pointerover',  () => back.setColor('#b87820'));
    back.on('pointerout',   () => back.setColor('#333333'));
    back.on('pointerdown',  () => this.scene.start('MainMenuScene'));

    const rows   = Math.ceil(LEVELS.length / COLS);
    const gridW  = COLS * CARD_W + (COLS - 1) * GAP_X;
    const gridH  = rows * CARD_H + (rows - 1) * GAP_Y;
    const startX = (width  - gridW) / 2;
    const startY = 90 + (height - 90 - gridH) / 2;

    LEVELS.forEach((level, i) => {
      const col = i % COLS;
      const row = Math.floor(i / COLS);
      const x   = startX + col * (CARD_W + GAP_X);
      const y   = startY + row * (CARD_H + GAP_Y);
      this.drawCard(x, y, i);
    });
  }

  private drawCard(x: number, y: number, index: number): void {
    const level     = LEVELS[index];
    const unlocked  = isUnlocked(index);
    const completed = isCompleted(level.id);
    const best      = bestScore(level.id);

    const bgColor     = completed ? 0x162016 : unlocked ? 0x111520 : 0x0e0e0e;
    const borderColor = completed ? 0x3a8a3a : unlocked ? 0x2a3a55 : 0x1e1e1e;
    const borderAlpha = completed ? 0.9      : unlocked ? 0.7      : 0.4;

    const g = this.add.graphics();
    const drawBg = (hover = false) => {
      g.clear();
      const bg = hover
        ? (completed ? 0x1c2e1c : 0x16202e)
        : bgColor;
      g.fillStyle(bg, 0.97);
      g.fillRoundedRect(x, y, CARD_W, CARD_H, 5);
      const bc = hover
        ? (completed ? 0x55cc55 : 0x4466aa)
        : borderColor;
      const ba = hover ? 1.0 : borderAlpha;
      g.lineStyle(1, bc, ba);
      g.strokeRoundedRect(x, y, CARD_W, CARD_H, 5);
    };
    drawBg();

    const numColor   = completed ? '#77cc77' : unlocked ? '#5577aa' : '#2a2a2a';
    const nameColor  = completed ? '#669966' : unlocked ? '#445566' : '#252525';
    const shortName  = level.title.includes(' — ')
      ? level.title.split(' — ')[1]
      : level.title;

    this.add.text(x + 14, y + 12, `${index + 1}`, {
      fontSize: '24px', fontFamily: 'monospace', fontStyle: 'bold', color: numColor,
    });

    this.add.text(x + 14, y + 48, shortName, {
      fontSize: '11px', fontFamily: 'monospace', color: nameColor,
      wordWrap: { width: CARD_W - 28 },
    });

    if (completed && best !== null) {
      this.add.text(x + CARD_W - 10, y + 12, `best: ${best}`, {
        fontSize: '10px', fontFamily: 'monospace', color: '#557755',
      }).setOrigin(1, 0);
    }

    if (!unlocked) {
      this.add.text(x + CARD_W - 12, y + CARD_H / 2, 'LOCKED', {
        fontSize: '9px', fontFamily: 'monospace', color: '#2a2a2a',
      }).setOrigin(1, 0.5);
      return;
    }

    const zone = this.add.zone(x, y, CARD_W, CARD_H).setOrigin(0).setInteractive({ useHandCursor: true });
    zone.on('pointerover',  () => drawBg(true));
    zone.on('pointerout',   () => drawBg(false));
    zone.on('pointerdown',  () => this.scene.start('GameScene', { levelIndex: index }));
  }
}
