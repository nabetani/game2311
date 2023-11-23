import * as Phaser from 'phaser';
import { BaseScene } from './baseScene';
import { Model, GameScene } from './model';
import { Vector } from 'matter';

type Phase = Countdown | Driving | YouDidIt
const baseItemScale = 0.2;

const rankString = (t: number): string => {
  if (60 * 120 < t) {
    return "Nice try";
  }
  return "Are you a human being?";
}


class PhaseType {
  scene: GameMain;
  constructor(scene: GameMain) {
    this.scene = scene;
  }
}

class YouDidIt extends PhaseType {
  tick: number = 0
  constructor(scene: GameMain, driveTick: number) {
    super(scene);
    scene.startYouDidIt(driveTick);
  }
  progress(): Phase {
    ++this.tick;
    if (3 * 60 < this.tick) {
      this.scene.showTryAgainText(true);
    }
    return this;
  }
}

class Countdown extends PhaseType {
  tick: number = 0
  constructor(scene: GameMain) {
    super(scene);
    scene.startCountDown();
  }
  progress(): Phase {
    ++this.tick;
    this.scene.progressDriving(0);
    this.scene.setCountDownText(this.tick);
    return this.tick < 3 * this.scene.fps() ? this : new Driving(this.scene);
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
    this.scene.showTick(this.tick);
    // return new YouDidIt(this.scene, this.tick);
    return this.scene.model.isCompleted() ? new YouDidIt(this.scene, this.tick) : this;
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
  youDidItText: Phaser.GameObjects.Text | null = null
  rankText: Phaser.GameObjects.Text | null = null
  countDownText: Phaser.GameObjects.Text | null = null
  tickText: Phaser.GameObjects.Text | null = null
  tryAgainText: Phaser.GameObjects.Text | null = null
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
      s.setScale(baseItemScale);
    }
    this.countDownText = this.addText(
      '3',
      this.canX(0.5), this.canY(0.5), 0.5,
      { fontSize: '120px' });
    this.youDidItText = this.addText(
      '',
      this.canX(0.5), this.canY(0.3), 0.5,
      { fontSize: '60px' });
    this.rankText = this.addText(
      '',
      this.canX(0.5), this.canY(0.4), 0.5,
      { fontSize: '35px' });
    this.tickText = this.addText(
      '',
      this.canX(0.05), this.canY(0.05), 0,
      { fontSize: '40px' });
    this.tryAgainText = this.addText(
      'Click to try again',
      this.canX(0.5), this.canY(0.8), 0.5,
      { fontSize: '40px' });
    this.tryAgainText.on('pointerup', () => {
      this.phase = new Countdown(this);
    });
    this.showTryAgainText(false);
  }

  showTick(tick: number) {
    let decaSec = Math.round(tick * 100 / this.fps());
    let f = decaSec % 100;
    let fs = `00${f}`.slice(-2);
    let i = (decaSec - f) / 100;
    this.tickText?.setText(`${i}.${fs} s`);
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
  startYouDidIt(driveTick: number) {
    this.youDidItText?.setText("COMPLETED!");
    this.youDidItText?.setVisible(true);
    this.rankText?.setText(rankString(driveTick));
    this.rankText?.setVisible(true);
  }
  showTryAgainText(sw: boolean) {
    this.tryAgainText?.setVisible(sw);
    this.tryAgainText?.setInteractive(sw);
  }

  startCountDown() {
    this.showTryAgainText(false);
    this.youDidItText?.setVisible(false);
    this.rankText?.setVisible(false);

    this.model = new Model(this);
    for (let i of this.items) {
      i.setVisible(true);
    }
  }
  startDriving() {
    this.countDownText?.setAlpha(1);
    this.countDownText?.setText("GO!");
  }

  setCountDownText(tick: number) {
    const t = 3 - tick / this.fps();
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
    const t = this.time.now.valueOf();
    this.model.progress(this.isPressing(), v);
    this.locate(this.sprites.ship, this.model.pAngle(), this.model.player.pos);
    this.locate(this.sprites.poi, this.model.pAngle(), this.model.player.poiPos());
    let ix = 0;
    for (let i of this.items) {
      i.setAngle(((ix * 2011 + t * 4e-3 * (ix * 13 % 50 + 10))) % 360);
      const a = ix * 2 + t * 1e-4 * (ix * 17 % 50 + 10);
      const s = 1 - 0.2 * (1 - Math.sin(a));
      i.setScale(baseItemScale * s);
      ++ix;
    }
  }

  update() {
    this.phase = this.phase.progress();
  }
}
