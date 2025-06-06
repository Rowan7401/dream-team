"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { auth, db } from "@/lib/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import styles from "@/styles/Profile.module.css";
import Navbar from "@/components/navbar";
import Head from "next/head";

export default function ProfilePage() {
    const [userData, setUserData] = useState<{ email: string; username: string; userId: string } | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserData = async () => {
            setLoading(true);
            try {
                if (!auth.currentUser) {
                    router.push("/");
                    return;
                }

                const userDocRef = doc(db, "users", auth.currentUser.uid);
                const userDoc = await getDoc(userDocRef);

                if (userDoc.exists()) {
                    const data = userDoc.data();
                    setUserData({
                        email: data.email,
                        username: data.username,
                        userId: data.uid,
                    });
                } else {
                    setError("User document does not exist");
                }
            } catch (err) {
                setError("Error fetching user data: " + err);
            } finally {
                setLoading(false); // Always runs now
            }
        };

        fetchUserData();
    }, [router]);





    return (
        <div className="background page-transition">
            <Head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1, user-scalable=no" />
            </Head>
            <div className={styles.nav}>
                <Navbar />
            </div>
            <div className={styles.vert}>
                <Image
                    src="/dream-team-logo.jpg"
                    alt="Team Illustration"
                    width={300}
                    height={200}
                    className={styles.logo}
                />
            </div>

            <>
                <p className={`${styles.searchError} ${error ? styles.searchErrorVisible : ""}`}>
                    {error}
                </p>

                <p className={`${styles.searchErrorMain} ${error === "User document does not exist" ? styles.searchErrorMainVisible : ""}`}>
                    Please signup or login again to authenticate your account access.
                </p>
            </>

            {loading ? (
                <p>Loading...</p>
            ) : userData === null ? (
                <p>No user data found.</p>
            ) : (
                <div className={styles.grid}>
                    <div className={styles.container}>

                        <div className={styles.card}>
                            <h1 className={styles.title}>Profile</h1>
                            <p className={styles.info}><span>Email:</span> {userData.email}</p>
                            <p className={styles.info}><span>Username:</span> {userData.username}</p>
                            <p className={styles.infoId}><span className={styles.h2}>User ID:</span> {userData.userId}</p>
                        </div>

                    </div>
                </div>
            )}


        </div>
    );
}
