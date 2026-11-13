// AI-assisted: see docs/AI_LOG.md #25
import { File } from 'expo-file-system';
import { CLOUDINARY_CONFIG } from '../config/cloudinary';
import { collectRegistrationPhotos, getImageFileInfo } from '../utils/uploadHelpers';
import { isTechnicalInspectionRequired } from '../utils/documentValidators';

// Reads the local photo only at upload time, so no big base64 strings live in the app state
async function readAsDataUri(uri) {
  try {
    const base64 = await new File(uri).base64();
    return `data:${getImageFileInfo(uri).type};base64,${base64}`;
  } catch (readError) {
    if (__DEV__) console.warn('Photo read error:', readError?.message);
    throw new Error('upload-read');
  }
}

// Uploads one local photo with the unsigned preset and returns its https URL.
// The photo travels as a base64 data URI inside JSON: the fetch of this Expo version does not
// support React Native's FormData file parts ("Unsupported FormDataPart implementation").
// Errors: upload-not-configured | upload-read | upload-timeout | upload-network | upload-failed
export async function uploadImage(uri) {
  const { cloudName, uploadPreset, uploadTimeoutMs } = CLOUDINARY_CONFIG;
  if (!cloudName || !uploadPreset) throw new Error('upload-not-configured');

  const file = await readAsDataUri(uri);

  // AbortController really cancels the upload when time runs out
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), uploadTimeoutMs);
  let response;
  try {
    response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file, upload_preset: uploadPreset }),
      signal: controller.signal,
    });
  } catch (requestError) {
    if (__DEV__) console.warn('Cloudinary request error:', requestError?.name, requestError?.message);
    throw new Error(requestError?.name === 'AbortError' ? 'upload-timeout' : 'upload-network');
  } finally {
    clearTimeout(timer);
  }

  let data = null;
  try {
    data = await response.json();
  } catch (parseError) {
    data = null;
  }
  // Only an https URL returned by Cloudinary is accepted
  if (!response.ok || typeof data?.secure_url !== 'string' || !data.secure_url.startsWith('https://')) {
    if (__DEV__) console.warn('Cloudinary error:', data?.error?.message ?? response.status);
    throw new Error('upload-failed');
  }
  return data.secure_url;
}

// Uploads every photo of the sign-up in parallel. onProgress({ done, total }) updates the screen.
// Returns { profilePhotoUrl, vehiclePhotoUrl, licensePhotoUrl, soatPhotoUrl, techPhotoUrl? }
export async function uploadRegistrationPhotos(personalData, vehicleData, documentsData, onProgress) {
  const inspectionRequired = isTechnicalInspectionRequired(vehicleData.year);
  const items = collectRegistrationPhotos(personalData, vehicleData, documentsData, inspectionRequired);
  const total = items.length;
  let done = 0;
  onProgress?.({ done, total });

  const entries = await Promise.all(
    items.map(async (item) => {
      const url = await uploadImage(item.uri);
      done += 1;
      onProgress?.({ done, total });
      return [item.key, url];
    }),
  );
  return Object.fromEntries(entries);
}