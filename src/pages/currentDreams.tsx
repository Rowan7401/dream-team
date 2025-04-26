"use client";

import { useEffect, useState } from "react";

import { db, auth } from "@/lib/firebaseConfig";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";

import { useParams, useRouter } from "next/navigation";
import styles from "@/styles/CurrentDreams.module.css";

interface DreamTeam {
  id: string;
  title: string;
  pick1: string;
  pick2: string;
  pick3: string;
  category: string;
}

interface User {
  username: string
}

export default function CurrentDreams() {
  const [dreams, setDreams] = useState<DreamTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState<string>("");
  const router = useRouter();
  const params = useParams();
  const uid = params?.uid as string;

  useEffect(() => {
    const fetchDreams = async () => {
      const user = auth.currentUser;
      if (!user) {
        console.log("No user found.");
        setLoading(false);
        return;
      }
  
      console.log("Fetching dreams for user:", user.uid);
  
      try {
        const q = query(collection(db, "teams"), where("uid", "==", user.uid));
        const querySnapshot = await getDocs(q);
        
        console.log("Query snapshot size:", querySnapshot.size);
  
        const dreamsList: DreamTeam[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<DreamTeam, "id">),
        }));
  
        console.log("Fetched dreams:", dreamsList);
  
        setDreams(dreamsList);
      } catch (err) {
        console.error("Error fetching dreams:", err);
      } finally {
        setLoading(false);
      }
    };
  
    fetchDreams();
  }, []);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{username}'s Dream Teams</h1>

      {loading ? (
        <p>Loading...</p>
      ) : dreams.length === 0 ? (
        <p>No dream teams found. Create one from the home page!</p>
      ) : (
        <div className={styles.grid}>
          {dreams.map((dream) => (
            <div key={dream.id} className={styles.card}>
              <h2>{dream.title}</h2>
              <p><strong>Pick 1:</strong> {dream.pick1}</p>
              <p><strong>Pick 2:</strong> {dream.pick2}</p>
              <p><strong>Pick 3:</strong> {dream.pick3}</p>
              <p><em>Category:</em> {dream.category}</p>
            </div>
          ))}
        </div>
      )}

      <button onClick={() => router.push("/dreamTeamLanding")} className={styles.button}>
        Back to Home
      </button>
    </div>
  );
}
