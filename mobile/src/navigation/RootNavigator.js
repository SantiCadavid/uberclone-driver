// AI-assisted: see docs/AI_LOG.md #5, #6, #10, #13, #16, #18, #21
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { useDriver } from '../context/DriverContext';
import { LanguageProvider, useLanguage } from '../context/LanguageContext';
import LoginScreen from '../screens/auth/LoginScreen';
import ActiveTripScreen from '../screens/trip/ActiveTripScreen';
import RegisterTabs from './RegisterTabs';
import DriverDrawer from './DriverDrawer';
import { colors } from '../theme/colors';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { user, initializing, registrationInProgress } = useAuth();
  const { activeTrip, summaryTripId } = useDriver();
  const { t } = useLanguage();

  // While Firebase checks for a saved session, show a loader instead of flashing the Login
  if (initializing) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // During registration the account exists before its profile is saved; stay on Register
  const showDriverApp = user && !registrationInProgress;
  // The trip screen stays open until the trip is cancelled or the driver closes the paid summary
  const showTripScreen = Boolean(activeTrip || summaryTripId);

  return (
    <Stack.Navigator>
      {showDriverApp ? (
        showTripScreen ? (
          // Stack for the trip flow (the title changes per stage inside the screen)
          <Stack.Screen
            name="ActiveTrip"
            component={ActiveTripScreen}
            options={{ title: t('nav.activeTrip'), gestureEnabled: false }}
          />
        ) : (
          // Drawer for Home, History, Earnings, Profile and the passenger simulator
          <Stack.Screen name="DriverApp" component={DriverDrawer} options={{ headerShown: false }} />
        )
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={RegisterTabs} options={{ title: t('nav.register') }} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function RootNavigator() {
  const { uid, driver } = useDriver();
  // One language for every screen, available even before login
  return (
    <LanguageProvider uid={uid} profileLanguage={driver?.language}>
      <AppNavigator />
    </LanguageProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});