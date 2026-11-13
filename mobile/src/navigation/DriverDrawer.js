// AI-assisted: see docs/AI_LOG.md #13, #14, #19, #21
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import { useDriver } from '../context/DriverContext';
import { useLanguage } from '../context/LanguageContext';
import { signOutDriver } from '../services/driverService';
import HomeScreen from '../screens/home/HomeScreen';
import HistoryScreen from '../screens/history/HistoryScreen';
import EarningsScreen from '../screens/earnings/EarningsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import PassengerSimulatorScreen from '../screens/simulator/PassengerSimulatorScreen';
import { colors } from '../theme/colors';

const Drawer = createDrawerNavigator();

function DriverDrawerContent(props) {
  const { uid, driver } = useDriver();
  const { t } = useLanguage();
  const [error, setError] = useState(null);

  const handleLogout = async () => {
    setError(null);
    try {
      await signOutDriver(uid, driver?.isAvailable);
    } catch (logoutError) {
      setError(t('drawer.logoutError'));
    }
  };

  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.header}>
        <Text style={styles.name}>{driver?.fullName ?? t('drawer.defaultName')}</Text>
        <Text style={styles.email}>{driver?.email}</Text>
      </View>
      <DrawerItemList {...props} />
      <Pressable style={styles.logout} onPress={handleLogout}>
        <Text style={styles.logoutText}>{t('drawer.logout')}</Text>
      </Pressable>
      {error && <Text style={styles.error}>{error}</Text>}
    </DrawerContentScrollView>
  );
}

export default function DriverDrawer() {
  const { t } = useLanguage();
  return (
    <Drawer.Navigator
      drawerContent={(props) => <DriverDrawerContent {...props} />}
      screenOptions={{
        drawerActiveTintColor: colors.primary,
        headerTintColor: colors.text,
      }}
    >
      <Drawer.Screen name="Home" component={HomeScreen} options={{ title: t('drawer.home') }} />
      <Drawer.Screen name="History" component={HistoryScreen} options={{ title: t('drawer.history') }} />
      <Drawer.Screen name="Earnings" component={EarningsScreen} options={{ title: t('drawer.earnings') }} />
      <Drawer.Screen name="Profile" component={ProfileScreen} options={{ title: t('drawer.profile') }} />
      <Drawer.Screen
        name="PassengerSimulator"
        component={PassengerSimulatorScreen}
        options={{ title: t('drawer.simulator') }}
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