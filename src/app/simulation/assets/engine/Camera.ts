import { Quaternion } from "../math/Quaternion";
import { clamp } from "../math/utils";
import { Vector3 } from "../math/Vector3";

export class Camera {
  position: Vector3;
  yaw: number;
  pitch: number;
  moveSpeed: number;
  lookSpeed: number;

  constructor(
    position: Vector3,
    yaw: number,
    pitch: number,
    moveSpeed: number,
    lookSpeed: number
  ) {
    this.position = position;
    this.yaw = yaw;
    this.pitch = pitch;
    this.moveSpeed = moveSpeed;
    this.lookSpeed = lookSpeed;
  }

  getQuaternion(): Quaternion {
    return Quaternion.fromAxisAngle(new Vector3(0, 1, 0), -this.yaw);
  }

  getForward(): Vector3 {
    return Quaternion.fromAxisAngle(new Vector3(0, 1, 0), this.yaw)
      .rotateVector(new Vector3(0, 0, 1))
      .normalize();
  }

  getRight(): Vector3 {
    return Quaternion.fromAxisAngle(new Vector3(0, 1, 0), this.yaw)
      .rotateVector(new Vector3(1, 0, 0))
      .normalize();
  }

  getUp(): Vector3 {
    return new Vector3(0, 1, 0);
  }

  move(forward: number, right: number, up: number) {
    const forwardMove = this.getForward().scale(forward * this.moveSpeed);
    const rightMove = this.getRight().scale(right * this.moveSpeed);
    const upMove = this.getUp().scale(up * this.moveSpeed);

    this.position = this.position.add(forwardMove).add(rightMove).add(upMove);
  }

  look(deltaYaw: number) {
    this.yaw += deltaYaw * this.lookSpeed;
  }
}
