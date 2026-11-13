// AI-assisted: see docs/AI_LOG.md #8, #20, #22
import { useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';
import { useRegistration } from '../../context/RegistrationContext';
import { useLanguage } from '../../context/LanguageContext';
import FormField from '../../components/form/FormField';
import TextField from '../../components/form/TextField';
import SelectField from '../../components/form/SelectField';
import DateField from '../../components/form/DateField';
import PhotoField from '../../components/form/PhotoField';
import LanguageSelector from '../../components/common/LanguageSelector';
import { GENDER_OPTIONS, REGISTRATION_RULES as RULES } from '../../config/registration';
import { translateOptions } from '../../i18n';
import { hasErrors } from '../../utils/validators';
import { colors } from '../../theme/colors';

export default function PersonalDataScreen({ navigation }) {
  const { t } = useLanguage();
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

  const genderOptions = useMemo(() => translateOptions(GENDER_OPTIONS, t), [t]);

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
        keyboardDismissMode="on-drag"
      >
        <Text style={styles.title}>{t('register.tab.personal')}</Text>

        {/* Same selector as Login and Profile: changing it switches the whole sign-up */}
        <FormField label={t('register.language')}>
          <LanguageSelector showLabel={false} />
        </FormField>

        <PhotoField
          label={t('register.profilePhoto')}
          value={personalData.profilePhoto}
          onChange={(uri) => updatePersonalField('profilePhoto', uri)}
          error={errorFor('profilePhoto')}
          round
        />

        <TextField
          label={t('register.fullName')}
          value={personalData.fullName}
          onChangeText={(text) => updatePersonalField('fullName', text)}
          onBlur={() => touchPersonalField('fullName')}
          error={errorFor('fullName')}
          placeholder={t('register.fullNamePlaceholder')}
          autoCapitalize="words"
          maxLength={RULES.maxFullNameLength}
        />

        <TextField
          label={t('register.documentId')}
          value={personalData.documentId}
          onChangeText={(text) => updatePersonalField('documentId', text)}
          onBlur={() => touchPersonalField('documentId')}
          error={errorFor('documentId')}
          placeholder={t('register.documentIdPlaceholder', {
            min: RULES.documentIdMinDigits,
            max: RULES.documentIdMaxDigits,
          })}
          keyboardType="number-pad"
          maxLength={RULES.documentIdMaxDigits}
        />

        <TextField
          label={t('register.phone')}
          value={personalData.phone}
          onChangeText={(text) => updatePersonalField('phone', text)}
          onBlur={() => touchPersonalField('phone')}
          error={errorFor('phone')}
          placeholder={t('register.phonePlaceholder')}
          keyboardType="number-pad"
          maxLength={RULES.phoneDigits}
        />

        <DateField
          label={t('register.birthDate')}
          value={personalData.birthDate}
          onChange={(date) => updatePersonalField('birthDate', date)}
          error={errorFor('birthDate')}
          maximumDate={new Date()}
        />

        <SelectField
          label={t('register.gender')}
          value={personalData.gender}
          options={genderOptions}
          onChange={(value) => updatePersonalField('gender', value)}
          error={errorFor('gender')}
        />

        <TextField
          label={t('register.email')}
          value={personalData.email}
          onChangeText={(text) => updatePersonalField('email', text)}
          onBlur={() => touchPersonalField('email')}
          error={errorFor('email')}
          placeholder={t('register.emailPlaceholder')}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TextField
          label={t('register.password')}
          value={personalData.password}
          onChangeText={(text) => updatePersonalField('password', text)}
          onBlur={() => touchPersonalField('password')}
          error={errorFor('password')}
          placeholder={t('register.passwordPlaceholder', { min: RULES.minPasswordLength })}
          secureTextEntry
          autoCapitalize="none"
        />

        <TextField
          label={t('register.confirmPassword')}
          value={personalData.confirmPassword}
          onChangeText={(text) => updatePersonalField('confirmPassword', text)}
          onBlur={() => touchPersonalField('confirmPassword')}
          error={errorFor('confirmPassword')}
          placeholder={t('register.confirmPasswordPlaceholder')}
          secureTextEntry
          autoCapitalize="none"
        />

        {/* Above the button so the tab bar never hides it */}
        {showSummary && <Text style={styles.summaryError}>{t('register.summaryError')}</Text>}

        <Pressable style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>{t('register.nextVehicle')}</Text>
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