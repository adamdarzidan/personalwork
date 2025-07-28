import { UniformGravity } from "../physics/gravity/UniformGravity";
import { Vector3 } from "./Vector3";

export function clamp(x: number, min: number, max: number): number {
  return Math.max(min, Math.min(x, max));
}
export function earthGravity(): UniformGravity {
  return new UniformGravity(new Vector3(0, -9.8, 0));
}
