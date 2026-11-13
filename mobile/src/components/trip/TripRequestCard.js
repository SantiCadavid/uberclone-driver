// AI-assisted: see docs/AI_LOG.md #15, #23, #28
import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { useLanguage } from '../../context/LanguageContext';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import Button from '../common/Button';
import { TRIP_CONFIG } from '../../config/trip';
import { categoryLabel, formatCop, paymentMethodLabel } from '../../utils/format';
import { colors } from '../../theme/colors';
import { fonts, type } from '../../theme/typography';
import { radius, space } from '../../theme/layout';

const TOTAL_MS = TRIP_CONFIG.requestTimeoutSeconds * 1000;
const URGENT_SECONDS = 5;

function Detail({ label, value, highlight }) {
  return (
    <View style={styles.detail}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, highlight && styles.highlight]}>{value}</Text>
    </View>
  );
}

export default function TripRequestCard({ request, secondsLeft, processing, onAccept, onReject }) {
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();
  const entrance = useRef(new Animated.Value(0)).current; // 0 below the screen -> 1 in place
  const timeLeft = useRef(new Animated.Value(1)).current; // 1 full bar -> 0 empty
  const urgent = secondsLeft <= URGENT_SECONDS;

  // Entrance: the most important moment of the app, so it is the main animation
  useEffect(() => {
    if (reduceMotion) {
      entrance.setValue(1);
      return undefined;
    }
    entrance.setValue(0);
    const animation = Animated.spring(entrance, { toValue: 1, damping: 18, stiffness: 170, useNativeDriver: true });
    animation.start();
    // Cleanup: stop the animation if the request disappears before it ends
    return () => animation.stop();
  }, [request.id, reduceMotion]); // eslint-disable-line react-hooks/exhaustive-deps

  // Continuous timer bar, measured from the request's creation time (same deadline as the hook)
  useEffect(() => {
    const startedAt = request.createdAt?.toMillis?.() ?? Date.now();
    const remaining = Math.max(0, startedAt + TOTAL_MS - Date.now());
    timeLeft.setValue(remaining / TOTAL_MS);
    if (reduceMotion || remaining === 0) return undefined;
    const animation = Animated.timing(timeLeft, {
      toValue: 0,
      duration: remaining,
      easing: Easing.linear,
      useNativeDriver: true,
    });
    animation.start();
    // Cleanup: stop the bar when the request is answered or replaced
    return () => animation.stop();
  }, [request.id, reduceMotion]); // eslint-disable-line react-hooks/exhaustive-deps

  // With reduced motion the bar follows the seconds instead of moving continuously
  useEffect(() => {
    if (reduceMotion) timeLeft.setValue(Math.max(0, secondsLeft / TRIP_CONFIG.requestTimeoutSeconds));
  }, [secondsLeft, reduceMotion]); // eslint-disable-line react-hooks/exhaustive-deps

  const translateY = entrance.interpolate({ inputRange: [0, 1], outputRange: [320, 0] });

  return (
    <Animated.View style={[styles.card, { opacity: entrance, transform: [{ translateY }] }]}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{t('request.title')}</Text>
        <Text style={[styles.timer, urgent && styles.timerUrgent]}>{secondsLeft}s</Text>
      </View>
      <View style={styles.progressTrack}>
        <Animated.View
          style={[styles.progressFill, urgent && styles.progressUrgent, { transform: [{ scaleX: timeLeft }] }]}
        />
      </View>

      <Text style={styles.passenger}>{request.passengerName}</Text>
      <Text style={styles.place}>
        <Text style={styles.placeLabel}>{t('request.origin')}</Text>
        {request.origin.address}
      </Text>
      <Text style={styles.place}>
        <Text style={styles.placeLabel}>{t('request.destination')}</Text>
        {request.destination.address}
      </Text>

      <View style={styles.detailsRow}>
        <Detail label={t('request.distance')} value={`${request.distanceKm} km`} />
        <Detail label={t('request.duration')} value={`${request.durationMin} min`} />
        <Detail label={t('request.category')} value={categoryLabel(request.category, t)} />
      </View>
      <View style={styles.detailsRow}>
        <Detail label={t('request.payment')} value={paymentMethodLabel(request.paymentMethod, t)} />
        <Detail label={t('request.fare')} value={formatCop(request.estimatedFare)} />
        <Detail label={t('request.earnings')} value={formatCop(request.estimatedDriverEarnings)} highlight />
      </View>

      <View style={styles.buttons}>
        <Button
          label={t('request.reject')}
          variant="secondary"
          onPress={onReject}
          disabled={processing}
          style={styles.buttonLeft}
        />
        {/* The signal yellow marks the one action that matters most */}
        <Button
          label={t('request.accept')}
          variant="signal"
          onPress={onAccept}
          loading={processing}
          style={styles.buttonRight}
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
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
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: type.cardTitle,
  timer: { fontFamily: fonts.bold, fontSize: 26, color: colors.text, fontVariant: ['tabular-nums'] },
  timerUrgent: { color: colors.error },
  progressTrack: {
    height: 8,
    backgroundColor: colors.surface,
    borderRadius: 4,
    marginTop: space.sm,
    overflow: 'hidden',
  },
  progressFill: { height: 8, backgroundColor: colors.signal, transformOrigin: 'left' },
  progressUrgent: { backgroundColor: colors.error },
  passenger: { ...type.section, marginTop: space.md },
  place: { ...type.body, marginTop: space.xs },
  placeLabel: { fontFamily: fonts.semibold },
  detailsRow: { flexDirection: 'row', marginTop: space.md },
  detail: { flex: 1 },
  detailLabel: type.caption,
  detailValue: { ...type.money, fontSize: 16, marginTop: 2 },
  highlight: { color: colors.success },
  buttons: { flexDirection: 'row', marginTop: space.lg },
  buttonLeft: { flex: 1, marginRight: space.sm },
  buttonRight: { flex: 1, marginLeft: space.sm },
});