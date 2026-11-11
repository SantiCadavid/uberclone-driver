// AI-assisted: see docs/AI_LOG.md #13
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';

// TEMPORARY placeholder until each screen is built
export default function ComingSoonScreen({ title }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.note}>En construcción</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 20, fontWeight: 'bold', color: colors.text },
  note: { fontSize: 15, color: colors.muted, marginTop: 8 },
});