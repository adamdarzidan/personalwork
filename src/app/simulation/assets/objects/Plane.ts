import { BoxCollider } from "../colliders/BoxCollider";
import { Vector3 } from "../math/Vector3";
import { Mesh } from "../meshs/Mesh";
import { Body3D } from "./Body3D";
export class Plane extends Body3D {
  normal: Vector3;
  point: Vector3;

  constructor(normal: Vector3, point: Vector3, mesh: Mesh) {
    super(
      point,
      1,
      1,
      mesh,
      new BoxCollider(point, new Vector3(1, 1, 1)),
      true
    );
    this.normal = normal;
    this.point = point;
  }
  getType(): string {
    return "plane";
  }
  signedDistanceTo(p: Vector3): number {
    return p.subtract(this.point).dot(this.normal);
  }
}
