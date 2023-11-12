import * as Phaser from 'phaser';
import { BaseScene } from './baseScene';
import { Model } from './model';

export class GameMain extends BaseScene {
  p: Phaser.GameObjects.Sprite[] = [];
  s: Model = new Model();
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
  }
  update() {
    this.p[0].setAngle(10);
  }
}
