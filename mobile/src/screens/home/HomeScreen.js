// AI-assisted: see docs/AI_LOG.md #6, #11
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useDriverProfile } from '../../hooks/useDriverProfile';
import { getAuthErrorMessage, logout } from '../../services/authService';
import { VEHICLE_CATEGORY_OPTIONS } from '../../config/registration';
import { APPROVAL_STATUS } from '../../utils/driverDocument';
import { colors } from '../../theme/colors';

const STATUS_DISPLAY = {
  [APPROVAL_STATUS.pending]: {
    label: 'Pendiente de aprobación',
    detail: 'Estamos revisando tus datos. No puedes ponerte Disponible hasta que tu cuenta sea aprobada.',
    color: '#B45309',
    background: '#FEF3C7',
  },
  [APPROVAL_STATUS.approved]: {
    label: 'Aprobado',
    detail: 'Tu cuenta fue aprobada. El modo Disponible llega en la siguiente entrega.',
    color: '#15803D',
    background: '#DCFCE7',
  },
};

const categoryLabel = (value) =>
  VEHICLE_CATEGORY_OPTIONS.find((option) => option.value === value)?.label ?? value;

export default function HomeScreen() {
  const { user } = useAuth();
  const { driver, loading, error } = useDriverProfile(user?.uid);
  const [logoutError, setLogoutError] = useState(null);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (logoutFailure) {
      setLogoutError(getAuthErrorMessage(logoutFailure));
    }
  };

  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator size="large" color={colors.primary} />;
    }
    if (error) {
      return <Text style={styles.errorText}>{error}</Text>;
    }
    if (!driver) {
      // E.g. an account created by hand in the console, without a driver profile
      return (
        <Text style={styles.note}>
          No encontramos tu perfil de conductor. Cierra sesión y completa el registro.
        </Text>
      );
    }

    const status = STATUS_DISPLAY[driver.approvalStatus] ?? STATUS_DISPLAY[APPROVAL_STATUS.pending];
    return (
      <>
        <Text style={styles.title}>Hola, {driver.fullName}</Text>
        <Text style={styles.email}>{driver.email}</Text>

        <View style={[styles.badge, { backgroundColor: status.background }]}>
          <Text style={[styles.badgeText, { color: status.color }]}>{status.label}</Text>
        </View>
        <Text style={styles.note}>{status.detail}</Text>

        <View style={styles.vehicleBox}>
          <Text style={styles.vehicleTitle}>Tu vehículo</Text>
          <Text style={styles.vehicleText}>
            {driver.vehicle.brand} {driver.vehicle.model} · {driver.vehicle.year}
          </Text>
          <Text style={styles.vehicleText}>
            Placa {driver.vehicle.plate} · {categoryLabel(driver.vehicle.category)}
          </Text>
        </View>
      </>
    );
  };

  return (
    <View style={styles.container}>
      {renderContent()}

      <Pressable style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Cerrar sesión</Text>
      </Pressable>
      {logoutError && <Text style={styles.errorText}>{logoutError}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: { fontSize: 22, fontWeight: 'bold', color: colors.text, textAlign: 'center' },
  email: { fontSize: 15, color: colors.muted, marginTop: 4 },
  badge: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 999, marginTop: 20 },
  badgeText: { fontSize: 15, fontWeight: 'bold' },
  note: { fontSize: 14, color: colors.muted, textAlign: 'center', marginTop: 12 },
  vehicleBox: {
    alignSelf: 'stretch',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 16,
    marginTop: 24,
  },
  vehicleTitle: { fontSize: 15, fontWeight: '600', color: colors.text, marginBottom: 6 },
  vehicleText: { fontSize: 15, color: colors.text, marginTop: 2 },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 32,
  },
  buttonText: { color: colors.primaryText, fontSize: 16, fontWeight: '600' },
  errorText: { color: colors.error, textAlign: 'center', marginTop: 12 },
});