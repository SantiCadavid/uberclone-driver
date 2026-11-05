// AI-assisted: see docs/AI_LOG.md #8
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';

// Label + field + error message right below it (no Alert)
export default function FormField({ label, error, children }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 6 },
  error: { color: colors.error, fontSize: 13, marginTop: 4 },
});