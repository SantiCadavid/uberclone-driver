// AI-assisted: see docs/AI_LOG.md #5, #18, #19
// Explicit colors so text stays readable even when the phone uses dark mode
export const colors = {
  background: '#FFFFFF',
  surface: '#F3F4F6',
  text: '#111111',
  muted: '#6B7280',
  primary: '#000000',
  primaryText: '#FFFFFF',
  error: '#DC2626',
  border: '#D1D5DB',
  success: '#15803D',
  warning: '#B45309',
};

// Colors for the payment status tones returned by utils/paymentStatus.js
export const toneColors = {
  success: colors.success,
  warning: colors.warning,
  danger: colors.error,
  neutral: colors.muted,
};