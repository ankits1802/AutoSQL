
// This file is no longer used for core database operations which now use SQLite.
// Kept to avoid breaking other potential Firebase service integrations if any exist or are planned.
// If no other Firebase services (Auth, Storage, etc.) are in use, this file can be safely deleted.
// Consider removing firebase dependency from package.json if completely unused.

// import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
// import { getFirestore, type Firestore } from 'firebase/firestore';

// const firebaseConfig = {
//   apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
//   authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
//   projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
//   storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
//   appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
// };

// let app: FirebaseApp | undefined = undefined;
// let db: Firestore | undefined = undefined;

// if (typeof window !== 'undefined' || process.env.FIREBASE_PROJECT_ID) { // Check if config is available
//   if (getApps().length === 0) {
//     if (firebaseConfig.projectId) { // Ensure projectId is available
//        app = initializeApp(firebaseConfig);
//        db = getFirestore(app);
//     } else {
//        console.warn("Firebase projectId is not configured. Firestore will not be initialized.");
//     }
//   } else {
//     app = getApps()[0];
//     db = getFirestore(app);
//   }
// } else {
//     console.warn("Firebase config not available. Firestore not initialized (server-side pre-render or missing env vars).");
// }


// export { app, db }; // Export possibly undefined app and db
