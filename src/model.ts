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
  constructor(pos: Vector2) {
    this.pos = pos;
  }
  progress(down: boolean, stage: Rectangle) {
    let accAngle = down ? -0.1 : 0.1;
    let a2 = accAngle * this.deltaAngle;
    let ra4p = 1 / (a2 * a2 + 1);
    this.velo *= ra4p;
    this.velo += 0.1 * ra4p;
    if (a2 < 0) {
      accAngle *= 10;
    }
    this.deltaAngle += accAngle;
    this.angle += this.deltaAngle;
    let t = (-90 + this.angle) * Math.PI / 180;
    this.pos.x += this.velo * Math.cos(t);
    this.pos.y += this.velo * Math.sin(t);
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

export class Model {
  stage: Rectangle = new Rectangle(spliteR, spliteR, Settings.bgSize.x - spliteR * 2, Settings.bgSize.y - spliteR * 2);
  player: Player = new Player(
    new Vector2(
      this.stage.left + this.stage.width * 0.9,
      this.stage.top + this.stage.height * 0.9));
  items: Item[] = [];
  constructor() {
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
  progress(down: boolean) {
    this.player.progress(down, this.stage);
    for (let i of this.items) {
      if (i.pos.distance(this.player.pos) < 90) {
        i.visible = false;
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
