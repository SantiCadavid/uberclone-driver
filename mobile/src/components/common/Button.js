// AI-assisted: see docs/AI_LOG.md #27
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { type } from '../../theme/typography';
import { MIN_TOUCH, radius, space } from '../../theme/layout';

const VARIANTS = {
  primary: { container: { backgroundColor: colors.primary }, text: { color: colors.primaryText } },
  signal: { container: { backgroundColor: colors.signal }, text: { color: colors.signalText } },
  secondary: {
    container: { backgroundColor: colors.background, borderWidth: 1.5, borderColor: colors.border },
    text: { color: colors.text },
  },
  danger: {
    container: { backgroundColor: colors.background, borderWidth: 1.5, borderColor: colors.error },
    text: { color: colors.error },
  },
};

// One button for the whole app. "loadingLabel" shows progress next to the spinner (e.g. photo upload).
export default function Button({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  loadingLabel,
  disabled = false,
  style,
}) {
  const look = VARIANTS[variant] ?? VARIANTS.primary;
  const filled = variant === 'primary' || variant === 'signal';
  const inactive = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        look.container,
        disabled && filled && styles.disabledFilled,
        disabled && !filled && styles.disabledOutline,
        pressed && !inactive && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <View style={styles.row}>
          <ActivityIndicator color={look.text.color} />
          {loadingLabel ? <Text style={[type.button, look.text, styles.loadingLabel]}>{loadingLabel}</Text> : null}
        </View>
      ) : (
        <Text style={[type.button, look.text]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: MIN_TOUCH,
    borderRadius: radius.control,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.lg,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  loadingLabel: { marginLeft: space.sm },
  disabledFilled: { backgroundColor: colors.disabled },
  disabledOutline: { opacity: 0.5 },
  pressed: { opacity: 0.85 },
});