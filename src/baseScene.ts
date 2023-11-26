import * as Phaser from 'phaser';

class NoSound {
  play() { }
  stop() { }
  static create() { return new NoSound(); }
};


export type Audio = NoSound | Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;

export class BaseScene extends Phaser.Scene {
  NoSound = NoSound;

  canX(ratio: number = 1.0): number { return this.sys.game.canvas.width * ratio }
  canY(ratio: number = 1.0): number { return this.sys.game.canvas.height * ratio }
  fps(): number { return this.game.config.fps.target!; }

  sprites: { [key: string]: Phaser.GameObjects.Sprite } = {};

  loadImages(kv: { [key: string]: string; }) {
    for (let [key, value] of Object.entries(kv)) {
      this.load.image(key, `assets/${value}`);
    }
  }

  addText(msg: string, x: number, y: number, org: number, attr: { [key: string]: string }): Phaser.GameObjects.Text {
    const baseAttr = { fontFamily: 'arial', fontSize: '40px', color: "black" };
    let text = this.add
      .text(x, y, msg, { ...baseAttr, ...attr })
      .setOrigin(org, 0.5).setInteractive();
    return text;
  }
  addSprite(x: number, y: number, imageName: string, spriteName: string | null = null) {
    const s = this.add.sprite(x, y, imageName);
    this.sprites[spriteName || imageName] = s;
  }

}
