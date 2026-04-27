import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Only initialize if we have an API key. 
// If it's missing during SSR, we'll try again on the client.
const app = (firebaseConfig.apiKey && (typeof window !== "undefined" || getApps().length === 0))
  ? (getApps().length > 0 ? getApp() : initializeApp(firebaseConfig))
  : null;

export const auth = app ? getAuth(app) : (null as unknown as Auth);