import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBQTSgO8hoqwh6fsTKVXe4jn7-ER3r-0Cs",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "embraze-react-e49c0.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "embraze-react-e49c0",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "embraze-react-e49c0.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "688944881832",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:688944881832:web:98d9d26fb9131e8f51e29d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);

// Configure auth settings
auth.useDeviceLanguage();

export const db = getFirestore(app);

export default app;
