// AI-assisted: see docs/AI_LOG.md #4
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Expo only replaces env vars written literally as process.env.EXPO_PUBLIC_*
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

if (!firebaseConfig.projectId) {
  console.error('Missing Firebase config: check mobile/.env and restart with --clear');
}

// Reuse the existing app on hot reload instead of initializing twice
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);