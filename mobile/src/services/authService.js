// AI-assisted: see docs/AI_LOG.md #6, #21
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth } from './firebase';
import { defaultT } from '../i18n';

// Returns the unsubscribe function so the caller can stop listening (useEffect cleanup)
export function subscribeToAuthChanges(callback) {
  return onAuthStateChanged(auth, callback);
}

export async function loginWithEmail(email, password) {
  const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
  return credential.user;
}

export async function registerWithEmail(email, password) {
  const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
  return credential.user;
}

export function logout() {
  return signOut(auth);
}

const AUTH_ERROR_KEYS = {
  'auth/invalid-credential': 'auth.invalidCredential',
  'auth/invalid-email': 'auth.invalidEmail',
  'auth/user-disabled': 'auth.userDisabled',
  'auth/too-many-requests': 'auth.tooManyRequests',
  'auth/network-request-failed': 'auth.network',
  'auth/email-already-in-use': 'auth.emailInUse',
  'auth/weak-password': 'auth.weakPassword',
};

// Translates Firebase error codes into clear messages, in the app language
export function getAuthErrorMessage(error, t = defaultT) {
  return t(AUTH_ERROR_KEYS[error?.code] ?? 'auth.unknown');
}