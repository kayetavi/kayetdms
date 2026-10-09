// /firebase/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAJFEQbD9Q-hixTAWuwRgE3M7yfm_InUZM",
  authDomain: "loginapp-feb72.firebaseapp.com",
  projectId: "loginapp-feb72",
  storageBucket: "loginapp-feb72.appspot.com",
  messagingSenderId: "772097380124",
  appId: "1:772097380124:web:86e589be7eb612ff",
  measurementId: ""
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db, firebaseConfig };
