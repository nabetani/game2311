import * as Phaser from 'phaser';
import * as Settings from './settings';
import { Wating } from "./waiting";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: Settings.bgSize.x,
  height: Settings.bgSize.y,
  parent: 'game-app',
  scene: [Wating],
  fps: {
    target: 60,
    forceSetTimeOut: true
  }
};

new Phaser.Game(config);
