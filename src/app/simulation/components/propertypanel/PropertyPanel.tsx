import { Scene } from "../../assets/engine/Scene";
import styles from "./propertypanel.module.css";

interface SceneProp {
  scene: Scene;
}

export default function PropertyPanel({ scene }: SceneProp) {
  const body = scene.bodies[1];
  return (
    <div className={styles.container}>
      <h4 className={styles.text}>
        Position x: {body.position.x.toFixed(3)} y: {body.position.y.toFixed(3)}{" "}
        z: {body.position.z.toFixed(3)}s
      </h4>
      <h4 className={styles.text}>
        Velocity x: {body.velocity.x.toFixed(3)} y: {body.velocity.y.toFixed(3)}{" "}
        z: {body.velocity.z.toFixed(3)}s
      </h4>
    </div>
  );
}
