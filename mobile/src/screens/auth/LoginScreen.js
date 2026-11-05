// AI-assisted: see docs/AI_LOG.md #6
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { getAuthErrorMessage, loginWithEmail } from '../../services/authService';
import { validateEmail, validateRequired } from '../../utils/validators';
import { colors } from '../../theme/colors';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const newErrors = {
      email: validateEmail(email),
      password: validateRequired(password),
    };
    setErrors(newErrors);
    setSubmitError(null);
    if (newErrors.email || newErrors.password) return;

    setLoading(true);
    try {
      await loginWithEmail(email, password);
      // No navigate() here: AuthContext detects the session and RootNavigator shows Home
    } catch (error) {
      setSubmitError(getAuthErrorMessage(error));
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>UberClone Conductor</Text>
      <Text style={styles.subtitle}>Inicia sesión para continuar</Text>

      <Text style={styles.label}>Correo electrónico</Text>
      <TextInput
        style={[styles.input, errors.email && styles.inputError]}
        value={email}
        onChangeText={setEmail}
        placeholder="nombre@dominio.com"
        placeholderTextColor={colors.muted}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />
      {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

      <Text style={styles.label}>Contraseña</Text>
      <TextInput
        style={[styles.input, errors.password && styles.inputError]}
        value={password}
        onChangeText={setPassword}
        placeholder="Tu contraseña"
        placeholderTextColor={colors.muted}
        secureTextEntry
        autoCapitalize="none"
      />
      {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

      <Pressable
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={colors.primaryText} />
        ) : (
          <Text style={styles.buttonText}>Iniciar sesión</Text>
        )}
      </Pressable>
      {submitError && <Text style={styles.submitError}>{submitError}</Text>}

      <Pressable style={styles.linkButton} onPress={() => navigation.navigate('Register')}>
        <Text style={styles.linkText}>¿No tienes cuenta? Regístrate como conductor</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    padding: 24,
  },
  title: { fontSize: 26, fontWeight: 'bold', color: colors.text, textAlign: 'center' },
  subtitle: {
    fontSize: 15,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginTop: 12, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
  },
  inputError: { borderColor: colors.error },
  errorText: { color: colors.error, fontSize: 13, marginTop: 4 },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 28,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: colors.primaryText, fontSize: 16, fontWeight: '600' },
  submitError: { color: colors.error, fontSize: 14, textAlign: 'center', marginTop: 12 },
  linkButton: { marginTop: 24, alignItems: 'center' },
  linkText: { color: colors.text, fontSize: 15, textDecorationLine: 'underline' },
});