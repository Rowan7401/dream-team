"use client";

import { useState, useEffect } from "react";

import { db, auth } from "@/lib/firebaseConfig";
import { collection, updateDoc, addDoc, getDoc, getDocs, doc } from "firebase/firestore";

import { useRouter } from "next/navigation";
import styles from "@/styles/CreateNewDream.module.css";

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
  const [customCategory, setCustomCategory] = useState("");
  const [error, setError] = useState("");

  const router = useRouter();

  const predefinedCategories = [
    "Sports",
    "Popular Culture",
    "Movies",
    "Food",
    "TV Shows",
    "Music",
    "Other"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
  
    const user = auth.currentUser;
    if (!user) {
      setError("You must be logged in to create a dream team.");
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
  
      const finalCategory =
        category === "Other" && customCategory.trim()
          ? customCategory.trim()
          : category;
  
      const newPicks = [
        normalizeInput(pick1),
        normalizeInput(pick2),
        normalizeInput(pick3)
      ].sort();
  
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
        // 🚀 Team already exists — co-sign instead of creating new
        const existingData = existingTeamDoc.data();
        const teamRef = doc(db, "teams", existingTeamDoc.id);
  
        const currentCosignedBy: string[] = existingData.cosignedBy || [];
  
        // Only add if not already cosigned
        if (!currentCosignedBy.includes(createdByUsername)) {
          await updateDoc(teamRef, {
            cosignedBy: [...currentCosignedBy, createdByUsername]
          });
        }
  
        router.push("/currentDreams");
        return;
      }
  
      // 🚀 No duplicate found — create new dream team
      await addDoc(teamsRef, {
        title: normalizeInput(title),
        pick1: normalizeInput(pick1),
        pick2: normalizeInput(pick2),
        pick3: normalizeInput(pick3),
        category: finalCategory,
        categoryLower: finalCategory.toLowerCase(),
        uid: user.uid,
        createdByUsername,
        cosignedBy: [], // 🔥 new field, starts empty
        createdAt: new Date()
      });
  
      router.push("/currentDreams");
    } catch (err) {
      console.error("Error creating dream team:", err);
      setError("An error occurred while creating the dream team.");
    }
  };
  

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Create a New Dream Team</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={styles.input}
          required
        />
        <input
          type="text"
          placeholder="Pick 1"
          value={pick1}
          onChange={(e) => setPick1(e.target.value)}
          className={styles.input}
          required
        />
        <input
          type="text"
          placeholder="Pick 2"
          value={pick2}
          onChange={(e) => setPick2(e.target.value)}
          className={styles.input}
          required
        />
        <input
          type="text"
          placeholder="Pick 3"
          value={pick3}
          onChange={(e) => setPick3(e.target.value)}
          className={styles.input}
          required
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={styles.select}
        >
          {predefinedCategories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {category === "Other" && (
          <input
            type="text"
            placeholder="Enter custom category"
            value={customCategory}
            onChange={(e) => setCustomCategory(e.target.value)}
            className={styles.input}
          />
        )}

        {error && <p className={styles.error}>{error}</p>}

        <button type="submit" className={styles.button}>
          Create Dream Team
        </button>
      </form>
    </div>
  );
}
