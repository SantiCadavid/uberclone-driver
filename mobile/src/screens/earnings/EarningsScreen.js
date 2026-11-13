// AI-assisted: see docs/AI_LOG.md #19, #24
import { useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useDriver } from '../../context/DriverContext';
import { useLanguage } from '../../context/LanguageContext';
import { useEarnings } from '../../hooks/useEarnings';
import SegmentedControl from '../../components/common/SegmentedControl';
import { EARNINGS_PERIOD_OPTIONS, PERIODS } from '../../config/history';
import { translateOptions } from '../../i18n';
import { formatCop } from '../../utils/format';
import { colors } from '../../theme/colors';

const withSign = (value) => `${value > 0 ? '+' : ''}${formatCop(value)}`;

function Metric({ label, value, valueColor }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, valueColor && { color: valueColor }]}>{value}</Text>
    </View>
  );
}

export default function EarningsScreen() {
  const { uid, driver } = useDriver();
  const { t } = useLanguage();
  const { summaries, loading, error } = useEarnings(uid);
  const [period, setPeriod] = useState(PERIODS.today);
  const periodOptions = useMemo(() => translateOptions(EARNINGS_PERIOD_OPTIONS, t), [t]);
  const summary = summaries[period];
  const balance = driver?.balance;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>{t('earnings.balance')}</Text>
        <Text style={[styles.balanceValue, balance < 0 && styles.negative]}>{formatCop(balance)}</Text>
        <Text style={styles.note}>{t('earnings.balanceNote')}</Text>
      </View>

      <SegmentedControl options={periodOptions} value={period} onChange={setPeriod} />

      {loading && <ActivityIndicator style={styles.spinner} size="large" color={colors.primary} />}
      {!loading && error && <Text style={styles.error}>{t(error)}</Text>}
      {!loading && !error && (
        <>
          {summary.tripCount === 0 && <Text style={styles.empty}>{t('earnings.empty')}</Text>}
          <View style={styles.grid}>
            <Metric label={t('earnings.trips')} value={String(summary.tripCount)} />
            <Metric label={t('earnings.billed')} value={formatCop(summary.totalBilled)} />
            <Metric label={t('earnings.commissions')} value={`-${formatCop(summary.totalCommission)}`} />
            <Metric label={t('earnings.tips')} value={formatCop(summary.totalTips)} />
            <Metric label={t('earnings.net')} value={formatCop(summary.netEarnings)} valueColor={colors.success} />
            <Metric label={t('earnings.average')} value={formatCop(summary.averagePerTrip)} />
            <Metric
              label={t('earnings.movement')}
              value={withSign(summary.balanceChange)}
              valueColor={summary.balanceChange < 0 ? colors.error : colors.text}
            />
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 40 },
  balanceCard: { backgroundColor: colors.primary, borderRadius: 12, padding: 16, marginBottom: 16 },
  balanceLabel: { fontSize: 14, color: colors.primaryText },
  balanceValue: { fontSize: 32, fontWeight: 'bold', color: colors.primaryText, marginTop: 4 },
  negative: { color: '#FCA5A5' },
  note: { fontSize: 12, color: colors.border, marginTop: 8 },
  spinner: { marginTop: 32 },
  error: { fontSize: 15, color: colors.error, textAlign: 'center', marginTop: 24 },
  empty: { fontSize: 14, color: colors.muted, textAlign: 'center', marginTop: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 16 },
  metric: { width: '48%', backgroundColor: colors.surface, borderRadius: 10, padding: 12, marginBottom: 12 },
  metricLabel: { fontSize: 13, color: colors.muted },
  metricValue: { fontSize: 18, fontWeight: 'bold', color: colors.text, marginTop: 4 },
});