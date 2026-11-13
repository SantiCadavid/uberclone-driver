// AI-assisted: see docs/AI_LOG.md #8, #22, #27
import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import FormField from './FormField';
import { pickImageFromCamera, pickImageFromLibrary } from '../../services/imagePicker';
import { useLanguage } from '../../context/LanguageContext';
import { colors } from '../../theme/colors';
import { type } from '../../theme/typography';
import { radius, space } from '../../theme/layout';

export default function PhotoField({ label, error, value, onChange, aspect = [1, 1], round = false }) {
  const { t } = useLanguage();
  const [pickerErrorKey, setPickerErrorKey] = useState(null);

  const handlePick = async (source) => {
    setPickerErrorKey(null);
    const result =
      source === 'camera' ? await pickImageFromCamera(aspect) : await pickImageFromLibrary(aspect);
    if (result.errorKey) {
      setPickerErrorKey(result.errorKey);
      return;
    }
    if (result.uri) onChange(result.uri);
  };

  const previewStyle = [styles.preview, round && styles.round];

  return (
    // A permission problem is shown first; otherwise the validation error
    <FormField label={label} error={pickerErrorKey ? t(pickerErrorKey) : error}>
      <View style={styles.row}>
        {value ? (
          <Image source={{ uri: value }} style={previewStyle} />
        ) : (
          <View style={[previewStyle, styles.emptyPreview, error && styles.emptyPreviewError]}>
            <Text style={styles.emptyText}>{t('photo.empty')}</Text>
          </View>
        )}
        <View style={styles.buttons}>
          <Pressable style={styles.button} onPress={() => handlePick('camera')}>
            <Text style={styles.buttonText}>{t('photo.camera')}</Text>
          </Pressable>
          <Pressable style={[styles.button, styles.lastButton]} onPress={() => handlePick('library')}>
            <Text style={styles.buttonText}>{t('photo.library')}</Text>
          </Pressable>
        </View>
      </View>
    </FormField>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  preview: { width: 96, height: 96, borderRadius: radius.control },
  round: { borderRadius: 48 },
  emptyPreview: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyPreviewError: { borderColor: colors.error },
  emptyText: type.caption,
  buttons: { flex: 1, marginLeft: space.lg },
  button: {
    minHeight: 44,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.control,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.sm,
  },
  lastButton: { marginBottom: 0 },
  buttonText: type.bodyStrong,
});