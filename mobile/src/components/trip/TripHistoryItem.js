// AI-assisted: see docs/AI_LOG.md #19
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PAYMENT_METHOD_LABELS, categoryLabel, formatCop } from '../../utils/format';
import { formatDateTime } from '../../utils/dates';
import { getPaymentStatusInfo } from '../../utils/paymentStatus';
import { colors, toneColors } from '../../theme/colors';

// One row of the history. memo: it only re-renders if its trip changes.
function TripHistoryItem({ trip, onPress }) {
  const payment = getPaymentStatusInfo(trip.paymentStatus);
  return (
    <Pressable style={({ pressed }) => [styles.item, pressed && styles.pressed]} onPress={() => onPress(trip)}>
      <View style={styles.header}>
        <Text style={styles.date}>{formatDateTime(trip.completedAtMs)}</Text>
        <Text style={[styles.status, { color: toneColors[payment.tone] }]}>{payment.label}</Text>
      </View>
      <Text style={styles.route} numberOfLines={2}>
        {trip.origin?.address ?? '—'} → {trip.destination?.address ?? '—'}
      </Text>
      <View style={styles.row}>
        <Text style={styles.meta}>
          {categoryLabel(trip.category)} · {PAYMENT_METHOD_LABELS[trip.paymentMethod] ?? '—'}
        </Text>
        <Text style={styles.meta}>Tarifa {formatCop(trip.fare)}</Text>
      </View>
      <Text style={styles.earnings}>Ganancia neta {formatCop(trip.driverEarnings)}</Text>
    </Pressable>
  );
}

export default memo(TripHistoryItem);

const styles = StyleSheet.create({
  item: { backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.border, padding: 16 },
  pressed: { backgroundColor: colors.surface },
  header: { flexDirection: 'row', justifyContent: 'space-between' },
  date: { fontSize: 13, color: colors.muted },
  status: { fontSize: 13, fontWeight: 'bold' },
  route: { fontSize: 15, color: colors.text, marginTop: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  meta: { fontSize: 13, color: colors.muted },
  earnings: { fontSize: 15, fontWeight: 'bold', color: colors.success, marginTop: 6 },
});