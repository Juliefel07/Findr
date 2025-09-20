
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";



const firebaseConfig = {
  apiKey: "AIzaSyBNnFvwrCdXynsngfHo4_yGj-q64-16caU",
  authDomain: "findr-3aad9.firebaseapp.com",
  projectId: "findr-3aad9",
  storageBucket: "findr-3aad9.firebasestorage.app",
  messagingSenderId: "1072392443307",
  appId: "1:1072392443307:web:17931f5dd5a9f814222eee"
};


const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

