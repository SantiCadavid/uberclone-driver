// AI-assisted: see docs/AI_LOG.md #5, #6, #10, #13
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterTabs from './RegisterTabs';
import DriverDrawer from './DriverDrawer';
import { colors } from '../theme/colors';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { user, initializing, registrationInProgress } = useAuth();

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

  return (
    <Stack.Navigator>
      {showDriverApp ? (
        // Drawer for Home, History, Earnings and Profile; trip screens join this Stack later
        <Stack.Screen name="DriverApp" component={DriverDrawer} options={{ headerShown: false }} />
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen
            name="Register"
            component={RegisterTabs}
            options={{ title: 'Registro de conductor' }}
          />
        </>
      )}
    </Stack.Navigator>
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