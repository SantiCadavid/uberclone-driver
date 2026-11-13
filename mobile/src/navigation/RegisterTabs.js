// AI-assisted: see docs/AI_LOG.md #5, #8, #20, #22
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RegistrationProvider } from '../context/RegistrationContext';
import { useLanguage } from '../context/LanguageContext';
import PersonalDataScreen from '../screens/register/PersonalDataScreen';
import VehicleScreen from '../screens/register/VehicleScreen';
import DocumentsScreen from '../screens/register/DocumentsScreen';

const Tab = createBottomTabNavigator();

export default function RegisterTabs() {
  const { t } = useLanguage();
  return (
    // The three tabs share the same form state; it resets when leaving the register flow
    <RegistrationProvider>
      <Tab.Navigator screenOptions={{ headerShown: false }}>
        <Tab.Screen name="PersonalData" component={PersonalDataScreen} options={{ title: t('register.tab.personal') }} />
        <Tab.Screen name="Vehicle" component={VehicleScreen} options={{ title: t('register.tab.vehicle') }} />
        <Tab.Screen name="Documents" component={DocumentsScreen} options={{ title: t('register.tab.documents') }} />
      </Tab.Navigator>
    </RegistrationProvider>
  );
}