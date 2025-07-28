import { Vector3 } from "../math/Vector3";
import { CollisionResult } from "./CollisionResult";

export abstract class Collider {
  abstract center: Vector3;
  abstract getType(): string;
  abstract detectCollision(other: Collider): CollisionResult;
  abstract handleCollisionWithBox(other: Collider): CollisionResult;
  abstract handleCollisionWithSphere(other: Collider): CollisionResult;
}
