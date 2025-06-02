"use client";

import { useEffect, useState } from "react";

import { db, auth } from "@/lib/firebaseConfig";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";

import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import BackButton from "@/components/backButton";
import styles from "@/styles/CurrentDreams.module.css";
import Head from "next/head";

interface DreamTeam {
  id: string;
  title: string;
  pick1: string;
  pick2: string;
  pick3: string;
  category: string;
  createdByUsername: string
  cosignedBy?: string[];
  source: "created" | "cosigned";
}


interface User {
  username: string
}

export default function CurrentDreams() {
  const [dreams, setDreams] = useState<DreamTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState<string>("");
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

      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);


        if (!userDoc.exists()) {
          console.log("User document not found.");
          setLoading(false);
          return;
        }

        const userData = userDoc.data() as User;
        const username = userData.username;
        setUsername(username);

        const teamsRef = collection(db, "teams");

        const querySnapshot = await getDocs(teamsRef);

        const createdQuery = query(teamsRef, where("uid", "==", user.uid));
        const cosignedQuery = query(teamsRef, where("cosignedBy", "array-contains", username));

        const [createdSnapshot, cosignedSnapshot] = await Promise.all([
          getDocs(createdQuery),
          getDocs(cosignedQuery),
        ]);

        const createdTeams: DreamTeam[] = createdSnapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Omit<DreamTeam, "id" | "source">),
          source: "created",
        }));

        let dreams = querySnapshot.docs.map((doc) => ({
          ...(doc.data() as DreamTeam),
          id: doc.id
        }));

        dreams = dreams
          .filter((dream) => dream.cosignedBy && dream.cosignedBy.length > 0)
          .sort((a, b) => (b.cosignedBy?.length || 0) - (a.cosignedBy?.length || 0));

        const cosignedTeams: DreamTeam[] = cosignedSnapshot.docs
          .filter(doc => doc.data().uid !== user.uid) // avoid duplicates
          .map(doc => ({
            id: doc.id,
            ...(doc.data() as Omit<DreamTeam, "id" | "source">),
            source: "cosigned",
          }));

        setDreams([...createdTeams, ...cosignedTeams]);
      } catch (err) {
        console.error("Error fetching dreams:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDreams();
  }, []);




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
          <h1 className={styles.heroTitle}>{username}'s Dream Teams</h1>
        </header>

        {loading ? (
          <div className={styles.results}>
            <p>Loading...</p>
          </div>
        ) : (
          <>
            {dreams.length === 0 && (
              <p className={styles.heroSubtitle}>
                No dream teams found. Create one from the home page!
              </p>
            )}

            {dreams.filter((d) => d.source === "created").length > 0 && (
              <>
                <h2 className={styles.sectionHeader}>🛠 Created by You</h2>
                <div className={styles.grid}>
                  {dreams
                    .filter((d) => d.source === "created")
                    .map((dream) => (
                      <div key={dream.id} className={styles.card}>
                        <h2>{dream.title}</h2>
                        <p><strong style={{ fontSize: "1.3rem" }}>✦ </strong> {dream.pick1}</p>
                        <p><strong style={{ fontSize: "1.3rem" }}>✦ </strong> {dream.pick2}</p>
                        <p><strong style={{ fontSize: "1.3rem" }}>✦ </strong> {dream.pick3}</p>
                        <p className={styles.heroSubtitle}>
                          <em style={{
                            border: "groove",
                            borderWidth: "0.25rem",
                            backgroundColor: "rgb(183, 183, 183)"
                          }}>
                            Category:
                          </em> {dream.category}
                        </p>
                      </div>
                    ))}
                </div>
              </>
            )}

            {dreams.filter((d) => d.source === "cosigned").length > 0 && (
              <>
                <h2 className={styles.sectionHeader}>🤝 Co-signed by You</h2>
                <div className={styles.grid}>
                  {dreams
                    .filter((d) => d.source === "cosigned")
                    .map((dream) => (
                      <div key={dream.id} className={styles.card}>
                        <h2>{dream.title}</h2>
                        <p><strong style={{ fontSize: "1.3rem" }}>✦ </strong> {dream.pick1}</p>
                        <p><strong style={{ fontSize: "1.3rem" }}>✦ </strong> {dream.pick2}</p>
                        <p><strong style={{ fontSize: "1.3rem" }}>✦ </strong> {dream.pick3}</p>
                        <p className={styles.heroSubtitle}>
                          <em style={{
                            border: "groove",
                            borderWidth: "0.25rem",
                            backgroundColor: "rgb(183, 183, 183)"
                          }}>
                            Category:
                          </em> {dream.category}
                        </p>
                        <p><strong>Created By:</strong> {dream.createdByUsername}</p>
                        {dream.cosignedBy && dream.cosignedBy.length > 0 && (
                          <p><em style={{ color: "#66acf7" }}>***Co-signed by:</em> {dream.cosignedBy.join(", ")}</p>
                        )}
                      </div>
                    ))}
                </div>
              </>
            )}
          </>
        )}

        <BackButton />
      </div>
    </div>
  );

}
