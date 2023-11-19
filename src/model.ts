import { Game } from 'phaser';
import * as Settings from './settings';

type Rectangle = Phaser.Geom.Rectangle;
const Rectangle = Phaser.Geom.Rectangle;
type Vector2 = Phaser.Math.Vector2;
const Vector2 = Phaser.Math.Vector2;
const spliteR = 48;

const centerOfRect = (r: Rectangle): Vector2 => {
  return new Vector2(r.centerX, r.centerY);
}

const clamp = (x: number, v0: number, v1: number): number => {
  const min = Math.min(v0, v1);
  const max = Math.max(v0, v1);
  if (x < min) { return min; }
  if (max < x) { return max; }
  return x;
}

class Player {
  angle: number = -30;
  deltaAngle: number = 0;
  velo: number = 0;
  pos: Vector2;
  poiPos(): Vector2 {
    const t = (Math.PI / 180) * (this.angle - 90);
    const r = 120;
    const dx = r * Math.cos(t);
    const dy = r * Math.sin(t);
    return new Vector2(
      this.pos.x + dx, this.pos.y + dy);
  }
  constructor(pos: Vector2) {
    this.pos = pos;
  }
  progress(down: boolean, v: number, stage: Rectangle) {
    let accAngle = down ? -0.1 : 0.1;
    let a2 = accAngle * this.deltaAngle;
    let ra4p = 1 / (a2 * a2 + 1);
    this.velo *= ra4p;
    this.velo += 1 * 0.1 * ra4p;
    if (a2 < 0) {
      accAngle *= 10;
    }
    this.deltaAngle += accAngle;
    this.angle += this.deltaAngle;
    let t = (-90 + this.angle) * Math.PI / 180;
    this.pos.x += v * this.velo * Math.cos(t);
    this.pos.y += v * this.velo * Math.sin(t);
    this.pos.x = clamp(this.pos.x, stage.left, stage.right);
    this.pos.y = clamp(this.pos.y, stage.bottom, stage.top);
  }
};

class Item {
  pos: Vector2;
  name: string;
  visible: boolean = true;
  constructor(pos: Vector2, name: string) {
    this.pos = pos;
    this.name = name;
  }
}

export interface GameScene {
  onItemStateChanged(ix: integer): void;
}

export class Model {
  hitRadius(): number { return 50; }
  stage: Rectangle = new Rectangle(spliteR, spliteR, Settings.bgSize.x - spliteR * 2, Settings.bgSize.y - spliteR * 2);
  player: Player = new Player(
    new Vector2(
      this.stage.left + this.stage.width * 0.9,
      this.stage.top + this.stage.height * 0.9));
  items: Item[] = [];
  gScene: GameScene;
  constructor(gScene: GameScene) {
    this.gScene = gScene;
    const x = (rx: number): number => {
      return this.stage.left + this.stage.width * rx;
    };
    for (let ry = 0.1; ry < 0.9; ry += 0.05) {
      const y = this.stage.top + this.stage.height * ry;
      this.items.push(new Item(new Vector2(x(0.2), y), "t0"));
      this.items.push(new Item(new Vector2(x(0.4), y), "t0"));
      this.items.push(new Item(new Vector2(x(0.6), y), "t0"));
      this.items.push(new Item(new Vector2(x(0.8), y), "t0"));
    }
  }
  imageIx(): integer {
    return 0;
  }
  pAngle(): number {
    return this.player.angle;
  }
  progress(down: boolean, v: number) {
    this.player.progress(down, v, this.stage);
    const poiPos = this.player.poiPos();
    for (let ix = 0; ix < this.items.length; ix++) {
      const i = this.items[ix];
      if (i.pos.distance(poiPos) < this.hitRadius()) {
        if (i.visible) {
          i.visible = false;
          this.gScene.onItemStateChanged(ix);
        }
      }
    }
  }
  position(): Phaser.Math.Vector2 {
    return this.player.pos;
  }
  pointerup() {
  }
  pointerdown() {
  }
}
