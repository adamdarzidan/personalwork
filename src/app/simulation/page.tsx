"use client";

import { useEffect, useState } from "react";
import { Vector3 } from "./assets/math/Vector3";
import { Body3D } from "./assets/objects/Body3D";
import { SphereMesh } from "./assets/meshs/SphereMesh";
import { Scene } from "./assets/engine/Scene";
import Engine from "./assets/engine/Engine";
import { SphereCollider } from "./assets/colliders/SphereCollider";
import { earthGravity } from "./assets/math/utils";
import { PlaneMesh } from "./assets/meshs/PlaneMesh";
import { BoxCollider } from "./assets/colliders/BoxCollider";
import { ModelLoader } from "./assets/engine/ModelLoader";
import { BoxMesh } from "./assets/meshs/BoxMesh";

export default function PhysicsPage() {
  const spherePos = new Vector3(0, 10, 10);
  const planePos = new Vector3(0, 0, 10);

  function generateBodies(): Body3D[] {
    const sphere = new Body3D(
      spherePos,
      1,
      0.5,
      SphereMesh.generateSphereMesh(1, 100, 100),
      new SphereCollider(1, spherePos),
      false,
      earthGravity()
    );
    const plane = new Body3D(
      planePos,
      1,
      0.5,
      BoxMesh.generateBoxMesh(1, new Vector3(10, 2, 10)),
      new BoxCollider(planePos, new Vector3(10, 2, 10)),
      true
    );

    return [plane, sphere];
  }

  const screen = new Scene(generateBodies());

  return (
    <>
      <Engine scene={screen} />
    </>
  );
}
