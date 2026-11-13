// AI-assisted: see docs/AI_LOG.md #10, #20, #25
import { PRICING } from '../config/pricing';
import { isTechnicalInspectionRequired } from './documentValidators';
import { normalizePlate } from './validators';

export const APPROVAL_STATUS = {
  pending: 'pending',
  approved: 'approved',
};

// Documents section of the profile. Photo URLs come from Cloudinary (step 21).
// Only the Mercado Pago EMAIL is stored: never bank account or card numbers.
function buildDocumentsSection(documentsData, vehicleYear, timestamp, photoUrls) {
  const inspectionRequired = isTechnicalInspectionRequired(vehicleYear);
  return {
    license: {
      number: documentsData.licenseNumber.trim(),
      photoUrl: photoUrls.licensePhotoUrl ?? null,
      expiresAt: documentsData.licenseExpiry,
    },
    soat: { photoUrl: photoUrls.soatPhotoUrl ?? null, expiresAt: documentsData.soatExpiry },
    technicalInspection: inspectionRequired
      ? { required: true, photoUrl: photoUrls.techPhotoUrl ?? null, expiresAt: documentsData.techExpiry }
      : { required: false, photoUrl: null, expiresAt: null },
    mercadoPagoEmail: documentsData.mercadoPagoEmail.trim().toLowerCase(),
    termsAcceptedAt: timestamp,
    // The commission the driver saw and accepted when registering
    acceptedCommissionRate: PRICING.commissionRate,
  };
}

// Pure function: builds the Firestore document field by field.
// Password fields and local photo paths are never copied; only https URLs from Cloudinary.
// "timestamp" is a parameter so this can be tested without Firebase.
export function buildDriverDocument(uid, personalData, vehicleData, timestamp, documentsData = null, photoUrls = {}) {
  const driver = {
    uid,
    fullName: personalData.fullName.trim(),
    documentId: personalData.documentId.trim(),
    phone: personalData.phone.trim(),
    birthDate: personalData.birthDate,
    gender: personalData.gender,
    email: personalData.email.trim().toLowerCase(),
    language: personalData.language,
    profilePhotoUrl: photoUrls.profilePhotoUrl ?? null,
    vehicle: {
      category: vehicleData.category,
      plate: normalizePlate(vehicleData.plate),
      brand: vehicleData.brand.trim(),
      model: vehicleData.model.trim(),
      year: Number(vehicleData.year),
      color: vehicleData.color,
      capacity: Number(vehicleData.capacity),
      photoUrl: photoUrls.vehiclePhotoUrl ?? null,
    },
    approvalStatus: APPROVAL_STATUS.pending,
    isAvailable: false,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  if (documentsData) {
    driver.documents = buildDocumentsSection(documentsData, vehicleData.year, timestamp, photoUrls);
  }
  return driver;
}