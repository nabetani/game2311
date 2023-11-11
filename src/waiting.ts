import * as Phaser from 'phaser';
import { BaseScene } from './baseScene';

export class Wating extends BaseScene {
  constructor() {
    super('Wating');
  }
  preload() {
    this.loadImages({
      bg: "bg.jpg",
      soundOn: "soundOn.png", soundOff: "soundOff.png"
    });
  }
  createSoundUI() {
    let soundOn = this.add.sprite(this.canX(0.8), 50, "soundOn");
    let soundOff = this.add.sprite(this.canX(0.9), 50, "soundOff");
    const setSound = (on: boolean) => {
      const soundScale = 0.6;
      soundOn.setScale(on ? 1 : soundScale);
      soundOff.setScale(!on ? 1 : soundScale);
    };
    setSound(false);
    const setSoundButton = (btn: Phaser.GameObjects.Sprite, on: boolean) => {
      btn.on("pointerdown", () => {
        setSound(on);
      }).setInteractive();
    };
    setSoundButton(soundOn, true);
    setSoundButton(soundOff, false);
  }
  create() {
    this.add.image(this.canX(0.5), this.canY(0.5), 'bg');
    this.createSoundUI();
    const attr = { fontFamily: 'arial', fontSize: '60px' };
    this.addText(
      'Rotation Jump',
      this.canX(0.5), this.canY(0.5), 0.5,
      { fontSize: '60px' });
    const startText = this.addText(
      'Click here to start game.',
      this.canX(0.5), this.canY(0.7), 0.5, { fontSize: "30px" });
    startText.on('pointerdown', () => {
      this.scene.start('GameMain');
    });
  }
}
