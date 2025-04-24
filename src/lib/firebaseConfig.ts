import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth"; // For Firebase Authentication
import { getFirestore } from "firebase/firestore"; // For Firestore
import { getAnalytics } from "firebase/analytics"; // For Analytics (client-side only)

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAXZkUfsfZ-aawm2SRdb1qeq1dKkhHVEYY",
  authDomain: "dream-team-66780.firebaseapp.com",
  projectId: "dream-team-66780",
  storageBucket: "dream-team-66780.firebasestorage.app",
  messagingSenderId: "268602110439",
  appId: "1:268602110439:web:bece72a25b5b9adf288d42",
  measurementId: "G-GQXHV8THNQ", // Optional if you're using analytics
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
const auth = getAuth(app);

// Initialize Firestore Database
const db = getFirestore(app);

// Initialize Google Auth Provider
const provider = new GoogleAuthProvider();

// Initialize Analytics only on the client-side
let analytics;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

export { app, auth, db, provider, analytics };
