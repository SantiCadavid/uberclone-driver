// AI-assisted: see docs/AI_LOG.md #8
import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import FormField from './FormField';
import { pickImageFromCamera, pickImageFromLibrary } from '../../services/imagePicker';
import { colors } from '../../theme/colors';

export default function PhotoField({ label, error, value, onChange, aspect = [1, 1], round = false }) {
  const [pickerError, setPickerError] = useState(null);

  const handlePick = async (source) => {
    setPickerError(null);
    const result =
      source === 'camera' ? await pickImageFromCamera(aspect) : await pickImageFromLibrary(aspect);
    if (result.error) {
      setPickerError(result.error);
      return;
    }
    if (result.uri) onChange(result.uri);
  };

  const previewStyle = [styles.preview, round && styles.round];

  return (
    // A permission problem is shown first; otherwise the validation error
    <FormField label={label} error={pickerError ?? error}>
      <View style={styles.row}>
        {value ? (
          <Image source={{ uri: value }} style={previewStyle} />
        ) : (
          <View style={[previewStyle, styles.emptyPreview, error && styles.emptyPreviewError]}>
            <Text style={styles.emptyText}>Sin foto</Text>
          </View>
        )}
        <View style={styles.buttons}>
          <Pressable style={styles.button} onPress={() => handlePick('camera')}>
            <Text style={styles.buttonText}>Tomar foto</Text>
          </Pressable>
          <Pressable style={styles.button} onPress={() => handlePick('library')}>
            <Text style={styles.buttonText}>Elegir de galería</Text>
          </Pressable>
        </View>
      </View>
    </FormField>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  preview: { width: 96, height: 96, borderRadius: 8 },
  round: { borderRadius: 48 },
  emptyPreview: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyPreviewError: { borderColor: colors.error },
  emptyText: { color: colors.muted, fontSize: 13 },
  buttons: { flex: 1, marginLeft: 16 },
  button: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 8,
  },
  buttonText: { color: colors.text, fontSize: 15, fontWeight: '600' },
});