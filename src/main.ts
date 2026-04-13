import Phaser from 'phaser';
import { BootScene }    from './scenes/BootScene';
import { PreloadScene } from './scenes/PreloadScene';
import { GameScene }    from './scenes/GameScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,           // WebGL with Canvas fallback
  width:  1280,
  height: 720,
  backgroundColor: '#111111',
  scene: [BootScene, PreloadScene, GameScene],
  scale: {
    mode:       Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

new Phaser.Game(config);
