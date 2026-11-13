// AI-assisted: see docs/AI_LOG.md #5, #8, #20
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RegistrationProvider } from '../context/RegistrationContext';
import PersonalDataScreen from '../screens/register/PersonalDataScreen';
import VehicleScreen from '../screens/register/VehicleScreen';
import DocumentsScreen from '../screens/register/DocumentsScreen';

const Tab = createBottomTabNavigator();

export default function RegisterTabs() {
  return (
    // The three tabs share the same form state; it resets when leaving the register flow
    <RegistrationProvider>
      <Tab.Navigator screenOptions={{ headerShown: false }}>
        <Tab.Screen
          name="PersonalData"
          component={PersonalDataScreen}
          options={{ title: 'Datos personales' }}
        />
        <Tab.Screen name="Vehicle" component={VehicleScreen} options={{ title: 'Vehículo' }} />
        <Tab.Screen name="Documents" component={DocumentsScreen} options={{ title: 'Documentos' }} />
      </Tab.Navigator>
    </RegistrationProvider>
  );
}