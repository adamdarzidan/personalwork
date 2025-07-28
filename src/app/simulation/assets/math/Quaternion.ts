import { Matrix3 } from "./Matrix3";
import { Vector3 } from "./Vector3";

export class Quaternion {
  w: number;
  x: number;
  y: number;
  z: number;

  constructor(w: number, x: number, y: number, z: number) {
    this.w = w;
    this.x = x;
    this.y = y;
    this.z = z;
  }

  static identity(): Quaternion {
    return new Quaternion(1, 0, 0, 0);
  }

  static fromAxisAngle(axis: Vector3, angle: number): Quaternion {
    const half = angle / 2;
    const s = Math.sin(half);
    const a = axis.normalize();
    return new Quaternion(Math.cos(half), s * a.x, s * a.y, s * a.z);
  }

  toMatrix3(): Matrix3 {
    const { w, x, y, z } = this;
    return new Matrix3([
      [1 - 2 * y * y - 2 * z * z, 2 * x * y - 2 * z * w, 2 * x * z + 2 * y * w],
      [2 * x * y + 2 * z * w, 1 - 2 * x * x - 2 * z * z, 2 * y * z - 2 * x * w],
      [2 * x * z - 2 * y * w, 2 * y * z + 2 * x * w, 1 - 2 * x * x - 2 * y * y],
    ]);
  }

  multiply(q: Quaternion): Quaternion {
    const { w: w1, x: x1, y: y1, z: z1 } = this;
    const { w: w2, x: x2, y: y2, z: z2 } = q;
    return new Quaternion(
      w1 * w2 - x1 * x2 - y1 * y2 - z1 * z2,
      w1 * x2 + x1 * w2 + y1 * z2 - z1 * y2,
      w1 * y2 - x1 * z2 + y1 * w2 + z1 * x2,
      w1 * z2 + x1 * y2 - y1 * x2 + z1 * w2
    );
  }

  rotateVector(v: Vector3): Vector3 {
    const qVec = new Quaternion(0, v.x, v.y, v.z);
    const qInv = this.inverse();
    const rotated = this.multiply(qVec).multiply(qInv);
    return new Vector3(rotated.x, rotated.y, rotated.z);
  }

  inverse(): Quaternion {
    const { w, x, y, z } = this;
    const normSq = w * w + x * x + y * y + z * z;
    return new Quaternion(w / normSq, -x / normSq, -y / normSq, -z / normSq);
  }

  normalize(): Quaternion {
    const len = Math.hypot(this.w, this.x, this.y, this.z);
    if (len === 0) return Quaternion.identity();
    return new Quaternion(
      this.w / len,
      this.x / len,
      this.y / len,
      this.z / len
    );
  }

  scale(scalar: number): Quaternion {
    return new Quaternion(
      this.w * scalar,
      this.x * scalar,
      this.y * scalar,
      this.z * scalar
    );
  }

  add(q: Quaternion): Quaternion {
    return new Quaternion(
      this.w + q.w,
      this.x + q.x,
      this.y + q.y,
      this.z + q.z
    );
  }

  clone(): Quaternion {
    return new Quaternion(this.w, this.x, this.y, this.z);
  }

  toString(): string {
    return `(${this.w}, ${this.x}, ${this.y}, ${this.z})`;
  }
}
