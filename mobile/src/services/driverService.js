// AI-assisted: see docs/AI_LOG.md #10, #11, #13
import { deleteUser } from 'firebase/auth';
import { doc, onSnapshot, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { getAuthErrorMessage, registerWithEmail } from './authService';
import { buildDriverDocument } from '../utils/driverDocument';

export async function registerDriver(personalData, vehicleData) {
  // 1. Create the account in Firebase Auth (the password stays there)
  const user = await registerWithEmail(personalData.email, personalData.password);

  try {
    // 2. Save the profile with the same id as the account: drivers/{uid}
    const driver = buildDriverDocument(user.uid, personalData, vehicleData, serverTimestamp());
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

export function getRegistrationErrorMessage(error) {
  if (error?.code?.startsWith('auth/')) return getAuthErrorMessage(error);
  if (error?.code === 'permission-denied') {
    return 'La base de datos rechazó el registro. Revisa las reglas de Firestore.';
  }
  if (error?.code === 'unavailable') {
    return 'Sin conexión con la base de datos. Revisa tu red e inténtalo de nuevo.';
  }
  return 'No se pudo completar el registro. Inténtalo de nuevo.';
}