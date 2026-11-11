// AI-assisted: see docs/AI_LOG.md #16
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useDriver } from '../../context/DriverContext';
import { useDriverLocation } from '../../hooks/useDriverLocation';
import {
  cancelTripByDriver,
  finishTrip,
  getTripErrorMessage,
  startPickup,
  startTrip,
} from '../../services/tripService';
import { withTimeout } from '../../utils/withTimeout';
import { PAYMENT_METHOD_LABELS, formatCop } from '../../utils/format';
import { TRIP_CONFIG, TRIP_STATUS } from '../../config/trip';
import { LOCATION_CONFIG } from '../../config/location';
import { colors } from '../../theme/colors';

const toLatLng = (place) => ({ latitude: place.lat, longitude: place.lng });

function Row({ label, value, strong }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, strong && styles.rowStrong]}>{value}</Text>
    </View>
  );
}

export default function ActiveTripScreen() {
  const { uid, activeTrip: trip } = useDriver();
  // Location keeps updating during the whole trip (cleanup when the screen closes)
  const { location, permissionDenied } = useDriverLocation({ uid, tracking: true });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);
  const pickupStartedRef = useRef(null);
  const mapRef = useRef(null);

  const status = trip?.status;

  // accepted -> driver_arriving: calculate the route to the pickup only once per trip
  useEffect(() => {
    if (!trip || status !== TRIP_STATUS.accepted) return;
    if (!location && !permissionDenied) return; // wait for the first position
    if (pickupStartedRef.current === trip.id) return;
    pickupStartedRef.current = trip.id;

    withTimeout(startPickup(trip, location), TRIP_CONFIG.routingTimeoutMs + TRIP_CONFIG.actionTimeoutMs)
      .then((routed) => {
        if (!routed) {
          setMessage({ type: 'info', text: 'No se pudo calcular la ruta a la recogida. Guíate por el marcador verde.' });
        }
      })
      .catch((pickupError) => {
        pickupStartedRef.current = null; // allow a retry
        setMessage({ type: 'error', text: getTripErrorMessage(pickupError) });
      });
  }, [trip?.id, status, location, permissionDenied]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fit the map to what matters in each stage
  useEffect(() => {
    if (!trip) return;
    const points =
      status === TRIP_STATUS.inProgress || status === TRIP_STATUS.completed
        ? [toLatLng(trip.origin), toLatLng(trip.destination)]
        : [toLatLng(trip.origin), ...(location ? [location] : [])];
    mapRef.current?.fitToCoordinates(points, {
      edgePadding: { top: 80, right: 60, bottom: 360, left: 60 },
      animated: true,
    });
  }, [trip?.id, status]); // eslint-disable-line react-hooks/exhaustive-deps

  const runAction = useCallback(async (action) => {
    setBusy(true);
    setMessage(null);
    try {
      await withTimeout(action(), TRIP_CONFIG.actionTimeoutMs);
    } catch (actionError) {
      setMessage({ type: 'error', text: getTripErrorMessage(actionError) });
    } finally {
      setBusy(false);
    }
  }, []);

  const handlePickedUp = useCallback(() => runAction(() => startTrip(trip.id)), [runAction, trip]);

  const handleFinish = useCallback(() => runAction(() => finishTrip(trip)), [runAction, trip]);

  const handleCancel = useCallback(() => {
    Alert.alert('Cancelar viaje', '¿Seguro que quieres cancelar este viaje?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Sí, cancelar',
        style: 'destructive',
        onPress: () => runAction(() => cancelTripByDriver(trip.id)),
      },
    ]);
  }, [runAction, trip]);

  if (!trip) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const showPickupLeg = status === TRIP_STATUS.accepted || status === TRIP_STATUS.driverArriving;
  const pickupPath = trip.pickupRoute?.path;

  const renderStage = () => {
    switch (status) {
      case TRIP_STATUS.accepted:
        return (
          <View style={styles.inline}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.subtitle}>Calculando ruta a la recogida…</Text>
          </View>
        );

      case TRIP_STATUS.driverArriving:
        return (
          <>
            <Text style={styles.title}>Recoge a {trip.passengerName}</Text>
            <Text style={styles.address}>{trip.origin.address}</Text>
            {trip.pickupRoute && (
              <Text style={styles.subtitle}>
                {trip.pickupRoute.distanceKm} km · {trip.pickupRoute.durationMin} min hasta la recogida
              </Text>
            )}
            <View style={styles.buttons}>
              <Pressable style={[styles.button, styles.secondary]} onPress={handleCancel} disabled={busy}>
                <Text style={styles.secondaryText}>Cancelar viaje</Text>
              </Pressable>
              <Pressable style={[styles.button, styles.primary]} onPress={handlePickedUp} disabled={busy}>
                {busy ? <ActivityIndicator color={colors.primaryText} /> : <Text style={styles.primaryText}>Pasajero a bordo</Text>}
              </Pressable>
            </View>
          </>
        );

      case TRIP_STATUS.inProgress:
        return (
          <>
            <Text style={styles.title}>En viaje con {trip.passengerName}</Text>
            <Text style={styles.address}>Destino: {trip.destination.address}</Text>
            <Text style={styles.subtitle}>
              {trip.distanceKm} km · {trip.durationMin} min · {PAYMENT_METHOD_LABELS[trip.paymentMethod]}
            </Text>
            <Pressable style={[styles.button, styles.primary, styles.fullButton]} onPress={handleFinish} disabled={busy}>
              {busy ? <ActivityIndicator color={colors.primaryText} /> : <Text style={styles.primaryText}>Finalizar viaje</Text>}
            </Pressable>
          </>
        );

      case TRIP_STATUS.completed:
        return (
          <>
            <Text style={styles.title}>Viaje finalizado</Text>
            <Row label="Tarifa final" value={formatCop(trip.fare)} />
            <Row label={`Comisión (${Math.round(trip.commissionRate * 100)} %)`} value={`-${formatCop(trip.commission)}`} />
            <Row label="Propina" value={formatCop(trip.tip)} />
            <Row label="Tu ganancia neta" value={formatCop(trip.driverEarnings)} strong />
            <Row label="Método de pago" value={PAYMENT_METHOD_LABELS[trip.paymentMethod]} />
            {/* TEMPORARY: the payment (Mercado Pago / cash) is added in step 17 */}
            <Text style={styles.note}>El cobro se registra en el siguiente paso.</Text>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.flex}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={LOCATION_CONFIG.defaultRegion}
        showsUserLocation={!permissionDenied}
      >
        {showPickupLeg && (
          <Marker coordinate={toLatLng(trip.origin)} title="Recogida" description={trip.origin.address} pinColor="green" />
        )}
        <Marker coordinate={toLatLng(trip.destination)} title="Destino" description={trip.destination.address} pinColor="red" />
        {showPickupLeg && pickupPath?.length > 1 && (
          <Polyline coordinates={pickupPath} strokeWidth={4} strokeColor="#2563EB" />
        )}
        {!showPickupLeg && trip.routePath?.length > 1 && (
          <Polyline coordinates={trip.routePath} strokeWidth={4} strokeColor={colors.primary} />
        )}
      </MapView>

      <View style={styles.card}>
        {renderStage()}
        {message && (
          <Text style={[styles.message, message.type === 'error' && styles.messageError]}>{message.text}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
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
  inline: { flexDirection: 'row', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', color: colors.text },
  address: { fontSize: 15, color: colors.text, marginTop: 6 },
  subtitle: { fontSize: 14, color: colors.muted, marginTop: 6, marginLeft: 0 },
  buttons: { flexDirection: 'row', marginTop: 16 },
  button: { flex: 1, paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  fullButton: { marginTop: 16 },
  primary: { backgroundColor: colors.primary, marginLeft: 8 },
  secondary: { borderWidth: 1, borderColor: colors.border, marginRight: 8 },
  primaryText: { color: colors.primaryText, fontSize: 16, fontWeight: '600' },
  secondaryText: { color: colors.text, fontSize: 16, fontWeight: '600' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  rowLabel: { fontSize: 15, color: colors.muted },
  rowValue: { fontSize: 15, color: colors.text },
  rowStrong: { fontWeight: 'bold', color: '#15803D' },
  note: { fontSize: 13, color: colors.muted, marginTop: 12 },
  message: { fontSize: 14, color: colors.muted, marginTop: 10, fontWeight: '600' },
  messageError: { color: colors.error },
});