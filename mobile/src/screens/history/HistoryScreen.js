// AI-assisted: see docs/AI_LOG.md #19, #24, #29
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Platform, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect } from '@react-navigation/native';
import { useDriver } from '../../context/DriverContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTripHistory } from '../../hooks/useTripHistory';
import SegmentedControl from '../../components/common/SegmentedControl';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import TripHistoryItem from '../../components/trip/TripHistoryItem';
import TripDetailModal from '../../components/trip/TripDetailModal';
import { PAYMENT_FILTER_OPTIONS, PERIODS, PERIOD_OPTIONS } from '../../config/history';
import { translateOptions } from '../../i18n';
import { formatDate, getPeriodRange, startOfMonth, validateDateRange } from '../../utils/dates';
import { colors } from '../../theme/colors';
import { fonts, type } from '../../theme/typography';
import { radius, space } from '../../theme/layout';

// Date field: compact picker on iOS, button + dialog on Android. Error under the field.
function DateInput({ label, value, onChange, error, locale }) {
  const [open, setOpen] = useState(false);

  // onValueChange: a date was chosen (the date is always defined); onDismiss: closed without choosing
  const handleValue = (event, selected) => {
    if (Platform.OS === 'android') setOpen(false);
    onChange(selected);
  };

  return (
    <View style={styles.dateField}>
      <Text style={styles.dateLabel}>{label}</Text>
      {Platform.OS === 'ios' ? (
        <DateTimePicker
          value={value}
          mode="date"
          display="compact"
          maximumDate={new Date()}
          onValueChange={handleValue}
          themeVariant="light"
          locale={locale}
        />
      ) : (
        <>
          <Pressable style={styles.dateButton} onPress={() => setOpen(true)}>
            <Text style={styles.dateButtonText}>{formatDate(value)}</Text>
          </Pressable>
          {open && (
            <DateTimePicker
              value={value}
              mode="date"
              maximumDate={new Date()}
              onValueChange={handleValue}
              onDismiss={() => setOpen(false)}
            />
          )}
        </>
      )}
      {error && <Text style={styles.fieldError}>{error}</Text>}
    </View>
  );
}

// Same shape as TripHistoryItem, so the screen does not jump when the trips arrive
function HistorySkeleton() {
  return (
    <View>
      {[0, 1, 2, 3, 4].map((index) => (
        <View key={index} style={styles.skeletonRow}>
          <View style={styles.skeletonHeader}>
            <Skeleton width={120} height={12} />
            <Skeleton width={60} height={12} />
          </View>
          <Skeleton height={14} style={styles.skeletonGap} />
          <Skeleton width="70%" height={14} style={styles.skeletonGapSmall} />
          <View style={styles.skeletonHeader}>
            <Skeleton width={140} height={12} style={styles.skeletonGap} />
            <Skeleton width={70} height={18} style={styles.skeletonGap} />
          </View>
        </View>
      ))}
    </View>
  );
}

export default function HistoryScreen({ navigation }) {
  const { uid } = useDriver();
  const { t, locale } = useLanguage();
  const [period, setPeriod] = useState(PERIODS.week);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [customRange, setCustomRange] = useState(() => ({ from: startOfMonth(new Date()), to: new Date() }));
  const [selectedTrip, setSelectedTrip] = useState(null);

  const periodOptions = useMemo(() => translateOptions(PERIOD_OPTIONS, t), [t]);
  const paymentOptions = useMemo(() => translateOptions(PAYMENT_FILTER_OPTIONS, t), [t]);

  const rangeErrors = useMemo(
    () => (period === PERIODS.range ? validateDateRange(customRange.from, customRange.to, t) : { from: null, to: null }),
    [period, customRange, t],
  );

  // Recalculated only when the filter changes (null if the custom range is invalid)
  const range = useMemo(() => getPeriodRange(period, new Date(), customRange), [period, customRange]);

  const { trips, loading, loadingMore, hasMore, error, reload, loadMore } = useTripHistory({
    driverId: uid,
    range,
    paymentMethod,
  });

  // Reloads when the screen gains focus and whenever a filter changes
  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  const handleSelect = useCallback((trip) => setSelectedTrip(trip), []);
  const handleCloseDetail = useCallback(() => setSelectedTrip(null), []);
  const renderItem = useCallback(({ item }) => <TripHistoryItem trip={item} onPress={handleSelect} />, [handleSelect]);

  const renderEmpty = () => {
    if (loading) return <HistorySkeleton />;
        if (error) return <EmptyState title={t(error)} />;
    if (!range) return <EmptyState title={t('history.fixRange')} />;
    return (
      <EmptyState
        title={t('history.empty')}
        message={t('empty.history.message')}
        actionLabel={t('empty.goHome')}
        onAction={() => navigation.navigate('Home')}
      />
    );
  };

  const renderFooter = () => {
    if (loadingMore) return <ActivityIndicator style={styles.footer} color={colors.primary} />;
    if (error && trips.length > 0) return <Text style={[styles.footerText, styles.errorText]}>{t(error)}</Text>;
    if (trips.length > 0 && !hasMore) return <Text style={styles.footerText}>{t('history.end')}</Text>;
    return null;
  };

  return (
    <View style={styles.screen}>
      <View style={styles.filters}>
        <SegmentedControl options={periodOptions} value={period} onChange={setPeriod} />
        {period === PERIODS.range && (
          <View style={styles.dates}>
            <DateInput
              label={t('history.from')}
              value={customRange.from}
              onChange={(from) => setCustomRange((current) => ({ ...current, from }))}
              error={rangeErrors.from}
              locale={locale}
            />
            <DateInput
              label={t('history.to')}
              value={customRange.to}
              onChange={(to) => setCustomRange((current) => ({ ...current, to }))}
              error={rangeErrors.to}
              locale={locale}
            />
          </View>
        )}
        <View style={styles.paymentFilter}>
          <SegmentedControl options={paymentOptions} value={paymentMethod} onChange={setPaymentMethod} />
        </View>
      </View>

      <FlatList
        data={trips}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl refreshing={loading && trips.length > 0} onRefresh={reload} tintColor={colors.primary} />
        }
        contentContainerStyle={trips.length === 0 && !loading && styles.emptyContainer}
      />

      <TripDetailModal trip={selectedTrip} onClose={handleCloseDetail} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  filters: { padding: space.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
  dates: { flexDirection: 'row', marginTop: space.md },
  dateField: { flex: 1, marginRight: space.sm },
  dateLabel: { ...type.caption, marginBottom: space.xs },
  dateButton: { borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.control, padding: space.md },
  dateButtonText: { fontFamily: fonts.regular, fontSize: 15, color: colors.text },
  fieldError: { ...type.caption, color: colors.error, marginTop: space.xs },
  paymentFilter: { marginTop: space.md },
  emptyContainer: { flexGrow: 1, justifyContent: 'center' },
  skeletonRow: { paddingVertical: space.md, paddingHorizontal: space.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
  skeletonHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  skeletonGap: { marginTop: space.sm },
  skeletonGapSmall: { marginTop: space.xs },
  errorText: { color: colors.error },
  footer: { marginVertical: space.lg },
  footerText: { ...type.caption, textAlign: 'center', marginVertical: space.lg },
});