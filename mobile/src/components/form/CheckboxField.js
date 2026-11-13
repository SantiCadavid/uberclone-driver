// AI-assisted: see docs/AI_LOG.md #20
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';

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
  field: { marginBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  box: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 1,
  },
  boxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  boxError: { borderColor: colors.error },
  check: { color: colors.primaryText, fontSize: 16, fontWeight: 'bold' },
  label: { flex: 1, fontSize: 15, color: colors.text },
  error: { color: colors.error, fontSize: 13, marginTop: 6 },
});