import styles from "./graphingcontainer.module.css";
import { evaluate, derivativeOrder } from "../../evaluator"; // full pipeline
import { ASTNode } from "../../types/ASTNode";
import { useEffect, useMemo, useState } from "react";

interface Props {
  func: ASTNode | null;
}

export default function GraphContainer({ func }: Props) {
  const canvasWidth = 600;
  const canvasHeight = 600;
  const range = 40;

  const points: [number, number][] = [];

  const minStep = 0.001;
  const maxStep = 0.5;
  const baseStep = 0.5;

  let x = -range;
  let previousY: number | null = null;

  while (x <= range) {
    try {
      const y = evaluate(func, { x });

      points.push([x, y]);

      if (previousY !== null) {
        const dy = Math.abs(y - previousY);

        let curvature = Math.abs(derivativeOrder(func, x, 2));
        let step = baseStep / (1 + curvature);
        step = Math.min(Math.max(step, minStep), maxStep);

        x += step;
      } else {
        x += 0.05;
      }

      previousY = y;
    } catch (e) {
      x += 0.01;
      previousY = null;
    }
  }

  // points now contains adaptively sampled (x, y) pairs

  useEffect(() => {
    const canvas = document.getElementById("graph") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.beginPath();

    prepareCanvas();

    const scale = 50;
    const threshold = 100; // Adjust based on scale and function jump size

    for (let i = 0; i < points.length; i++) {
      const [x, y] = points[i];
      const py = canvasHeight / 2 - y * scale;
      const px = canvasWidth / 2 + x * scale;

      // Handle discontinuities
      const prev = points[i - 1];
      const prevY = prev ? canvasHeight / 2 - prev[1] * scale : py;
      const jump = Math.abs(py - prevY);

      if (i === 0 || jump > threshold || !isFinite(y)) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }

    ctx.strokeStyle = "#000";
    ctx.stroke();
  }, [points]);

  function prepareCanvas() {
    const canvas = document.getElementById("graph") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.moveTo(0, canvasHeight / 2);
    ctx.lineTo(canvasWidth, canvasHeight / 2);

    ctx.moveTo(canvasWidth / 2, 0);
    ctx.lineTo(canvasWidth / 2, canvasHeight);
  }

  return (
    <div className={styles.container}>
      <canvas id="graph" width={canvasWidth} height={canvasHeight}></canvas>
    </div>
  );
}
