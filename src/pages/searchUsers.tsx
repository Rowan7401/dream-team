"use client";

import { useState, useEffect } from "react";
import styles from "@/styles/SearchUsers.module.css";


import { collection, query, where, getDocs, doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebaseConfig"; // Import the database and auth
import { arrayUnion } from "firebase/firestore";

import Navbar from "@/components/navbar";
import BackButton from "@/components/backButton";

import { useRouter } from "next/navigation"; // App Router version

import Head from "next/head";




export default function SearchUsers() {
  const [searchUsername, setSearchUsername] = useState("");

  const [results, setResults] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showFriends, setShowFriends] = useState(false); // State to toggle between search and friends
  const router = useRouter(); // Using router for navigation

  const getTeamCounts = async (uName: string) => {
    const teamsRef = collection(db, "teams");

    const createdQuery = query(teamsRef, where("createdByUsername", "==", uName));
    const createdSnapshot = await getDocs(createdQuery);

    const cosignedQuery = query(teamsRef, where("cosignedBy", "array-contains", uName));
    const cosignedSnapshot = await getDocs(cosignedQuery);

    return {
      authored: createdSnapshot.size,
      cosigned: cosignedSnapshot.size,
    };
  };



  useEffect(() => {
    if (error) {
      const timeout = setTimeout(() => {
        setError(null);
      }, 3000); // 3 seconds

      return () => clearTimeout(timeout);
    }
  }, [error]);



  useEffect(() => {
    if (auth.currentUser) {
      // Fetch the current user's friends when the component loads
      fetchFriends();
    }
  }, []);

  const fetchFriends = async () => {
    if (!auth.currentUser) return;

    try {
      const userDocRef = doc(db, "users", auth.currentUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const friendsArray = userData?.friends || [];

        const enrichedFriends = await Promise.all(
          friendsArray.map(async (friend: any) => {
            const counts = await getTeamCounts(friend.username);
            return { ...friend, ...counts };
          })
        );

        setFriends(enrichedFriends);
      }
    } catch (err) {
      console.error("Error fetching friends:", err);
    }
  };


  const handleSearch = async () => {
    setError("");
    setResults([]);

    try {
      if (searchUsername.length === 0) {
        setError("Invalid (empty) search");
        return;
      }

      type UserData = {
        uid: string;
        username: string;
        email?: string;
      };

      const q = query(collection(db, "users"), where("username", "==", searchUsername));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError("No users found with that username.");
        return;
      }

      const users: UserData[] = querySnapshot.docs.map((doc) => ({
        uid: doc.id,
        ...(doc.data() as Omit<UserData, "uid">),
      }));

      const enrichedUsers = await Promise.all(
        users.map(async (user) => {
          const counts = await getTeamCounts(user.username);
          return { ...user, ...counts };
        })
      );




      setShowFriends(false);
      setResults(enrichedUsers);
    } catch (err: any) {
      console.error("Error fetching users:", err);
      setError("Error fetching users.");
    }
  };


  const handleViewFriends = () => {
    setShowFriends(true);
  };

  const handleAddFriend = async (friend: any) => {
    if (!auth.currentUser) return;

    const userDocRef = doc(db, "users", auth.currentUser.uid);

    try {
      // Fetch the user document
      const userDoc = await getDoc(userDocRef);
      const userData = userDoc.data();

      // Check if friends field exists and is an array
      const friendsList = userData?.friends || []; // Default to an empty array if friends doesn't exist

      const isFriendAlready = friendsList.some((f: any) => f.uid === friend.uid);

      if (isFriendAlready) {
        alert("This user is already your friend!");
        return;
      }

      // If not, add them to the friends list
      await updateDoc(userDocRef, {
        friends: arrayUnion({
          uid: friend.uid,
          username: friend.username,
          email: friend.email
        })
      });

      alert(`${friend.username} has been added as a friend!`);
      fetchFriends(); // Re-fetch friends to update the list
    } catch (err) {
      console.error("Error adding friend:", err);
      setError("Failed to add friend.");
    }
  };


  const handleViewDreams = (friendUsername: string) => {
    router.push(`/userTeams/${friendUsername}`);
  };


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
          <h1 className={styles.heroTitle}>Search Users</h1>
        </header>

        {error && (
          <>
            <p className={`${styles.userSearchError} ${!error ? styles.userSearchErrorHidden : ""}`}>
              {error}
            </p>

            {error === "Invalid (empty) search" && (
              <p className={`${styles.userSearchErrorMain} ${!error ? styles.userSearchErrorMainHidden : ""}`}>
                Please type a valid Username or a partial Username.
              </p>
            )}
          </>
        )}


        <div className={styles.searchBar}>
          <input
            className={styles.searchBar}
            type="text"
            placeholder="Enter username"
            value={searchUsername}
            onChange={(e) => setSearchUsername(e.target.value.toLowerCase())}
          />

          <button onClick={handleSearch} className={styles.searchButton}>
            Search
          </button>
        </div>

        {/* Toggle between Search Results and Friends */}
        <div className={styles.buttonContainer}>
          <button onClick={handleViewFriends} className={styles.viewFriendsButton}>
            View Friends
          </button>
        </div>

        {/* Display Friends if toggled */}
        {showFriends && (
          <div className={styles.results}>
            <h2 className={styles.h2}>Your Friends</h2>
            {friends.length > 0 ? (
              friends.map((friend, index) => (
                <div key={index} className={styles.resultCard}>
                  <p><strong>Username:</strong> {friend.username}</p>
                  <p><strong>Email:</strong> {friend.email}</p>
                  <p><strong>Dream Teams Authored:</strong> {friend.authored ?? "Loading..."}</p>
                  <p><strong>Dream Teams Co-signed:</strong> {friend.cosigned ?? "Loading..."}</p>

                  <button
                    onClick={() => handleViewDreams(friend.username)} // Use friend's username here
                    className={styles.viewDreamTeamsButton}
                  >
                    View Dream Teams
                  </button>
                </div>
              ))
            ) : (
              <p>You have no friends yet.</p>
            )}
          </div>
        )}

        {/* Display Search Results if not showing friends */}
        {!showFriends && (
          <div className={styles.results}>
            <h2 className={styles.h2}>Search Results</h2>
            {results.length > 0 ? (
              results.map((user, index) => (
                <div key={index} className={styles.resultCard}>
                  <p><strong>Username:</strong> {user.username}</p>
                  <p><strong>Dream Teams Authored:</strong> {user.authored ?? "Loading..."}</p>
                  <p><strong>Dream Teams Co-signed:</strong> {user.cosigned ?? "Loading..."}</p>

                  <button onClick={() => handleAddFriend(user)} className={styles.addFriendButton}>
                    Add Friend
                  </button>
                  <button
                    onClick={() => handleViewDreams(user.username)} // Use username for dream teams
                    className={styles.viewDreamTeamsButton}
                  >
                    View Dream Teams
                  </button>
                </div>
              ))
            ) : (
              <p className={styles.h3}>No users found.</p>
            )}
          </div>
        )}
        <BackButton />
      </div>

    </div >
  );
}
