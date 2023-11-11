import * as Phaser from 'phaser';

export const bgSize = new Phaser.Math.Vector2(512, 900);

export class Settings {
  soundOn: boolean = false;
}
export const S: Settings = new Settings();
