import { Vector3 } from "../../math/Vector3";
import { Body3D } from "../../objects/Body3D";
import { GravitySource } from "./GravitySource";

export class CentralGravity implements GravitySource {
  center: Vector3;
  mass: number;

  constructor(center: Vector3, mass: number) {
    this.center = center;
    this.mass = mass;
  }

  getForce(body: Body3D): Vector3 {
    const G = 6.6743e-11;
    const delta = this.center.subtract(body.position);
    const r2 = delta.lengthSq();
    if (r2 === 0) return new Vector3(0, 0, 0);
    const direction = delta.normalize();
    const magnitude = (G * body.mass * this.mass) / r2;
    return direction.scale(magnitude);
  }
}
