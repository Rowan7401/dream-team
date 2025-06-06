"use client";

import { useState } from "react";

import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebaseConfig";
import { doc, setDoc, collection, query, where, getDocs } from "firebase/firestore";

import BackButton from "@/components/backButton";
import { useRouter } from "next/navigation"; // Import useRouter for navigation
import Head from "next/head";

import styles from "@/styles/Signup.module.css";
import MoonWithStars from "./moonWithStars";
import { FiEye, FiEyeOff } from "react-icons/fi";

export default function SignUp() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter(); // Initialize router for navigation

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate username format
    const allowedUsernameRegex = /^[a-z0-9!&$_-]+$/;

    if (!email || !password || !username) {
      setError("Username, Email, and password fields cannot be blank.");
      return;
    }

    if (!allowedUsernameRegex.test(username)) {
      setError("Username can only contain lowercase letters, numbers, !, &, $, _, or -.");
      return;
    }

    try {
      // Step 1: Check if the username already exists
      const q = query(collection(db, "users"), where("username", "==", username.toLowerCase()));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setError("Username is already taken. Please choose another.");
        return;
      }

      // Step 2: Create the user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Step 3: Save the user in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        username: username,
      });

      router.push("/dreamTeamLanding");
    } catch (err: any) {
      setError("Invalid signup");
    }
  };


  return (
    <div className="background page-transition">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1, user-scalable=no" />
      </Head>
      <div className={styles.container}>

        <header className={styles.heroHeader}>
          <div className={styles.moonContainer}>
            <MoonWithStars />
            <h1 className={styles.heroTitle2}>Dream Team</h1>
          </div>



          <p className={styles.heroSubtitle}>Assemble your perfect team</p>

          <h1 className={styles.heroTitle}>Create Account</h1>
          <p className={styles.headerP}>Sign Up To Get Started</p>
        </header>

        <main className={styles.main}>
          {error && (
            <>
              <p className={styles.loginError}>***{error}***</p>
            </>
          )}

          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label htmlFor="username" className={styles.inputLabel}>Username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                className={styles.inputField}
                placeholder="Username"
              />
            </div>
            <div>
              <label htmlFor="email" className={styles.inputLabel}>Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value.toLowerCase())}
                className={styles.inputField}
                placeholder="garywinthorpe@example.com"
              />
            </div>

            <div style={{ position: "relative" }}>
              {/* Eye Icon Button */}
              <button
                className={styles.showPassword}
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff style={{ color: "white" }} /> : <FiEye style={{ color: "white" }} />}
              </button>


              <label htmlFor="password" className={styles.inputLabel}>Password</label>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.inputField}
                placeholder="password123"
              />

            </div>

            <button type="submit" className={styles.button}>
              Sign Up
            </button>
          </form>

          <p className={styles.text}>
            Already have an account?{" "}
            <a href="/" className={styles.textLink}>
              Log in
            </a>
          </p>
        </main>
        <BackButton />
      </div>
    </div>
  );
}
