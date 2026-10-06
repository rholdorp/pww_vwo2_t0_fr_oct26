// Firebase web config. These values are public by design; access is
// controlled by firestore.rules. Fill in after creating the project (task 5.1).
import type { FirebaseOptions } from 'firebase/app';

export const firebaseConfig: FirebaseOptions = {
  apiKey: 'demo-key',
  authDomain: 'demo-trainer.firebaseapp.com',
  projectId: 'demo-trainer',
  appId: 'demo-app',
};

/** Use the local emulators (npm run emulators) for a demo project or when asked. */
export const useEmulator =
  firebaseConfig.projectId?.startsWith('demo-') || import.meta.env.VITE_USE_EMULATOR === 'true';
