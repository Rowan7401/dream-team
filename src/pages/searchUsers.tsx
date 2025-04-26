"use client";

import { useState, useEffect } from "react";
import styles from "@/styles/SearchUsers.module.css";

import { collection, query, where, getDocs, doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebaseConfig"; // Import the database and auth
import { arrayUnion } from "firebase/firestore";
import { useRouter } from "next/router"; // For navigation




export default function SearchUsers() {
  const [username, setUsername] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [showFriends, setShowFriends] = useState(false); // State to toggle between search and friends
  const router = useRouter(); // Using router for navigation

  useEffect(() => {
    if (auth.currentUser) {
      // Fetch the current user's friends when the component loads
      fetchFriends();
    }
  }, []);

  const fetchFriends = async () => {
    if (!auth.currentUser) return;

    try {
      const userDocRef = doc(db, "users", auth.currentUser.uid); // Current user document
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setFriends(userData.friends || []); // Assuming friends are an array in the user's data
      }
    } catch (err) {
      console.error("Error fetching friends:", err);
    }
  };

  const handleSearch = async () => {
    setError("");
    setResults([]);

    try {
      const q = query(collection(db, "users"), where("username", "==", username));
      const querySnapshot = await getDocs(q);

      const users: any[] = [];
      querySnapshot.forEach((doc) => users.push(doc.data()));

      if (users.length === 0) {
        setError("No users found with that username.");
      } else {
        setResults(users);
      }
    } catch (err: any) {
      setError("Error fetching users.");
      console.error(err);
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
      alert("Failed to add friend.");
    }
  };
  

  const handleViewDreams = (friendUsername: string) => {
    router.push(`/userTeams/${friendUsername}`);
  };
  

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Search Users</h1>

      {/* Search Input */}
      <div className={styles.searchBar}>
        <input
          type="text"
          placeholder="Enter username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className={styles.input}
        />
        <button onClick={handleSearch} className={styles.searchButton}>
          Search
        </button>
      </div>

      {/* Error Message */}
      {error && <p className={styles.error}>{error}</p>}

      {/* Toggle between Search Results and Friends */}
      <div className={styles.buttonContainer}>
        <button onClick={handleViewFriends} className={styles.viewFriendsButton}>
          View Friends
        </button>
      </div>

      {/* Display Friends if toggled */}
      {showFriends && (
        <div className={styles.results}>
          <h2>Your Friends</h2>
          {friends.length > 0 ? (
            friends.map((friend, index) => (
              <div key={index} className={styles.resultCard}>
                <p><strong>Username:</strong> {friend.username}</p>
                <p><strong>Email:</strong> {friend.email}</p>
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
          <h2>Search Results</h2>
          {results.length > 0 ? (
            results.map((user, index) => (
              <div key={index} className={styles.resultCard}>
                <p><strong>Username:</strong> {user.username}</p>
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
            <p>No users found.</p>
          )}
        </div>
      )}
    </div>
  );
}
