import { Vector3 } from "../../math/Vector3";
import { Body3D } from "../../objects/Body3D";

export interface GravitySource {
  getForce(body: Body3D): Vector3;
}
