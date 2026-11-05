// AI-assisted: see docs/AI_LOG.md #5
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import PersonalDataScreen from '../screens/register/PersonalDataScreen';
import VehicleScreen from '../screens/register/VehicleScreen';

const Tab = createBottomTabNavigator();

export default function RegisterTabs() {
  return (
    // The parent Stack already shows a header, so the tabs hide their own
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen
        name="PersonalData"
        component={PersonalDataScreen}
        options={{ title: 'Datos personales' }}
      />
      <Tab.Screen
        name="Vehicle"
        component={VehicleScreen}
        options={{ title: 'Vehículo' }}
      />
    </Tab.Navigator>
  );
}