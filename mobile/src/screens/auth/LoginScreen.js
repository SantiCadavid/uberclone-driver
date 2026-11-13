// AI-assisted: see docs/AI_LOG.md #6, #20, #21, #22, #27
import { useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLanguage } from '../../context/LanguageContext';
import LanguageSelector from '../../components/common/LanguageSelector';
import Button from '../../components/common/Button';
import { formStyles } from '../../components/form/formStyles';
import { getAuthErrorMessage, loginWithEmail } from '../../services/authService';
import { validateEmail, validateRequired } from '../../utils/validators';
import { colors } from '../../theme/colors';
import { fonts, type } from '../../theme/typography';
import { space } from '../../theme/layout';

// Brand mark: lane markings in road-sign yellow
function LaneMark() {
  return (
    <View style={styles.lane} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {[0, 1, 2, 3].map((index) => (
        <View key={index} style={styles.dash} />
      ))}
    </View>
  );
}

export default function LoginScreen({ navigation }) {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [loading, setLoading] = useState(false);
  const passwordRef = useRef(null);

  const handleLogin = async () => {
    if (loading) return; // Prevents a double submit (button or keyboard key)
    Keyboard.dismiss();
    const newErrors = {
      email: validateEmail(email, t),
      password: validateRequired(password, t),
    };
    setErrors(newErrors);
    setSubmitError(null);
    if (newErrors.email || newErrors.password) return;

    setLoading(true);
    try {
      await loginWithEmail(email, password);
      // No navigate() here: AuthContext detects the session and RootNavigator shows Home
    } catch (error) {
      setSubmitError(getAuthErrorMessage(error, t));
      setLoading(false);
    }
  };

  const handleGoToRegister = () => {
    Keyboard.dismiss();
    navigation.navigate('Register');
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* "handled": taps on buttons work with the keyboard open; taps on empty space close it */}
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <View style={styles.languageBox}>
          <LanguageSelector showLabel={false} />
        </View>

        <LaneMark />
        <Text style={styles.title}>{t('login.title')}</Text>
        <Text style={styles.subtitle}>{t('login.subtitle')}</Text>

        <Text style={styles.label}>{t('login.email')}</Text>
        <TextInput
          style={[formStyles.input, errors.email && formStyles.inputError]}
          value={email}
          onChangeText={setEmail}
          placeholder={t('login.emailPlaceholder')}
          placeholderTextColor={colors.muted}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="next"
          blurOnSubmit={false}
          onSubmitEditing={() => passwordRef.current?.focus()}
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

        <Text style={styles.label}>{t('login.password')}</Text>
        <TextInput
          ref={passwordRef}
          style={[formStyles.input, errors.password && formStyles.inputError]}
          value={password}
          onChangeText={setPassword}
          placeholder={t('login.passwordPlaceholder')}
          placeholderTextColor={colors.muted}
          secureTextEntry
          autoCapitalize="none"
          returnKeyType="go"
          onSubmitEditing={handleLogin}
        />
        {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

        <Button label={t('login.submit')} onPress={handleLogin} loading={loading} style={styles.submit} />
        {submitError && <Text style={styles.submitError}>{submitError}</Text>}

        <Pressable style={styles.linkButton} onPress={handleGoToRegister} hitSlop={8}>
          <Text style={styles.linkText}>{t('login.register')}</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: {
    flexGrow: 1, // keeps the form centered when there is room, scrollable when the keyboard is open
    justifyContent: 'center',
    padding: space.xl,
  },
  languageBox: { marginBottom: space.xxl },
  lane: { flexDirection: 'row', marginBottom: space.lg },
  dash: { width: 28, height: 6, borderRadius: 3, backgroundColor: colors.signal, marginRight: space.sm },
  title: type.title,
  subtitle: { ...type.body, color: colors.muted, marginTop: space.xs, marginBottom: space.xl },
  label: { ...type.label, marginTop: space.md, marginBottom: 6 },
  errorText: { ...type.caption, color: colors.error, marginTop: space.xs },
  submit: { marginTop: space.xl },
  submitError: { ...type.body, color: colors.error, textAlign: 'center', marginTop: space.md },
  linkButton: { marginTop: space.xl, alignItems: 'center', minHeight: 44, justifyContent: 'center' },
  linkText: { fontFamily: fonts.medium, fontSize: 15, color: colors.text, textDecorationLine: 'underline' },
});