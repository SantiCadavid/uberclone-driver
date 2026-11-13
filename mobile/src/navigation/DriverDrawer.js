// AI-assisted: see docs/AI_LOG.md #13, #14, #19, #21, #29
import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
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
import { fonts, type } from '../theme/typography';
import { MIN_TOUCH, radius, space } from '../theme/layout';

const Drawer = createDrawerNavigator();

const initials = (name) =>
  (name ?? '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('');

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
        {driver?.profilePhotoUrl ? (
          <Image source={{ uri: driver.profilePhotoUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials(driver?.fullName)}</Text>
          </View>
        )}
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
        headerTintColor: colors.text,
        headerTitleStyle: { fontFamily: fonts.semibold, fontSize: 17, color: colors.text },
        drawerActiveTintColor: colors.text,
        drawerInactiveTintColor: colors.muted,
        drawerActiveBackgroundColor: colors.surface,
        drawerLabelStyle: { fontFamily: fonts.medium, fontSize: 16 },
        drawerItemStyle: { borderRadius: radius.control },
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
    paddingHorizontal: space.lg,
    paddingBottom: space.lg,
    marginBottom: space.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.md,
  },
  avatarText: { fontFamily: fonts.bold, fontSize: 20, color: colors.primaryText },
  name: type.section,
  email: { ...type.caption, marginTop: 2 },
  logout: { marginTop: space.lg, marginHorizontal: space.lg, minHeight: MIN_TOUCH, justifyContent: 'center' },
  logoutText: { fontFamily: fonts.semibold, fontSize: 16, color: colors.error },
  error: { ...type.caption, color: colors.error, marginHorizontal: space.lg },
});