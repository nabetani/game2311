import * as Phaser from 'phaser';
import * as Settings from './settings';
import { Wating } from "./waiting";
import { GameMain } from "./gameMain";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: Settings.bgSize.x,
  height: Settings.bgSize.y,
  parent: 'game-app',
  scene: [Wating, GameMain],
  fps: {
    target: 60,
    forceSetTimeOut: true
  }
};

new Phaser.Game(config);
