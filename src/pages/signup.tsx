"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebaseConfig";
import { useRouter } from "next/navigation"; // Import useRouter for navigation
import styles from "@/styles/Signup.module.css";
import { doc, setDoc, collection, query, where, getDocs } from "firebase/firestore";


export default function SignUp() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter(); // Initialize router for navigation

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
  
    try {
      // Step 1: Check if the username already exists
      const q = query(collection(db, "users"), where("username", "==", username));
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        setError("Username is already taken. Please choose another.");
        return;
      }
  
      // Step 2: Create the user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log("User created:", user);
  
      // Step 3: Save the user in Firestore using their UID as the doc ID
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        username: username,
      });
  
      router.push("/dreamTeamLanding");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Sign Up</h1>
        <p>Create your account to get started</p>
      </header>

      <main className={styles.main}>
        <h2 className={styles.formTitle}>Create Account</h2>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label className={styles.inputLabel}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={styles.inputField}
              placeholder="Username"
              required
            />
          </div>
          <div>
            <label className={styles.inputLabel}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.inputField}
              placeholder="you@example.com"
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
            Sign Up
          </button>
        </form>

        <p className={styles.textCenter}>
          Already have an account?{" "}
          <a href="/" className={styles.textLink}>
            Log in
          </a>
        </p>
      </main>
    </div>
  );
}
