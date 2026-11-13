// AI-assisted: see docs/AI_LOG.md #20
import { useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useRegistration } from '../../context/RegistrationContext';
import { getRegistrationErrorMessage, registerDriver } from '../../services/driverService';
import TextField from '../../components/form/TextField';
import DateField from '../../components/form/DateField';
import PhotoField from '../../components/form/PhotoField';
import CheckboxField from '../../components/form/CheckboxField';
import TabStatus from '../../components/form/TabStatus';
import { REGISTRATION_RULES as RULES } from '../../config/registration';
import { PRICING } from '../../config/pricing';
import { hasErrors } from '../../utils/validators';
import { colors } from '../../theme/colors';

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
    setRegistrationInProgress(true);
    try {
      await registerDriver(personalData, vehicleData, documentsData);
      // Success: when the flag goes back to false, RootNavigator shows Home
    } catch (error) {
      setSubmitError(getRegistrationErrorMessage(error));
    } finally {
      setSubmitting(false);
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
        <Text style={styles.title}>Documentos y pagos</Text>

        <Text style={styles.section}>Licencia de conducción</Text>
        <TextField
          label="Número de licencia"
          value={documentsData.licenseNumber}
          onChangeText={(text) => updateDocumentsField('licenseNumber', text)}
          onBlur={() => touchDocumentsField('licenseNumber')}
          error={errorFor('licenseNumber')}
          placeholder="Solo números"
          keyboardType="number-pad"
          maxLength={RULES.licenseNumberMaxDigits}
        />
        <PhotoField
          label="Foto de la licencia"
          value={documentsData.licensePhoto}
          onChange={(uri) => updateDocumentsField('licensePhoto', uri)}
          error={errorFor('licensePhoto')}
          aspect={[4, 3]}
        />
        <DateField
          label="Vencimiento de la licencia"
          value={documentsData.licenseExpiry}
          onChange={(date) => updateDocumentsField('licenseExpiry', date)}
          error={errorFor('licenseExpiry')}
          minimumDate={tomorrow}
          maximumDate={farthestDate}
          initialDate={tomorrow}
        />

        <Text style={styles.section}>SOAT</Text>
        <PhotoField
          label="Foto del SOAT"
          value={documentsData.soatPhoto}
          onChange={(uri) => updateDocumentsField('soatPhoto', uri)}
          error={errorFor('soatPhoto')}
          aspect={[4, 3]}
        />
        <DateField
          label="Vencimiento del SOAT"
          value={documentsData.soatExpiry}
          onChange={(date) => updateDocumentsField('soatExpiry', date)}
          error={errorFor('soatExpiry')}
          minimumDate={tomorrow}
          maximumDate={farthestDate}
          initialDate={tomorrow}
        />

        <Text style={styles.section}>Revisión técnico-mecánica</Text>
        {technicalInspectionRequired ? (
          <>
            <Text style={styles.note}>
              Obligatoria para vehículos con {RULES.technicalInspectionAfterYears} años o más.
            </Text>
            <PhotoField
              label="Foto de la revisión técnico-mecánica"
              value={documentsData.techPhoto}
              onChange={(uri) => updateDocumentsField('techPhoto', uri)}
              error={errorFor('techPhoto')}
              aspect={[4, 3]}
            />
            <DateField
              label="Vencimiento de la revisión"
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
            No aplica: tu vehículo ({vehicleData.year}) tiene menos de {RULES.technicalInspectionAfterYears} años.
          </Text>
        )}

        <Text style={styles.section}>Pagos</Text>
        <Text style={styles.note}>
          Escribe el correo de tu cuenta de Mercado Pago, donde recibirías tus pagos. La app no guarda números
          de cuenta bancaria ni de tarjeta: de eso se encarga la pasarela de pago.
        </Text>
        <TextField
          label="Correo de la cuenta de Mercado Pago"
          value={documentsData.mercadoPagoEmail}
          onChangeText={(text) => updateDocumentsField('mercadoPagoEmail', text)}
          onBlur={() => touchDocumentsField('mercadoPagoEmail')}
          error={errorFor('mercadoPagoEmail')}
          placeholder="nombre@dominio.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <CheckboxField
          label={`Acepto los términos y condiciones y que la plataforma cobra una comisión del ${commissionPercent} % sobre la tarifa de cada viaje (las propinas son completas para mí).`}
          checked={documentsData.acceptedTerms}
          onChange={(accepted) => updateDocumentsField('acceptedTerms', accepted)}
          error={errorFor('acceptedTerms')}
        />

        <View style={styles.statusBox}>
          <TabStatus
            label="Datos personales"
            valid={personalValid}
            actionLabel="Completar"
            onAction={() => goToTab('PersonalData', touchAllPersonal)}
          />
          <TabStatus
            label="Vehículo"
            valid={vehicleValid}
            actionLabel="Completar"
            onAction={() => goToTab('Vehicle', touchAllVehicle)}
          />
          <TabStatus
            label="Documentos"
            valid={documentsValid}
            actionLabel="Ver errores"
            onAction={showDocumentErrors}
          />
        </View>

        <Pressable
          style={[styles.button, !canSubmit && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={!canSubmit}
        >
          {submitting ? (
            <ActivityIndicator color={colors.primaryText} />
          ) : (
            <Text style={styles.buttonText}>Enviar registro</Text>
          )}
        </Pressable>
        {submitError && <Text style={styles.submitError}>{submitError}</Text>}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: 'bold', color: colors.text, marginBottom: 8 },
  section: { fontSize: 17, fontWeight: 'bold', color: colors.text, marginTop: 16, marginBottom: 10 },
  note: { fontSize: 13, color: colors.muted, marginBottom: 12 },
  statusBox: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: { backgroundColor: '#9CA3AF' },
  buttonText: { color: colors.primaryText, fontSize: 16, fontWeight: '600' },
  submitError: { color: colors.error, textAlign: 'center', marginTop: 12, fontWeight: '600' },
});