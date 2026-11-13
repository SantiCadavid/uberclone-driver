// AI-assisted: see docs/AI_LOG.md #14, #23
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useDriver } from '../../context/DriverContext';
import { useLanguage } from '../../context/LanguageContext';
import { createSimulatedTrip, getSimulatorErrorKey } from '../../services/tripService';
import { PAYMENT_METHODS } from '../../config/trip';
import { colors } from '../../theme/colors';

// Replaces the passenger app (it does not exist in this project): creates real trip requests
export default function PassengerSimulatorScreen() {
  const { t } = useLanguage();
  const { driver } = useDriver();
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState(null); // { type, key }

  const canSimulate = Boolean(driver?.isAvailable) && !creating;

  const handleCreate = useCallback(
    async (paymentMethod) => {
      setCreating(true);
      setMessage(null);
      try {
        await createSimulatedTrip({ driver, paymentMethod });
        setMessage({ type: 'ok', key: 'simulator.created' });
      } catch (error) {
        setMessage({ type: 'error', key: getSimulatorErrorKey(error) });
      } finally {
        setCreating(false);
      }
    },
    [driver],
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('simulator.title')}</Text>
      <Text style={styles.description}>{t('simulator.description')}</Text>

      {!driver?.isAvailable && <Text style={styles.warning}>{t('simulator.warning')}</Text>}

      <Pressable
        style={[styles.button, !canSimulate && styles.buttonDisabled]}
        disabled={!canSimulate}
        onPress={() => handleCreate(PAYMENT_METHODS.mercadopago)}
      >
        <Text style={styles.buttonText}>{t('simulator.card')}</Text>
      </Pressable>

      <Pressable
        style={[styles.button, styles.secondaryButton, !canSimulate && styles.buttonDisabled]}
        disabled={!canSimulate}
        onPress={() => handleCreate(PAYMENT_METHODS.cash)}
      >
        <Text style={[styles.buttonText, styles.secondaryText]}>{t('simulator.cash')}</Text>
      </Pressable>

      {creating && (
        <View style={styles.row}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.progress}>{t('simulator.progress')}</Text>
        </View>
      )}
      {message && <Text style={message.type === 'ok' ? styles.ok : styles.error}>{t(message.key)}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 24 },
  title: { fontSize: 22, fontWeight: 'bold', color: colors.text },
  description: { fontSize: 15, color: colors.muted, marginTop: 8, marginBottom: 24 },
  warning: { fontSize: 14, color: colors.warning, marginBottom: 16 },
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
  ok: { color: colors.success, marginTop: 12, fontWeight: '600' },
  error: { color: colors.error, marginTop: 12, fontWeight: '600' },
});