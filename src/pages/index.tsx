"use client";

import Image from "next/image";
import { useState } from "react";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, provider, db } from "@/lib/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "@/styles/Home.module.css";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      let userEmail = email;
      if (!email.includes("@")) {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("username", "==", email));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          setError("Username not found");
          return;
        }

        const userDoc = querySnapshot.docs[0];
        userEmail = userDoc.data().email;
      }

      await signInWithEmailAndPassword(auth, userEmail, password);
      console.log("Logged in!");
      router.push("/dreamTeamLanding");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
      console.log("Logged in with Google!");
      router.push("/dreamTeamLanding");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Dream Team</h1>
        <p>Assemble your perfect team</p>
        <Image
          src="/dream-team-logo.jpg"
          alt="Team Illustration"
          width={300}
          height={200}
          className={styles.logo}
        />
      </header>

      <main className={styles.main}>
        <h2 className={styles.formTitle}>Log In</h2>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className={styles.inputLabel}>Email/Username</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.inputField}
              placeholder="person@email.com / username"
              required
            />
          </div>
          <div>
            <label className={styles.inputLabel}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.inputField}
              placeholder="password123"
              required
            />
          </div>
          <button type="submit" className={styles.button}>
            Log In
          </button>
        </form>

        <button onClick={handleGoogleLogin} className={styles.googleButton}>
          Log in with Google
        </button>

        <p className={styles.textCenter}>
          Don’t have an account?{" "}
          <Link href="/signup" className={styles.textLink}>
            Sign up
          </Link>
        </p>
      </main>
    </div>
  );
}
