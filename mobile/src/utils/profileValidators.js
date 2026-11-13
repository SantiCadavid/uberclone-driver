// AI-assisted: see docs/AI_LOG.md #21, #22
import { GENDER_OPTIONS } from '../config/registration';
import { defaultT } from '../i18n';
import { validateFullName, validateOption, validatePhone } from './validators';

// Only these fields can be edited from the profile (same rules as the sign-up)
export function validateProfileData(data, t = defaultT) {
  return {
    fullName: validateFullName(data.fullName, t),
    phone: validatePhone(data.phone, t),
    gender: validateOption(data.gender, GENDER_OPTIONS, 'validation.gender', t),
  };
}

// Builds the Firestore update with ONLY the editable fields, already cleaned
export function buildProfileUpdate(data) {
  return {
    fullName: data.fullName.trim(),
    phone: data.phone.trim(),
    gender: data.gender,
  };
}

export function hasProfileChanges(driver, data) {
  const update = buildProfileUpdate(data);
  return Object.keys(update).some((field) => update[field] !== driver[field]);
}