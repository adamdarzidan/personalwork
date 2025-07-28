import { useEffect, useRef, useState } from "react";
import { Scene } from "./Scene";
import { Renderer } from "./Renderer";
import { Camera } from "./Camera";
import { Vector3 } from "../math/Vector3";
import PropertyPanel from "../../components/propertypanel/PropertyPanel";

export default function Engine({ scene }: { scene: Scene }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cameraRef = useRef(new Camera(new Vector3(0, 5, -5), 0, 0, 0.2, 0.002));
  const [tick, setTick] = useState(0);

  const pressedKeys = useRef<Set<string>>(new Set());
  //movement states
  const movement = useRef({
    forward: 0,
    backward: 0,
    left: 0,
    right: 0,
    up: 0,
    down: 0,
  });

  const fpsRef = useRef({
    frameCount: 0,
    lastTime: performance.now(),
    fps: 0,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      pressedKeys.current.add(e.key);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      pressedKeys.current.delete(e.key);
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    const handleMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement === canvasRef.current) {
        cameraRef.current.look(e.movementX);
      }
    };
    window.addEventListener("mousemove", handleMouseMove);

    const handleClick = () => {
      canvasRef.current?.requestPointerLock();
    };
    canvasRef.current?.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("mousemove", handleMouseMove);
      canvasRef.current?.removeEventListener("click", handleClick);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resolutionScale = 0.8;
    canvas.width = window.innerWidth * resolutionScale;
    canvas.height = window.innerHeight * resolutionScale;

    canvas.style.width = "100vw";
    canvas.style.height = "100vh";

    let lastTime = performance.now();
    const loop = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;
      scene.step(dt);

      fpsRef.current.frameCount++;
      if (time - fpsRef.current.lastTime >= 1000) {
        fpsRef.current.fps = fpsRef.current.frameCount;
        fpsRef.current.frameCount = 0;
        fpsRef.current.lastTime = time;
        console.log("FPS:", fpsRef.current.fps);
      }

      const cam = cameraRef.current;
      const keys = pressedKeys.current;
      const moveForward = (keys.has("w") ? 1 : 0) - (keys.has("s") ? 1 : 0);
      const moveRight = (keys.has("d") ? 1 : 0) - (keys.has("a") ? 1 : 0);
      const moveUp = (keys.has(" ") ? 1 : 0) - (keys.has("Shift") ? 1 : 0);

      cam.move(moveForward, moveRight, moveUp);

      Renderer.draw(scene, ctx, canvas.width, canvas.height, cam);
      setTick((t) => t + 1);
      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }, [scene]);

  return (
    <>
      <PropertyPanel scene={scene} />
      <canvas
        ref={canvasRef}
        style={{
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(0,0,0,0.05)",
        }}
      ></canvas>
    </>
  );
}
