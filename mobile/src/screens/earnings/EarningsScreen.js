// AI-assisted: see docs/AI_LOG.md #19, #24, #29
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useDriver } from '../../context/DriverContext';
import { useLanguage } from '../../context/LanguageContext';
import { useEarnings } from '../../hooks/useEarnings';
import SegmentedControl from '../../components/common/SegmentedControl';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import { EARNINGS_PERIOD_OPTIONS, PERIODS } from '../../config/history';
import { translateOptions } from '../../i18n';
import { formatCop } from '../../utils/format';
import { colors } from '../../theme/colors';
import { fonts, type } from '../../theme/typography';
import { radius, space } from '../../theme/layout';

const withSign = (value) => `${value > 0 ? '+' : ''}${formatCop(value)}`;

function Metric({ label, value, valueColor }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, valueColor && { color: valueColor }]}>{value}</Text>
    </View>
  );
}

// Same grid as the real metrics, so nothing jumps when the totals arrive
function MetricsSkeleton() {
  return (
    <View style={styles.grid}>
      {[0, 1, 2, 3, 4, 5].map((index) => (
        <View key={index} style={styles.metric}>
          <Skeleton width="60%" height={12} />
          <Skeleton width="80%" height={20} style={styles.skeletonGap} />
        </View>
      ))}
    </View>
  );
}

export default function EarningsScreen({ navigation }) {
  const { uid, driver } = useDriver();
  const { t } = useLanguage();
  const { summaries, loading, error } = useEarnings(uid);
  const [period, setPeriod] = useState(PERIODS.today);
  const periodOptions = useMemo(() => translateOptions(EARNINGS_PERIOD_OPTIONS, t), [t]);
  const summary = summaries[period];
  const balance = driver?.balance;

  const renderContent = () => {
    if (loading) return <MetricsSkeleton />;
    if (error) return <EmptyState title={t(error)} />;
    if (summary.tripCount === 0) {
      return (
        <EmptyState
          title={t('empty.earnings.title')}
          message={t('empty.earnings.message')}
          actionLabel={t('empty.goHome')}
          onAction={() => navigation.navigate('Home')}
        />
      );
    }
    return (
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
    );
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>{t('earnings.balance')}</Text>
        <Text style={[styles.balanceValue, balance < 0 && styles.negative]}>{formatCop(balance)}</Text>
        <Text style={styles.balanceNote}>{t('earnings.balanceNote')}</Text>
      </View>

      <SegmentedControl options={periodOptions} value={period} onChange={setPeriod} />

      {renderContent()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: space.lg, paddingBottom: space.xxl + space.lg },
  balanceCard: { backgroundColor: colors.primary, borderRadius: radius.card, padding: space.lg, marginBottom: space.lg },
  balanceLabel: { fontFamily: fonts.medium, fontSize: 14, color: colors.primaryText },
  balanceValue: {
    fontFamily: fonts.bold,
    fontSize: 38,
    lineHeight: 44,
    color: colors.primaryText,
    marginTop: space.xs,
    fontVariant: ['tabular-nums'],
  },
  negative: { color: '#FFB4A8' },
  balanceNote: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 17, color: colors.border, marginTop: space.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: space.lg },
  metric: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: space.md,
    marginBottom: space.md,
  },
  metricLabel: type.caption,
  metricValue: { ...type.money, fontSize: 20, marginTop: space.xs },
  skeletonGap: { marginTop: space.sm },
});