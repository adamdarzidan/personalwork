import { Mesh } from "../meshs/Mesh";
import { Vector3 } from "../math/Vector3";
import { Matrix3 } from "../math/Matrix3";
import { Quaternion } from "../math/Quaternion";
import { Collider } from "../colliders/Collider";
import { GravitySource } from "../physics/gravity/GravitySource";
import { UniformGravity } from "../physics/gravity/UniformGravity";
import { CentralGravity } from "../physics/gravity/CentralGravity";
import { MassProperties } from "../engine/MassProperties";
export class Body3D {
  position: Vector3;
  velocity: Vector3;
  acceleration: Vector3;
  force: Vector3;
  mesh: Mesh;
  collider?: Collider;
  staticBody?: boolean;

  //mass properties
  mass: number;
  inverseMass: number;
  restitution: number;
  massProperties: {
    volume: number;
    centerOfMass: Vector3;
    inertiaTensor: Matrix3;
  };

  //rotational mechanics
  orientatation: Quaternion = Quaternion.identity();
  angularVelocity: Vector3 = new Vector3(0, 0, 0);
  torque: Vector3 = new Vector3(0, 0, 0);
  inertiaTensorInv: Matrix3;

  gravity: GravitySource;

  constructor(
    position: Vector3,
    mass: number,
    restitution: number,
    mesh: Mesh,
    collider: Collider,
    staticBody?: boolean,
    gravity?: GravitySource
  ) {
    this.position = position;
    this.velocity = new Vector3(0, 0, 0);
    this.acceleration = new Vector3(0, 0, 0);
    this.force = new Vector3(0, 0, 0);
    this.restitution = restitution;
    this.mesh = mesh;
    this.collider = collider;
    this.staticBody = staticBody;
    this.gravity = gravity || new UniformGravity(new Vector3(0, -9.8, 0));

    //mass properties
    this.mass = mass;
    this.inverseMass = 1 / mass;
    this.massProperties = MassProperties.compute(mesh);
    if (!this.staticBody) {
      this.inertiaTensorInv = this.massProperties.inertiaTensor.inverse();
    } else {
      this.inertiaTensorInv = Matrix3.identity();
    }
  }

  getRotationalMatrix(): Matrix3 {
    return new Matrix3([]);
  }

  applyForce(force: Vector3) {
    this.force = this.force.add(force);
  }

  integrate(dt: number) {
    //handle velocity and pos
    if (this.staticBody) return;
    this.acceleration = this.force.scale(this.inverseMass);
    this.velocity = this.velocity.add(this.acceleration.scale(dt));
    this.position = this.position.add(this.velocity.scale(dt));

    if (this.gravity instanceof CentralGravity) {
      this.gravity.center = this.position;
    }

    this.force = new Vector3(0, 0, 0);
    if (this.collider) this.collider.center = this.position;

    //inertia update
    this.updateInertiaTensorWorld();
  }

  applyMeshRotation(q: Quaternion): void {
    this.mesh.applyRotation(q);
  }
  getWorldCenterOfMass(): Vector3 {
    return this.position.add(this.massProperties.centerOfMass);
  }

  //updates inertia_world
  updateInertiaTensorWorld() {
    const R = this.orientatation.toMatrix3();
    const I_body = this.massProperties.inertiaTensor;
    const I_world = R.multiplyMatricies(I_body).multiplyMatricies(
      Matrix3.transpose(R)
    );
    this.inertiaTensorInv = I_world.inverse();
  }
}
