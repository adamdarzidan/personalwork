import { Matrix3 } from "./Matrix3";

export class Vector3 {
  constructor(public x: number, public y: number, public z: number) {}

  add(v: Vector3): Vector3 {
    return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z);
  }
  subtract(v: Vector3) {
    return new Vector3(this.x - v.x, this.y - v.y, this.z - v.z);
  }
  scale(n: number) {
    return new Vector3(this.x * n, this.y * n, this.z * n);
  }
  dot(v: Vector3) {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }
  crossProduct(v: Vector3) {
    return new Vector3(
      this.y * v.z - this.z * v.y,
      this.z * v.x - this.x * v.z,
      this.x * v.y - this.y * v.x
    );
  }
  magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }
  normalize(): Vector3 {
    return new Vector3(
      this.x / this.magnitude(),
      this.y / this.magnitude(),
      this.z / this.magnitude()
    );
  }
  negate(): Vector3 {
    return new Vector3(this.x * -1, this.y * -1, this.z * -1);
  }

  lengthSq(): number {
    return this.x ** 2 + this.y ** 2 + this.z ** 2;
  }

  outerProduct(v: Vector3): Matrix3 {
    return new Matrix3([
      [this.x * v.x, this.x * v.y, this.x * v.z],
      [this.y * v.x, this.y * v.y, this.y * v.z],
      [this.z * v.x, this.z * v.y, this.z * v.z],
    ]);
  }
}
