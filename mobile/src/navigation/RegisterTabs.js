// AI-assisted: see docs/AI_LOG.md #5, #8, #20, #22, #27
import { StyleSheet, Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RegistrationProvider } from '../context/RegistrationContext';
import { useLanguage } from '../context/LanguageContext';
import PersonalDataScreen from '../screens/register/PersonalDataScreen';
import VehicleScreen from '../screens/register/VehicleScreen';
import DocumentsScreen from '../screens/register/DocumentsScreen';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

const Tab = createBottomTabNavigator();

// The sign-up is a real sequence, so each tab shows its step number
function StepIcon({ number, focused }) {
  return (
    <View style={[styles.step, focused && styles.stepFocused]}>
      <Text style={[styles.stepText, focused && styles.stepTextFocused]}>{number}</Text>
    </View>
  );
}

const tabOptions = (number, title) => ({
  title,
  tabBarIcon: ({ focused }) => <StepIcon number={number} focused={focused} />,
});

export default function RegisterTabs() {
  const { t } = useLanguage();
  return (
    // The three tabs share the same form state; it resets when leaving the register flow
    <RegistrationProvider>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.text,
          tabBarInactiveTintColor: colors.muted,
          tabBarLabelStyle: { fontFamily: fonts.medium, fontSize: 12 },
        }}
      >
        <Tab.Screen name="PersonalData" component={PersonalDataScreen} options={tabOptions(1, t('register.tab.personal'))} />
        <Tab.Screen name="Vehicle" component={VehicleScreen} options={tabOptions(2, t('register.tab.vehicle'))} />
        <Tab.Screen name="Documents" component={DocumentsScreen} options={tabOptions(3, t('register.tab.documents'))} />
      </Tab.Navigator>
    </RegistrationProvider>
  );
}

const styles = StyleSheet.create({
  step: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepFocused: { backgroundColor: colors.primary, borderColor: colors.primary },
  stepText: { fontFamily: fonts.semibold, fontSize: 13, color: colors.muted },
  stepTextFocused: { color: colors.primaryText },
});