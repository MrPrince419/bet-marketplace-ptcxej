
import { Alert, Platform } from 'react-native';

// Conditional imports for Stripe - only import on native platforms
let StripeProvider: any;
let useStripe: any;

if (Platform.OS === 'ios' || Platform.OS === 'android') {
  const stripe = require('@stripe/stripe-react-native');
  StripeProvider = stripe.StripeProvider;
  useStripe = stripe.useStripe;
} else {
  // Mock implementations for web
  StripeProvider = ({ children, publishableKey }: any) => children;
  useStripe = () => ({
    initPaymentSheet: async () => ({ error: null }),
    presentPaymentSheet: async () => ({ error: null }),
    confirmPayment: async () => ({ error: null }),
  });
}

// This would normally come from your backend/environment variables
// For demo purposes, using Stripe test keys
export const STRIPE_PUBLISHABLE_KEY = 'pk_test_51234567890abcdef'; // Replace with your actual publishable key

// Export the conditionally imported StripeProvider
export { StripeProvider };

export interface PaymentIntent {
  id: string;
  client_secret: string;
  amount: number;
  currency: string;
  status: string;
}

export interface StripePaymentService {
  createPaymentIntent: (amount: number, currency?: string) => Promise<PaymentIntent>;
  confirmPayment: (clientSecret: string, paymentMethodId: string) => Promise<boolean>;
  createSetupIntent: () => Promise<{ client_secret: string }>;
}

// Mock Stripe service for demo purposes
// In a real app, these would be API calls to your backend
export const stripeService: StripePaymentService = {
  createPaymentIntent: async (amount: number, currency: string = 'usd'): Promise<PaymentIntent> => {
    console.log('Creating payment intent for amount:', amount);
    
    // Mock API call - replace with actual backend call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: `pi_${Date.now()}`,
          client_secret: `pi_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`,
          amount: amount * 100, // Stripe uses cents
          currency,
          status: 'requires_payment_method',
        });
      }, 1000);
    });
  },

  confirmPayment: async (clientSecret: string, paymentMethodId: string): Promise<boolean> => {
    console.log('Confirming payment with client secret:', clientSecret);
    
    // Mock payment confirmation - replace with actual Stripe confirmation
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate 90% success rate
        const success = Math.random() > 0.1;
        resolve(success);
      }, 2000);
    });
  },

  createSetupIntent: async (): Promise<{ client_secret: string }> => {
    console.log('Creating setup intent for saving payment method');
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          client_secret: `seti_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`,
        });
      }, 1000);
    });
  },
};

export const useStripePayment = () => {
  const { initPaymentSheet, presentPaymentSheet, confirmPayment } = useStripe();

  // On web, show alert that payments are not supported
  if (Platform.OS === 'web') {
    return {
      initializePaymentSheet: async (amount: number, currency: string = 'usd') => {
        Alert.alert('Payment Not Available', 'Stripe payments are not supported on web. Please use the mobile app for payments.');
        return false;
      },
      processPayment: async (): Promise<boolean> => {
        Alert.alert('Payment Not Available', 'Stripe payments are not supported on web. Please use the mobile app for payments.');
        return false;
      },
    };
  }

  const initializePaymentSheet = async (amount: number, currency: string = 'usd') => {
    try {
      const paymentIntent = await stripeService.createPaymentIntent(amount, currency);
      
      const { error } = await initPaymentSheet({
        merchantDisplayName: 'BetMarket App',
        paymentIntentClientSecret: paymentIntent.client_secret,
        defaultBillingDetails: {
          name: 'User',
        },
        allowsDelayedPaymentMethods: true,
      });

      if (error) {
        console.log('Error initializing payment sheet:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.log('Error in initializePaymentSheet:', error);
      return false;
    }
  };

  const processPayment = async (): Promise<boolean> => {
    try {
      const { error } = await presentPaymentSheet();

      if (error) {
        console.log('Payment cancelled or failed:', error);
        return false;
      }

      console.log('Payment successful!');
      return true;
    } catch (error) {
      console.log('Error processing payment:', error);
      return false;
    }
  };

  return {
    initializePaymentSheet,
    processPayment,
  };
};
