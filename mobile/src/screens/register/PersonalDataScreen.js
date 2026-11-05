// AI-assisted: see docs/AI_LOG.md #8
import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';
import { useRegistration } from '../../context/RegistrationContext';
import TextField from '../../components/form/TextField';
import SelectField from '../../components/form/SelectField';
import DateField from '../../components/form/DateField';
import PhotoField from '../../components/form/PhotoField';
import {
  GENDER_OPTIONS,
  LANGUAGE_OPTIONS,
  REGISTRATION_RULES as RULES,
} from '../../config/registration';
import { hasErrors } from '../../utils/validators';
import { colors } from '../../theme/colors';

export default function PersonalDataScreen({ navigation }) {
  const {
    personalData,
    personalErrors,
    personalTouched,
    updatePersonalField,
    touchPersonalField,
    touchAllPersonal,
  } = useRegistration();
  const [triedToContinue, setTriedToContinue] = useState(false);
  const scrollRef = useRef(null);

  // Show a field's error only after it was touched
  const errorFor = (field) => (personalTouched[field] ? personalErrors[field] : null);

  const handleNext = () => {
    touchAllPersonal();
    setTriedToContinue(true);
    if (hasErrors(personalErrors)) {
      // Go back to the top so the user sees the first field in red
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }
    navigation.navigate('Vehicle');
  };

  const showSummary = triedToContinue && hasErrors(personalErrors);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <ScrollView
        ref={scrollRef}
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Datos personales</Text>

        <PhotoField
          label="Foto de perfil"
          value={personalData.profilePhoto}
          onChange={(uri) => updatePersonalField('profilePhoto', uri)}
          error={errorFor('profilePhoto')}
          round
        />

        <TextField
          label="Nombre completo"
          value={personalData.fullName}
          onChangeText={(text) => updatePersonalField('fullName', text)}
          onBlur={() => touchPersonalField('fullName')}
          error={errorFor('fullName')}
          placeholder="Ej. Santiago Cadavid"
          autoCapitalize="words"
          maxLength={RULES.maxFullNameLength}
        />

        <TextField
          label="Documento de identidad"
          value={personalData.documentId}
          onChangeText={(text) => updatePersonalField('documentId', text)}
          onBlur={() => touchPersonalField('documentId')}
          error={errorFor('documentId')}
          placeholder="Entre 6 y 10 dígitos"
          keyboardType="number-pad"
          maxLength={RULES.documentIdMaxDigits}
        />

        <TextField
          label="Número de celular"
          value={personalData.phone}
          onChangeText={(text) => updatePersonalField('phone', text)}
          onBlur={() => touchPersonalField('phone')}
          error={errorFor('phone')}
          placeholder="Ej. 3001234567"
          keyboardType="number-pad"
          maxLength={RULES.phoneDigits}
        />

        <DateField
          label="Fecha de nacimiento"
          value={personalData.birthDate}
          onChange={(date) => updatePersonalField('birthDate', date)}
          error={errorFor('birthDate')}
          maximumDate={new Date()}
        />

        <SelectField
          label="Género"
          value={personalData.gender}
          options={GENDER_OPTIONS}
          onChange={(value) => updatePersonalField('gender', value)}
          error={errorFor('gender')}
        />

        <TextField
          label="Correo electrónico"
          value={personalData.email}
          onChangeText={(text) => updatePersonalField('email', text)}
          onBlur={() => touchPersonalField('email')}
          error={errorFor('email')}
          placeholder="nombre@dominio.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <SelectField
          label="Idioma"
          value={personalData.language}
          options={LANGUAGE_OPTIONS}
          onChange={(value) => updatePersonalField('language', value)}
          error={errorFor('language')}
        />

        <TextField
          label="Contraseña"
          value={personalData.password}
          onChangeText={(text) => updatePersonalField('password', text)}
          onBlur={() => touchPersonalField('password')}
          error={errorFor('password')}
          placeholder="Mínimo 8 caracteres, con letras y números"
          secureTextEntry
          autoCapitalize="none"
        />

        <TextField
          label="Confirmar contraseña"
          value={personalData.confirmPassword}
          onChangeText={(text) => updatePersonalField('confirmPassword', text)}
          onBlur={() => touchPersonalField('confirmPassword')}
          error={errorFor('confirmPassword')}
          placeholder="Repite la contraseña"
          secureTextEntry
          autoCapitalize="none"
        />

        {/* Above the button so the tab bar never hides it */}
        {showSummary && (
          <Text style={styles.summaryError}>
            No puedes continuar: revisa los campos marcados en rojo.
          </Text>
        )}

        <Pressable style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>Siguiente: Vehículo</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: 'bold', color: colors.text, marginBottom: 16 },
  summaryError: {
    color: colors.error,
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '600',
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: { color: colors.primaryText, fontSize: 16, fontWeight: '600' },
});