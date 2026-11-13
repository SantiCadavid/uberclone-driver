// AI-assisted: see docs/AI_LOG.md #10, #11, #13, #20, #21, #22, #25
import { deleteUser } from 'firebase/auth';
import { doc, onSnapshot, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { getAuthErrorMessage, logout, registerWithEmail } from './authService';
import { uploadRegistrationPhotos } from './uploadService';
import { buildDriverDocument } from '../utils/driverDocument';
import { defaultT } from '../i18n';

// onProgress({ done, total }) reports the photo upload to the screen
export async function registerDriver(personalData, vehicleData, documentsData, { onProgress } = {}) {
  // 1. Create the account in Firebase Auth first: it validates the email before uploading anything
  const user = await registerWithEmail(personalData.email, personalData.password);

  try {
    // 2. Upload the photos to Cloudinary (in parallel)
    const photoUrls = await uploadRegistrationPhotos(personalData, vehicleData, documentsData, onProgress);
    // 3. Save the profile with the same id as the account: drivers/{uid}
    const driver = buildDriverDocument(
      user.uid,
      personalData,
      vehicleData,
      serverTimestamp(),
      documentsData,
      photoUrls,
    );
    await setDoc(doc(db, 'drivers', user.uid), driver);
    return user.uid;
  } catch (error) {
    // Roll back: an account without its profile would be useless
    await deleteUser(user).catch(() => {});
    throw error;
  }
}

// Real-time listener on drivers/{uid}. Returns the unsubscribe function for useEffect cleanup.
// onData receives the driver object, or null when the document does not exist.
export function subscribeToDriver(uid, onData, onError) {
  return onSnapshot(
    doc(db, 'drivers', uid),
    (snapshot) => onData(snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null),
    onError,
  );
}

export function setDriverAvailability(uid, isAvailable) {
  return updateDoc(doc(db, 'drivers', uid), {
    isAvailable,
    updatedAt: serverTimestamp(),
  });
}

export function updateDriverLocation(uid, { latitude, longitude }) {
  return updateDoc(doc(db, 'drivers', uid), {
    location: { lat: latitude, lng: longitude, updatedAt: serverTimestamp() },
  });
}

// Profile edits: callers send only editable fields (see utils/profileValidators.js) or the language.
// The Firestore rules (step 22) block approvalStatus, balance and other protected fields.
export function updateDriverProfile(uid, changes) {
  return updateDoc(doc(db, 'drivers', uid), {
    ...changes,
    updatedAt: serverTimestamp(),
  });
}

// Never leave a driver "available" after logging out
export async function signOutDriver(uid, isAvailable) {
  if (uid && isAvailable) await setDriverAvailability(uid, false);
  await logout();
}

const UPLOAD_ERROR_KEYS = {
  'upload-not-configured': 'upload.error.notConfigured',
  'upload-read': 'upload.error.read',
  'upload-timeout': 'upload.error.timeout',
  'upload-network': 'upload.error.network',
  'upload-failed': 'upload.error.failed',
};

export function getRegistrationErrorMessage(error, t = defaultT) {
  if (error?.code?.startsWith('auth/')) return getAuthErrorMessage(error, t);
  if (UPLOAD_ERROR_KEYS[error?.message]) return t(UPLOAD_ERROR_KEYS[error.message]);
  if (error?.code === 'permission-denied') return t('register.error.permission');
  if (error?.code === 'unavailable') return t('register.error.network');
  return t('register.error.unknown');
}