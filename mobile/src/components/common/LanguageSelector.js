// AI-assisted: see docs/AI_LOG.md #21, #27
import { StyleSheet, Text, View } from 'react-native';
import SegmentedControl from './SegmentedControl';
import { useLanguage } from '../../context/LanguageContext';
import { LANGUAGE_OPTIONS } from '../../config/registration';
import { type } from '../../theme/typography';

// Same selector on Login, sign-up and Profile: one language for the whole app
export default function LanguageSelector({ showLabel = true }) {
  const { language, setLanguage, t } = useLanguage();
  return (
    <View>
      {showLabel && <Text style={styles.label}>{t('language.label')}</Text>}
      <SegmentedControl options={LANGUAGE_OPTIONS} value={language} onChange={setLanguage} />
    </View>
  );
}

const styles = StyleSheet.create({
  label: { ...type.caption, marginBottom: 6 },
});