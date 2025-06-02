"use client";

import Image from "next/image";
import { JSX, useEffect, useState } from "react";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, provider, db } from "@/lib/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "@/styles/Home.module.css";

import { FiEye, FiEyeOff } from "react-icons/fi"; // 👈 these are simple clean icons

import MoonWithStars from "./moonWithStars";
import Head from "next/head";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000); // clears after 5 seconds

      return () => clearTimeout(timer); // cleanup if component unmounts early
    }
  }, [error]);



  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email and password fields cannot be blank.");
      return;
    }

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
      setError("Invalid login");
    }
  };

  // const handleGoogleLogin = async () => {
  //   try {
  //     await signInWithPopup(auth, provider);
  //     console.log("Logged in with Google!");
  //     router.push("/dreamTeamLanding");
  //   } catch (err: any) {
  //     setError(err.message);
  //   }
  // };



  return (
    <div className="background page-transition">
      <div className={styles.container}>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1, user-scalable=no" />
        </Head>
        <header className={styles.header}>

          <div className={styles.moonContainer}>
            <MoonWithStars />
            <h1 className={styles.heroTitle}>Dream Team</h1>
          </div>


          <h2 className={styles.heroSubtitle}>Assemble your perfect team</h2>
          <Image
            className={styles.logo}
            src="/dream-team-logo.jpg"
            alt="Team Illustration"
            width={320}
            height={250}
          />
        </header>

        <main className={styles.main}>
          <h2 className={styles.formTitle}>Log In</h2>

          {error && (
            <>
              <p className={styles.loginError}>{error}</p>
              {error === "Invalid login" && (
                <p className={styles.loginErrorMain}>
                  Incorrect Username and/or Password. Please try again.
                </p>
              )}
            </>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email/username" className={styles.inputLabel}>Email/Username</label>
              <input
                id="email/username"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value.toLowerCase())}
                className={styles.inputField}
                placeholder="garywinthorpe@example.com / gary"
              />
            </div>

            <div style={{ position: "relative" }}>
              <label htmlFor="password" className={styles.inputLabel}>Password</label>

              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.inputField}
                placeholder="password123"
              />

              {/* Eye Icon Button */}
              <button
                className={styles.showPassword}
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff style={{ color: "white" }} /> : <FiEye style={{ color: "white" }} />}
              </button>
            </div>


            <button type="submit" className={styles.button}>
              Log In
            </button>
          </form>

          {/* <button onClick={handleGoogleLogin} className={styles.googleButton}>
          Log in with Google
        </button> */}

          <p className={styles.textCenter}>
            Don’t have an account?{" "}
            <Link href="/signup" className={styles.textLink}>
              Sign up
            </Link>
          </p>
        </main>
      </div>
    </div>
  );
}
