import * as Phaser from 'phaser';
import { BaseScene } from './baseScene';
import { Model, GameScene } from './model';

export class GameMain extends BaseScene implements GameScene {
  p: Phaser.GameObjects.Sprite[] = [];
  items: Phaser.GameObjects.Sprite[] = [];
  model: Model = new Model(this);
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
    for (let i of this.model.items) {
      const s = this.add.sprite(i.pos.x, i.pos.y, "p0");
      this.items.push(s)
      s.setScale(0.3);
    }
  }
  pSprite(): Phaser.GameObjects.Sprite {
    return this.p[this.model.imageIx()];
  }
  onDotEat(ix: integer): void {
  }

  update() {
    this.model.progress(0 != (this.input.mousePointer.buttons & 1));
    for (let i = 0; i < this.p.length; i++) {
      this.p[i].setVisible(this.model.imageIx() == i);
    }
    const p = this.pSprite();
    p.setAngle(this.model.pAngle());
    const pos = this.model.player.pos;
    p.setPosition(pos.x, pos.y);
    for (let ix = 0; ix < this.items.length; ++ix) {
      this.items[ix].setVisible(this.model.items[ix].visible);
    }
  }
}
