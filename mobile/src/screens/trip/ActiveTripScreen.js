// AI-assisted: see docs/AI_LOG.md #16, #18
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useDriver } from '../../context/DriverContext';
import { useDriverLocation } from '../../hooks/useDriverLocation';
import { useTripPayment } from '../../hooks/useTripPayment';
import {
  cancelTripByDriver,
  finishTrip,
  getTripErrorMessage,
  startPickup,
  startTrip,
} from '../../services/tripService';
import { withTimeout } from '../../utils/withTimeout';
import { PAYMENT_METHOD_LABELS, formatCop } from '../../utils/format';
import { getCollectionActions, getPaymentStatusInfo } from '../../utils/paymentStatus';
import { TRIP_CONFIG, TRIP_STATUS } from '../../config/trip';
import { PAYMENT_STATUS } from '../../config/payment';
import { LOCATION_CONFIG } from '../../config/location';
import { colors } from '../../theme/colors';

const toLatLng = (place) => ({ latitude: place.lat, longitude: place.lng });

const TONE_COLORS = {
  success: colors.success,
  warning: colors.warning,
  danger: colors.error,
  neutral: colors.muted,
};

const MESSAGE_COLORS = { success: colors.success, info: colors.muted, error: colors.error };

const SCREEN_TITLES = {
  [TRIP_STATUS.completed]: 'Cobro del viaje',
  [TRIP_STATUS.paid]: 'Resumen del viaje',
};

function Row({ label, value, strong, valueColor }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, strong && styles.rowStrong, valueColor && { color: valueColor }]}>{value}</Text>
    </View>
  );
}

function FareRows({ trip }) {
  return (
    <>
      <Row label="Tarifa final" value={formatCop(trip.fare)} />
      <Row label={`Comisión (${Math.round(trip.commissionRate * 100)} %)`} value={`-${formatCop(trip.commission)}`} />
      <Row label="Propina" value={formatCop(trip.tip)} />
      <Row label="Tu ganancia neta" value={formatCop(trip.driverEarnings)} strong />
      <Row label="Método de pago" value={PAYMENT_METHOD_LABELS[trip.paymentMethod] ?? '—'} />
    </>
  );
}

function ActionButton({ label, onPress, loading, disabled, variant = 'primary' }) {
  const isPrimary = variant === 'primary';
  return (
    <Pressable
      style={[styles.actionButton, isPrimary ? styles.actionPrimary : styles.actionSecondary, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? colors.primaryText : colors.text} />
      ) : (
        <Text style={isPrimary ? styles.primaryText : styles.secondaryText}>{label}</Text>
      )}
    </Pressable>
  );
}

