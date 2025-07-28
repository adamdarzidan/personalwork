import { Vector3 } from "../math/Vector3";
import { Mesh } from "./Mesh";

export class BoxMesh {
  static generateBoxMesh(scale: number, dimensions: Vector3) {
    const hw = 0.5 * dimensions.x * scale;
    const hh = 0.5 * dimensions.y * scale;
    const hl = 0.5 * dimensions.z * scale;

    const vertices: Vector3[] = [
      new Vector3(-hw, -hh, -hl), // 0
      new Vector3(hw, -hh, -hl), // 1
      new Vector3(hw, -hh, hl), // 2
      new Vector3(-hw, -hh, hl), // 3
      new Vector3(-hw, hh, -hl), // 4
      new Vector3(hw, hh, -hl), // 5
      new Vector3(hw, hh, hl), // 6
      new Vector3(-hw, hh, hl), // 7
    ];

    const faces: number[][] = [
      [0, 1, 2],
      [0, 2, 3], // bottom
      [4, 6, 5],
      [4, 7, 6], // top
      [3, 2, 6],
      [3, 6, 7], // front
      [0, 5, 1],
      [0, 4, 5], // back
      [0, 3, 7],
      [0, 7, 4], // left
      [1, 5, 6],
      [1, 6, 2], // right
    ];

    return new Mesh(vertices, faces);
  }
}
