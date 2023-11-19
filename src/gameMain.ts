import * as Phaser from 'phaser';
import { BaseScene } from './baseScene';
import { Model, GameScene } from './model';
import { Vector } from 'matter';

type Phase = Countdown | Driving | YouDidIt;

class PhaseType {
  scene: GameMain;
  constructor(scene: GameMain) {
    this.scene = scene;
  }
}

class YouDidIt extends PhaseType {
  tick: number = 0
  constructor(scene: GameMain) {
    super(scene);
    scene.startYouDidIt();
  }
  progress(): Phase {
    ++this.tick;
    return this;
  }
}

class Countdown extends PhaseType {
  tick: number = 0
  constructor(scene: GameMain) {
    super(scene);
  }
  progress(): Phase {
    ++this.tick;
    this.scene.progressDriving(0);
    this.scene.setCountDownText(this.tick);
    return this.tick < 3 * 60 ? this : new Driving(this.scene);
  }
}

class Driving extends PhaseType {
  tick: number = 0
  constructor(scene: GameMain) {
    super(scene);
    scene.startDriving();
  }
  progress(): Phase {
    ++this.tick;
    this.scene.setGoText(this.tick);
    this.scene.progressDriving(1);
    return this.scene.model.isCompleted() ? new YouDidIt(this.scene) : this;
  }
}

const xorshift32 = (n: number): integer => {
  const x = (e: integer): integer => {
    e ^= (e << 13);
    e >>>= 0;
    e ^= e >> 17;
    e >>>= 0;
    e ^= (e << 5);
    return e >>> 0;
  };
  n += 123; // 全ゼロ回避
  for (let i = 0; i < 20; ++i) {
    n = x(n);
  }
  return n;
};

export class GameMain extends BaseScene implements GameScene {
  items: Phaser.GameObjects.Sprite[] = [];
  model: Model = new Model(this);
  phase: Phase = new Countdown(this);
  countDownText: Phaser.GameObjects.Text | null = null
  constructor() {
    super('GameMain');
  }
  preload() {
    const tights = (): { [key: string]: string } => {
      let r: { [key: string]: string } = {}
      for (let i = 0; i < 8; ++i) {
        r[`t${i}`] = `t${i}.png`;
      }
      return r;
    };
    this.loadImages({
      mainBG: "mainBG.jpg",
      ship: "ship.png",
      poi: "poi.png",
      ...tights()
    });
  }

  create() {
    this.add.image(this.canX(0.5), this.canY(0.5), 'mainBG');
    const zone = this.add.zone(this.canX(0.5), this.canY(0.5), this.canX(1), this.canY(1));
    zone.setInteractive();
    zone.on('pointerup', () => { this.model.pointerup(); });
    zone.on('pointerdown', () => { this.model.pointerdown(); });
    this.addSprite(0, -1000, "poi");
    this.addSprite(0, -1000, "ship");
    this.sprites.poi.setDisplayOrigin(96 / 2, 96 / 2);
    for (let i of this.model.items) {
      const n = xorshift32(this.items.length) % 8;
      const s = this.add.sprite(i.pos.x, i.pos.y, `t${n}`);
      this.items.push(s)
      s.setScale(0.2);
    }
    this.countDownText = this.addText(
      '3',
      this.canX(0.5), this.canY(0.5), 0.5,
      { fontSize: '120px' });
  }

  setGoText(tick: number) {
    const t = tick / 30 - 1;
    if (t < 0) {
      return;
    } else if (t < 1) {
      this.countDownText?.setAlpha(1 - t)
    } else {
      this.countDownText?.setText("");
    }
  }
  startYouDidIt() {
    this.countDownText?.setText("");
  }
  startDriving() {
    this.countDownText?.setAlpha(1);
    this.countDownText?.setText("GO!");
  }

  setCountDownText(tick: number) {
    const t = 3 - tick / 60;
    const ft = Math.floor(t + 0.5);
    const ft2 = Math.floor(t * 2 + 1) / 2;
    this.countDownText?.setAlpha(1);
    this.countDownText?.setText((ft == ft2) ? `${ft}` : "");
  }

  onItemStateChanged(ix: integer): void {
    this.items[ix].setVisible(this.model.items[ix].visible);
  }

  isPressing(): boolean {
    return 0 != (this.input.activePointer.buttons & 1);
  }

  locate(p: Phaser.GameObjects.Sprite, angle: number, pos: Phaser.Math.Vector2) {
    p.setAngle(angle);
    p.setPosition(pos.x, pos.y);
  }

  progressDriving(v: number) {
    this.model.progress(this.isPressing(), v);
    this.locate(this.sprites.ship, this.model.pAngle(), this.model.player.pos);
    this.locate(this.sprites.poi, this.model.pAngle(), this.model.player.poiPos());
  }

  update() {
    this.phase = this.phase.progress();
  }
}
