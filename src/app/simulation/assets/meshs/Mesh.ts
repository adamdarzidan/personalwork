import { Quaternion } from "../math/Quaternion";
import { Vector3 } from "../math/Vector3";

export class Mesh {
  vertices: Vector3[];
  faces: number[][];
  constructor(vertices: Vector3[], faces: number[][]) {
    (this.vertices = vertices), (this.faces = faces);
  }

  applyRotation(q: Quaternion): void {
    const rotationMatrix = q.toMatrix3();
    for (let i = 0; i < this.vertices.length; i++) {
      this.vertices[i] = rotationMatrix.multiplyVector(this.vertices[i]);
    }
  }
}
