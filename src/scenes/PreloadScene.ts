import Phaser from 'phaser';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload(): void {
    // Day 1-2: no assets to load yet.
    // Add asset loads here as art/audio is ready:
    //   this.load.image('gear',  'assets/sprites/gear.png');
    //   this.load.audio('place', 'assets/audio/place.ogg');
  }

  create(): void {
    this.scene.start('GameScene');
  }
}
