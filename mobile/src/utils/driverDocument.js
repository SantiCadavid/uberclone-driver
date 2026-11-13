// AI-assisted: see docs/AI_LOG.md #10, #20
import { PRICING } from '../config/pricing';
import { isTechnicalInspectionRequired } from './documentValidators';
import { normalizePlate } from './validators';

export const APPROVAL_STATUS = {
  pending: 'pending',
  approved: 'approved',
};

// Documents section of the profile. Photos stay null until the Cloudinary upload (step 21).
// Only the Mercado Pago EMAIL is stored: never bank account or card numbers.
function buildDocumentsSection(documentsData, vehicleYear, timestamp) {
  const inspectionRequired = isTechnicalInspectionRequired(vehicleYear);
  return {
    license: {
      number: documentsData.licenseNumber.trim(),
      photoUrl: null,
      expiresAt: documentsData.licenseExpiry,
    },
    soat: { photoUrl: null, expiresAt: documentsData.soatExpiry },
    technicalInspection: inspectionRequired
      ? { required: true, photoUrl: null, expiresAt: documentsData.techExpiry }
      : { required: false, photoUrl: null, expiresAt: null },
    mercadoPagoEmail: documentsData.mercadoPagoEmail.trim().toLowerCase(),
    termsAcceptedAt: timestamp,
    // The commission the driver saw and accepted when registering
    acceptedCommissionRate: PRICING.commissionRate,
  };
}

// Pure function: builds the Firestore document field by field.
// Password fields are never copied; Firebase Auth stores the password, not Firestore.
// "timestamp" is a parameter so this can be tested without Firebase.
export function buildDriverDocument(uid, personalData, vehicleData, timestamp, documentsData = null) {
  const driver = {
    uid,
    fullName: personalData.fullName.trim(),
    documentId: personalData.documentId.trim(),
    phone: personalData.phone.trim(),
    birthDate: personalData.birthDate,
    gender: personalData.gender,
    email: personalData.email.trim().toLowerCase(),
    language: personalData.language,
    profilePhotoUrl: null, // TEMPORARY: filled in step 21 (Cloudinary upload)
    vehicle: {
      category: vehicleData.category,
      plate: normalizePlate(vehicleData.plate),
      brand: vehicleData.brand.trim(),
      model: vehicleData.model.trim(),
      year: Number(vehicleData.year),
      color: vehicleData.color,
      capacity: Number(vehicleData.capacity),
      photoUrl: null, // TEMPORARY: filled in step 21 (Cloudinary upload)
    },
    approvalStatus: APPROVAL_STATUS.pending,
    isAvailable: false,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  if (documentsData) {
    driver.documents = buildDocumentsSection(documentsData, vehicleData.year, timestamp);
  }
  return driver;
}