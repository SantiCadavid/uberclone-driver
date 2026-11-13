// AI-assisted: see docs/AI_LOG.md #8, #20, #22, #27
import { useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import FormField from './FormField';
import { formStyles } from './formStyles';
import { useLanguage } from '../../context/LanguageContext';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/typography';
import { space } from '../../theme/layout';

const DEFAULT_PICKER_DATE = new Date(2000, 0, 1);

const pad = (number) => String(number).padStart(2, '0');
// dd/mm/yyyy in both languages: the app is for Colombia
const formatDate = (date) =>
  `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;

export default function DateField({
  label,
  error,
  value,
  onChange,
  maximumDate,
  minimumDate,
  initialDate = DEFAULT_PICKER_DATE,
}) {
  const { t, locale } = useLanguage();
  const [open, setOpen] = useState(false);
  const [draftDate, setDraftDate] = useState(value ?? initialDate);

  const openPicker = () => {
    setDraftDate(value ?? initialDate);
    setOpen(true);
  };

  // Android shows its own dialog: "set" means the user confirmed a date
  const handleAndroidChange = (event, selectedDate) => {
    setOpen(false);
    if (event.type === 'set' && selectedDate) onChange(selectedDate);
  };

  const confirmIosDate = () => {
    onChange(draftDate);
    setOpen(false);
  };

  return (
    <FormField label={label} error={error}>
      <Pressable
        style={[formStyles.input, formStyles.selectBox, error && formStyles.inputError]}
        onPress={openPicker}
      >
        <Text style={value ? formStyles.valueText : formStyles.placeholderText}>
          {value ? formatDate(value) : t('date.placeholder')}
        </Text>
        <Text style={styles.icon}>📅</Text>
      </Pressable>

      {Platform.OS === 'android' && open && (
        <DateTimePicker
          value={draftDate}
          mode="date"
          maximumDate={maximumDate}
          minimumDate={minimumDate}
          onChange={handleAndroidChange}
        />
      )}

      {Platform.OS === 'ios' && (
        <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
          <View style={formStyles.backdrop}>
            <View style={formStyles.sheet}>
              <Text style={formStyles.sheetTitle}>{label}</Text>
              {/* themeVariant="light" keeps the wheel readable when the phone uses dark mode */}
              <DateTimePicker
                value={draftDate}
                mode="date"
                display="spinner"
                themeVariant="light"
                locale={locale}
                maximumDate={maximumDate}
                minimumDate={minimumDate}
                onChange={(event, selectedDate) => selectedDate && setDraftDate(selectedDate)}
              />
              <View style={styles.actions}>
                <Pressable style={styles.actionButton} onPress={() => setOpen(false)}>
                  <Text style={styles.cancelText}>{t('date.cancel')}</Text>
                </Pressable>
                <Pressable style={styles.actionButton} onPress={confirmIosDate}>
                  <Text style={styles.confirmText}>{t('date.confirm')}</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </FormField>
  );
}

const styles = StyleSheet.create({
  icon: { fontSize: 16 },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: space.sm },
  actionButton: { paddingVertical: space.md, paddingHorizontal: space.lg },
  cancelText: { fontFamily: fonts.medium, fontSize: 16, color: colors.muted },
  confirmText: { fontFamily: fonts.semibold, fontSize: 16, color: colors.text },
});