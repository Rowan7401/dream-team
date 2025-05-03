"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { auth, db } from "@/lib/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import styles from "@/styles/Profile.module.css";
import Navbar from "@/components/navbar";

export default function ProfilePage() {
    const [userData, setUserData] = useState<{ email: string; username: string; userId: string } | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchUserData = async () => {
            if (!auth.currentUser) {
                router.push("/");
                return;
            }

            const currentUser = auth.currentUser;

            try {
                const userDocRef = doc(db, "users", currentUser.uid);
                const userDoc = await getDoc(userDocRef);

                if (userDoc.exists()) {
                    const data = userDoc.data();
                    setUserData({
                        email: data.email,
                        username: data.username,
                        userId: data.uid,
                    });
                } else {
                    console.error("User document does not exist");
                }
            } catch (err) {
                console.error("Error fetching user data:", err);
            }
        };

        fetchUserData();
    }, [router]);

    if (!userData) {
        return <div className={styles.loading}>Loading...</div>;
    }

    return (
        <>
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

            <div className={styles.container}>

                <div className={styles.card}>
                    <h1 className={styles.title}>Profile</h1>
                    <p className={styles.info}><span>Email:</span> {userData.email}</p>
                    <p className={styles.info}><span>Username:</span> {userData.username}</p>
                    <p className={styles.infoId}><span className={styles.h2}>User ID:</span> {userData.userId}</p>
                </div>

            </div>
        </>
    );
}
