
export class Model {
  myAngle: number = 0;
  deltaAngle: number = 0;
  velo: number = 0;
  poteVelo: number = 0;
  pos: Phaser.Math.Vector2 = new Phaser.Math.Vector2(200, 200)
  progress() { }
  imageIx(): integer {
    return 0;
  }
  pAngle(): number {
    return this.myAngle;
  }
  notifyButtonState(down: boolean) {
    let accAngle = down ? -0.1 : 0.1;
    let a2 = accAngle * this.deltaAngle;
    let ra4p = 1 / (a2 * a2 + 1);
    this.velo *= ra4p;
    this.velo += 0.1 * ra4p;
    if (a2 < 0) {
      accAngle *= 10;
    }
    this.deltaAngle += accAngle;
    this.myAngle += this.deltaAngle;
    let t = (-90 + this.myAngle) * Math.PI / 180;
    this.pos.x += this.velo * Math.cos(t)
    this.pos.y += this.velo * Math.sin(t)
  }
  position(): Phaser.Math.Vector2 {
    return this.pos;
  }
  pointerup() {
  }
  pointerdown() {
  }
}
