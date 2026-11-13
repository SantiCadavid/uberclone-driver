// AI-assisted: see docs/AI_LOG.md #29
import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { colors } from '../../theme/colors';

// Placeholder block with the shape of the content that is loading
export default function Skeleton({ width = '100%', height = 14, borderRadius = 6, style }) {
  const reduceMotion = useReducedMotion();
  const pulse = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    if (reduceMotion) {
      pulse.setValue(0.8);
      return undefined;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.6, duration: 700, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    );
    loop.start();
    // Cleanup: stop the endless loop when the real content replaces the skeleton
    return () => loop.stop();
  }, [reduceMotion]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[{ width, height, borderRadius, backgroundColor: colors.surface, opacity: pulse }, style]}
    />
  );
}