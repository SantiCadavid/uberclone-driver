// AI-assisted: see docs/AI_LOG.md #19
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';

// Row of mutually exclusive options (filters)
export default function SegmentedControl({ options, value, onChange }) {
  return (
    <View style={styles.container}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={String(option.value)}
            style={[styles.segment, selected && styles.selected]}
            onPress={() => onChange(option.value)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
          >
            <Text style={[styles.label, selected && styles.selectedLabel]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: 8, padding: 3 },
  segment: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 6 },
  selected: { backgroundColor: colors.primary },
  label: { fontSize: 14, fontWeight: '600', color: colors.text },
  selectedLabel: { color: colors.primaryText },
});