import * as Phaser from 'phaser';
import { BaseScene } from './baseScene';
import { Model, GameScene } from './model';

type Phase = Countdown | Driving

class Countdown {
  tick: number = 0
  scene: GameMain;
  constructor(scene: GameMain) {
    this.scene = scene;
  }
  progress(): Phase {
    ++this.tick;
    this.scene.progressDriving(0);
    return this.tick < 3 * 60 ? this : new Driving(this.scene);
  }
}

class Driving {
  scene: GameMain;
  constructor(scene: GameMain) {
    this.scene = scene;
  }
  progress(): Phase {
    this.scene.progressDriving(1);
    return this;
  }
}

export class GameMain extends BaseScene implements GameScene {
  p: Phaser.GameObjects.Sprite[] = [];
  items: Phaser.GameObjects.Sprite[] = [];
  model: Model = new Model(this);
  phase: Phase = new Countdown(this);
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
