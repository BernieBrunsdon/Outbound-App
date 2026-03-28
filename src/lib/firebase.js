import { initializeApp, getApps, getApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

/**
 * Configure via .env.local (Vite). Keys must be prefixed with VITE_ to be exposed to the client.
 * Firebase Console → Project settings → Your apps (Web).
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

if (import.meta.env.DEV) {
  const missing = []
  if (!firebaseConfig.apiKey) missing.push('VITE_FIREBASE_API_KEY')
  if (!firebaseConfig.projectId) missing.push('VITE_FIREBASE_PROJECT_ID')
  if (!firebaseConfig.appId) missing.push('VITE_FIREBASE_APP_ID')
  if (missing.length) {
    console.warn(
      `[Firebase] Missing env: ${missing.join(', ')}. ` +
        'Fix: (1) Save .env.local to disk in the project root (Cmd/Ctrl+S). ' +
        '(2) Use names exactly like VITE_FIREBASE_PROJECT_ID. ' +
        '(3) Stop and run npm run dev again. See .env.example.'
    )
  }
}

function getFirebaseApp() {
  if (getApps().length > 0) {
    return getApp()
  }
  return initializeApp(firebaseConfig)
}

export const app = getFirebaseApp()
export const db = getFirestore(app)

/** True when core config is present (useful for conditional UI). */
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId
)
