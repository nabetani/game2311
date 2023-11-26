import * as Phaser from 'phaser';
import { BaseScene } from './baseScene';

export class Wating extends BaseScene {
  soundOn: boolean = false
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
    let soundOn = this.add.sprite(this.canX(0.6), 100, "soundOn");
    let soundOff = this.add.sprite(this.canX(0.8), 100, "soundOff");
    const setSound = (on: boolean) => {
      this.soundOn = on;
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
    const startText = this.addText(
      'Click here to start game.',
      this.canX(0.5), this.canY(0.35), 0.5, { fontSize: "35px", fontStyle: "bold" });
    startText.on('pointerdown', () => {
      this.scene.start('GameMain', { sound: this.soundOn });
    });
  }
}
