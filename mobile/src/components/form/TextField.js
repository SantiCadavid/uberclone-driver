// AI-assisted: see docs/AI_LOG.md #8
import { TextInput } from 'react-native';
import FormField from './FormField';
import { formStyles } from './formStyles';
import { colors } from '../../theme/colors';

export default function TextField({ label, error, ...inputProps }) {
  return (
    <FormField label={label} error={error}>
      <TextInput
        style={[formStyles.input, error && formStyles.inputError]}
        placeholderTextColor={colors.muted}
        {...inputProps}
      />
    </FormField>
  );
}