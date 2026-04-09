// ─────────────────────────────────────────────────────────────
//  firebase.js  –  paste YOUR Firebase project config here
//  Get it from: Firebase Console → Project Settings → Your Apps
// ─────────────────────────────────────────────────────────────
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBSfWKvRAUKdpS3FymGXzB8RonBfVgj8gY",
  authDomain: "spendsmart-b8598.firebaseapp.com",
  projectId: "spendsmart-b8598",
  storageBucket: "spendsmart-b8598.firebasestorage.app",
  messagingSenderId: "69075266196",
  appId: "1:69075266196:web:31593985eb0c686d6ea281",
  measurementId: "G-9PXSW85DCJ"
};
const app      = initializeApp(firebaseConfig);
export const auth     = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db       = getFirestore(app);
