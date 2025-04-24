"use client";

import { useRouter } from "next/navigation";
import styles from "@/styles/DreamTeamLanding.module.css";

export default function DreamTeamLanding() {
  const router = useRouter();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Welcome to Dream Team</h1>
      </header>

      <main className={styles.main}>
        <button
          className={styles.button}
          onClick={() => router.push("/searchDreams")}
        >
          Search Dream Teams
        </button>
        <button
          className={styles.button}
          onClick={() => router.push("/searchUsers")}
        >
          Search Users
        </button>
        <button
          className={styles.button}
          onClick={() => router.push("/createNewDream")}
        >
          Create New Dream Team
        </button>
        <button
          className={styles.button}
          onClick={() => router.push("/currentDreams")}
        >
          View Current Dream Teams
        </button>
      </main>
    </div>
  );
}
