import { clamp } from "../math/utils";
import { Vector3 } from "../math/Vector3";
import { Collider } from "./Collider";
import { CollisionResult } from "./CollisionResult";
import { SphereCollider } from "./SphereCollider";
export class BoxCollider extends Collider {
  center: Vector3;
  dimensions: Vector3;

  constructor(center: Vector3, dimensions: Vector3) {
    super();
    this.center = center;
    this.dimensions = dimensions;
  }

  getType(): string {
    return "box";
  }
  detectCollision(other: Collider): CollisionResult {
    return other.handleCollisionWithBox(this);
  }

  handleCollisionWithBox(other: Collider): CollisionResult {
    const otherBox = other as BoxCollider;

    const halfA = this.dimensions.scale(0.5);
    const halfB = otherBox.dimensions.scale(0.5);
    const delta = otherBox.center.subtract(this.center);

    const overlapX = halfA.x + halfB.x - Math.abs(delta.x);
    const overlapY = halfA.y + halfB.y - Math.abs(delta.y);
    const overlapZ = halfA.z + halfB.z - Math.abs(delta.z);

    if (overlapX <= 0 || overlapY <= 0 || overlapZ <= 0) {
      return new CollisionResult(false);
    }
    let penetrationDepth = overlapX;
    let normal = new Vector3(Math.sign(delta.x), 0, 0);

    if (overlapY < penetrationDepth) {
      penetrationDepth = overlapY;
      normal = new Vector3(0, Math.abs(Math.sign(delta.y)), 0);
    }

    if (overlapZ < penetrationDepth) {
      penetrationDepth = overlapZ;
      normal = new Vector3(0, 0, Math.sign(delta.z));
    }

    return new CollisionResult(true, normal, penetrationDepth);
  }
  handleCollisionWithSphere(other: Collider): CollisionResult {
    const sphere = other as SphereCollider;
    const closest_x = clamp(
      sphere.center.x,
      this.dimensions.x * -0.5 + this.center.x,
      this.dimensions.x * 0.5 + this.center.x
    );
    const closest_y = clamp(
      sphere.center.y,
      this.dimensions.y * -0.5 + this.center.y,
      this.dimensions.y * 0.5 + this.center.y
    );
    const closest_z = clamp(
      sphere.center.z,
      this.dimensions.z * -0.5 + this.center.z,
      this.dimensions.z * 0.5 + this.center.z
    );
    const closestPoint = new Vector3(closest_x, closest_y, closest_z);
    const delta = sphere.center.subtract(closestPoint); // vector from box to sphere center
    const distance = delta.magnitude();
    if (distance > sphere.radius) {
      return new CollisionResult(false);
    }
    const normal = delta.normalize();
    const penetration = sphere.radius - distance;
    return new CollisionResult(true, normal, penetration);
  }
}
