// AI-assisted: see docs/AI_LOG.md #8
import { StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

export const formStyles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
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
  valueText: { fontSize: 16, color: colors.text },
  placeholderText: { fontSize: 16, color: colors.muted },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    paddingBottom: 32,
  },
  sheetTitle: { fontSize: 17, fontWeight: '600', color: colors.text, marginBottom: 8 },
});