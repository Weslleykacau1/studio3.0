'use client';
import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

declare global {
  var __firebase_config: string | undefined;
}

const firebaseConfigStr = typeof window !== 'undefined' ? window.__firebase_config : undefined;
let firebaseApp: FirebaseApp;
let auth: Auth;
let db: Firestore;

try {
  const firebaseConfig = firebaseConfigStr ? JSON.parse(firebaseConfigStr) : {};
  if (Object.keys(firebaseConfig).length > 0) {
      if (!getApps().length) {
          firebaseApp = initializeApp(firebaseConfig);
      } else {
          firebaseApp = getApp();
      }
      auth = getAuth(firebaseApp);
      db = getFirestore(firebaseApp);
  }
} catch (error) {
  console.error("Firebase initialization error:", error);
}

export { auth, db };
