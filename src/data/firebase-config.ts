// Firebase web config. These values are public by design; access is
// controlled by firestore.rules.
import type { FirebaseOptions } from 'firebase/app';

/** Local development uses the emulators (npm run emulators), see .env.development. */
export const useEmulator = import.meta.env.VITE_USE_EMULATOR === 'true';

const production: FirebaseOptions = {
  apiKey: 'AIzaSyCLkf7z0ahA3Tl41zfzeUgV8F9PtIEMYRw',
  authDomain: 'frans-trainer-vwo2-t0-oct26.firebaseapp.com',
  projectId: 'frans-trainer-vwo2-t0-oct26',
  storageBucket: 'frans-trainer-vwo2-t0-oct26.firebasestorage.app',
  messagingSenderId: '262829577439',
  appId: '1:262829577439:web:7e3f2e32c69f184136056a',
};

export const firebaseConfig: FirebaseOptions = useEmulator
  ? { ...production, projectId: 'demo-trainer' }
  : production;
