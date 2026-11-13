// AI-assisted: see docs/AI_LOG.md #9, #10, #20, #22, #27
import { useMemo, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from 'react-native';
import { useRegistration } from '../../context/RegistrationContext';
import { useLanguage } from '../../context/LanguageContext';
import TextField from '../../components/form/TextField';
import SelectField from '../../components/form/SelectField';
import PhotoField from '../../components/form/PhotoField';
import Button from '../../components/common/Button';
import {
  CAPACITY_BY_CATEGORY,
  MAX_VEHICLE_CAPACITY,
  REGISTRATION_RULES as RULES,
  VEHICLE_CATEGORY_OPTIONS,
  VEHICLE_COLOR_OPTIONS,
} from '../../config/registration';
import { translateOptions } from '../../i18n';
import { hasErrors } from '../../utils/validators';
import { colors } from '../../theme/colors';
import { type } from '../../theme/typography';
import { space } from '../../theme/layout';

export default function VehicleScreen({ navigation }) {
  const { t } = useLanguage();
  const { vehicleData, vehicleErrors, vehicleTouched, updateVehicleField, touchVehicleField, touchAllVehicle } =
    useRegistration();
  const scrollRef = useRef(null);
  const [triedToContinue, setTriedToContinue] = useState(false);

  const categoryOptions = useMemo(() => translateOptions(VEHICLE_CATEGORY_OPTIONS, t), [t]);
  const colorOptions = useMemo(() => translateOptions(VEHICLE_COLOR_OPTIONS, t), [t]);
  const capacityRange = CAPACITY_BY_CATEGORY[vehicleData.category] ?? { min: 1, max: MAX_VEHICLE_CAPACITY };

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
        <Text style={styles.title}>{t('register.tab.vehicle')}</Text>

        <SelectField
          label={t('register.category')}
          value={vehicleData.category}
          options={categoryOptions}
          onChange={(value) => updateVehicleField('category', value)}
          error={errorFor('category')}
        />

        <TextField
          label={t('register.plate')}
          value={vehicleData.plate}
          // Uppercase while typing; the validator also removes spaces and dashes
          onChangeText={(text) => updateVehicleField('plate', text.toUpperCase())}
          onBlur={() => touchVehicleField('plate')}
          error={errorFor('plate')}
          placeholder={t('register.platePlaceholder')}
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={7}
        />

        <TextField
          label={t('register.brand')}
          value={vehicleData.brand}
          onChangeText={(text) => updateVehicleField('brand', text)}
          onBlur={() => touchVehicleField('brand')}
          error={errorFor('brand')}
          placeholder={t('register.brandPlaceholder')}
          maxLength={RULES.maxBrandLength}
        />

        <TextField
          label={t('register.model')}
          value={vehicleData.model}
          onChangeText={(text) => updateVehicleField('model', text)}
          onBlur={() => touchVehicleField('model')}
          error={errorFor('model')}
          placeholder={t('register.modelPlaceholder')}
          maxLength={RULES.maxModelLength}
        />

        <TextField
          label={t('register.year')}
          value={vehicleData.year}
          onChangeText={(text) => updateVehicleField('year', text)}
          onBlur={() => touchVehicleField('year')}
          error={errorFor('year')}
          placeholder={t('register.yearPlaceholder')}
          keyboardType="number-pad"
          maxLength={4}
        />

        <SelectField
          label={t('register.color')}
          value={vehicleData.color}
          options={colorOptions}
          onChange={(value) => updateVehicleField('color', value)}
          error={errorFor('color')}
        />

        <TextField
          label={t('register.capacity')}
          value={vehicleData.capacity}
          onChangeText={(text) => updateVehicleField('capacity', text)}
          onBlur={() => touchVehicleField('capacity')}
          error={errorFor('capacity')}
          placeholder={t('register.capacityPlaceholder', capacityRange)}
          keyboardType="number-pad"
          maxLength={2}
        />

        <PhotoField
          label={t('register.vehiclePhoto')}
          value={vehicleData.vehiclePhoto}
          onChange={(uri) => updateVehicleField('vehiclePhoto', uri)}
          error={errorFor('vehiclePhoto')}
          aspect={[4, 3]}
        />

        {/* Above the button so the tab bar never hides it */}
        {showSummary && <Text style={styles.summaryError}>{t('register.summaryError')}</Text>}

        <Button label={t('register.nextDocuments')} onPress={handleNext} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: space.xl, paddingBottom: space.xxl + space.lg },
  title: { ...type.title, marginBottom: space.xl },
  summaryError: { ...type.bodyStrong, color: colors.error, textAlign: 'center', marginBottom: space.md },
});