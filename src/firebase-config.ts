// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBLDbVDP4wYl7v3e4LbIaJKA3Uhlfydedo",
  authDomain: "real-time-collaborative-fd1eb.firebaseapp.com",
  projectId: "real-time-collaborative-fd1eb",
  storageBucket: "real-time-collaborative-fd1eb.firebasestorage.app",
  messagingSenderId: "366054097339",
  appId: "1:366054097339:web:d0d658375d9710cf61449e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);