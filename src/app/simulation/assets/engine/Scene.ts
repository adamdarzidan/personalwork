import { Vector3 } from "../math/Vector3";
import { Body3D } from "../objects/Body3D";
import { PhysicsResolver } from "../physics/PhysicsResolver";

export class Scene {
  bodies: Body3D[] = [];

  constructor(bodies: Body3D[]) {
    this.bodies = bodies;
  }

  addBody(body: Body3D): void {
    this.bodies.push(body);
  }
  step(dt: number) {
    for (const body of this.bodies) {
      if (body.mass === 0) continue;
      const gravityForce = body.gravity.getForce(body);
      body.applyForce(gravityForce);
    }

    for (const body of this.bodies) {
      body.integrate(dt);
    }

    for (let i = 0; i < this.bodies.length; i++) {
      const a = this.bodies[i];
      if (!a.collider) continue;

      for (let j = i + 1; j < this.bodies.length; j++) {
        const b = this.bodies[j];
        if (!b.collider) continue;

        const result = a.collider.detectCollision(b.collider);

        if (!result.collided) continue;
        PhysicsResolver.resolveCollision(a, b, result);
      }
    }
  }
}
