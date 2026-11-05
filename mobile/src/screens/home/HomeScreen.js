// AI-assisted: see docs/AI_LOG.md #6
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { getAuthErrorMessage, logout } from '../../services/authService';
import { colors } from '../../theme/colors';

export default function HomeScreen() {
  const { user } = useAuth();
  const [error, setError] = useState(null);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (logoutError) {
      setError(getAuthErrorMessage(logoutError));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sesión iniciada</Text>
      <Text style={styles.email}>{user?.email}</Text>
      <Text style={styles.note}>Inicio del conductor (en construcción)</Text>

      <Pressable style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Cerrar sesión</Text>
      </Pressable>
      {error && <Text style={styles.errorText}>{error}</Text>}
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
  title: { fontSize: 22, fontWeight: 'bold', color: colors.text },
  email: { fontSize: 16, color: colors.text, marginTop: 8 },
  note: { fontSize: 14, color: colors.muted, marginTop: 8, marginBottom: 32 },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: { color: colors.primaryText, fontSize: 16, fontWeight: '600' },
  errorText: { color: colors.error, marginTop: 12 },
});