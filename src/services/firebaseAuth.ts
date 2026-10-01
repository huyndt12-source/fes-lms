import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  Auth,
  UserCredential,
  Unsubscribe,
} from 'firebase/auth';
import configJson from '../../firebase-applet-config.json';

// Initialize Firebase App instance for the client
const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(configJson);

// Canonical client-side Firebase Auth instance
export const auth: Auth = getAuth(app);

/**
 * Returns the currently signed-in Firebase user, or null if none.
 */
export function getCurrentFirebaseUser(): User | null {
  return auth.currentUser;
}

/**
 * Retrieves the current Firebase ID token.
 * Passes forceRefresh to ensure freshness when required.
 */
export async function getFirebaseIdToken(forceRefresh = false): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  try {
    return await user.getIdToken(forceRefresh);
  } catch (err) {
    console.warn('[firebaseAuth] Failed to retrieve ID token:', err);
    return null;
  }
}

/**
 * Signs in using Email and Password via Firebase Authentication.
 */
export async function loginWithEmailPassword(
  email: string,
  pass: string
): Promise<UserCredential> {
  return signInWithEmailAndPassword(auth, email.trim(), pass);
}

/**
 * Creates a new user account with Email and Password via Firebase Authentication.
 */
export async function registerWithEmailPassword(
  email: string,
  pass: string
): Promise<UserCredential> {
  return createUserWithEmailAndPassword(auth, email.trim(), pass);
}

/**
 * Signs out the current Firebase user.
 */
export async function logoutFirebase(): Promise<void> {
  await signOut(auth);
}

/**
 * Subscribes to Firebase Authentication state changes.
 */
export function onAuthChange(callback: (user: User | null) => void): Unsubscribe {
  return onAuthStateChanged(auth, callback);
}

/**
 * Identifies if an authentication error is due to Email/Password provider being disabled
 * in the Firebase project settings.
 */
export function isPasswordLoginDisabledError(error: any): boolean {
  if (!error) return false;
  const code = error.code || '';
  const message = error.message || '';
  return (
    code === 'auth/operation-not-allowed' ||
    message.includes('PASSWORD_LOGIN_DISABLED') ||
    message.includes('OPERATION_NOT_ALLOWED')
  );
}
