// AI-assisted: see docs/AI_LOG.md #19, #24, #29
import { useCallback, useRef } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useLanguage } from '../../context/LanguageContext';
import { categoryLabel, formatCop, paymentMethodLabel } from '../../utils/format';
import { formatDateTime } from '../../utils/dates';
import { getPaymentStatusInfo } from '../../utils/paymentStatus';
import { colors, toneColors } from '../../theme/colors';
import { fonts, type } from '../../theme/typography';
import { space } from '../../theme/layout';

const toLatLng = (place) => ({ latitude: place.lat, longitude: place.lng });

function DetailRow({ label, value, valueColor, strong }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, strong && styles.strong, valueColor && { color: valueColor }]}>{value}</Text>
    </View>
  );
}

// Trip detail: the route is drawn from the saved routePath (no Static Maps, no API quota)
export default function TripDetailModal({ trip, onClose }) {
  const { t } = useLanguage();
  const mapRef = useRef(null);

  const fitRoute = useCallback(() => {
    if (!trip?.origin || !trip?.destination) return;
    const points = trip.routePath?.length > 1 ? trip.routePath : [toLatLng(trip.origin), toLatLng(trip.destination)];
    mapRef.current?.fitToCoordinates(points, {
      edgePadding: { top: 40, right: 40, bottom: 40, left: 40 },
      animated: false,
    });
  }, [trip]);

  const payment = getPaymentStatusInfo(trip?.paymentStatus, t);
  const hasPlaces = Boolean(trip?.origin && trip?.destination);

  return (
    <Modal visible={Boolean(trip)} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      {trip && (
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>{t('detail.title')}</Text>
            <Pressable onPress={onClose} hitSlop={12} style={styles.closeButton}>
              <Text style={styles.close}>{t('detail.close')}</Text>
            </Pressable>
          </View>

          {hasPlaces ? (
            <MapView
              ref={mapRef}
              style={styles.map}
              initialRegion={{ ...toLatLng(trip.origin), latitudeDelta: 0.05, longitudeDelta: 0.05 }}
              onMapReady={fitRoute}
            >
              <Marker coordinate={toLatLng(trip.origin)} title={t('detail.originMarker')} pinColor="green" />
              <Marker coordinate={toLatLng(trip.destination)} title={t('detail.destinationMarker')} pinColor="red" />
              {trip.routePath?.length > 1 && (
                <Polyline coordinates={trip.routePath} strokeWidth={5} strokeColor={colors.primary} />
              )}
            </MapView>
          ) : (
            <Text style={styles.noMap}>{t('detail.noMap')}</Text>
          )}

          <ScrollView contentContainerStyle={styles.details}>
            <DetailRow label={t('detail.date')} value={formatDateTime(trip.completedAtMs, t)} />
            <DetailRow label={t('detail.passenger')} value={trip.passengerName ?? '—'} />
            <Text style={styles.address}>{t('detail.origin', { address: trip.origin?.address ?? '—' })}</Text>
            <Text style={styles.address}>{t('detail.destination', { address: trip.destination?.address ?? '—' })}</Text>
            <DetailRow label={t('detail.distance')} value={Number.isFinite(trip.distanceKm) ? `${trip.distanceKm} km` : '—'} />
            <DetailRow label={t('detail.duration')} value={Number.isFinite(trip.durationMin) ? `${trip.durationMin} min` : '—'} />
            <DetailRow label={t('detail.category')} value={categoryLabel(trip.category, t)} />
            <DetailRow label={t('detail.paymentMethod')} value={paymentMethodLabel(trip.paymentMethod, t)} />
            <DetailRow label={t('detail.paymentStatus')} value={payment.label} valueColor={toneColors[payment.tone]} strong />
            <View style={styles.divider} />
            <DetailRow label={t('detail.fare')} value={formatCop(trip.fare)} />
            <DetailRow
              label={t('detail.commission', {
                percent: Number.isFinite(trip.commissionRate) ? Math.round(trip.commissionRate * 100) : '—',
              })}
              value={`-${formatCop(trip.commission)}`}
            />
            <DetailRow label={t('detail.tip')} value={formatCop(trip.tip)} />
            <DetailRow label={t('detail.net')} value={formatCop(trip.driverEarnings)} valueColor={colors.success} strong />
            <DetailRow
              label={t('detail.rating')}
              value={Number.isFinite(trip.rating) ? `${trip.rating} / 5 ★` : t('detail.noRating')}
            />
          </ScrollView>
        </View>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: space.lg },
  title: type.cardTitle,
  closeButton: { minHeight: 44, justifyContent: 'center' },
  close: { fontFamily: fonts.semibold, fontSize: 16, color: colors.text },
  map: { height: 260 },
  noMap: { ...type.caption, paddingHorizontal: space.lg },
  details: { padding: space.lg, paddingBottom: space.xxl + space.lg },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: space.md },
  label: { ...type.body, color: colors.muted },
  value: {
    ...type.body,
    fontVariant: ['tabular-nums'],
    flexShrink: 1,
    textAlign: 'right',
    marginLeft: space.md,
  },
  strong: { fontFamily: fonts.bold },
  address: { ...type.body, marginTop: space.md },
  divider: { height: 1, backgroundColor: colors.border, marginTop: space.lg },
});