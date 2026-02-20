import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBQTSgO8hoqwh6fsTKVXe4jn7-ER3r-0Cs",
  authDomain: "embraze-react-e49c0.firebaseapp.com",
  projectId: "embraze-react-e49c0",
  storageBucket: "embraze-react-e49c0.firebasestorage.app",
  messagingSenderId: "688944881832",
  appId: "1:688944881832:web:98d9d26fb9131e8f51e29d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);

// Configure auth settings
auth.useDeviceLanguage();

export const db = getFirestore(app);

export default app;
