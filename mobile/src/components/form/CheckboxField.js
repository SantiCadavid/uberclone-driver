// AI-assisted: see docs/AI_LOG.md #20, #27
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { fonts, type } from '../../theme/typography';
import { space } from '../../theme/layout';

// Checkbox with its label and the error message right below it (no Alert)
export default function CheckboxField({ label, checked, onChange, error }) {
  return (
    <View style={styles.field}>
      <Pressable
        style={styles.row}
        onPress={() => onChange(!checked)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
      >
        <View style={[styles.box, checked && styles.boxChecked, error && styles.boxError]}>
          {checked && <Text style={styles.check}>✓</Text>}
        </View>
        <Text style={styles.label}>{label}</Text>
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: space.lg },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  box: {
    width: 26,
    height: 26,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: space.md,
    marginTop: 1,
  },
  boxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  boxError: { borderColor: colors.error },
  check: { color: colors.primaryText, fontFamily: fonts.bold, fontSize: 16 },
  label: { ...type.body, flex: 1 },
  error: { ...type.caption, color: colors.error, marginTop: 6 },
});