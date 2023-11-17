import * as Phaser from 'phaser';
import { BaseScene } from './baseScene';
import { Model } from './model';

export class GameMain extends BaseScene {
  p: Phaser.GameObjects.Sprite[] = [];
  model: Model = new Model();
  constructor() {
    super('GameMain');
  }
  preload() {
    this.loadImages({
      mainBG: "mainBG.jpg",
      p0: "p0.png",
      p1: "p1.png",
    });
  }

  create() {
    this.add.image(this.canX(0.5), this.canY(0.5), 'mainBG');
    this.p = [0, 1].map(e => this.add.sprite(200, 200 + e * 700, `p${e}`));
    this.p[0].setVisible(true);
    const zone = this.add.zone(this.canX(0.5), this.canY(0.5), this.canX(1), this.canY(1));
    zone.setInteractive();
    zone.on('pointerup', () => { this.model.pointerup(); });
    zone.on('pointerdown', () => { this.model.pointerdown(); });
  }
  pSprite(): Phaser.GameObjects.Sprite {
    return this.p[this.model.imageIx()];
  }
  update() {
    this.model.notifyButtonState(0 != (this.input.mousePointer.buttons & 1));
    this.model.progress()
    for (let i = 0; i < this.p.length; i++) {
      this.p[i].setVisible(this.model.imageIx() == i);
    }
    const p = this.pSprite();
    p.setAngle(this.model.pAngle());
    p.setPosition(this.model.pos.x, this.model.pos.y);
  }
}
