// AI-assisted: see docs/AI_LOG.md #10
import { normalizePlate } from './validators';

export const APPROVAL_STATUS = {
  pending: 'pending',
  approved: 'approved',
};

// Pure function: builds the Firestore document field by field.
// Password fields are never copied; Firebase Auth stores the password, not Firestore.
// "timestamp" is a parameter so this can be tested without Firebase.
export function buildDriverDocument(uid, personalData, vehicleData, timestamp) {
  return {
    uid,
    fullName: personalData.fullName.trim(),
    documentId: personalData.documentId.trim(),
    phone: personalData.phone.trim(),
    birthDate: personalData.birthDate,
    gender: personalData.gender,
    email: personalData.email.trim().toLowerCase(),
    language: personalData.language,
    profilePhotoUrl: null, // TEMPORARY: filled in step 9b (Cloudinary upload)
    vehicle: {
      category: vehicleData.category,
      plate: normalizePlate(vehicleData.plate),
      brand: vehicleData.brand.trim(),
      model: vehicleData.model.trim(),
      year: Number(vehicleData.year),
      color: vehicleData.color,
      capacity: Number(vehicleData.capacity),
      photoUrl: null, // TEMPORARY: filled in step 9b (Cloudinary upload)
    },
    approvalStatus: APPROVAL_STATUS.pending,
    isAvailable: false,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}