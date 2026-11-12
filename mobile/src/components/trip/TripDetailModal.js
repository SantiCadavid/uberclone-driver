// AI-assisted: see docs/AI_LOG.md #19
import { useCallback, useRef } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { PAYMENT_METHOD_LABELS, categoryLabel, formatCop } from '../../utils/format';
import { formatDateTime } from '../../utils/dates';
import { getPaymentStatusInfo } from '../../utils/paymentStatus';
import { colors, toneColors } from '../../theme/colors';

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
  const mapRef = useRef(null);

  const fitRoute = useCallback(() => {
    if (!trip?.origin || !trip?.destination) return;
    const points = trip.routePath?.length > 1 ? trip.routePath : [toLatLng(trip.origin), toLatLng(trip.destination)];
    mapRef.current?.fitToCoordinates(points, {
      edgePadding: { top: 40, right: 40, bottom: 40, left: 40 },
      animated: false,
    });
  }, [trip]);

  const payment = getPaymentStatusInfo(trip?.paymentStatus);
  const hasPlaces = Boolean(trip?.origin && trip?.destination);

  return (
    <Modal visible={Boolean(trip)} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      {trip && (
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Detalle del viaje</Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <Text style={styles.close}>Cerrar</Text>
            </Pressable>
          </View>

          {hasPlaces ? (
            <MapView ref={mapRef} style={styles.map} initialRegion={{ ...toLatLng(trip.origin), latitudeDelta: 0.05, longitudeDelta: 0.05 }} onMapReady={fitRoute}>
              <Marker coordinate={toLatLng(trip.origin)} title="Origen" pinColor="green" />
              <Marker coordinate={toLatLng(trip.destination)} title="Destino" pinColor="red" />
              {trip.routePath?.length > 1 && (
                <Polyline coordinates={trip.routePath} strokeWidth={4} strokeColor={colors.primary} />
              )}
            </MapView>
          ) : (
            <Text style={styles.noMap}>Este viaje no tiene ubicaciones guardadas.</Text>
          )}

          <ScrollView contentContainerStyle={styles.details}>
            <DetailRow label="Fecha" value={formatDateTime(trip.completedAtMs)} />
            <DetailRow label="Pasajero" value={trip.passengerName ?? '—'} />
            <Text style={styles.address}>Origen: {trip.origin?.address ?? '—'}</Text>
            <Text style={styles.address}>Destino: {trip.destination?.address ?? '—'}</Text>
            <DetailRow label="Distancia" value={Number.isFinite(trip.distanceKm) ? `${trip.distanceKm} km` : '—'} />
            <DetailRow label="Duración" value={Number.isFinite(trip.durationMin) ? `${trip.durationMin} min` : '—'} />
            <DetailRow label="Categoría" value={categoryLabel(trip.category)} />
            <DetailRow label="Método de pago" value={PAYMENT_METHOD_LABELS[trip.paymentMethod] ?? '—'} />
            <DetailRow label="Estado del pago" value={payment.label} valueColor={toneColors[payment.tone]} strong />
            <DetailRow label="Tarifa" value={formatCop(trip.fare)} />
            <DetailRow
              label={`Comisión (${Number.isFinite(trip.commissionRate) ? Math.round(trip.commissionRate * 100) : '—'} %)`}
              value={`-${formatCop(trip.commission)}`}
            />
            <DetailRow label="Propina" value={formatCop(trip.tip)} />
            <DetailRow label="Ganancia neta" value={formatCop(trip.driverEarnings)} valueColor={colors.success} strong />
            <DetailRow
              label="Calificación del pasajero"
              value={Number.isFinite(trip.rating) ? `${trip.rating} / 5 ★` : 'Sin calificación'}
            />
          </ScrollView>
        </View>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', color: colors.text },
  close: { fontSize: 16, fontWeight: '600', color: colors.text },
  map: { height: 260 },
  noMap: { fontSize: 14, color: colors.muted, paddingHorizontal: 16 },
  details: { padding: 16, paddingBottom: 40 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  label: { fontSize: 15, color: colors.muted },
  value: { fontSize: 15, color: colors.text, flexShrink: 1, textAlign: 'right', marginLeft: 12 },
  strong: { fontWeight: 'bold' },
  address: { fontSize: 15, color: colors.text, marginTop: 10 },
});