import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
// import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyCs_XSoE231i9QqjHoQO-PqK3das0D6F4w",
    authDomain: "databynganha.firebaseapp.com",
    projectId: "databynganha",
    storageBucket: "databynganha.firebasestorage.app",
    messagingSenderId: "809415248312",
    appId: "1:809415248312:web:e0932721b0ff02a2a0e74d",
    measurementId: "G-XCG3W90KH1"
};

// Singleton pattern to avoid re-initialization error in Next.js
let app: FirebaseApp | undefined;
let db: Firestore | undefined;

try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    db = getFirestore(app);
} catch (error) {
    console.error("Firebase initialization error:", error);
}
// const auth = getAuth(app);

export { db };
