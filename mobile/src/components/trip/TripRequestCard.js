// AI-assisted: see docs/AI_LOG.md #15, #23
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLanguage } from '../../context/LanguageContext';
import { TRIP_CONFIG } from '../../config/trip';
import { categoryLabel, formatCop, paymentMethodLabel } from '../../utils/format';
import { colors } from '../../theme/colors';

function Detail({ label, value, highlight }) {
  return (
    <View style={styles.detail}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, highlight && styles.highlight]}>{value}</Text>
    </View>
  );
}

export default function TripRequestCard({ request, secondsLeft, processing, onAccept, onReject }) {
  const { t } = useLanguage();
  const progress = Math.max(0, secondsLeft / TRIP_CONFIG.requestTimeoutSeconds);
  const urgent = secondsLeft <= 5;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{t('request.title')}</Text>
        <Text style={[styles.timer, urgent && styles.timerUrgent]}>{secondsLeft}s</Text>
      </View>
      <View style={styles.progressTrack}>
        <View
          style={[styles.progressFill, urgent && styles.progressUrgent, { width: `${progress * 100}%` }]}
        />
      </View>

      <Text style={styles.passenger}>{request.passengerName}</Text>
      <Text style={styles.place}>
        <Text style={styles.placeLabel}>{t('request.origin')}</Text>
        {request.origin.address}
      </Text>
      <Text style={styles.place}>
        <Text style={styles.placeLabel}>{t('request.destination')}</Text>
        {request.destination.address}
      </Text>

      <View style={styles.detailsRow}>
        <Detail label={t('request.distance')} value={`${request.distanceKm} km`} />
        <Detail label={t('request.duration')} value={`${request.durationMin} min`} />
        <Detail label={t('request.category')} value={categoryLabel(request.category, t)} />
      </View>
      <View style={styles.detailsRow}>
        <Detail label={t('request.payment')} value={paymentMethodLabel(request.paymentMethod, t)} />
        <Detail label={t('request.fare')} value={formatCop(request.estimatedFare)} />
        <Detail label={t('request.earnings')} value={formatCop(request.estimatedDriverEarnings)} highlight />
      </View>

      <View style={styles.buttons}>
        <Pressable
          style={[styles.button, styles.rejectButton]}
          onPress={onReject}
          disabled={processing}
        >
          <Text style={styles.rejectText}>{t('request.reject')}</Text>
        </Pressable>
        <Pressable
          style={[styles.button, styles.acceptButton, processing && styles.disabled]}
          onPress={onAccept}
          disabled={processing}
        >
          {processing ? (
            <ActivityIndicator color={colors.primaryText} />
          ) : (
            <Text style={styles.acceptText}>{t('request.accept')}</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 32,
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 6,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', color: colors.text },
  timer: { fontSize: 22, fontWeight: 'bold', color: colors.text },
  timerUrgent: { color: colors.error },
  progressTrack: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFill: { height: 6, backgroundColor: colors.primary },
  progressUrgent: { backgroundColor: colors.error },
  passenger: { fontSize: 16, fontWeight: '600', color: colors.text, marginTop: 12 },
  place: { fontSize: 14, color: colors.text, marginTop: 4 },
  placeLabel: { fontWeight: '600' },
  detailsRow: { flexDirection: 'row', marginTop: 12 },
  detail: { flex: 1 },
  detailLabel: { fontSize: 12, color: colors.muted },
  detailValue: { fontSize: 15, fontWeight: '600', color: colors.text, marginTop: 2 },
  highlight: { color: colors.success },
  buttons: { flexDirection: 'row', marginTop: 16 },
  button: { flex: 1, paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  rejectButton: { borderWidth: 1, borderColor: colors.border, marginRight: 8 },
  acceptButton: { backgroundColor: colors.primary, marginLeft: 8 },
  disabled: { opacity: 0.6 },
  rejectText: { fontSize: 16, fontWeight: '600', color: colors.text },
  acceptText: { fontSize: 16, fontWeight: '600', color: colors.primaryText },
});