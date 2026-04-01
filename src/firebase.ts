import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfigFile from '../firebase-applet-config.json';

// Use the local JSON file (AI Studio) directly
const firebaseConfig = {
  apiKey: firebaseConfigFile.apiKey,
  authDomain: firebaseConfigFile.authDomain,
  projectId: firebaseConfigFile.projectId,
  storageBucket: (firebaseConfigFile as any).storageBucket,
  messagingSenderId: (firebaseConfigFile as any).messagingSenderId,
  appId: firebaseConfigFile.appId,
  firestoreDatabaseId: firebaseConfigFile.firestoreDatabaseId
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
