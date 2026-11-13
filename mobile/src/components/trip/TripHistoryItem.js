// AI-assisted: see docs/AI_LOG.md #19, #24, #29
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useLanguage } from '../../context/LanguageContext';
import { categoryLabel, formatCop, paymentMethodLabel } from '../../utils/format';
import { formatDateTime } from '../../utils/dates';
import { getPaymentStatusInfo } from '../../utils/paymentStatus';
import { colors, toneColors } from '../../theme/colors';
import { fonts, type } from '../../theme/typography';
import { space } from '../../theme/layout';

// One row of the history. memo: it only re-renders if its trip (or the language) changes.
function TripHistoryItem({ trip, onPress }) {
  const { t } = useLanguage();
  const payment = getPaymentStatusInfo(trip.paymentStatus, t);
  return (
    <Pressable style={({ pressed }) => [styles.item, pressed && styles.pressed]} onPress={() => onPress(trip)}>
      <View style={styles.header}>
        <Text style={styles.date}>{formatDateTime(trip.completedAtMs, t)}</Text>
        <Text style={[styles.status, { color: toneColors[payment.tone] }]}>{payment.label}</Text>
      </View>
      <Text style={styles.route} numberOfLines={2}>
        {trip.origin?.address ?? '—'} → {trip.destination?.address ?? '—'}
      </Text>
      <View style={styles.footer}>
        <Text style={styles.meta}>
          {categoryLabel(trip.category, t)} · {paymentMethodLabel(trip.paymentMethod, t)}
        </Text>
        <View style={styles.amounts}>
          <Text style={styles.fare}>{t('history.fare', { amount: formatCop(trip.fare) })}</Text>
          <Text style={styles.earnings}>{formatCop(trip.driverEarnings)}</Text>
        </View>
      </View>
    </Pressable>
  );
}

export default memo(TripHistoryItem);

const styles = StyleSheet.create({
  item: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: space.md,
    paddingHorizontal: space.lg,
  },
  pressed: { backgroundColor: colors.surface },
  header: { flexDirection: 'row', justifyContent: 'space-between' },
  date: type.caption,
  status: { fontFamily: fonts.semibold, fontSize: 13 },
  route: { ...type.body, marginTop: space.xs },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: space.sm },
  meta: { ...type.caption, flexShrink: 1, marginRight: space.sm },
  amounts: { alignItems: 'flex-end' },
  fare: { ...type.caption, fontVariant: ['tabular-nums'] },
  earnings: { ...type.money, fontSize: 18, color: colors.success },
});