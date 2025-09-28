
import { Alert, Platform } from 'react-native';
import { Transaction } from '../types';
import uuid from 'react-native-uuid';

export interface MockPaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

export class MockPaymentService {
  private static instance: MockPaymentService;

  static getInstance(): MockPaymentService {
    if (!MockPaymentService.instance) {
      MockPaymentService.instance = new MockPaymentService();
    }
    return MockPaymentService.instance;
  }

  async processPayment(amount: number, description: string): Promise<MockPaymentResult> {
    console.log(`Processing mock payment: $${amount} - ${description}`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate 95% success rate
    const success = Math.random() > 0.05;
    
    if (success) {
      return {
        success: true,
        transactionId: `mock_${uuid.v4()}`,
      };
    } else {
      return {
        success: false,
        error: 'Payment failed. Please try again.',
      };
    }
  }

  async processWithdrawal(amount: number, description: string): Promise<MockPaymentResult> {
    console.log(`Processing mock withdrawal: $${amount} - ${description}`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate 98% success rate for withdrawals
    const success = Math.random() > 0.02;
    
    if (success) {
      return {
        success: true,
        transactionId: `mock_withdrawal_${uuid.v4()}`,
      };
    } else {
      return {
        success: false,
        error: 'Withdrawal failed. Please try again later.',
      };
    }
  }

  showPaymentNotSupportedAlert(): void {
    if (Platform.OS === 'web') {
      Alert.alert(
        'Demo Mode',
        'This is a demo application. In a real app, this would process actual payments through Stripe or another payment provider.',
        [{ text: 'OK' }]
      );
    }
  }
}

export const mockPaymentService = MockPaymentService.getInstance();
