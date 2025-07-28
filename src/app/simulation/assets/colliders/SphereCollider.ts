import { Vector3 } from "../math/Vector3";
import { Collider } from "./Collider";
import { CollisionResult } from "./CollisionResult";
import { clamp } from "../math/utils";
import { BoxCollider } from "./BoxCollider";
import { Plane } from "../objects/Plane";

export class SphereCollider extends Collider {
  center: Vector3;
  radius: number;

  constructor(radius: number, center: Vector3) {
    super();
    this.center = center;
    this.radius = radius;
  }

  getType(): string {
    return "sphere";
  }
  detectCollision(other: Collider): CollisionResult {
    return other.handleCollisionWithSphere(this);
  }
  handleCollisionWithBox(other: Collider): CollisionResult {
    const box = other as BoxCollider;

    const closest_x = clamp(
      this.center.x,
      box.dimensions.x * -0.5 + box.center.x,
      box.dimensions.x * 0.5 + box.center.x
    );
    const closest_y = clamp(
      this.center.y,
      box.dimensions.y * -0.5 + box.center.y,
      box.dimensions.y * 0.5 + box.center.y
    );
    const closest_z = clamp(
      this.center.z,
      box.dimensions.z * -0.5 + box.center.z,
      box.dimensions.z * 0.5 + box.center.z
    );
    const closestPoint = new Vector3(closest_x, closest_y, closest_z);
    const delta = this.center.subtract(closestPoint);
    const distance = delta.magnitude();
    if (distance === 0) {
      return new CollisionResult(true, new Vector3(0, 1, 0), this.radius);
    }
    if (distance > this.radius) {
      return new CollisionResult(false);
    }
    const normal = delta.normalize();
    const penetration = this.radius - distance;

    return new CollisionResult(true, normal, penetration);
  }
  handleCollisionWithSphere(other: Collider): CollisionResult {
    const otherSphere = other as SphereCollider;
    const radi = this.radius + otherSphere.radius;
    const distance = otherSphere.center.subtract(this.center);
    const delta = distance.magnitude();
    if (delta === 0) {
      return new CollisionResult(true, new Vector3(1, 0, 0), this.radius);
    }
    if (delta > radi) {
      return new CollisionResult(false);
    }
    const normal = distance.normalize();
    const penetration = radi - delta;
    return new CollisionResult(true, normal, penetration);
  }
  handleCollisionWithPlane(plane: Plane): CollisionResult {
    const distance = plane.signedDistanceTo(this.center);

    if (Math.abs(distance) > this.radius) {
      return new CollisionResult(false);
    }

    const normal = distance < 0 ? plane.normal.negate() : plane.normal;
    const penetration = this.radius - Math.abs(distance);

    return new CollisionResult(true, normal, penetration);
  }
}
