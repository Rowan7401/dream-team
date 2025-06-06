"use client";

import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import BackButton from "@/components/backButton";
import styles from "@/styles/DreamTeamLanding.module.css";

import Head from "next/head";


export default function DreamTeamLanding() {
  const router = useRouter();

  return (
    <div className="background page-transition">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1, user-scalable=no" />
      </Head>

      <div className={styles.nav}>
        <Navbar />
      </div>
      <div className={styles.container}>
        <header className={styles.heroHeader}>
          <h1 className={styles.heroTitle}>Dream Team</h1>
          <p className={styles.heroSubtitle}>Dream, Discover, and Co-Sign the Ultimate Teams</p>
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

        <BackButton />
      </div>
    </div>
     
  );
}
