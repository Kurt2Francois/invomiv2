import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD335oKZ6JC9lVGTl7DFX-3dV7Y73ji1NE",
  authDomain: "kurtadv-8f862.firebaseapp.com",
  projectId: "kurtadv-8f862",
  storageBucket: "kurtadv-8f862.firebasestorage.app",
  messagingSenderId: "291974737791",
  appId: "1:291974737791:web:6e125de7a5678b19e0744a",
  measurementId: "G-H4EL7ZM0K3"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
