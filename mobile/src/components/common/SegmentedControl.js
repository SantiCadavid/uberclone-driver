// AI-assisted: see docs/AI_LOG.md #19, #27
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/typography';
import { radius } from '../../theme/layout';

// Row of mutually exclusive options (filters, language)
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
  container: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.control, padding: 4 },
  segment: { flex: 1, minHeight: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 9 },
  selected: { backgroundColor: colors.primary },
  label: { fontFamily: fonts.medium, fontSize: 15, color: colors.text },
  selectedLabel: { fontFamily: fonts.semibold, color: colors.primaryText },
});