export default function ActiveTripScreen({ navigation }) {
  const { uid, driver, activeTrip, summaryTripId, summaryTrip, summaryError, dismissSummary } = useDriver();
  // Summary mode: the trip was just paid and is no longer "active"
  const isSummary = !activeTrip && Boolean(summaryTripId);
  const trip = activeTrip ?? (isSummary ? summaryTrip : null);
  const status = trip?.status;

  // Location keeps updating during the trip and stops in the summary (cleanup inside the hook)
  const { location, permissionDenied } = useDriverLocation({ uid, tracking: !isSummary });
  const {
    busyAction,
    busy: paymentBusy,
    message: paymentMessage,
    payWithCard,
    verify,
    markCash,
  } = useTripPayment(trip, uid);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);
  const pickupStartedRef = useRef(null);
  const mapRef = useRef(null);

  // Header title per stage
  useLayoutEffect(() => {
    navigation.setOptions({ title: SCREEN_TITLES[status] ?? 'Viaje en curso' });
  }, [navigation, status]);

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

  // Fit the map to what matters in each stage. Used when the stage changes and when a
  // new map finishes loading (iOS ignores fitToCoordinates before the map is ready)
  const fitMap = useCallback(() => {
    if (!trip) return;
    const showFullRoute =
      status === TRIP_STATUS.inProgress || status === TRIP_STATUS.completed || status === TRIP_STATUS.paid;
    const points = showFullRoute
      ? [toLatLng(trip.origin), toLatLng(trip.destination)]
      : [toLatLng(trip.origin), ...(location ? [location] : [])];
    mapRef.current?.fitToCoordinates(points, {
      edgePadding: { top: 80, right: 60, bottom: 380, left: 60 },
      animated: true,
    });
  }, [trip?.id, status]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fitMap();
  }, [fitMap]);

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

  // A confirmation (not a form error), so an Alert is the right tool here
  const handleCash = useCallback(() => {
    if (!trip) return;
    Alert.alert(
      'Cobro en efectivo',
      `¿Recibiste ${formatCop(trip.fare)} en efectivo? La comisión de ${formatCop(trip.commission)} se descontará de tu saldo.`,
      [
        { text: 'No', style: 'cancel' },
        { text: 'Sí, recibido', onPress: markCash },
      ],
    );
  }, [trip, markCash]);

  if (!trip) {
    return (
      <View style={styles.centered}>
        {isSummary && summaryError ? (
          <>
            <Text style={styles.centeredText}>{summaryError}</Text>
            <ActionButton label="Continuar" onPress={dismissSummary} />
          </>
        ) : (
          <ActivityIndicator size="large" color={colors.primary} />
        )}
      </View>
    );
  }

  const showPickupLeg = status === TRIP_STATUS.accepted || status === TRIP_STATUS.driverArriving;
  const pickupPath = trip.pickupRoute?.path;
  const paymentInfo = getPaymentStatusInfo(trip.paymentStatus);
  const shownMessage = paymentMessage ?? message;

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

      case TRIP_STATUS.completed: {
        const actions = getCollectionActions(trip);
        return (
          <>
            <Text style={styles.title}>Cobra el viaje</Text>
            <FareRows trip={trip} />
            <Row label="Estado del pago" value={paymentInfo.label} valueColor={TONE_COLORS[paymentInfo.tone]} strong />
            {actions.canPayWithCard && (
              <ActionButton
                label={paymentInfo.status === PAYMENT_STATUS.REJECTED ? 'Reintentar con Mercado Pago' : 'Cobrar con Mercado Pago'}
                onPress={payWithCard}
                loading={busyAction === 'card'}
                disabled={paymentBusy}
              />
            )}
            {actions.canVerify && (
              <ActionButton label="Verificar pago" onPress={verify} loading={busyAction === 'verify'} disabled={paymentBusy} />
            )}
            {actions.canMarkCash && (
              <ActionButton
                label="Efectivo recibido"
                variant={actions.canPayWithCard ? 'secondary' : 'primary'}
                onPress={handleCash}
                loading={busyAction === 'cash'}
                disabled={paymentBusy}
              />
            )}
          </>
        );
      }

      case TRIP_STATUS.paid:
        return (
          <>
            <Text style={styles.title}>Viaje cobrado</Text>
            <FareRows trip={trip} />
            <Row label="Estado del pago" value={paymentInfo.label} valueColor={TONE_COLORS[paymentInfo.tone]} strong />
            <Row label="Tu saldo actual" value={formatCop(driver?.balance)} />
            {paymentInfo.status === PAYMENT_STATUS.CASH && (
              <Text style={styles.note}>
                La comisión ({formatCop(trip.commission)}) se descontó de tu saldo porque el dinero lo recibiste tú.
              </Text>
            )}
            {trip.paymentMethodChangedFrom && (
              <Text style={styles.note}>Se cobró en efectivo después de un pago con tarjeta rechazado.</Text>
            )}
            {isSummary && <ActionButton label="Continuar" onPress={dismissSummary} />}
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
        onMapReady={fitMap}
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
        {shownMessage && (
          <Text style={[styles.message, { color: MESSAGE_COLORS[shownMessage.type] ?? colors.muted }]}>
            {shownMessage.text}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: colors.background },
  centeredText: { fontSize: 15, color: colors.text, textAlign: 'center' },
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
  actionButton: { alignSelf: 'stretch', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 12 },
  actionPrimary: { backgroundColor: colors.primary },
  actionSecondary: { borderWidth: 1, borderColor: colors.border },
  disabled: { opacity: 0.5 },
  primaryText: { color: colors.primaryText, fontSize: 16, fontWeight: '600' },
  secondaryText: { color: colors.text, fontSize: 16, fontWeight: '600' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  rowLabel: { fontSize: 15, color: colors.muted },
  rowValue: { fontSize: 15, color: colors.text },
  rowStrong: { fontWeight: 'bold', color: colors.success },
  note: { fontSize: 13, color: colors.muted, marginTop: 10 },
  message: { fontSize: 14, marginTop: 10, fontWeight: '600' },
});