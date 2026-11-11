// AI-assisted: see docs/AI_LOG.md #14
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useDriver } from '../../context/DriverContext';
import { createSimulatedTrip, getSimulatorErrorMessage } from '../../services/tripService';
import { PAYMENT_METHODS } from '../../config/trip';
import { colors } from '../../theme/colors';

// Replaces the passenger app (it does not exist in this project): creates real trip requests
export default function PassengerSimulatorScreen() {
  const { driver } = useDriver();
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState(null);

  const canSimulate = Boolean(driver?.isAvailable) && !creating;

  const handleCreate = useCallback(
    async (paymentMethod) => {
      setCreating(true);
      setMessage(null);
      try {
        await createSimulatedTrip({ driver, paymentMethod });
        setMessage({ type: 'ok', text: 'Solicitud creada. Vuelve a Inicio para verla.' });
      } catch (error) {
        setMessage({ type: 'error', text: getSimulatorErrorMessage(error) });
      } finally {
        setCreating(false);
      }
    },
    [driver],
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Simulador de pasajero</Text>
      <Text style={styles.description}>
        Reemplaza la app del pasajero: crea una solicitud de viaje real cerca de tu ubicación, con
        ruta, distancia, duración y tarifa estimada.
      </Text>

      {!driver?.isAvailable && (
        <Text style={styles.warning}>Ponte Disponible en Inicio para poder recibir solicitudes.</Text>
      )}

      <Pressable
        style={[styles.button, !canSimulate && styles.buttonDisabled]}
        disabled={!canSimulate}
        onPress={() => handleCreate(PAYMENT_METHODS.mercadopago)}
      >
        <Text style={styles.buttonText}>Solicitar viaje — pago con tarjeta</Text>
      </Pressable>

      <Pressable
        style={[styles.button, styles.secondaryButton, !canSimulate && styles.buttonDisabled]}
        disabled={!canSimulate}
        onPress={() => handleCreate(PAYMENT_METHODS.cash)}
      >
        <Text style={[styles.buttonText, styles.secondaryText]}>
          Solicitar viaje — pago en efectivo
        </Text>
      </Pressable>

      {creating && (
        <View style={styles.row}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.progress}>Calculando ruta y direcciones…</Text>
        </View>
      )}
      {message && (
        <Text style={message.type === 'ok' ? styles.ok : styles.error}>{message.text}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 24 },
  title: { fontSize: 22, fontWeight: 'bold', color: colors.text },
  description: { fontSize: 15, color: colors.muted, marginTop: 8, marginBottom: 24 },
  warning: { fontSize: 14, color: '#B45309', marginBottom: 16 },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  secondaryButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: colors.primaryText, fontSize: 16, fontWeight: '600' },
  secondaryText: { color: colors.text },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  progress: { marginLeft: 8, color: colors.muted },
  ok: { color: '#15803D', marginTop: 12, fontWeight: '600' },
  error: { color: colors.error, marginTop: 12, fontWeight: '600' },
});