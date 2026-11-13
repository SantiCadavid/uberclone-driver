// AI-assisted: see docs/AI_LOG.md #25
// Public values (not secrets): an unsigned preset is designed to be used from the app.
// The API key and API secret are never used in the app.
export const CLOUDINARY_CONFIG = {
  cloudName: process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME,
  uploadPreset: process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
  uploadTimeoutMs: 30000, // per photo
};