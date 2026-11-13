// AI-assisted: see docs/AI_LOG.md #29
import { StyleSheet, Text, View } from 'react-native';
import Button from './Button';
import { colors } from '../../theme/colors';
import { type } from '../../theme/typography';
import { space } from '../../theme/layout';

// An empty screen is an invitation to act: what happened and what to do next
export default function EmptyState({ title, message, actionLabel, onAction }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {actionLabel && onAction ? (
        <Button label={actionLabel} variant="secondary" onPress={onAction} style={styles.button} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingHorizontal: space.xl, paddingVertical: space.xxl },
  title: { ...type.section, textAlign: 'center' },
  message: { ...type.body, color: colors.muted, textAlign: 'center', marginTop: space.sm },
  button: { marginTop: space.lg, minWidth: 180 },
});