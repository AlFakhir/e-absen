
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC9d2lZDdXYemVG4donrv2zeAlseKrt7_Y",
  authDomain: "gen-lang-client-0753239052.firebaseapp.com",
  projectId: "gen-lang-client-0753239052",
  storageBucket: "gen-lang-client-0753239052.firebasestorage.app",
  messagingSenderId: "461247787699",
  appId: "1:461247787699:web:d7d9c06b64d3449dd2f6c6",
  measurementId: "G-084VHPCY65"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const db = getFirestore(app);

export { app, analytics, db };
