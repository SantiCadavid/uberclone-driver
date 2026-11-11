// AI-assisted: see docs/AI_LOG.md #13, #14
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import { useDriver } from '../context/DriverContext';
import { logout } from '../services/authService';
import { setDriverAvailability } from '../services/driverService';
import HomeScreen from '../screens/home/HomeScreen';
import PassengerSimulatorScreen from '../screens/simulator/PassengerSimulatorScreen';
import ComingSoonScreen from '../screens/common/ComingSoonScreen';
import { colors } from '../theme/colors';

const Drawer = createDrawerNavigator();

// TEMPORARY screens, replaced in the next steps
function HistoryScreen() {
  return <ComingSoonScreen title="Historial de carreras" />;
}
function EarningsScreen() {
  return <ComingSoonScreen title="Ganancias" />;
}
function ProfileScreen() {
  return <ComingSoonScreen title="Perfil y configuración" />;
}

function DriverDrawerContent(props) {
  const { uid, driver } = useDriver();
  const [error, setError] = useState(null);

  const handleLogout = async () => {
    setError(null);
    try {
      // Never leave a driver "available" after logging out
      if (driver?.isAvailable) await setDriverAvailability(uid, false);
      await logout();
    } catch (logoutError) {
      setError('No se pudo cerrar sesión. Revisa tu conexión.');
    }
  };

  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.header}>
        <Text style={styles.name}>{driver?.fullName ?? 'Conductor'}</Text>
        <Text style={styles.email}>{driver?.email}</Text>
      </View>
      <DrawerItemList {...props} />
      <Pressable style={styles.logout} onPress={handleLogout}>
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </Pressable>
      {error && <Text style={styles.error}>{error}</Text>}
    </DrawerContentScrollView>
  );
}

export default function DriverDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <DriverDrawerContent {...props} />}
      screenOptions={{
        drawerActiveTintColor: colors.primary,
        headerTintColor: colors.text,
      }}
    >
      <Drawer.Screen name="Home" component={HomeScreen} options={{ title: 'Inicio' }} />
      <Drawer.Screen name="History" component={HistoryScreen} options={{ title: 'Historial' }} />
      <Drawer.Screen name="Earnings" component={EarningsScreen} options={{ title: 'Ganancias' }} />
      <Drawer.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Perfil y configuración' }}
      />
      <Drawer.Screen
        name="PassengerSimulator"
        component={PassengerSimulatorScreen}
        options={{ title: 'Simulador de pasajero' }}
      />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  name: { fontSize: 18, fontWeight: 'bold', color: colors.text },
  email: { fontSize: 14, color: colors.muted, marginTop: 2 },
  logout: { marginTop: 16, marginHorizontal: 16, paddingVertical: 12 },
  logoutText: { fontSize: 15, fontWeight: '600', color: colors.error },
  error: { color: colors.error, marginHorizontal: 16 },
});