// AI-assisted: see docs/AI_LOG.md #9, #20
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';

// One line of the "registration status" box: tab name, complete/incomplete and a shortcut
export default function TabStatus({ label, valid, actionLabel, onAction }) {
  return (
    <View style={styles.statusRow}>
      <Text style={[styles.statusText, valid ? styles.statusOk : styles.statusPending]}>
        {valid ? '✓' : '✗'} {label}: {valid ? 'completo' : 'incompleto'}
      </Text>
      {!valid && (
        <Pressable onPress={onAction}>
          <Text style={styles.statusAction}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  statusText: { fontSize: 15, fontWeight: '600' },
  statusOk: { color: colors.success },
  statusPending: { color: colors.error },
  statusAction: { fontSize: 15, color: colors.text, textDecorationLine: 'underline' },
});