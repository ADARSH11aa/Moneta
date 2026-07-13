import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  serverTimestamp
} from "firebase/firestore";
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider,
  OAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged, 
  signOut 
} from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC-I-QT2IuCVu9WL-WKCnS3m8zg6xaEvCg",
  authDomain: "pocketledger-62aad.firebaseapp.com",
  projectId: "pocketledger-62aad",
  storageBucket: "pocketledger-62aad.firebasestorage.app",
  messagingSenderId: "584138167361",
  appId: "1:584138167361:web:a58e474fdd17eb559ae2c0",
  measurementId: "G-1QX9T2FHPZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const appleProvider = new OAuthProvider('apple.com');

export { 
  auth,
  db, 
  googleProvider,
  appleProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged, 
  signOut,
  doc, 
  setDoc, 
  getDoc, 
  serverTimestamp
};
