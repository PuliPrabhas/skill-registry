import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
const firebaseConfig = {
 apiKey: "AIzaSyBuzULSqpFx8Yn8PbciAjvEOY59LCDK26Y",
  authDomain: "skill-registry-2a682.firebaseapp.com",
  databaseURL:"https://skill-registry-2a682-default-rtdb.firebaseio.com",
  projectId: "skill-registry-2a682",
  storageBucket: "skill-registry-2a682.firebasestorage.app",
  messagingSenderId: "154307258132",
  appId: "1:154307258132:web:fbbc7066ccc7601a28c401",
  measurementId: "G-XT8BPJJGXP"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
