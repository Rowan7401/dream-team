"use client";

import { useState, useEffect } from "react";

import { db, auth } from "@/lib/firebaseConfig";
import { collection, updateDoc, addDoc, getDocs, getDoc, doc } from "firebase/firestore";

import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import BackButton from "@/components/backButton";
import styles from "@/styles/CreateNewDream.module.css";
import CategorySelect from "@/components/categorySelect";
import Head from "next/head";


function normalizeInput(pick: string): string {
  return pick
    .trim()
    .toLowerCase()
    .replace(/[^\w\s]/gi, "") // remove punctuation
    .replace(/\s+/g, " ")    // collapse multiple spaces
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function CreateNewDream() {
  const [title, setTitle] = useState("");

  const [pick1, setPick1] = useState("");
  const [pick2, setPick2] = useState("");
  const [pick3, setPick3] = useState("");

  const [category, setCategory] = useState("Sports");

  const [error, setError] = useState("");

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);


  const router = useRouter();

  const predefinedCategories = [
    "Sports",
    "Popular Culture",
    "Movies",
    "Food",
    "TV Shows",
    "Music",
    "Gaming",
    "Other"
  ];


  const handleRandomTopic = async () => {
    try {
      const res = await fetch("https://rnd.bgenc.dev/v1/word?category=nouns&count=1&separator=+");
      const word = await res.text();

      const normalizedTopic = normalizeInput(word);

      setTitle(normalizedTopic);         // Update title input
      setCategory("Other");              // Switch to "Other" category
    } catch (err) {
      console.error("Failed to fetch random topic:", err);
      setError("Couldn't fetch a random topic. Please try again.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Reset error state

    const user = auth.currentUser;
    if (!user) {
      setError("You must be logged in to create a dream team.");
      return;
    }

    const newPicks = [
      normalizeInput(pick1),
      normalizeInput(pick2),
      normalizeInput(pick3)
    ].sort();

    if (title.trim().length === 0) {
      setError("Blank Title. Please input a Title for your team.");
      return;
    }

    if (newPicks.some((p) => p.length === 0)) {
      setError("There must be 3 picks. Please fill in blank field(s).");
      return;
    }

    if (new Set(newPicks).size !== 3) {
      setError("Duplicate picks found. Please make dream team 3 unique picks.");
      return;
    }

    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      let createdByUsername = "Anonymous";
      if (userDoc.exists()) {
        const userData = userDoc.data();
        createdByUsername = userData.username || "Anonymous";
      }

      const teamsRef = collection(db, "teams");
      const snapshot = await getDocs(teamsRef);

      let existingTeamDoc = null;

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        const existingPicks = [
          normalizeInput(data.pick1 || ""),
          normalizeInput(data.pick2 || ""),
          normalizeInput(data.pick3 || "")
        ].sort();

        if (JSON.stringify(existingPicks) === JSON.stringify(newPicks)) {
          existingTeamDoc = docSnap;
          break;
        }
      }

      if (existingTeamDoc) {
        const existingData = existingTeamDoc.data();
        const teamRef = doc(db, "teams", existingTeamDoc.id);
        const currentCosignedBy: string[] = existingData.cosignedBy || [];

        if (!currentCosignedBy.includes(createdByUsername)) {
          await updateDoc(teamRef, {
            cosignedBy: [...currentCosignedBy, createdByUsername]
          });
        }

        setSuccessMessage("✅ Co-signed existing Dream Team! 👊");
        setShowPopup(true);
       
        router.push("/currentDreams");

        return;
      }

      // 🚀 No duplicate found — create new dream team
      await addDoc(teamsRef, {
        title: normalizeInput(title),
        pick1: normalizeInput(pick1),
        pick2: normalizeInput(pick2),
        pick3: normalizeInput(pick3),
        category,
        categoryLower: category.toLowerCase(),
        uid: user.uid,
        createdByUsername,
        cosignedBy: [],
        createdAt: new Date()
      });

      setSuccessMessage("✅ Thank you, dream team created! 😴💭");
      setShowPopup(true);

      
      router.push("/currentDreams");
    
    } catch (err) {
      console.error("🔥 Firebase error:", err);
      setError("An error occurred while creating the dream team.");
    }
  };




  return (
    <div className="background page-transition">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <div className={styles.nav}>
        <Navbar />
      </div>

      <div className={styles.container}>
        <header className={styles.heroHeader}>
          <h1 className={styles.heroTitle}>Create New Dream Team</h1>
        </header>

        {showPopup && successMessage && (
          <div className={`${styles.popup} ${styles.popupFadeIn}`}>
            <p>{successMessage}</p>
            <button className={styles.dismissButton} onClick={() => setShowPopup(false)}>
              Dismiss
            </button>
          </div>
        )}


        <div className={styles.card}>

          <form onSubmit={handleSubmit} className={styles.form}>
            <p className={styles.heroSubtitle}> 🤔 Can't Think of Topic? 💭 </p>
            <button
              type="button"
              onClick={handleRandomTopic}
              className={styles.surpriseButton}
            >
              🎲 Surprise Me with an Idea
            </button>

            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={styles.input}

            />
            <input
              type="text"
              placeholder="Pick 1"
              value={pick1}
              onChange={(e) => setPick1(e.target.value)}
              className={styles.input}

            />
            <input
              type="text"
              placeholder="Pick 2"
              value={pick2}
              onChange={(e) => setPick2(e.target.value)}
              className={styles.input}

            />
            <input
              type="text"
              placeholder="Pick 3"
              value={pick3}
              onChange={(e) => setPick3(e.target.value)}
              className={styles.input}

            />

            <CategorySelect
              value={category}
              onValueChange={setCategory}
              options={predefinedCategories}
            />

            {error && <p className={styles.error}>*** {error} ***</p>}

            <button type="submit" className={styles.button}>
              Create Team
            </button>
          </form>
        </div>
        <BackButton />
      </div>
    </div>
  );
}
