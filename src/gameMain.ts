import * as Phaser from 'phaser';
import { BaseScene, Audio } from './baseScene';
import { Model, GameScene } from './model';
import * as Util from './util';

type Phase = Countdown | Driving | YouDidIt | StartPhase;
const baseItemScale = 0.2;

const ranks = [
  { t: 50, n: "a Beginner" },
  { t: 30, n: "a Novice" },
  { t: 20, n: "an Apprentice" },
  { t: 15, n: "a Good Player" },
  { t: 12, n: "a Very Good Player" },
  { t: 10, n: "a Expert Player" },
  { t: 9, n: "an Advanced Player" },
  { t: 8, n: "a Super Advanced Player" },
  { t: 7, n: "an Incredible Player" },
  { t: 6, n: "a Master" },
  { t: 5.5, n: "a Hero" },
  { t: 5, n: "a Super Hero" },
];

const rankString = (ticks: number): string => {
  const s = ticks / 60
  if (120 < s) {
    return "Nice try";
  }
  for (let k of ranks) {
    if (k.t < s) {
      return "You are " + k.n;
    }
  }
  return "Are you a human being?";
}


class PhaseType {
  scene: GameMain;
  constructor(scene: GameMain) {
    this.scene = scene;
  }
}

class StartPhase {
  scene: GameMain;
  constructor(scene: GameMain) {
    this.scene = scene;
  }
  progress(): Phase {
    return this
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
    this.scene.doCountDown(this.tick);
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

export class GameMain extends BaseScene implements GameScene {
  items: Phaser.GameObjects.Sprite[] = [];
  model: Model = new Model(this);
  phase: Phase = new StartPhase(this);
  youDidItText: Phaser.GameObjects.Text | null = null
  rankText: Phaser.GameObjects.Text | null = null
  countDownText: Phaser.GameObjects.Text | null = null
  tickText: Phaser.GameObjects.Text | null = null
  tryAgainText: Phaser.GameObjects.Text | null = null
  zone: Phaser.GameObjects.Zone | null = null
  constructor() {
    super('GameMain');
  }
  waves: Phaser.GameObjects.Image[] = []
  preload() {
    const tights = (): { [key: string]: string } => {
      let r: { [key: string]: string } = {}
      for (let i = 0; i < 8; ++i) {
        r[`t${i}`] = `t${i}.png`;
      }
      return r;
    };
    this.loadAudios({
      bgm: "bgm2.m4a",
      get: "get.m4a",
      countdown: "countdown.m4a",
      go: "go.m4a",
      goal: "goal.m4a",
    });
    this.loadImages({
      mainBG: "mainBG.jpg",
      ship: "ship.png",
      poi: "poi.png",
      wave0: "wave0.png",
      wave1: "wave1.png",
      fish0: "fish0.png",
      fish1: "fish1.png",
      fish2: "devil.png",
      fish3: "manta.png",
      fish4: "wshark.png",
      share: "share.png",
      ...tights()
    });
  }

  createFish() {
    const rng = new Util.Rng(0);
    for (let i = 1; i <= 25; ++i) {
      const g = 100;
      const x = rng.next() % (this.canX(1) + g * 2) - g;
      const y = rng.next() % (this.canY(1) + g * 2) - g;
      const a = rng.next() % 360;
      const imname = `fish${Math.floor(Math.sqrt(i) - 1)}`;
      const spname = `fish${i - 1}`;
      this.addSprite(x, y, imname, spname)
      const s = this.sprites[spname];
      s.setAngle(a).setDepth(-100 - i);
    }
  }

  createTexts() {
    const text = (s: string, rx: number, ry: number, o: number, f: number): Phaser.GameObjects.Text => {
      return this.addText(s, this.canX(rx), this.canY(ry), o, {
        fontSize: `${f}px`
      });
    }
    this.countDownText = text("3", 0.5, 0.5, 0.5, 120);
    this.youDidItText = text("", 0.5, 0.3, 0.5, 60);
    this.rankText = text("", 0.5, 0.4, 0.5, 35);
    this.tickText = text("", 0.05, 0.05, 0, 40);
    this.tryAgainText = text('Click to try again', 0.5, 0.8, 0.5, 40);
    this.tryAgainText.setInteractive();
    this.tryAgainText.on('pointerup', () => {
      this.phase = new Countdown(this);
    });
    this.showTryAgainText(false);
  }
  onShareButton() {
    const text = [
      "Time: " + (this.tickText?.text || "??"),
      "#PoiTights",
      "https://nabetani.sakura.ne.jp/game2311/",
    ].join("\n");
    const encoded = encodeURIComponent(text);
    this.sprites.share.setVisible(false);
    const url = "https://taittsuu.com/share?text=" + encoded;
    if (!window.open(url)) {
      location.href = url;
    }
  }
  gamingUI(inGame: boolean) {
    this.sprites.share.setVisible(!inGame);
    // this.sprites.share.setInteractive(!inGame);
    this.rankText?.setVisible(!inGame);
    this.sprites.share.setVisible(!inGame);
    this.youDidItText?.setVisible(!inGame);

    // this.zone?.setInteractive(inGame);
    this.zone?.setScale(inGame ? 1.0 : 0.0);

    if (inGame) {
      this.tryAgainText?.setVisible(false);
      // this.tryAgainText?.setInteractive(false);
    }
  }

  create(data: { sound: boolean }) {
    this.add.image(this.canX(0.5), this.canY(0.5), 'mainBG').setDepth(-200);
    this.waves = [
      this.add.image(this.canX(0.5), this.canY(0.5), 'wave0').setAlpha(0.5),
      this.add.image(this.canX(0.5), this.canY(0.5), 'wave1').setAlpha(0.5),
    ]
    this.zone = this.add.zone(this.canX(0.5), this.canY(0.5), this.canX(1), this.canY(1));
    this.zone.setInteractive();

    this.zone.on('pointerup', () => { this.model.pointerup(); });
    this.zone.on('pointerdown', () => { this.model.pointerdown(); });
    this.addSprite(0, -1000, "poi");
    this.addSprite(0, -1000, "ship");

    this.addSprite(this.canX(0.8), this.canY(0.9), "share");
    this.sprites.share.setInteractive();
    this.sprites.share.on('pointerdown', () => this.onShareButton());

    this.createFish();
    this.sprites.poi.setDisplayOrigin(96 / 2, 96 / 2);
    const rng = new Util.Rng(2);
    for (let i of this.model.items) {
      const n = rng.next() % 8;
      const s = this.add.sprite(i.pos.x, i.pos.y, `t${n}`);
      this.items.push(s)
      s.setScale(baseItemScale);
    }
    this.createTexts();
    this.prepareSounds(data?.sound, {
      bgm: new this.AddSound("bgm", { loop: true, volume: 0.2 }),
      get: new this.AddSound("get", { volume: 1 / 4 }),
      goal: "goal",
      countdown: new this.AddSound("countdown", { volume: 1 / 4 }),
      go: new this.AddSound("go", { volume: 0.2 }),
    });
    this.phase = new Countdown(this);
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
    this.gamingUI(false);
    this.audios.goal.play();
    this.audios.bgm.stop();
    this.youDidItText?.setText("COMPLETED!");
    this.rankText?.setText(rankString(driveTick));
  }
  showTryAgainText(sw: boolean) {
    this.tryAgainText?.setVisible(sw);
  }

  startCountDown() {
    this.gamingUI(true);

    this.model = new Model(this);
    for (let i of this.items) {
      i.setVisible(true);
    }
  }
  startDriving() {
    this.countDownText?.setAlpha(1);
    this.countDownText?.setText("GO!");
    this.audios.go.play();
    this.audios.bgm.play();
  }

  doCountDown(tick: number) {
    const t = 3 - tick / this.fps();
    const tp = 3 - (tick - 1) / this.fps();
    const ft = Math.floor(t + 0.5);
    const ft2 = Math.floor(t * 2 + 1) / 2;
    const ft2p = Math.floor(tp * 2 + 1) / 2;
    this.countDownText?.setAlpha(1);
    if (ft == ft2 && ft != ft2p) {
      this.audios.countdown.play();
    }
    this.countDownText?.setText((ft == ft2) ? `${ft}` : "");
  }

  onItemStateChanged(ix: integer): void {
    this.items[ix].setVisible(this.model.items[ix].visible);
    this.audios.get.play();
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
  updateFish() {

    for (let i = 0; ; ++i) {
      const s = this.sprites[`fish${i}`]
      if (!s) {
        break;
      }
      const t = (s.angle - 90) * (Math.PI / 180);
      const dx = Math.cos(t);
      const dy = Math.sin(t);
      const v = 1;
      let x = s.x + v * dx;
      let y = s.y + v * dy;
      const g = 100
      if (x < -g) { x = this.canX(1) + g; }
      else if (g + this.canX(1) < x) { x = - g; };
      if (y < -g) { x = this.canY(1) + g; }
      else if (this.canY(1) + g < y) { y = - g; };
      s.setPosition(x, y);
      s.setAngle(s.angle + (Util.xorshift32(x + y) % 11 - 5) / 10)

    }
  }

  update() {
    this.updateFish();
    const tick = this.time.now.valueOf();
    const pos = (d: number): number[] => {
      const t = tick * 1e-3 + d;
      const k = 20;
      const a = t * 0.01;
      const s = Math.sin(a);
      const c = Math.cos(a);
      const x = k * Math.cos(t);
      const y = k * Math.sin(t * 0.123);
      return [c * x + s * y + this.canX(0.5), -s * x + c * y + this.canX(1)];
    }
    this.waves[0].setPosition(...pos(0));
    this.waves[1].setPosition(...pos(1));
    this.phase = this.phase.progress();
  }
}
