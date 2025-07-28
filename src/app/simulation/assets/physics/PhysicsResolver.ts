import { CollisionResult } from "../colliders/CollisionResult";
import { Body3D } from "../objects/Body3D";

export class PhysicsResolver {
  static resolveCollision(a: Body3D, b: Body3D, result: CollisionResult) {
    const normal = result.normal;
    const penetrationDepth = result.penetrationDepth;

    if (!normal || penetrationDepth === undefined)
      throw new Error("Collision Error");

    const aStatic = a.staticBody;
    const bStatic = b.staticBody;

    const invMassA = aStatic ? 0 : 1 / a.mass;
    const invMassB = bStatic ? 0 : 1 / a.mass;
    const totalInvMass = invMassA + invMassB;

    const percent = 0.8;
    const slop = 0.01;

    if (penetrationDepth > slop && totalInvMass > 0) {
      const correction = normal.scale(
        ((penetrationDepth - slop) * percent) / totalInvMass
      );
      if (!aStatic) {
        a.position = a.position.subtract(correction.scale(invMassA));
      }
      if (!bStatic) {
        b.position = b.position.add(correction.scale(invMassB));
      }
    }

    const relativeVelocity = b.velocity.subtract(a.velocity);
    const velocityAlongNormal = relativeVelocity.dot(normal);
    if (velocityAlongNormal > -0.01) return;

    const restitution = Math.min(a.restitution ?? 0.5, b.restitution ?? 0.5);
    const impulseMag =
      (-(1 + restitution) * velocityAlongNormal) / totalInvMass;

    const impulse = normal.scale(impulseMag);
    if (!aStatic) a.velocity = a.velocity.subtract(impulse.scale(invMassA));
    if (!bStatic) b.velocity = b.velocity.add(impulse.scale(invMassB));
  }
}
