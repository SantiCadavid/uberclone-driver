// AI-assisted: see docs/AI_LOG.md #11, #13, #15, #21, #23, #28
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Easing, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useDriver } from '../../context/DriverContext';
import { useLanguage } from '../../context/LanguageContext';
import { useDriverLocation } from '../../hooks/useDriverLocation';
import { useTripRequests } from '../../hooks/useTripRequests';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { setDriverAvailability } from '../../services/driverService';
import { loadLastAvailability, saveLastAvailability } from '../../services/preferencesService';
import TripRequestCard from '../../components/trip/TripRequestCard';
import { APPROVAL_STATUS } from '../../utils/driverDocument';
import { withTimeout } from '../../utils/withTimeout';
import { LOCATION_CONFIG } from '../../config/location';
import { colors } from '../../theme/colors';
import { fonts, type } from '../../theme/typography';
import { radius, space } from '../../theme/layout';

const STATUS_DISPLAY = {
  [APPROVAL_STATUS.pending]: { labelKey: 'home.status.pending', color: colors.warning, background: '#FBF0D0' },
  [APPROVAL_STATUS.approved]: { labelKey: 'home.status.approved', color: colors.success, background: '#E2F2EA' },
};

const NOTICE_COLORS = { ok: colors.success, info: colors.muted, error: colors.error };

const toLatLng = (place) => ({ latitude: place.lat, longitude: place.lng });

