// AI-assisted: see docs/AI_LOG.md #8
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

// Each function returns { uri } on success, { uri: null } if the user cancels, or { error }
export async function pickImageFromCamera(aspect) {
  try {
    const { granted } = await ImagePicker.requestCameraPermissionsAsync();
    if (!granted) {
      return { error: 'Permiso de cámara denegado. Actívalo en Configuración o elige de la galería.' };
    }
    return toResult(await ImagePicker.launchCameraAsync({ ...PICKER_OPTIONS, aspect }));
  } catch (error) {
    return { error: 'No se pudo abrir la cámara. Intenta con la galería.' };
  }
}

export async function pickImageFromLibrary(aspect) {
  try {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) {
      return { error: 'Permiso de galería denegado. Actívalo en Configuración del teléfono.' };
    }
    return toResult(await ImagePicker.launchImageLibraryAsync({ ...PICKER_OPTIONS, aspect }));
  } catch (error) {
    return { error: 'No se pudo abrir la galería. Inténtalo de nuevo.' };
  }
}