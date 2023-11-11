import * as Phaser from 'phaser';
import { BaseScene } from './baseScene';

export class GameMain extends BaseScene {
  constructor() {
    super('GameMain');
  }
  preload() {
    this.loadImages({
      mainBG: "mainBG.jpg",
    });
  }
  create() {
    this.add.image(this.canX(0.5), this.canY(0.5), 'mainBG');
  }
}
