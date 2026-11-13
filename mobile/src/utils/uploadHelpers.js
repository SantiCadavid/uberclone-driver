// AI-assisted: see docs/AI_LOG.md #25
// Pure helpers for the photo upload (tested with Jest)

const EXTENSION_TYPES = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  heic: 'image/heic',
  heif: 'image/heif',
};

// File type and name sent to Cloudinary, deduced from the local uri. Unknown -> JPEG.
export function getImageFileInfo(uri) {
  const extension = String(uri ?? '').split('?')[0].split('.').pop().toLowerCase();
  const known = Boolean(EXTENSION_TYPES[extension]);
  return {
    type: known ? EXTENSION_TYPES[extension] : 'image/jpeg',
    name: `photo.${known ? extension : 'jpg'}`,
  };
}

// Photos of the sign-up to upload, with the profile field each URL goes to.
// The inspection photo is uploaded only when the inspection applies to the vehicle.
export function collectRegistrationPhotos(personalData, vehicleData, documentsData, inspectionRequired) {
  const items = [
    { key: 'profilePhotoUrl', uri: personalData?.profilePhoto },
    { key: 'vehiclePhotoUrl', uri: vehicleData?.vehiclePhoto },
    { key: 'licensePhotoUrl', uri: documentsData?.licensePhoto },
    { key: 'soatPhotoUrl', uri: documentsData?.soatPhoto },
    ...(inspectionRequired ? [{ key: 'techPhotoUrl', uri: documentsData?.techPhoto }] : []),
  ];
  return items.filter((item) => typeof item.uri === 'string' && item.uri.length > 0);
}