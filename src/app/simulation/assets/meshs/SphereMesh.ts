import { Vector3 } from "../math/Vector3";
import { Mesh } from "./Mesh";

export class SphereMesh {
  static generateSphereMesh(
    r: number,
    latSections: number,
    lonSections: number
  ) {
    const vertices: Vector3[] = [];
    const faces: number[][] = [];

    for (let lat = 0; lat <= latSections; lat++) {
      const phi = (lat * Math.PI) / latSections;
      for (let lon = 0; lon <= lonSections; lon++) {
        const theta = (lon * 2 * Math.PI) / lonSections;

        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.sin(phi) * Math.sin(theta);
        const z = r * Math.cos(phi);

        vertices.push(new Vector3(x, y, z));
      }
    }

    for (let lat = 0; lat < latSections; lat++) {
      for (let lon = 0; lon < lonSections; lon++) {
        const current = lat * (lonSections + 1) + lon;
        const next = current + lonSections + 1;

        faces.push([current, next, current + 1]);
        faces.push([next, next + 1, current + 1]);
      }
    }

    return new Mesh(vertices, faces);
  }
}
