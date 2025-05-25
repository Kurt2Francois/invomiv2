import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

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
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

export default app;
