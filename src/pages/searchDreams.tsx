"use client";

import { useState } from "react";
import styles from "@/styles/SearchDreams.module.css";

import Navbar from "@/components/navbar";
import BackButton from "@/components/backButton";

import { db } from "@/lib/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import Head from "next/head";

interface DreamTeam {
  id: string;
  title: string;
  pick1: string;
  pick2: string;
  pick3: string;
  category: string;
  categoryLower: string;
  createdByUsername: string;
  cosignedBy?: string[]; // optional array of usernames
}


export default function SearchDreams() {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<DreamTeam[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");


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
        dream.title?.toLowerCase().includes(queryStr.toLowerCase())
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
      const teamsRef = collection(db, "teams");
      const querySnapshot = await getDocs(teamsRef);

      let dreams = querySnapshot.docs.map((doc) => ({
        ...(doc.data() as DreamTeam),
        id: doc.id
      }));

      if (category.toLowerCase() === "most popular") {
        dreams = dreams
          .filter((dream) => dream.cosignedBy && dream.cosignedBy.length > 0)
          .sort((a, b) => (b.cosignedBy?.length || 0) - (a.cosignedBy?.length || 0));
      } else {
        dreams = dreams.filter(
          (dream) => dream.categoryLower?.toLowerCase() === category.toLowerCase()
        );
      }

      setResults(dreams);
    } catch (error) {
      console.error("Error fetching dreams:", error);
    }

    setLoading(false);
  };

  const categories = [
    "most popular",
    "sports",
    "popular culture",
    "movies",
    "food",
    "tv shows",
    "music",
    "gaming",
    "other"
  ];

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
          <h1 className={styles.heroTitle}>Search Dream Teams</h1>
        </header>

        <div className={styles.searchBar}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for a dream team by title..."
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
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                fetchDreamsByCategory(cat);
              }}
              className={`${styles.categoryButton} ${selectedCategory === cat ? styles.activeButton : ""}`}
            >
              {cat
                .split(" ")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")}
            </button>

          ))}
        </div>

        <div className={styles.results}>
          {loading ? (
            <p>Loading...</p>
          ) : results.length === 0 ? (
            <p>No dream teams found.</p>
          ) : (
            <div className={styles.grid}>
              {results.map((dream) => (
                <div key={dream.id} className={styles.card}>
                  <h2 className={styles.heroSubtitle}>{dream.title}</h2>
                  <p><strong style={{ fontSize: "1.3rem" }}>✦     </strong> {dream.pick1}</p>
                  <p><strong style={{ fontSize: "1.3rem" }}>✦     </strong> {dream.pick2}</p>
                  <p><strong style={{ fontSize: "1.3rem" }}>✦     </strong> {dream.pick3}</p>
                  <p style={{marginTop: "1rem", marginBottom: "1rem"}}><em style={{ padding: "0.1rem", border: "double", borderWidth: "0.2rem", backgroundColor: "rgb(183, 183, 183)" }}>Category:</em> {dream.category}</p>
                  <p><strong>Created By:</strong> {dream.createdByUsername}</p>

                  {dream.cosignedBy && dream.cosignedBy.length > 0 && (
                    <p><em style={{ color: "#66acf7" }}>***Co-signed by:</em> {dream.cosignedBy.join(", ")}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <BackButton />
      </div>
    </div>
  );
}
