
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StripeProvider } from '@stripe/stripe-react-native';
import { STRIPE_PUBLISHABLE_KEY } from '../services/stripeService';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="auth/login" />
          <Stack.Screen name="auth/register" />
          <Stack.Screen name="main" />
          <Stack.Screen name="create-bet" />
          <Stack.Screen name="create-item" />
          <Stack.Screen name="bet/[id]" />
          <Stack.Screen name="item/[id]" />
          <Stack.Screen name="wallet" />
        </Stack>
        <StatusBar style="dark" />
      </StripeProvider>
    </GestureHandlerRootView>
  );
}
