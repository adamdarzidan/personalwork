import { Vector3 } from "../math/Vector3";
import { Mesh } from "./Mesh";

export class PlaneMesh {
  static generatePlaneMesh(size: Vector3): Mesh {
    const vertices: Vector3[] = [];
    const faces: number[][] = [];

    const halfWidth = 0.5 * size.x;
    const halfDepth = 0.5 * size.z;

    // Centered at origin (0, 0, 0)
    vertices.push(
      new Vector3(-halfWidth, 0, -halfDepth), // 0: bottom-left
      new Vector3(halfWidth, 0, -halfDepth), // 1: bottom-right
      new Vector3(halfWidth, 0, halfDepth), // 2: top-right
      new Vector3(-halfWidth, 0, halfDepth) // 3: top-left
    );

    faces.push([0, 1, 2], [0, 2, 3]);

    return new Mesh(vertices, faces);
  }
}
