// AI-assisted: see docs/AI_LOG.md #5, #18, #19, #27
// "Asfalto y señal": asphalt, lane white and road-sign yellow.
// The yellow is used sparingly (Available, the request timer, Accept) so it keeps its strength.
export const colors = {
  background: '#FFFFFF', // Carril (lane white)
  surface: '#EDEFF2', // Concreto: secondary surfaces, fields, filters
  text: '#232A33', // Asfalto
  muted: '#5B6672', // Grafito: secondary text
  primary: '#232A33', // Asfalto: main buttons and strong surfaces
  primaryText: '#FFFFFF',
  signal: '#F2B705', // Señal: only the most important state and action
  signalText: '#232A33', // text on the signal yellow (high contrast)
  error: '#D2402F', // Pare
  border: '#D5D9DE',
  success: '#1F8A5B', // Paso: success and earnings
  warning: '#9A6A00', // dark amber, readable on white (pending states)
  disabled: '#AEB5BD',
};

// Colors for the payment status tones returned by utils/paymentStatus.js
export const toneColors = {
  success: colors.success,
  warning: colors.warning,
  danger: colors.error,
  neutral: colors.muted,
};