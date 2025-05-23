import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";  // Use this for Firebase v9+
import { getFirestore } from "firebase/firestore";
import { GoogleAuthProvider } from "firebase/auth";  // For Google auth provider


import { getAnalytics } from "firebase/analytics";

// Firebase config using env variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID!, // Optional
};

const app = initializeApp(firebaseConfig); // Initialize Firebase
const auth = getAuth(app);  // Use getAuth for Firebase authentication
const db = getFirestore(app); // Firestore database reference
const provider = new GoogleAuthProvider(); // For Google Auth provider


let analytics;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

export { app, auth, db, provider, analytics };
