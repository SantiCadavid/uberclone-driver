// AI-assisted: see docs/AI_LOG.md #11, #13, #15
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Switch, Text, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useDriver } from '../../context/DriverContext';
import { useDriverLocation } from '../../hooks/useDriverLocation';
import { useTripRequests } from '../../hooks/useTripRequests';
import { setDriverAvailability } from '../../services/driverService';
import TripRequestCard from '../../components/trip/TripRequestCard';
import { APPROVAL_STATUS } from '../../utils/driverDocument';
import { withTimeout } from '../../utils/withTimeout';
import { LOCATION_CONFIG } from '../../config/location';
import { colors } from '../../theme/colors';

const STATUS_DISPLAY = {
  [APPROVAL_STATUS.pending]: { label: 'Pendiente de aprobación', color: '#B45309', background: '#FEF3C7' },
  [APPROVAL_STATUS.approved]: { label: 'Aprobado', color: '#15803D', background: '#DCFCE7' },
};

const NOTICE_COLORS = { ok: '#15803D', info: colors.muted, error: colors.error };

const toLatLng = (place) => ({ latitude: place.lat, longitude: place.lng });

export default function HomeScreen() {
  const { uid, driver, loading, error } = useDriver();
  const [toggling, setToggling] = useState(false);
  const [actionError, setActionError] = useState(null);
  const mapRef = useRef(null);
  const centeredRef = useRef(false);

  const approved = driver?.approvalStatus === APPROVAL_STATUS.approved;
  const isAvailable = Boolean(driver?.isAvailable);
  const receiving = isAvailable && approved;

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
      edgePadding: { top: 80, right: 60, bottom: 420, left: 60 },
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
      setActionError(null);
      if (nextValue && !approved) {
        setActionError('Tu cuenta debe estar aprobada para ponerte Disponible.');
        return;
      }
      if (nextValue && permissionDenied) {
        setActionError('Activa el permiso de ubicación en Configuración para ponerte Disponible.');
        return;
      }
      setToggling(true);
      try {
        await withTimeout(
          setDriverAvailability(uid, nextValue),
          LOCATION_CONFIG.availabilityTimeoutMs,
        );
      } catch (toggleError) {
        setActionError('No se pudo cambiar tu estado. Revisa tu conexión.');
      } finally {
        setToggling(false);
      }
    },
    [approved, permissionDenied, uid],
  );

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
        <Text style={styles.errorText}>
          {error ?? 'No encontramos tu perfil de conductor. Cierra sesión desde el menú y completa el registro.'}
        </Text>
      </View>
    );
  }

  const status = STATUS_DISPLAY[driver.approvalStatus] ?? STATUS_DISPLAY[APPROVAL_STATUS.pending];
  const firstName = driver.fullName.split(' ')[0];
  const visibleError =
    actionError ??
    requestsError ??
    locationError ??
    (permissionDenied ? 'Sin permiso de ubicación: actívalo en Configuración para ponerte Disponible.' : null);

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
              title="Recogida"
              description={request.origin.address}
              pinColor="green"
            />
            <Marker
              coordinate={toLatLng(request.destination)}
              title="Destino"
              description={request.destination.address}
              pinColor="red"
            />
            {request.routePath?.length > 1 && (
              <Polyline coordinates={request.routePath} strokeWidth={4} strokeColor={colors.primary} />
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
          <Text style={styles.greeting}>Hola, {firstName}</Text>
          <View style={[styles.badge, { backgroundColor: status.background }]}>
            <Text style={[styles.badgeText, { color: status.color }]}>{status.label}</Text>
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>{isAvailable ? 'Disponible' : 'No disponible'}</Text>
            {toggling ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <Switch
                value={isAvailable}
                onValueChange={handleToggle}
                disabled={!approved}
                trackColor={{ true: '#15803D' }}
              />
            )}
          </View>

          {!approved && (
            <Text style={styles.note}>Podrás ponerte Disponible cuando tu cuenta sea aprobada.</Text>
          )}
          {receiving && (
            <Text style={styles.note}>Esperando solicitudes. Compartiendo tu ubicación.</Text>
          )}
          {notice && (
            <Text style={[styles.notice, { color: NOTICE_COLORS[notice.type] }]}>{notice.text}</Text>
          )}
          {visibleError && <Text style={styles.errorText}>{visibleError}</Text>}
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
    padding: 24,
    backgroundColor: colors.background,
  },
  card: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 32,
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  greeting: { fontSize: 20, fontWeight: 'bold', color: colors.text },
  badge: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 999,
    marginTop: 8,
  },
  badgeText: { fontSize: 13, fontWeight: 'bold' },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  switchLabel: { fontSize: 17, fontWeight: '600', color: colors.text },
  note: { fontSize: 14, color: colors.muted, marginTop: 8 },
  notice: { fontSize: 14, fontWeight: '600', marginTop: 8 },
  errorText: { fontSize: 14, color: colors.error, marginTop: 8, textAlign: 'center' },
});