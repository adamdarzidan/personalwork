import { Vector3 } from "../math/Vector3";
import { Body3D } from "../objects/Body3D";
import { Camera } from "./Camera";
import { Scene } from "./Scene";

export class Renderer {
  static draw(
    scene: Scene,
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    camera: Camera,
    fov: number = 400,
    maxRenderDistance: number = 150,
    displayCenterOfMass: boolean = true,
    wireframe: boolean = false
  ) {
    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 0.7;

    //light direction
    const lightDirection = new Vector3(1, 1, -0.8);

    //camera rotation and position data
    const rotationMatrix = camera.getQuaternion().toMatrix3();
    const cameraPosition = camera.position;

    function project(
      v: Vector3,
      offset: Vector3
    ): { x: number; y: number; z: number } | null {
      const world = v.add(offset);
      const relative = world.subtract(cameraPosition);
      const rotated = rotationMatrix.multiplyVector(relative);
      const depth = rotated.z;
      if (depth <= 0.1 || depth > maxRenderDistance) return null;
      const scale = fov / depth;
      const screenX = Math.floor(width / 2 + rotated.x * scale);
      const screenY = Math.floor(height / 2 - rotated.y * scale);
      return { x: screenX, y: screenY, z: depth };
    }

    if (wireframe) {
      for (const body of scene.bodies) {
        for (const face of body.mesh.faces) {
          const verts = face.map((i) => body.mesh.vertices[i]);
          const projected = verts.map((v) => project(v, body.position));
          if (projected.some((p) => p === null)) continue;
          const [p0, p1, p2] = projected as [
            { x: number; y: number; z: number },
            { x: number; y: number; z: number },
            { x: number; y: number; z: number }
          ];
          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y);
          ctx.lineTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.closePath();
          ctx.stroke();
        }
      }

      if (displayCenterOfMass) {
        for (const body of scene.bodies) {
          const COM = body.getWorldCenterOfMass();
          const projectedDot = project(COM, new Vector3(0, 0, 0));
          if (projectedDot) {
            ctx.beginPath();
            ctx.arc(projectedDot.x, projectedDot.y, 8, 0, 2 * Math.PI);
            ctx.fillStyle = "red";
            ctx.fill();
          }
        }
      }

      return;
    }

    const buffer = new Uint8ClampedArray(width * height * 4);
    const zBuffer: number[] = Array(width * height).fill(Infinity);

    function setPixel(
      x: number,
      y: number,
      color: [number, number, number, number]
    ) {
      if (x < 0 || x >= width || y < 0 || y >= height) return;
      const index = (y * width + x) * 4;
      const [r, g, b, a] = color;
      buffer[index] = r;
      buffer[index + 1] = g;
      buffer[index + 2] = b;
      buffer[index + 3] = a;
    }

    function barycentric(
      P: { x: number; y: number },
      A: { x: number; y: number },
      B: { x: number; y: number },
      C: { x: number; y: number }
    ): { u: number; v: number; w: number } | null {
      const v0 = { x: B.x - A.x, y: B.y - A.y };
      const v1 = { x: C.x - A.x, y: C.y - A.y };
      const v2 = { x: P.x - A.x, y: P.y - A.y };
      const d00 = v0.x * v0.x + v0.y * v0.y;
      const d01 = v0.x * v1.x + v0.y * v1.y;
      const d11 = v1.x * v1.x + v1.y * v1.y;
      const d20 = v2.x * v0.x + v2.y * v0.y;
      const d21 = v2.x * v1.x + v2.y * v1.y;
      const denom = d00 * d11 - d01 * d01;
      if (denom === 0) return null;
      const v = (d11 * d20 - d01 * d21) / denom;
      const w = (d00 * d21 - d01 * d20) / denom;
      const u = 1 - v - w;
      return { u, v, w };
    }

    function drawTriangle(
      p0: Vector3,
      p1: Vector3,
      p2: Vector3,
      z0: number,
      z1: number,
      z2: number,
      color: [number, number, number, number]
    ) {
      const minX = Math.max(0, Math.floor(Math.min(p0.x, p1.x, p2.x)));
      const maxX = Math.min(width - 1, Math.ceil(Math.max(p0.x, p1.x, p2.x)));
      const minY = Math.max(0, Math.floor(Math.min(p0.y, p1.y, p2.y)));
      const maxY = Math.min(height - 1, Math.ceil(Math.max(p0.y, p1.y, p2.y)));
      for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
          const bc = barycentric({ x, y }, p0, p1, p2);
          if (!bc || bc.u < 0 || bc.v < 0 || bc.w < 0) continue;
          const depth = bc.u * z0 + bc.v * z1 + bc.w * z2;
          const index = y * width + x;
          if (depth < zBuffer[index]) {
            zBuffer[index] = depth;
            setPixel(x, y, color);
          }
        }
      }
    }

    for (const body of scene.bodies) {
      for (const face of body.mesh.faces) {
        const verts = face.map((i) => body.mesh.vertices[i]);
        const projected = verts.map((v) => project(v, body.position));
        if (projected.some((p) => p === null)) continue;
        const [p0, p1, p2] = projected as [
          { x: number; y: number; z: number },
          { x: number; y: number; z: number },
          { x: number; y: number; z: number }
        ];

        // face normal (in world space)
        const worldVerts = face.map((i) =>
          rotationMatrix.multiplyVector(
            body.mesh.vertices[i].add(body.position.subtract(cameraPosition))
          )
        );
        const [v0, v1, v2] = worldVerts;
        const edge1 = v1.subtract(v0);
        const edge2 = v2.subtract(v0);
        const normal = edge1.crossProduct(edge2).normalize();

        // lighting intensity
        const intensity = Math.max(0, normal.dot(lightDirection));

        // color with shading
        const baseColor: [number, number, number] = [200, 200, 200]; // light gray
        const shadedColor: [number, number, number, number] = [
          baseColor[0] * intensity,
          baseColor[1] * intensity,
          baseColor[2] * intensity,
          200,
        ];

        drawTriangle(
          new Vector3(p0.x, p0.y, 0),
          new Vector3(p1.x, p1.y, 0),
          new Vector3(p2.x, p2.y, 0),
          p0.z,
          p1.z,
          p2.z,
          shadedColor
        );
      }
    }

    const imageData = new ImageData(buffer, width, height);
    ctx.putImageData(imageData, 0, 0);
  }
}
