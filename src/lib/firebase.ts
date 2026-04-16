import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC_BugJq4oy1_4-ccQgM3NgzFBmBJU2kJI",
  authDomain: "rf-tech-solutions.firebaseapp.com",
  projectId: "rf-tech-solutions",
  storageBucket: "rf-tech-solutions.firebasestorage.app",
  messagingSenderId: "880464546151",
  appId: "1:880464546151:web:2244986fdeaa370d80c7c2"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Site Configuration
export const siteId = "siteC";
export const siteAdminEmail = "shehussubnet@gmail.com";
