import { initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth, signInAnonymously } from 'firebase/auth';
import {
  connectFirestoreEmulator, initializeFirestore, persistentLocalCache, persistentMultipleTabManager,
} from 'firebase/firestore';
import { firebaseConfig, useEmulator } from './firebase-config';

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

// Offline: writes are queued in IndexedDB and sent when back online (design D8).
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
});

if (useEmulator) {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
}

/** Invisible anonymous session; the identity is the name key, not this uid (design D6). */
export async function ensureSignedIn(): Promise<void> {
  await auth.authStateReady();
  if (!auth.currentUser) await signInAnonymously(auth);
}
