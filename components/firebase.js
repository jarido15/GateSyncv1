/* eslint-disable quotes */
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDIDaprylwOHheSTlQSGxofwnxpVM-Gd5k",
  authDomain: "gatesync-25810.firebaseapp.com",
  projectId: "gatesync-25810",
  storageBucket: "gatesync-25810.appspot.com",
  messagingSenderId: "659285679162",
  appId: "1:659285679162:web:3523a135c82acedc172903",
  measurementId: "G-EFGGWTR6KS",
};

// Ensure Firebase initializes only once
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Initialize Auth with AsyncStorage for persistence
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (error) {
  // If already initialized, use getAuth()
  auth = getAuth(app);
}

// Initialize Firestore
const db = getFirestore(app);

// Export Firebase instances
export { app, db, auth };
