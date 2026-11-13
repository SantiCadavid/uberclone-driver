// AI-assisted: see docs/AI_LOG.md #8, #27
import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { fonts, type } from '../../theme/typography';
import { MIN_TOUCH, radius, space } from '../../theme/layout';

export const formStyles = StyleSheet.create({
  input: {
    minHeight: MIN_TOUCH,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.control,
    paddingHorizontal: space.md,
    paddingVertical: space.md,
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.background,
  },
  inputError: { borderColor: colors.error },
  selectBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  valueText: { fontFamily: fonts.regular, fontSize: 16, color: colors.text },
  placeholderText: { fontFamily: fonts.regular, fontSize: 16, color: colors.muted },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(35, 42, 51, 0.45)', // asphalt, translucent
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    padding: space.lg,
    paddingBottom: space.xxl,
  },
  sheetTitle: { ...type.section, marginBottom: space.sm },
});