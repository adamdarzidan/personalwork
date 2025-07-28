import Image from "next/image";
import styles from "./home.module.css";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Link type="button" className={styles.button} href="/calculator">
        Go To Calculator
      </Link>
      <Link type="button" className={styles.button} href="/simulation">
        Go To Physics
      </Link>
    </>
  );
}
