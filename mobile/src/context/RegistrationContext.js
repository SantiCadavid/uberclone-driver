// AI-assisted: see docs/AI_LOG.md #8
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { validatePersonalData, validateVehicleData } from '../utils/validators';

const INITIAL_PERSONAL_DATA = {
  profilePhoto: null,
  fullName: '',
  documentId: '',
  phone: '',
  birthDate: null,
  gender: null,
  email: '',
  language: 'es',
  password: '',
  confirmPassword: '',
};

const INITIAL_VEHICLE_DATA = {
  category: null,
  plate: '',
  brand: '',
  model: '',
  year: '',
  color: null,
  capacity: '',
  vehiclePhoto: null,
};

const markAllTouched = (data) =>
  Object.fromEntries(Object.keys(data).map((field) => [field, true]));

// Returns the same object when the field is already touched, so React skips the re-render
const markFieldTouched = (previous, field) =>
  previous[field] ? previous : { ...previous, [field]: true };

const RegistrationContext = createContext(null);

export function RegistrationProvider({ children }) {
  const [personalData, setPersonalData] = useState(INITIAL_PERSONAL_DATA);
  const [vehicleData, setVehicleData] = useState(INITIAL_VEHICLE_DATA);
  // A field shows its error after the user changes it, leaves it, or tries to continue
  const [personalTouched, setPersonalTouched] = useState({});
  const [vehicleTouched, setVehicleTouched] = useState({});

  const updatePersonalField = useCallback((field, value) => {
    setPersonalData((previous) => ({ ...previous, [field]: value }));
    setPersonalTouched((previous) => markFieldTouched(previous, field));
  }, []);

  const updateVehicleField = useCallback((field, value) => {
    setVehicleData((previous) => ({ ...previous, [field]: value }));
    setVehicleTouched((previous) => markFieldTouched(previous, field));
  }, []);

  // Used on blur: leaving an empty field shows "Este campo es obligatorio."
  const touchPersonalField = useCallback((field) => {
    setPersonalTouched((previous) => markFieldTouched(previous, field));
  }, []);

  const touchVehicleField = useCallback((field) => {
    setVehicleTouched((previous) => markFieldTouched(previous, field));
  }, []);

  const touchAllPersonal = useCallback(() => {
    setPersonalTouched(markAllTouched(INITIAL_PERSONAL_DATA));
  }, []);

  const touchAllVehicle = useCallback(() => {
    setVehicleTouched(markAllTouched(INITIAL_VEHICLE_DATA));
  }, []);

  // Errors are recalculated only when the data of that tab changes
  const personalErrors = useMemo(() => validatePersonalData(personalData), [personalData]);
  const vehicleErrors = useMemo(() => validateVehicleData(vehicleData), [vehicleData]);

  const value = useMemo(
    () => ({
      personalData,
      vehicleData,
      personalErrors,
      vehicleErrors,
      personalTouched,
      vehicleTouched,
      updatePersonalField,
      updateVehicleField,
      touchPersonalField,
      touchVehicleField,
      touchAllPersonal,
      touchAllVehicle,
    }),
    [
      personalData,
      vehicleData,
      personalErrors,
      vehicleErrors,
      personalTouched,
      vehicleTouched,
      updatePersonalField,
      updateVehicleField,
      touchPersonalField,
      touchVehicleField,
      touchAllPersonal,
      touchAllVehicle,
    ],
  );

  return <RegistrationContext.Provider value={value}>{children}</RegistrationContext.Provider>;
}

export function useRegistration() {
  const context = useContext(RegistrationContext);
  if (!context) {
    throw new Error('useRegistration must be used inside RegistrationProvider');
  }
  return context;
}