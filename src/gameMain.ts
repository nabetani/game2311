import * as Phaser from 'phaser';
import { BaseScene } from './baseScene';
import { Model, GameScene } from './model';

type Phase = Countdown | Driving

class PhaseType {
  scene: GameMain;
  constructor(scene: GameMain) {
    this.scene = scene;
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
    return this;
  }
}

export class GameMain extends BaseScene implements GameScene {
  p: Phaser.GameObjects.Sprite[] = [];
  items: Phaser.GameObjects.Sprite[] = [];
  model: Model = new Model(this);
  phase: Phase = new Countdown(this);
  countDownText: Phaser.GameObjects.Text | null = null
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
    const zone = this.add.zone(this.canX(0.5), this.canY(0.5), this.canX(1), this.canY(1));
    zone.setInteractive();
    zone.on('pointerup', () => { this.model.pointerup(); });
    zone.on('pointerdown', () => { this.model.pointerdown(); });
    for (let i of this.model.items) {
      const s = this.add.sprite(i.pos.x, i.pos.y, "p0");
      this.items.push(s)
      s.setScale(0.3);
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

  pSprite(): Phaser.GameObjects.Sprite {
    return this.p[this.model.imageIx()];
  }
  onItemStateChanged(ix: integer): void {
    this.items[ix].setVisible(this.model.items[ix].visible);
  }

  isPressing(): boolean {
    return 0 != (this.input.activePointer.buttons & 1);
  }

  progressDriving(v: number) {
    this.model.progress(this.isPressing(), v);
    for (let i = 0; i < this.p.length; i++) {
      this.p[i].setVisible(this.model.imageIx() == i);
    }
    const p = this.pSprite();
    p.setAngle(this.model.pAngle());
    const pos = this.model.player.pos;
    p.setPosition(pos.x, pos.y);
  }

  update() {
    this.phase = this.phase.progress();
  }
}
