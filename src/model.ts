import { Game } from 'phaser';
import * as Settings from './settings';

type Rectangle = Phaser.Geom.Rectangle;
const Rectangle = Phaser.Geom.Rectangle;
type Vector2 = Phaser.Math.Vector2;
const Vector2 = Phaser.Math.Vector2;
const v2 = (x: number, y: number): Vector2 => {
  return new Vector2(x, y);
}

const spliteR = 48;

const vecAdd = (a: Vector2, b: Vector2): Vector2 => {
  return v2(a.x + b.x, a.y + b.y);
}
const vecMul = (a: Vector2 | number, b: Vector2 | number): Vector2 => {
  if (typeof a === 'object') {
    const nb = b as number;
    return v2(a.x * nb, a.y * nb);
  } else if (typeof b === 'object') {
    const na = a as number;
    return v2(na * b.x, na * b.y);
  } else {
    throw `a or b should be vector : a:${a}, b:${b}`;
  }
}
const vecSub = (a: Vector2, b: Vector2): Vector2 => {
  return v2(a.x - b.x, a.y - b.y);
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
    const deltaAngleLimit = 10;
    this.deltaAngle = clamp(this.deltaAngle + accAngle, -deltaAngleLimit, deltaAngleLimit);
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
  visible: boolean = true;
  constructor(pos: Vector2) {
    this.pos = pos;
  }
}

class Line {
  readonly p0: Vector2;
  readonly p1: Vector2;
  readonly curve: number;
  constructor(points: Vector2[], ix: integer, curve: number) {
    this.p0 = points[ix];
    this.p1 = points[(ix + 1) % points.length];
    this.curve = curve;
  };
  len(): number {
    return this.p0.distance(this.p1);
  }
  posAt(i: number): (Vector2 | null) {
    let r = i / this.len();
    if (1 < r) {
      return null;
    }
    return vecAdd(this.p0, vecMul(r, vecSub(this.p1, this.p0)));
  }
}

export interface GameScene {
  onItemStateChanged(ix: integer): void;
}

const itemPositions = (stage: Rectangle): Vector2[] => {
  const g = stage.width / 10;
  const x0 = g;
  const x3 = stage.right - g;
  const x1 = (x0 * 2 + x3) / 3;
  const x2 = (x0 + x3 * 2) / 3;
  const y0 = 100;
  const y2 = stage.bottom - 100;
  const y1 = (y0 * 2 + y2) / 3;
  let points: Vector2[] = [
    v2(x0, y0), v2(x0, y2),
    v2(x1, y2), v2(x1, y1),
    v2(x2, y1), v2(x2, y2),
    v2(x3, y2), v2(x3, y0),
  ];
  const paths = Array.from(points.keys()).map((ix) => {
    return new Line(points, ix, (ix % 2) * 2 - 1);
  });
  const total = paths.reduce((acc, cur): number => {
    return acc + cur.len();
  }, 0);
  let r: Vector2[] = [];
  const nofItems = 50;
  for (let i = 0; i < nofItems; i++) {
    let lpos = total * i / nofItems;
    for (let p of paths) {
      let pos = p.posAt(lpos);
      if (pos) {
        r.push(pos);
        break;
      }
      lpos -= p.len();
    }
  }
  return r;
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
    for (let pos of itemPositions(this.stage)) {
      this.items.push(new Item(pos));
    }
  }
  imageIx(): integer {
    return 0;
  }
  pAngle(): number {
    return this.player.angle;
  }
  isCompleted(): boolean {
    return this.items.every(e => { return !e.visible });
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
