// AI-assisted: see docs/AI_LOG.md #5
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';

export default function PersonalDataScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Pestaña 1 — Datos personales</Text>
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
  text: { fontSize: 18, color: colors.text },
});