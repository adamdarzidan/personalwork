import { Matrix3 } from "../math/Matrix3";
import { Vector3 } from "../math/Vector3";
import { Mesh } from "../meshs/Mesh";

export class MassProperties {
  static compute(mesh: Mesh, density: number = 1) {
    const vertices = mesh.vertices;
    const faces = mesh.faces;

    const { volume, centerOfMass, inertiaTensor } = this.computeMassProperties(
      mesh,
      density
    );
    const shiftedInertiaTensor = this.parallelAxisTheoremShift(
      density,
      volume,
      centerOfMass,
      inertiaTensor
    );

    return {
      volume,
      centerOfMass,
      inertiaTensor,
    };
  }

  private static computeMassProperties(mesh: Mesh, density: number) {
    const vertices = mesh.vertices;
    const faces = mesh.faces;

    let volume = 0;
    let sumVC = new Vector3(0, 0, 0);

    let Ixx = 0,
      Iyy = 0,
      Izz = 0;
    let Ixy = 0,
      Ixz = 0,
      Iyz = 0;

    const f1 = (a: number, b: number, c: number): number => a + b + c;
    const f2 = (a: number, b: number, c: number): number =>
      a * a + b * b + c * c + a * b + b * c + c * a;

    for (const face of faces) {
      const v0 = vertices[face[0]];
      const v1 = vertices[face[1]];
      const v2 = vertices[face[2]];

      const vI = (1 / 6) * v0.dot(v1.crossProduct(v2));
      volume += vI;

      const cI = v0
        .add(v1)
        .add(v2)
        .scale(1 / 4);
      sumVC = sumVC.add(cI.scale(vI));

      const [x0, y0, z0] = [v0.x, v0.y, v0.z];
      const [x1, y1, z1] = [v1.x, v1.y, v1.z];
      const [x2, y2, z2] = [v2.x, v2.y, v2.z];

      Ixx += (density * vI * (f2(y0, y1, y2) + f2(z0, z1, z2))) / 10;
      Iyy += (density * vI * (f2(x0, x1, x2) + f2(z0, z1, z2))) / 10;
      Izz += (density * vI * (f2(x0, x1, x2) + f2(y0, y1, y2))) / 10;

      Ixy += (density * vI * f1(x0, x1, x2) * f1(y0, y1, y2)) / 20;
      Ixz += (density * vI * f1(x0, x1, x2) * f1(z0, z1, z2)) / 20;
      Iyz += (density * vI * f1(y0, y1, y2) * f1(z0, z1, z2)) / 20;
    }

    const centerOfMass =
      volume !== 0 ? sumVC.scale(1 / volume) : new Vector3(0, 0, 0);

    const inertiaTensor = new Matrix3([
      [Ixx, -Ixy, -Ixz],
      [-Ixy, Iyy, -Iyz],
      [-Ixz, -Iyz, Izz],
    ]);

    return { volume, centerOfMass, inertiaTensor };
  }

  private static parallelAxisTheoremShift(
    density: number,
    volume: number,
    centerOfMass: Vector3,
    inertiaTensor: Matrix3
  ): Matrix3 {
    //computes squared distance from origin ||d||^2
    const distanceSquared =
      centerOfMass.x ** 2 + centerOfMass.y ** 2 + centerOfMass.z ** 2;

    //inside terms ||d||^2 dot IdentityMatrix - COM outerproduct with COM
    const insideMatrix = Matrix3.identity()
      .scale(distanceSquared)
      .subtract(centerOfMass.outerProduct(centerOfMass));
    return inertiaTensor.subtract(insideMatrix.scale(volume * density));
  }
}
