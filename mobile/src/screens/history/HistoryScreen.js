// AI-assisted: see docs/AI_LOG.md #19
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Platform, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect } from '@react-navigation/native';
import { useDriver } from '../../context/DriverContext';
import { useTripHistory } from '../../hooks/useTripHistory';
import SegmentedControl from '../../components/common/SegmentedControl';
import TripHistoryItem from '../../components/trip/TripHistoryItem';
import TripDetailModal from '../../components/trip/TripDetailModal';
import { PAYMENT_FILTER_OPTIONS, PERIODS, PERIOD_OPTIONS } from '../../config/history';
import { formatDate, getPeriodRange, startOfMonth, validateDateRange } from '../../utils/dates';
import { colors } from '../../theme/colors';

// Date field: compact picker on iOS, button + dialog on Android. Error under the field.
function DateInput({ label, value, onChange, error }) {
  const [open, setOpen] = useState(false);

  const handleChange = (event, selected) => {
    if (Platform.OS === 'android') setOpen(false);
    if (selected && event.type !== 'dismissed') onChange(selected);
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
          onChange={handleChange}
          themeVariant="light"
          locale="es-CO"
        />
      ) : (
        <>
          <Pressable style={styles.dateButton} onPress={() => setOpen(true)}>
            <Text style={styles.dateButtonText}>{formatDate(value)}</Text>
          </Pressable>
          {open && <DateTimePicker value={value} mode="date" maximumDate={new Date()} onChange={handleChange} />}
        </>
      )}
      {error && <Text style={styles.fieldError}>{error}</Text>}
    </View>
  );
}

export default function HistoryScreen() {
  const { uid } = useDriver();
  const [period, setPeriod] = useState(PERIODS.week);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [customRange, setCustomRange] = useState(() => ({ from: startOfMonth(new Date()), to: new Date() }));
  const [selectedTrip, setSelectedTrip] = useState(null);

  const rangeErrors = useMemo(
    () => (period === PERIODS.range ? validateDateRange(customRange.from, customRange.to) : { from: null, to: null }),
    [period, customRange],
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
    if (loading) return <ActivityIndicator style={styles.emptySpinner} size="large" color={colors.primary} />;
    if (error) return <Text style={[styles.empty, styles.errorText]}>{error}</Text>;
    if (!range) return <Text style={styles.empty}>Corrige el rango de fechas para ver tus viajes.</Text>;
    return <Text style={styles.empty}>No tienes viajes en este periodo.</Text>;
  };

  const renderFooter = () => {
    if (loadingMore) return <ActivityIndicator style={styles.footer} color={colors.primary} />;
    if (error && trips.length > 0) return <Text style={[styles.footerText, styles.errorText]}>{error}</Text>;
    if (trips.length > 0 && !hasMore) return <Text style={styles.footerText}>No hay más viajes.</Text>;
    return null;
  };

  return (
    <View style={styles.screen}>
      <View style={styles.filters}>
        <SegmentedControl options={PERIOD_OPTIONS} value={period} onChange={setPeriod} />
        {period === PERIODS.range && (
          <View style={styles.dates}>
            <DateInput
              label="Desde"
              value={customRange.from}
              onChange={(from) => setCustomRange((current) => ({ ...current, from }))}
              error={rangeErrors.from}
            />
            <DateInput
              label="Hasta"
              value={customRange.to}
              onChange={(to) => setCustomRange((current) => ({ ...current, to }))}
              error={rangeErrors.to}
            />
          </View>
        )}
        <View style={styles.paymentFilter}>
          <SegmentedControl options={PAYMENT_FILTER_OPTIONS} value={paymentMethod} onChange={setPaymentMethod} />
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
        refreshControl={<RefreshControl refreshing={loading && trips.length > 0} onRefresh={reload} />}
        contentContainerStyle={trips.length === 0 && styles.emptyContainer}
      />

      <TripDetailModal trip={selectedTrip} onClose={handleCloseDetail} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  filters: { padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  dates: { flexDirection: 'row', marginTop: 12 },
  dateField: { flex: 1, marginRight: 8 },
  dateLabel: { fontSize: 13, color: colors.muted, marginBottom: 4 },
  dateButton: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 10 },
  dateButtonText: { fontSize: 15, color: colors.text },
  fieldError: { fontSize: 13, color: colors.error, marginTop: 4 },
  paymentFilter: { marginTop: 12 },
  emptyContainer: { flexGrow: 1, justifyContent: 'center' },
  emptySpinner: { marginTop: 40 },
  empty: { fontSize: 15, color: colors.muted, textAlign: 'center', padding: 24 },
  errorText: { color: colors.error },
  footer: { marginVertical: 16 },
  footerText: { fontSize: 13, color: colors.muted, textAlign: 'center', marginVertical: 16 },
});