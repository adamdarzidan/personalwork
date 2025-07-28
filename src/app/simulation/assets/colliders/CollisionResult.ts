import { Vector3 } from "../math/Vector3";

export class CollisionResult {
  collided: boolean;
  normal?: Vector3;
  penetrationDepth?: number;
  pointOfContact?: number;

  constructor(
    collided: boolean,
    normal?: Vector3,
    depth?: number,
    contactPoint?: number
  ) {
    this.collided = collided;
    this.normal = normal;
    this.penetrationDepth = depth;
    this.pointOfContact = contactPoint;
  }
}
