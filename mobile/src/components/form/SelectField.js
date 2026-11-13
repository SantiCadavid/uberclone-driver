// AI-assisted: see docs/AI_LOG.md #8, #22, #27
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import FormField from './FormField';
import { formStyles } from './formStyles';
import { useLanguage } from '../../context/LanguageContext';
import { colors } from '../../theme/colors';
import { fonts, type } from '../../theme/typography';
import { MIN_TOUCH } from '../../theme/layout';

export default function SelectField({ label, error, value, options, onChange, placeholder }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setOpen(false);
  };

  return (
    <FormField label={label} error={error}>
      <Pressable
        style={[formStyles.input, formStyles.selectBox, error && formStyles.inputError]}
        onPress={() => setOpen(true)}
      >
        <Text style={selected ? formStyles.valueText : formStyles.placeholderText}>
          {selected ? selected.label : placeholder ?? t('select.placeholder')}
        </Text>
        <Text style={styles.chevron}>▾</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        {/* Tapping outside the sheet closes the list */}
        <Pressable style={formStyles.backdrop} onPress={() => setOpen(false)}>
          {/* Empty onPress keeps taps inside the sheet from closing it */}
          <Pressable style={formStyles.sheet} onPress={() => {}}>
            <Text style={formStyles.sheetTitle}>{label}</Text>
            <ScrollView style={styles.list}>
              {options.map((option) => {
                const isSelected = option.value === value;
                return (
                  <Pressable key={option.value} style={styles.option} onPress={() => handleSelect(option.value)}>
                    <Text style={[styles.optionText, isSelected && styles.optionSelected]}>{option.label}</Text>
                    {isSelected && <Text style={styles.check}>✓</Text>}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </FormField>
  );
}

const styles = StyleSheet.create({
  chevron: { fontSize: 16, color: colors.muted },
  list: { maxHeight: 360 },
  option: {
    minHeight: MIN_TOUCH,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  optionText: { ...type.body, fontSize: 16 },
  optionSelected: { fontFamily: fonts.semibold },
  check: { ...type.bodyStrong, color: colors.text },
});