// AI-assisted: see docs/AI_LOG.md #5
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';

export default function LoginScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>UberClone Conductor</Text>
      <Text style={styles.subtitle}>Inicio de sesión (en construcción)</Text>

      <Pressable style={styles.button} onPress={() => navigation.navigate('Register')}>
        <Text style={styles.buttonText}>Crear cuenta de conductor</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: { fontSize: 26, fontWeight: 'bold', color: colors.text },
  subtitle: { fontSize: 15, color: colors.muted, marginTop: 8, marginBottom: 32 },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: { color: colors.primaryText, fontSize: 16, fontWeight: '600' },
});