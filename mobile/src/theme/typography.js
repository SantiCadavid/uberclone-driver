// AI-assisted: see docs/AI_LOG.md #27
import { colors } from './colors';

// Barlow: a typeface inspired by highway signage, legible at a glance.
// Each weight is its own font file, so styles use fontFamily instead of fontWeight.
export const fonts = {
  regular: 'Barlow_400Regular',
  medium: 'Barlow_500Medium',
  semibold: 'Barlow_600SemiBold',
  bold: 'Barlow_700Bold',
};

// One scale for the whole app: 28 screen title · 20 card title · 17 section · 15 body · 13 caption
export const type = {
  title: { fontFamily: fonts.bold, fontSize: 28, lineHeight: 34, color: colors.text },
  cardTitle: { fontFamily: fonts.semibold, fontSize: 20, lineHeight: 26, color: colors.text },
  section: { fontFamily: fonts.semibold, fontSize: 17, lineHeight: 22, color: colors.text },
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 21, color: colors.text },
  bodyStrong: { fontFamily: fonts.semibold, fontSize: 15, lineHeight: 21, color: colors.text },
  label: { fontFamily: fonts.medium, fontSize: 14, lineHeight: 19, color: colors.text },
  caption: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, color: colors.muted },
  button: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 20 },
  // Money never "dances": every digit has the same width
  money: { fontFamily: fonts.semibold, fontVariant: ['tabular-nums'], color: colors.text },
};