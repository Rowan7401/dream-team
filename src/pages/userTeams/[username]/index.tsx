"use client";

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Navbar from "@/components/navbar";
import BackButton from "@/components/backButton";
import styles from "@/styles/SearchUsers.module.css";

import { db } from "@/lib/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import Head from "next/head";

type DreamTeam = {
  id: string;
  title: string;
  pick1: string;
  pick2: string;
  pick3: string;
  category: string;
  categoryLower: string;
  createdByUsername: string;
  source: "created" | "cosigned";
  cosignedBy?: string[]; // optional
};

export default function UserTeamsPage() {
  const router = useRouter();
  const { username } = router.query; // Dynamic username from URL
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState<DreamTeam[]>([]);

  useEffect(() => {
    if (!username) return;

    const fetchTeams = async () => {
      try {
        const teamsRef = collection(db, "teams");

        // Fetch teams created by the user
        const createdQuery = query(teamsRef, where("createdByUsername", "==", username));
        const createdSnapshot = await getDocs(createdQuery);

        const createdTeams: DreamTeam[] = createdSnapshot.docs.map((teamDoc) => ({
          id: teamDoc.id,
          ...(teamDoc.data() as Omit<DreamTeam, "id">),
          source: "created",
        }));

        // Fetch teams co-signed by the user
        const cosignedQuery = query(teamsRef, where("cosignedBy", "array-contains", username));
        const cosignedSnapshot = await getDocs(cosignedQuery);

        const cosignedTeams: DreamTeam[] = cosignedSnapshot.docs.map((teamDoc) => ({
          id: teamDoc.id,
          ...(teamDoc.data() as Omit<DreamTeam, "id">),
          source: "cosigned",
        }));

        // Combine and sort teams
        setTeams([...createdTeams, ...cosignedTeams]);
      } catch (err) {
        console.error("Error fetching teams:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [username]);

  const createdTeams = teams.filter((team) => team.source === "created");
  const cosignedTeams = teams.filter((team) => team.source === "cosigned");

  if (loading) return <p>Loading dream teams for {username}...</p>;
  if (teams.length === 0) return <p>{username} has no dream teams yet.</p>;
  return (
    <div className="background page-transition">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1, user-scalable=no" />
      </Head>
      <div className={styles.nav}>
        <Navbar />
      </div>

      <div className={styles.container}>
        <header className={styles.heroHeader}>
          <h1 className={styles.heroTitle} style={{ fontSize: "3rem" }}>
            Dream Teams by {username}
          </h1>
        </header>

        {createdTeams.length > 0 && (
          <>
            <h2 className={styles.sectionHeader}>
              🛠 Created by {username} ({createdTeams.length})
            </h2>
            <div className={styles.grid}>
              {createdTeams.map((team) => (
                <div key={team.id} className={styles.resultCard}>
                  <h2>{team.title}</h2>
                  <p>
                    <strong style={{ fontSize: "1.3rem" }}>✦ </strong> {team.pick1}
                  </p>
                  <p>
                    <strong style={{ fontSize: "1.3rem" }}>✦ </strong> {team.pick2}
                  </p>
                  <p>
                    <strong style={{ fontSize: "1.3rem" }}>✦ </strong> {team.pick3}
                  </p>
                  <p className={styles.heroSubtitle}>
                    <em style={{ border: "groove", borderWidth: "0.25rem", backgroundColor: "rgb(183, 183, 183)" }}>
                      Category:
                    </em>{" "}
                    {team.category}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}

        {cosignedTeams.length > 0 && (
          <>
            <h2 className={styles.sectionHeader}>
              🤝 Co-signed by {username} ({cosignedTeams.length})
            </h2>
            <div className={styles.grid}>
              {cosignedTeams.map((team) => (
                <div key={team.id} className={styles.resultCard}>
                  <h2>{team.title}</h2>
                  <p>
                    <strong style={{ fontSize: "1.3rem" }}>✦ </strong> {team.pick1}
                  </p>
                  <p>
                    <strong style={{ fontSize: "1.3rem" }}>✦ </strong> {team.pick2}
                  </p>
                  <p>
                    <strong style={{ fontSize: "1.3rem" }}>✦ </strong> {team.pick3}
                  </p>
                  <p className={styles.heroSubtitle}>
                    <em style={{ border: "groove", borderWidth: "0.25rem", backgroundColor: "rgb(183, 183, 183)" }}>
                      Category:
                    </em>{" "}
                    {team.category}
                  </p>
                  <p>
                    <strong>Created By:</strong> {team.createdByUsername}
                  </p>
                  {team.cosignedBy && team.cosignedBy.length > 0 && (
                    <p>
                      <em style={{ color: "#66acf7" }}>Co-signed by:</em> {team.cosignedBy.join(", ")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        <p>
          <strong>Total Dream Teams:</strong> {teams.length}
        </p>
      </div>

      <BackButton />
    </div>
  );
}