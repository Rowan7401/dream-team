"use client";

import { useState, useEffect } from "react";

import { db, auth } from "@/lib/firebaseConfig";
import { collection, addDoc, getDocs } from "firebase/firestore";

import { useRouter } from "next/navigation";
import styles from "@/styles/CreateNewDream.module.css";

function normalizePick(pick: string): string {
    return pick
        .trim()
        .toLowerCase()
        .replace(/[^\w\s]/gi, "") // remove punctuation
        .replace(/\s+/g, " ");    // collapse multiple spaces
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

    const finalCategory =
      category === "Other" && customCategory.trim()
        ? customCategory.trim()
        : category;

    const newPicks = [
        normalizePick(pick1),
        normalizePick(pick2),
        normalizePick(pick3)
        ].sort();
          

    try {
      const teamsRef = collection(db, "teams");
      const snapshot = await getDocs(teamsRef);

      const isDuplicate = snapshot.docs.some((doc) => {
        const data = doc.data();
        const existingPicks = [
            normalizePick(data.pick1 || ""),
            normalizePick(data.pick2 || ""),
            normalizePick(data.pick3 || "")
          ].sort();
          

        return JSON.stringify(existingPicks) === JSON.stringify(newPicks);
      });

      if (isDuplicate) {
        setError("A dream team with these exact picks already exists.");
        return;
      }

      await addDoc(teamsRef, {
        title: title.trim(),
        pick1: pick1.trim(),
        pick2: pick2.trim(),
        pick3: pick3.trim(),
        category: finalCategory,
        categoryLower: category.toLowerCase(),
        uid: user.uid,
        createdByUsername: user.displayName || user.email || "Anonymous",
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
