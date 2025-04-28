"use client";

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Navbar from "@/components/navbar";
import BackButton from "@/components/backButton";
import styles from "@/styles/SearchUsers.module.css";
import '@/styles/global.css';

import { db } from "@/lib/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";

type Team = {
  id: string;
  title: string;
  pick1: string;
  pick2: string;
  pick3: string;
  category: string;
  categoryLower: string;
  uid: string;
  createdByUsername: string;
  createdAt: Date;
};

export default function UserTeamsPage() {
  const router = useRouter();
  const { username } = router.query; // Use `router.query` to get the dynamic `username` from the URL
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    if (!username) return;

    const fetchTeams = async () => {
      try {
        const teamsRef = collection(db, "teams");
        const q = query(teamsRef, where("createdByUsername", "==", username));
        const snapshot = await getDocs(q);
        const fetchedTeams: Team[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Omit<Team, "id">),
        }));
        setTeams(fetchedTeams);
      } catch (err) {
        console.error("Error fetching teams:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [username]);

  if (loading) return <p>Loading dream teams for {username}...</p>;
  if (teams.length === 0) return <p>{username} has no dream teams yet.</p>;

  return (
    <>
      <div className={styles.nav}>
          <Navbar />
      </div>  

      <div className={styles.container}>
        <header className={styles.heroHeader}>
            <h1 className={styles.heroTitle} style={{ fontSize: "3rem" }}>Dream Teams by {username}</h1>
        </header>
   
        {teams.map((team) => (
          <div key={team.id} style={{ border: "1px solid #ccc", marginBottom: "1rem", padding: "1rem" }}>
            <p>Category: {team.category}</p>
            <h2>{team.title}</h2>
            <ul>
              <li>{team.pick1}</li>
              <li>{team.pick2}</li>
              <li>{team.pick3}</li>
            </ul>
          </div>
        ))}
      </div>
      <BackButton/>
    </>
  );
}
