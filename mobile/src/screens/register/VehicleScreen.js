// AI-assisted: see docs/AI_LOG.md #9, #10, #20
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
import PhotoField from '../../components/form/PhotoField';
import {
  REGISTRATION_RULES as RULES,
  VEHICLE_CATEGORY_OPTIONS,
  VEHICLE_COLOR_OPTIONS,
} from '../../config/registration';
import { hasErrors } from '../../utils/validators';
import { colors } from '../../theme/colors';

export default function VehicleScreen({ navigation }) {
  const { vehicleData, vehicleErrors, vehicleTouched, updateVehicleField, touchVehicleField, touchAllVehicle } =
    useRegistration();
  const scrollRef = useRef(null);
  const [triedToContinue, setTriedToContinue] = useState(false);

  const errorFor = (field) => (vehicleTouched[field] ? vehicleErrors[field] : null);
  const showSummary = triedToContinue && hasErrors(vehicleErrors);

  const handleNext = () => {
    touchAllVehicle();
    if (hasErrors(vehicleErrors)) {
      setTriedToContinue(true);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }
    setTriedToContinue(false);
    navigation.navigate('Documents');
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

        {/* Above the button so the tab bar never hides it */}
        {showSummary && (
          <Text style={styles.summaryError}>No puedes continuar: revisa los campos marcados en rojo.</Text>
        )}

        <Pressable style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>Siguiente: Documentos</Text>
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