export default function HomeScreen() {
  const { uid, driver, loading, error } = useDriver();
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();
  const [toggling, setToggling] = useState(false);
  const [actionErrorKey, setActionErrorKey] = useState(null);
  const [lastAvailable, setLastAvailable] = useState(false);
  const mapRef = useRef(null);
  const centeredRef = useRef(false);

  const approved = driver?.approvalStatus === APPROVAL_STATUS.approved;
  const isAvailable = Boolean(driver?.isAvailable);
  const receiving = isAvailable && approved;
  const availableAnim = useRef(new Animated.Value(isAvailable ? 1 : 0)).current;

  const {
    location,
    permissionDenied,
    error: locationError,
  } = useDriverLocation({ uid, tracking: receiving });

  const {
    request,
    secondsLeft,
    processing,
    notice,
    error: requestsError,
    accept,
    reject,
  } = useTripRequests({ driverId: uid, enabled: receiving });

  // Read the last availability saved on this phone (AsyncStorage preference)
  useEffect(() => {
    let cancelled = false;
    loadLastAvailability().then((value) => {
      if (!cancelled) setLastAvailable(value);
    });
    // Cleanup: ignore the answer if the screen unmounts first
    return () => {
      cancelled = true;
    };
  }, []);

  // The yellow "Available" stripe answers the driver's action with a short transition
  useEffect(() => {
    const toValue = isAvailable ? 1 : 0;
    if (reduceMotion) {
      availableAnim.setValue(toValue);
      return undefined;
    }
    const animation = Animated.timing(availableAnim, {
      toValue,
      duration: 260,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    });
    animation.start();
    // Cleanup: stop the transition if the state changes again before it ends
    return () => animation.stop();
  }, [isAvailable, reduceMotion]); // eslint-disable-line react-hooks/exhaustive-deps

  // Center the map the first time the driver's position is known
  useEffect(() => {
    if (location && !centeredRef.current) {
      centeredRef.current = true;
      mapRef.current?.animateToRegion(
        { ...location, latitudeDelta: 0.01, longitudeDelta: 0.01 },
        600,
      );
    }
  }, [location]);

  // When a new request arrives, fit the map to show driver, pickup and destination
  useEffect(() => {
    if (!request) return;
    const points = [toLatLng(request.origin), toLatLng(request.destination)];
    if (location) points.push(location);
    mapRef.current?.fitToCoordinates(points, {
      edgePadding: { top: 80, right: 60, bottom: 440, left: 60 },
      animated: true,
    });
  }, [request?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Safety net: if the account stops being approved while available, go offline
  useEffect(() => {
    if (uid && driver && isAvailable && !approved) {
      setDriverAvailability(uid, false).catch(() => {});
    }
  }, [uid, driver, isAvailable, approved]);

  const handleToggle = useCallback(
    async (nextValue) => {
      setActionErrorKey(null);
      if (nextValue && !approved) {
        setActionErrorKey('home.error.notApproved');
        return;
      }
      if (nextValue && permissionDenied) {
        setActionErrorKey('home.error.permission');
        return;
      }
      setToggling(true);
      try {
        await withTimeout(
          setDriverAvailability(uid, nextValue),
          LOCATION_CONFIG.availabilityTimeoutMs,
        );
        // Preference only: remembers the last chosen state on this phone
        setLastAvailable(nextValue);
        saveLastAvailability(nextValue);
      } catch (toggleError) {
        setActionErrorKey('home.error.toggle');
      } finally {
        setToggling(false);
      }
    },
    [approved, permissionDenied, uid],
  );

  const dismissReconnect = useCallback(() => {
    setLastAvailable(false);
    saveLastAvailability(false);
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !driver) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{t(error ?? 'home.error.noProfile')}</Text>
      </View>
    );
  }

  const status = STATUS_DISPLAY[driver.approvalStatus] ?? STATUS_DISPLAY[APPROVAL_STATUS.pending];
  const firstName = driver.fullName.split(' ')[0];
  const showReconnect = lastAvailable && approved && !isAvailable && !permissionDenied && !toggling;
  // Every error is a translation key, so it follows the current language
  const visibleErrorKey =
    actionErrorKey ??
    requestsError ??
    locationError ??
    (permissionDenied ? 'home.error.permissionBanner' : null);

  return (
    <View style={styles.flex}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={LOCATION_CONFIG.defaultRegion}
        showsUserLocation={!permissionDenied}
      >
        {request && (
          <>
            <Marker
              coordinate={toLatLng(request.origin)}
              title={t('home.marker.pickup')}
              description={request.origin.address}
              pinColor="green"
            />
            <Marker
              coordinate={toLatLng(request.destination)}
              title={t('home.marker.destination')}
              description={request.destination.address}
              pinColor="red"
            />
            {request.routePath?.length > 1 && (
              <Polyline coordinates={request.routePath} strokeWidth={5} strokeColor={colors.primary} />
            )}
          </>
        )}
      </MapView>

      {request ? (
        <TripRequestCard
          request={request}
          secondsLeft={secondsLeft}
          processing={processing}
          onAccept={accept}
          onReject={reject}
        />
      ) : (
        <View style={styles.card}>
          {/* The memorable element: the road-sign stripe appears while the driver is Available */}
          <Animated.View
            style={[styles.stripe, { opacity: availableAnim, transform: [{ scaleX: availableAnim }] }]}
          />

          <Text style={styles.greeting}>{t('home.greeting', { name: firstName })}</Text>
          <View style={[styles.badge, { backgroundColor: status.background }]}>
            <Text style={[styles.badgeText, { color: status.color }]}>{t(status.labelKey)}</Text>
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>{isAvailable ? t('home.available') : t('home.unavailable')}</Text>
            {toggling ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <Switch
                value={isAvailable}
                onValueChange={handleToggle}
                disabled={!approved}
                trackColor={{ true: colors.signal, false: colors.border }}
                ios_backgroundColor={colors.border}
              />
            )}
          </View>

          {showReconnect && (
            <View style={styles.reconnect}>
              <Text style={styles.reconnectText}>{t('home.lastAvailable')}</Text>
              <View style={styles.reconnectActions}>
                <Pressable onPress={dismissReconnect} style={styles.reconnectButton} hitSlop={6}>
                  <Text style={styles.dismissText}>{t('home.dismiss')}</Text>
                </Pressable>
                <Pressable onPress={() => handleToggle(true)} style={[styles.reconnectButton, styles.reconnectPrimary]}>
                  <Text style={styles.reconnectPrimaryText}>{t('home.reconnect')}</Text>
                </Pressable>
              </View>
            </View>
          )}

          {!approved && <Text style={styles.note}>{t('home.pendingNote')}</Text>}
          {receiving && <Text style={styles.note}>{t('home.waiting')}</Text>}
          {notice && <Text style={[styles.notice, { color: NOTICE_COLORS[notice.type] }]}>{t(notice.key)}</Text>}
          {visibleErrorKey && <Text style={styles.errorText}>{t(visibleErrorKey)}</Text>}
        </View>
      )}
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
  card: {
    position: 'absolute',
    left: space.md,
    right: space.md,
    bottom: space.xl,
    backgroundColor: colors.background,
    borderRadius: radius.sheet,
    padding: space.lg,
    paddingTop: space.xl,
    overflow: 'hidden', // clips the stripe to the rounded corners
    shadowColor: colors.text,
    shadowOpacity: 0.15,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  stripe: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 8,
    backgroundColor: colors.signal,
    transformOrigin: 'left',
  },
  greeting: type.cardTitle,
  badge: {
    alignSelf: 'flex-start',
    paddingVertical: space.xs,
    paddingHorizontal: space.md,
    borderRadius: radius.pill,
    marginTop: space.sm,
  },
  badgeText: { fontFamily: fonts.semibold, fontSize: 13 },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: space.lg,
  },
  switchLabel: { fontFamily: fonts.bold, fontSize: 22, color: colors.text },
  reconnect: { marginTop: space.md, padding: space.md, borderRadius: radius.card, backgroundColor: colors.surface },
  reconnectText: type.body,
  reconnectActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: space.sm },
  reconnectButton: {
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: space.lg,
    borderRadius: radius.control,
    marginLeft: space.sm,
  },
  reconnectPrimary: { backgroundColor: colors.primary },
  reconnectPrimaryText: { fontFamily: fonts.semibold, fontSize: 15, color: colors.primaryText },
  dismissText: { fontFamily: fonts.medium, fontSize: 15, color: colors.muted },
  note: { ...type.body, color: colors.muted, marginTop: space.sm },
  notice: { fontFamily: fonts.semibold, fontSize: 14, marginTop: space.sm },
  errorText: { ...type.body, color: colors.error, marginTop: space.sm, textAlign: 'center' },
});