import { Vector3 } from "../../math/Vector3";
import { Body3D } from "../../objects/Body3D";
import { GravitySource } from "./GravitySource";

export class UniformGravity implements GravitySource {
  gravity: Vector3;
  constructor(gravity: Vector3) {
    this.gravity = gravity;
  }
  getForce(body: Body3D): Vector3 {
    return this.gravity.scale(body.mass);
  }
}
