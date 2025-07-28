import { Vector3 } from "../math/Vector3";
import { Mesh } from "../meshs/Mesh";

export class ModelLoader {
  static fromJSON(data: any): Mesh {
    const vertices = data.vertices.map(
      ([x, y, z]: [number, number, number]) => new Vector3(x, y, z)
    );
    const faces = data.faces;
    return new Mesh(vertices, faces);
  }
  static fromOBJ(objText: string): Mesh {
    const lines = objText.split("\n");
    const vertices: Vector3[] = [];
    const faces: number[][] = [];

    for (const line of lines) {
      if (line.startsWith("v ")) {
        const [, x, y, z] = line.trim().split(/\s+/);
        if (!x || !y || !z) continue;
        vertices.push(new Vector3(+x, +y, +z));
      } else if (line.startsWith("f ")) {
        const indices = line
          .trim()
          .split(/\s+/)
          .slice(1)
          .map((token) => parseInt(token.split("/")[0]) - 1);
        faces.push(indices);
      }
    }

    return new Mesh(vertices, faces);
  }
}
