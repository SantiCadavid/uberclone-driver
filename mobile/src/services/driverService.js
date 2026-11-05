// AI-assisted: see docs/AI_LOG.md #10
import { deleteUser } from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
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