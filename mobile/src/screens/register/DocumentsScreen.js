// AI-assisted: see docs/AI_LOG.md #20, #22, #25, #27
import { useMemo, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useRegistration } from '../../context/RegistrationContext';
import { useLanguage } from '../../context/LanguageContext';
import { getRegistrationErrorMessage, registerDriver } from '../../services/driverService';
import TextField from '../../components/form/TextField';
import DateField from '../../components/form/DateField';
import PhotoField from '../../components/form/PhotoField';
import CheckboxField from '../../components/form/CheckboxField';
import TabStatus from '../../components/form/TabStatus';
import Button from '../../components/common/Button';
import { REGISTRATION_RULES as RULES } from '../../config/registration';
import { PRICING } from '../../config/pricing';
import { hasErrors } from '../../utils/validators';
import { colors } from '../../theme/colors';
import { type } from '../../theme/typography';
import { radius, space } from '../../theme/layout';

// Expiry pickers start tomorrow and cannot go before it or beyond the allowed horizon
const startOfTomorrow = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 1);
  return date;
};

const farthestExpiry = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() + RULES.maxExpiryYearsAhead);
  return date;
};

export default function DocumentsScreen({ navigation }) {
  const { t } = useLanguage();
  const { setRegistrationInProgress } = useAuth();
  const {
    personalData,
    vehicleData,
    documentsData,
    personalErrors,
    vehicleErrors,
    documentsErrors,
    documentsTouched,
    technicalInspectionRequired,
    updateDocumentsField,
    touchDocumentsField,
    touchAllDocuments,
    touchAllPersonal,
    touchAllVehicle,
  } = useRegistration();
  const scrollRef = useRef(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null); // { done, total }

  const tomorrow = useMemo(startOfTomorrow, []);
  const farthestDate = useMemo(farthestExpiry, []);
  const commissionPercent = Math.round(PRICING.commissionRate * 100);

  const errorFor = (field) => (documentsTouched[field] ? documentsErrors[field] : null);

  const personalValid = !hasErrors(personalErrors);
  const vehicleValid = !hasErrors(vehicleErrors);
  const documentsValid = !hasErrors(documentsErrors);
  // The guide: "Enviar registro" is enabled only when the three tabs are complete and valid
  const canSubmit = personalValid && vehicleValid && documentsValid && !submitting;

  const showDocumentErrors = () => {
    touchAllDocuments();
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const goToTab = (tabName, touchAll) => {
    touchAll();
    navigation.navigate(tabName);
  };

  const handleSubmit = async () => {
    if (submitting) return; // Prevents a double submit
    setSubmitting(true);
    setSubmitError(null);
    setUploadProgress(null);
    setRegistrationInProgress(true);
    try {
      await registerDriver(personalData, vehicleData, documentsData, { onProgress: setUploadProgress });
      // Success: when the flag goes back to false, RootNavigator shows Home
    } catch (error) {
      setSubmitError(getRegistrationErrorMessage(error, t));
    } finally {
      setSubmitting(false);
      setUploadProgress(null);
      setRegistrationInProgress(false);
    }
  };

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
        <Text style={styles.title}>{t('register.documents.title')}</Text>

        <Text style={styles.section}>{t('register.license')}</Text>
        <TextField
          label={t('register.licenseNumber')}
          value={documentsData.licenseNumber}
          onChangeText={(text) => updateDocumentsField('licenseNumber', text)}
          onBlur={() => touchDocumentsField('licenseNumber')}
          error={errorFor('licenseNumber')}
          placeholder={t('register.licenseNumberPlaceholder')}
          keyboardType="number-pad"
          maxLength={RULES.licenseNumberMaxDigits}
        />
        <PhotoField
          label={t('register.licensePhoto')}
          value={documentsData.licensePhoto}
          onChange={(uri) => updateDocumentsField('licensePhoto', uri)}
          error={errorFor('licensePhoto')}
          aspect={[4, 3]}
        />
        <DateField
          label={t('register.licenseExpiry')}
          value={documentsData.licenseExpiry}
          onChange={(date) => updateDocumentsField('licenseExpiry', date)}
          error={errorFor('licenseExpiry')}
          minimumDate={tomorrow}
          maximumDate={farthestDate}
          initialDate={tomorrow}
        />

        <Text style={styles.section}>{t('register.soat')}</Text>
        <PhotoField
          label={t('register.soatPhoto')}
          value={documentsData.soatPhoto}
          onChange={(uri) => updateDocumentsField('soatPhoto', uri)}
          error={errorFor('soatPhoto')}
          aspect={[4, 3]}
        />
        <DateField
          label={t('register.soatExpiry')}
          value={documentsData.soatExpiry}
          onChange={(date) => updateDocumentsField('soatExpiry', date)}
          error={errorFor('soatExpiry')}
          minimumDate={tomorrow}
          maximumDate={farthestDate}
          initialDate={tomorrow}
        />

        <Text style={styles.section}>{t('register.inspection')}</Text>
        {technicalInspectionRequired ? (
          <>
            <Text style={styles.note}>
              {t('register.inspectionRequired', { years: RULES.technicalInspectionAfterYears })}
            </Text>
            <PhotoField
              label={t('register.inspectionPhoto')}
              value={documentsData.techPhoto}
              onChange={(uri) => updateDocumentsField('techPhoto', uri)}
              error={errorFor('techPhoto')}
              aspect={[4, 3]}
            />
            <DateField
              label={t('register.inspectionExpiry')}
              value={documentsData.techExpiry}
              onChange={(date) => updateDocumentsField('techExpiry', date)}
              error={errorFor('techExpiry')}
              minimumDate={tomorrow}
              maximumDate={farthestDate}
              initialDate={tomorrow}
            />
          </>
        ) : (
          <Text style={styles.note}>
            {t('register.inspectionNotRequired', {
              year: vehicleData.year,
              years: RULES.technicalInspectionAfterYears,
            })}
          </Text>
        )}

        <Text style={styles.section}>{t('register.payments')}</Text>
        <Text style={styles.note}>{t('register.paymentsNote')}</Text>
        <TextField
          label={t('register.mercadoPagoEmail')}
          value={documentsData.mercadoPagoEmail}
          onChangeText={(text) => updateDocumentsField('mercadoPagoEmail', text)}
          onBlur={() => touchDocumentsField('mercadoPagoEmail')}
          error={errorFor('mercadoPagoEmail')}
          placeholder={t('register.emailPlaceholder')}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <CheckboxField
          label={t('register.terms', { percent: commissionPercent })}
          checked={documentsData.acceptedTerms}
          onChange={(accepted) => updateDocumentsField('acceptedTerms', accepted)}
          error={errorFor('acceptedTerms')}
        />

        <View style={styles.statusBox}>
          <TabStatus
            label={t('register.tab.personal')}
            valid={personalValid}
            actionLabel={t('register.status.fill')}
            onAction={() => goToTab('PersonalData', touchAllPersonal)}
          />
          <TabStatus
            label={t('register.tab.vehicle')}
            valid={vehicleValid}
            actionLabel={t('register.status.fill')}
            onAction={() => goToTab('Vehicle', touchAllVehicle)}
          />
          <TabStatus
            label={t('register.tab.documents')}
            valid={documentsValid}
            actionLabel={t('register.status.showErrors')}
            onAction={showDocumentErrors}
          />
        </View>

        <Button
          label={t('register.submit')}
          onPress={handleSubmit}
          disabled={!canSubmit}
          loading={submitting}
          loadingLabel={
            uploadProgress ? t('upload.progress', { done: uploadProgress.done, total: uploadProgress.total }) : undefined
          }
        />
        {submitError && <Text style={styles.submitError}>{submitError}</Text>}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: space.xl, paddingBottom: space.xxl + space.lg },
  title: { ...type.title, marginBottom: space.sm },
  section: { ...type.section, marginTop: space.xl, marginBottom: space.md },
  note: { ...type.caption, marginBottom: space.md },
  statusBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: space.md,
    marginTop: space.sm,
    marginBottom: space.lg,
  },
  submitError: { ...type.bodyStrong, color: colors.error, textAlign: 'center', marginTop: space.md },
});