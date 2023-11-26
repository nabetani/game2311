import * as Phaser from 'phaser';
import { BaseScene } from './baseScene';

export class Wating extends BaseScene {
  soundOn: boolean = false
  constructor() {
    super('Wating');
  }
  preload() {
    this.loadImages({
      bg: "bg.jpg",
      soundOn: "soundOn.png", soundOff: "soundOff.png"
    });
  }
  createSoundUI() {
    let soundOn = this.add.sprite(this.canX(0.6), 100, "soundOn");
    let soundOff = this.add.sprite(this.canX(0.8), 100, "soundOff");
    const setSound = (on: boolean) => {
      this.soundOn = on;
      const soundScale = 0.6;
      soundOn.setScale(on ? 1 : soundScale);
      soundOff.setScale(!on ? 1 : soundScale);
    };
    setSound(false);
    const setSoundButton = (btn: Phaser.GameObjects.Sprite, on: boolean) => {
      btn.on("pointerdown", () => {
        setSound(on);
      }).setInteractive();
    };
    setSoundButton(soundOn, true);
    setSoundButton(soundOff, false);
  }
  addLink(rx: number, ry: number, g: number, msg: string, url: string) {
    const text = this.addText(
      msg,
      this.canX(rx), this.canY(ry), g, { fontSize: "20px", backgroundColor: "#fff8" });
    text.on('pointerdown', () => {
      window.location.href = url;
    });
  }
  addTextText(rx: number, ry: number, g: number, longText: Phaser.GameObjects.Text, btnText: string, msg: string) {
    const text = this.addText(
      btnText,
      this.canX(rx), this.canY(ry), g, { fontSize: "25px", backgroundColor: "#fff8" });
    text.on('pointerdown', () => {
      longText.setText(msg);
      longText.setVisible(true);
    });
  }

  create() {
    this.add.image(this.canX(0.5), this.canY(0.5), 'bg');
    this.createSoundUI();
    const startText = this.addText(
      '\n   Click here to start game.   \n',
      this.canX(0.5), this.canY(0.4), 0.5, { fontSize: "33px", fontStyle: "bold", backgroundColor: "#fff8" });
    startText.on('pointerdown', () => {
      this.scene.start('GameMain', { sound: this.soundOn });
    });
    let longText = this.addText("", this.canX(0.5), this.canY(0.7), 0.5,
      { fontSize: "22px", backgroundColor: "#fffa", lineSpacing: 10 });
    this.addTextText(
      0.5, 0.5, 0.5,
      longText,
      "遊び方",
      "押している間は左回転（反時計回り）\n" +
      "離すと右回転（時計回り）\n" +
      "あんまり回転してないと前に進みます。\n" +
      "船の先端のポイでタイツに触れるとタイツ回収。\n" +
      "50個のタイツをすべて回収してください。",
    );
    let ry = 0.95;
    const dry = 0.04;
    this.addLink(0.96, ry, 1, "Source code and license", "https://github.com/nabetani/game2310/");
    ry -= dry;
    this.addLink(0.96, ry, 1, "制作ノート", "https://nabetani.hatenadiary.com/entry/2023/11/game2311");
    ry -= dry;
    this.addLink(0.96, ry, 1, "鍋谷武典 @ タイッツー", "https://taittsuu.com/users/nabetani");
    ry -= dry;
    this.addLink(0.96, ry, 1, " タイッツー #PoiTights", "https://taittsuu.com/search/taiitsus/hashtags?query=PoiTights");
  }
}
