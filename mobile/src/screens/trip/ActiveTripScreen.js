// AI-assisted: see docs/AI_LOG.md #16, #18, #23, #26, #28
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useDriver } from '../../context/DriverContext';
import { useLanguage } from '../../context/LanguageContext';
import { useDriverLocation } from '../../hooks/useDriverLocation';
import { useTripPayment } from '../../hooks/useTripPayment';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import Button from '../../components/common/Button';
import {
  cancelTripByDriver,
  finishTrip,
  getTripErrorKey,
  startPickup,
  startTrip,
} from '../../services/tripService';
import { withTimeout } from '../../utils/withTimeout';
import { formatCop, paymentMethodLabel } from '../../utils/format';
import { getCollectionActions, getPaymentStatusInfo } from '../../utils/paymentStatus';
import { TRIP_CONFIG, TRIP_STATUS } from '../../config/trip';
import { PAYMENT_STATUS } from '../../config/payment';
import { LOCATION_CONFIG } from '../../config/location';
import { colors, toneColors } from '../../theme/colors';
import { fonts, type } from '../../theme/typography';
import { radius, space } from '../../theme/layout';

const toLatLng = (place) => ({ latitude: place.lat, longitude: place.lng });

const MESSAGE_COLORS = { success: colors.success, info: colors.muted, error: colors.error };

const SCREEN_TITLE_KEYS = {
  [TRIP_STATUS.completed]: 'trip.title.collect',
  [TRIP_STATUS.paid]: 'trip.title.summary',
};

function Row({ label, value, strong, valueColor }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, strong && styles.rowStrong, valueColor && { color: valueColor }]}>{value}</Text>
    </View>
  );
}

function FareRows({ trip, t }) {
  return (
    <>
      <Row label={t('trip.fare')} value={formatCop(trip.fare)} />
      <Row
        label={t('trip.commission', { percent: Math.round(trip.commissionRate * 100) })}
        value={`-${formatCop(trip.commission)}`}
      />
      <Row label={t('trip.tip')} value={formatCop(trip.tip)} />
      <Row label={t('trip.netEarnings')} value={formatCop(trip.driverEarnings)} strong valueColor={colors.success} />
      <Row label={t('trip.paymentMethod')} value={paymentMethodLabel(trip.paymentMethod, t)} />
    </>
  );
}

