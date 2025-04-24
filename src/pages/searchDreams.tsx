"use client";

import { useState } from "react";
import styles from "@/styles/SearchDreams.module.css";
import { db } from "@/lib/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";

interface DreamTeam {
  id: string;
  title: string;
  pick1: string;
  pick2: string;
  pick3: string;
  createdByUsername: string;
  category: string;
}

export default function SearchDreams() {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<DreamTeam[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDreamsByQuery = async (queryStr: string) => {
    setLoading(true);
    try {
      const q = query(collection(db, "teams"));
      const querySnapshot = await getDocs(q);
      const allDreams = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<DreamTeam, "id">),
      }));

      const filtered = allDreams.filter((dream) =>
        dream.title.toLowerCase().includes(queryStr.toLowerCase())
      );
      setResults(filtered);
    } catch (err) {
      console.error("Error searching dreams:", err);
    }
    setLoading(false);
  };

  const fetchDreamsByCategory = async (category: string) => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "teams"),
        where("categoryLower", "==", category.toLowerCase())
      );
      const querySnapshot = await getDocs(q);
      const categoryDreams = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<DreamTeam, "id">),
      }));
      setResults(categoryDreams);
    } catch (err) {
      console.error("Error fetching dreams by category:", err);
    }
    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Search Dream Teams</h1>

      <div className={styles.searchBar}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for a dream team..."
          className={styles.input}
        />
        <button
          onClick={() => fetchDreamsByQuery(searchQuery)}
          className={styles.searchButton}
        >
          Search
        </button>
      </div>

      <div className={styles.categoryButtons}>
        <button onClick={() => fetchDreamsByCategory("most popular")}>Most Popular</button>
        <button onClick={() => fetchDreamsByCategory("sports")}>Sports</button>
        <button onClick={() => fetchDreamsByCategory("popular culture")}>Popular Culture</button>
        <button onClick={() => fetchDreamsByCategory("movies")}>Movies</button>
        <button onClick={() => fetchDreamsByCategory("food")}>Food</button>
        <button onClick={() => fetchDreamsByCategory("other")}>Other</button>
      </div>

      <div className={styles.results}>
        {loading ? (
          <p>Loading...</p>
        ) : results.length === 0 ? (
          <p>No dream teams found.</p>
        ) : (
          results.map((dream) => (
            <div key={dream.id} className={styles.card}>
              <h2>{dream.title}</h2>
              <p><strong>Pick 1:</strong> {dream.pick1}</p>
              <p><strong>Pick 2:</strong> {dream.pick2}</p>
              <p><strong>Pick 3:</strong> {dream.pick3}</p>
              <p><em>Category:</em> {dream.category}</p>
              <p><strong>Created By:</strong> {dream.createdByUsername}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
