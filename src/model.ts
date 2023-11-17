
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
    if (down) {
      this.deltaAngle = this.deltaAngle + Math.min(0.1, 1.0 / (0.1 + this.deltaAngle));
      this.velo *= 0.8;
      this.poteVelo += 0.2 + 1 / (this.poteVelo + 1);
    } else {
      this.velo *= 0.95;
    }
    this.myAngle += this.deltaAngle;
    let t = (-90 + this.myAngle) * Math.PI / 180;
    this.pos.x += this.velo * Math.cos(t)
    this.pos.y += this.velo * Math.sin(t)
  }
  position(): Phaser.Math.Vector2 {
    return this.pos;
  }
  pointerup() {
    this.velo = this.poteVelo;
    this.poteVelo = 0;
    this.deltaAngle = 0;
  }
  pointerdown() {

  }
}
