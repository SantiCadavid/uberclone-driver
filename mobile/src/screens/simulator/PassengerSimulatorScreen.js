// AI-assisted: see docs/AI_LOG.md #14, #23, #28
import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useDriver } from '../../context/DriverContext';
import { useLanguage } from '../../context/LanguageContext';
import Button from '../../components/common/Button';
import { createSimulatedTrip, getSimulatorErrorKey } from '../../services/tripService';
import { PAYMENT_METHODS } from '../../config/trip';
import { colors } from '../../theme/colors';
import { fonts, type } from '../../theme/typography';
import { radius, space } from '../../theme/layout';

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

      {!driver?.isAvailable && (
        <View style={styles.warningBox}>
          <Text style={styles.warning}>{t('simulator.warning')}</Text>
        </View>
      )}

      <Button
        label={t('simulator.card')}
        onPress={() => handleCreate(PAYMENT_METHODS.mercadopago)}
        disabled={!canSimulate}
        style={styles.button}
      />
      <Button
        label={t('simulator.cash')}
        variant="secondary"
        onPress={() => handleCreate(PAYMENT_METHODS.cash)}
        disabled={!canSimulate}
        style={styles.button}
      />

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
  container: { flex: 1, backgroundColor: colors.background, padding: space.xl },
  title: type.title,
  description: { ...type.body, color: colors.muted, marginTop: space.sm, marginBottom: space.xl },
  warningBox: { backgroundColor: '#FBF0D0', borderRadius: radius.card, padding: space.md, marginBottom: space.lg },
  warning: { ...type.body, color: colors.warning },
  button: { marginBottom: space.md },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: space.sm },
  progress: { ...type.body, color: colors.muted, marginLeft: space.sm },
  ok: { fontFamily: fonts.semibold, fontSize: 15, color: colors.success, marginTop: space.md },
  error: { fontFamily: fonts.semibold, fontSize: 15, color: colors.error, marginTop: space.md },
});