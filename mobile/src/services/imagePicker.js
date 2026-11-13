// AI-assisted: see docs/AI_LOG.md #8, #22
import * as ImagePicker from 'expo-image-picker';

const PICKER_OPTIONS = {
  mediaTypes: ['images'],
  allowsEditing: true,
  quality: 0.7,
};

function toResult(result) {
  if (result.canceled || !result.assets?.length) return { uri: null };
  return { uri: result.assets[0].uri };
}

// Each function returns { uri } on success, { uri: null } if the user cancels,
// or { errorKey } (a translation key) when something fails
export async function pickImageFromCamera(aspect) {
  try {
    const { granted } = await ImagePicker.requestCameraPermissionsAsync();
    if (!granted) return { errorKey: 'photo.error.cameraPermission' };
    return toResult(await ImagePicker.launchCameraAsync({ ...PICKER_OPTIONS, aspect }));
  } catch (error) {
    return { errorKey: 'photo.error.camera' };
  }
}

export async function pickImageFromLibrary(aspect) {
  try {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) return { errorKey: 'photo.error.libraryPermission' };
    return toResult(await ImagePicker.launchImageLibraryAsync({ ...PICKER_OPTIONS, aspect }));
  } catch (error) {
    return { errorKey: 'photo.error.library' };
  }
}