// Confirms that the money was recorded: a short bounce that answers the payment
function PaidMark({ reduceMotion }) {
  const scale = useRef(new Animated.Value(reduceMotion ? 1 : 0.5)).current;
  const opacity = useRef(new Animated.Value(reduceMotion ? 1 : 0)).current;

  useEffect(() => {
    if (reduceMotion) return undefined;
    const animation = Animated.parallel([
      Animated.spring(scale, { toValue: 1, damping: 10, stiffness: 220, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
    ]);
    animation.start();
    // Cleanup: stop it if the summary closes right away
    return () => animation.stop();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Animated.View style={[styles.paidMark, { opacity, transform: [{ scale }] }]}>
      <Text style={styles.paidMarkText}>✓</Text>
    </Animated.View>
  );
}

export default function ActiveTripScreen({ navigation }) {
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();
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
  } = useTripPayment(trip);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null); // { type, key }
  const pickupStartedRef = useRef(null);
  const mapRef = useRef(null);

  // Header title per stage, in the current language
  useLayoutEffect(() => {
    navigation.setOptions({ title: t(SCREEN_TITLE_KEYS[status] ?? 'nav.activeTrip') });
  }, [navigation, status, t]);

  // accepted -> driver_arriving: calculate the route to the pickup only once per trip
  useEffect(() => {
    if (!trip || status !== TRIP_STATUS.accepted) return;
    if (!location && !permissionDenied) return; // wait for the first position
    if (pickupStartedRef.current === trip.id) return;
    pickupStartedRef.current = trip.id;

    withTimeout(startPickup(trip, location), TRIP_CONFIG.routingTimeoutMs + TRIP_CONFIG.actionTimeoutMs)
      .then((routed) => {
        if (!routed) setMessage({ type: 'info', key: 'trip.pickupRouteFailed' });
      })
      .catch((pickupError) => {
        pickupStartedRef.current = null; // allow a retry
        setMessage({ type: 'error', key: getTripErrorKey(pickupError) });
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
      edgePadding: { top: 80, right: 60, bottom: 400, left: 60 },
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
      setMessage({ type: 'error', key: getTripErrorKey(actionError) });
    } finally {
      setBusy(false);
    }
  }, []);

  const handlePickedUp = useCallback(() => runAction(() => startTrip(trip.id)), [runAction, trip]);

  const handleFinish = useCallback(() => runAction(() => finishTrip(trip)), [runAction, trip]);

  const handleCancel = useCallback(() => {
    Alert.alert(t('trip.cancelTitle'), t('trip.cancelMessage'), [
      { text: t('trip.no'), style: 'cancel' },
      {
        text: t('trip.cancelConfirm'),
        style: 'destructive',
        onPress: () => runAction(() => cancelTripByDriver(trip.id)),
      },
    ]);
  }, [runAction, trip, t]);

  // A confirmation (not a form error), so an Alert is the right tool here
  const handleCash = useCallback(() => {
    if (!trip) return;
    Alert.alert(
      t('trip.cashTitle'),
      t('trip.cashMessage', { fare: formatCop(trip.fare), commission: formatCop(trip.commission) }),
      [
        { text: t('trip.no'), style: 'cancel' },
        { text: t('trip.cashConfirm'), onPress: markCash },
      ],
    );
  }, [trip, markCash, t]);

  if (!trip) {
    return (
      <View style={styles.centered}>
        {isSummary && summaryError ? (
          <>
            <Text style={styles.centeredText}>{t(summaryError)}</Text>
            <Button label={t('trip.continue')} onPress={dismissSummary} style={styles.fullButton} />
          </>
        ) : (
          <ActivityIndicator size="large" color={colors.primary} />
        )}
      </View>
    );
  }

  const showPickupLeg = status === TRIP_STATUS.accepted || status === TRIP_STATUS.driverArriving;
  const pickupPath = trip.pickupRoute?.path;
  const paymentInfo = getPaymentStatusInfo(trip.paymentStatus, t);
  const shownMessage = paymentMessage ?? message;

  const renderStage = () => {
    switch (status) {
      case TRIP_STATUS.accepted:
        return (
          <View style={styles.inline}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.inlineText}>{t('trip.calculatingPickup')}</Text>
          </View>
        );

      case TRIP_STATUS.driverArriving:
        return (
          <>
            <Text style={styles.title}>{t('trip.pickUp', { name: trip.passengerName })}</Text>
            <Text style={styles.address}>{trip.origin.address}</Text>
            {trip.pickupRoute && (
              <Text style={styles.subtitle}>
                {t('trip.toPickup', { km: trip.pickupRoute.distanceKm, min: trip.pickupRoute.durationMin })}
              </Text>
            )}
            <View style={styles.buttons}>
              <Button
                label={t('trip.cancel')}
                variant="secondary"
                onPress={handleCancel}
                disabled={busy}
                style={styles.buttonLeft}
              />
              <Button
                label={t('trip.passengerOnBoard')}
                onPress={handlePickedUp}
                loading={busy}
                style={styles.buttonRight}
              />
            </View>
          </>
        );

      case TRIP_STATUS.inProgress:
        return (
          <>
            <Text style={styles.title}>{t('trip.inTrip', { name: trip.passengerName })}</Text>
            <Text style={styles.address}>{t('trip.destination', { address: trip.destination.address })}</Text>
            <Text style={styles.subtitle}>
              {trip.distanceKm} km · {trip.durationMin} min · {paymentMethodLabel(trip.paymentMethod, t)}
            </Text>
            <Button label={t('trip.finish')} onPress={handleFinish} loading={busy} style={styles.fullButton} />
          </>
        );

      case TRIP_STATUS.completed: {
        const actions = getCollectionActions(trip);
        return (
          <>
            <Text style={styles.title}>{t('trip.collectTitle')}</Text>
            <FareRows trip={trip} t={t} />
            <Row label={t('trip.paymentStatus')} value={paymentInfo.label} valueColor={toneColors[paymentInfo.tone]} strong />
            {actions.canPayWithCard && (
              <Button
                label={paymentInfo.status === PAYMENT_STATUS.REJECTED ? t('trip.retryCard') : t('trip.payCard')}
                onPress={payWithCard}
                loading={busyAction === 'card'}
                disabled={paymentBusy && busyAction !== 'card'}
                style={styles.fullButton}
              />
            )}
            {actions.canVerify && (
              <Button
                label={t('trip.verify')}
                onPress={verify}
                loading={busyAction === 'verify'}
                disabled={paymentBusy && busyAction !== 'verify'}
                style={styles.fullButton}
              />
            )}
            {actions.canMarkCash && (
              <Button
                label={t('trip.cashReceived')}
                variant={actions.canPayWithCard ? 'secondary' : 'primary'}
                onPress={handleCash}
                loading={busyAction === 'cash'}
                disabled={paymentBusy && busyAction !== 'cash'}
                style={styles.fullButton}
              />
            )}
          </>
        );
      }

      case TRIP_STATUS.paid:
        return (
          <>
            <View style={styles.paidHeader}>
              <PaidMark reduceMotion={reduceMotion} />
              <Text style={[styles.title, styles.paidTitle]}>{t('trip.paidTitle')}</Text>
            </View>
            <FareRows trip={trip} t={t} />
            <Row label={t('trip.paymentStatus')} value={paymentInfo.label} valueColor={toneColors[paymentInfo.tone]} strong />
            <Row label={t('trip.balance')} value={formatCop(driver?.balance)} />
            {paymentInfo.status === PAYMENT_STATUS.CASH && (
              <Text style={styles.note}>{t('trip.cashNote', { commission: formatCop(trip.commission) })}</Text>
            )}
            {trip.paymentMethodChangedFrom && <Text style={styles.note}>{t('trip.changedNote')}</Text>}
            {isSummary && <Button label={t('trip.continue')} onPress={dismissSummary} style={styles.fullButton} />}
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
          <Marker
            coordinate={toLatLng(trip.origin)}
            title={t('home.marker.pickup')}
            description={trip.origin.address}
            pinColor="green"
          />
        )}
        <Marker
          coordinate={toLatLng(trip.destination)}
          title={t('home.marker.destination')}
          description={trip.destination.address}
          pinColor="red"
        />
        {/* To the pickup: dashed like a lane marking. The trip itself: a solid asphalt line */}
        {showPickupLeg && pickupPath?.length > 1 && (
          <Polyline coordinates={pickupPath} strokeWidth={5} strokeColor={colors.primary} lineDashPattern={[10, 8]} />
        )}
        {!showPickupLeg && trip.routePath?.length > 1 && (
          <Polyline coordinates={trip.routePath} strokeWidth={5} strokeColor={colors.primary} />
        )}
      </MapView>

      <View style={styles.card}>
        {renderStage()}
        {shownMessage && (
          <Text style={[styles.message, { color: MESSAGE_COLORS[shownMessage.type] ?? colors.muted }]}>
            {t(shownMessage.key, shownMessage.params)}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: space.xl,
    backgroundColor: colors.background,
  },
  centeredText: { ...type.body, textAlign: 'center' },
  card: {
    position: 'absolute',
    left: space.md,
    right: space.md,
    bottom: space.xl,
    backgroundColor: colors.background,
    borderRadius: radius.sheet,
    padding: space.lg,
    shadowColor: colors.text,
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  inline: { flexDirection: 'row', alignItems: 'center' },
  inlineText: { ...type.body, color: colors.muted, marginLeft: space.sm },
  title: type.cardTitle,
  address: { ...type.body, marginTop: space.xs },
  subtitle: { ...type.caption, marginTop: space.xs },
  buttons: { flexDirection: 'row', marginTop: space.lg },
  buttonLeft: { flex: 1, marginRight: space.sm },
  buttonRight: { flex: 1, marginLeft: space.sm },
  fullButton: { alignSelf: 'stretch', marginTop: space.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: space.sm },
  rowLabel: { ...type.body, color: colors.muted },
  rowValue: { ...type.money, fontSize: 15, fontFamily: fonts.medium },
  rowStrong: { fontFamily: fonts.bold, fontSize: 16 },
  paidHeader: { flexDirection: 'row', alignItems: 'center' },
  paidTitle: { marginLeft: space.sm },
  paidMark: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paidMarkText: { color: colors.primaryText, fontFamily: fonts.bold, fontSize: 18 },
  note: { ...type.caption, marginTop: space.sm },
  message: { fontFamily: fonts.semibold, fontSize: 14, marginTop: space.md },
});