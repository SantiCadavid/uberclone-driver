// AI-assisted: see docs/AI_LOG.md #8, #27
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { type } from '../../theme/typography';
import { space } from '../../theme/layout';

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
  field: { marginBottom: space.lg },
  label: { ...type.label, marginBottom: 6 },
  error: { ...type.caption, color: colors.error, marginTop: space.xs },
});