// AI-assisted: see docs/AI_LOG.md #9, #10
import { useRef, useState } from 'react';
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
import SelectField from '../../components/form/SelectField';
import PhotoField from '../../components/form/PhotoField';
import {
  REGISTRATION_RULES as RULES,
  VEHICLE_CATEGORY_OPTIONS,
  VEHICLE_COLOR_OPTIONS,
} from '../../config/registration';
import { hasErrors } from '../../utils/validators';
import { colors } from '../../theme/colors';

function TabStatus({ label, valid, actionLabel, onAction }) {
  return (
    <View style={styles.statusRow}>
      <Text style={[styles.statusText, valid ? styles.statusOk : styles.statusPending]}>
        {valid ? '✓' : '✗'} {label}: {valid ? 'completo' : 'incompleto'}
      </Text>
      {!valid && (
        <Pressable onPress={onAction}>
          <Text style={styles.statusAction}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

export default function VehicleScreen({ navigation }) {
  const { setRegistrationInProgress } = useAuth();
  const {
    personalData,
    vehicleData,
    vehicleErrors,
    vehicleTouched,
    personalErrors,
    updateVehicleField,
    touchVehicleField,
    touchAllVehicle,
    touchAllPersonal,
  } = useRegistration();
  const scrollRef = useRef(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const errorFor = (field) => (vehicleTouched[field] ? vehicleErrors[field] : null);

  const personalValid = !hasErrors(personalErrors);
  const vehicleValid = !hasErrors(vehicleErrors);
  // The guide: "Enviar registro" is enabled only when every tab is complete and valid
  const canSubmit = personalValid && vehicleValid && !submitting;

  const showVehicleErrors = () => {
    touchAllVehicle();
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const goToPersonalData = () => {
    touchAllPersonal();
    navigation.navigate('PersonalData');
  };

  const handleSubmit = async () => {
    if (submitting) return; // Prevents a double submit
    setSubmitting(true);
    setSubmitError(null);
    setRegistrationInProgress(true);
    try {
      await registerDriver(personalData, vehicleData);
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
      >
        <Text style={styles.title}>Vehículo</Text>

        <SelectField
          label="Categoría"
          value={vehicleData.category}
          options={VEHICLE_CATEGORY_OPTIONS}
          onChange={(value) => updateVehicleField('category', value)}
          error={errorFor('category')}
        />

        <TextField
          label="Placa"
          value={vehicleData.plate}
          // Uppercase while typing; the validator also removes spaces and dashes
          onChangeText={(text) => updateVehicleField('plate', text.toUpperCase())}
          onBlur={() => touchVehicleField('plate')}
          error={errorFor('plate')}
          placeholder="Ej. ABC123"
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={7}
        />

        <TextField
          label="Marca"
          value={vehicleData.brand}
          onChangeText={(text) => updateVehicleField('brand', text)}
          onBlur={() => touchVehicleField('brand')}
          error={errorFor('brand')}
          placeholder="Ej. Renault"
          maxLength={RULES.maxBrandLength}
        />

        <TextField
          label="Modelo"
          value={vehicleData.model}
          onChangeText={(text) => updateVehicleField('model', text)}
          onBlur={() => touchVehicleField('model')}
          error={errorFor('model')}
          placeholder="Ej. Duster"
          maxLength={RULES.maxModelLength}
        />

        <TextField
          label="Año"
          value={vehicleData.year}
          onChangeText={(text) => updateVehicleField('year', text)}
          onBlur={() => touchVehicleField('year')}
          error={errorFor('year')}
          placeholder="Ej. 2022"
          keyboardType="number-pad"
          maxLength={4}
        />

        <SelectField
          label="Color"
          value={vehicleData.color}
          options={VEHICLE_COLOR_OPTIONS}
          onChange={(value) => updateVehicleField('color', value)}
          error={errorFor('color')}
        />

        <TextField
          label="Capacidad de pasajeros"
          value={vehicleData.capacity}
          onChangeText={(text) => updateVehicleField('capacity', text)}
          onBlur={() => touchVehicleField('capacity')}
          error={errorFor('capacity')}
          placeholder={vehicleData.category === 'xl' ? 'Entre 6 y 8 para XL' : 'Entre 1 y 4'}
          keyboardType="number-pad"
          maxLength={2}
        />

        <PhotoField
          label="Foto del vehículo (debe verse la placa)"
          value={vehicleData.vehiclePhoto}
          onChange={(uri) => updateVehicleField('vehiclePhoto', uri)}
          error={errorFor('vehiclePhoto')}
          aspect={[4, 3]}
        />

        <View style={styles.statusBox}>
          <TabStatus
            label="Datos personales"
            valid={personalValid}
            actionLabel="Completar"
            onAction={goToPersonalData}
          />
          <TabStatus
            label="Vehículo"
            valid={vehicleValid}
            actionLabel="Ver errores"
            onAction={showVehicleErrors}
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
  title: { fontSize: 22, fontWeight: 'bold', color: colors.text, marginBottom: 16 },
  statusBox: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  statusText: { fontSize: 15, fontWeight: '600' },
  statusOk: { color: '#15803D' },
  statusPending: { color: colors.error },
  statusAction: { fontSize: 15, color: colors.text, textDecorationLine: 'underline' },
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