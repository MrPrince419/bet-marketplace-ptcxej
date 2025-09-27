
import { useState, useEffect } from 'react';
import { Transaction, User } from '../types';
import { useAuth } from './useAuth';
import { stripeService, useStripePayment } from '../services/stripeService';
import { getTransactions, saveTransactions } from '../utils/storage';
import uuid from 'react-native-uuid';
import { Alert, Platform } from 'react-native';

export const usePayments = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const { authState, updateUserBalance } = useAuth();
  const { initializePaymentSheet, processPayment } = useStripePayment();

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const allTransactions = await getTransactions();
      const userTransactions = allTransactions.filter(t => t.userId === authState.user?.id);
      setTransactions(userTransactions);
    } catch (error) {
      console.log('Error loading transactions:', error);
    }
  };

  const createTransaction = async (
    type: Transaction['type'],
    amount: number,
    description: string,
    relatedId?: string
  ): Promise<Transaction> => {
    const transaction: Transaction = {
      id: uuid.v4() as string,
      userId: authState.user!.id,
      type,
      amount,
      status: 'pending',
      description,
      relatedId,
      createdAt: new Date().toISOString(),
    };

    const allTransactions = await getTransactions();
    const updatedTransactions = [...allTransactions, transaction];
    await saveTransactions(updatedTransactions);
    
    setTransactions(prev => [...prev, transaction]);
    return transaction;
  };

  const updateTransactionStatus = async (
    transactionId: string,
    status: Transaction['status'],
    stripePaymentIntentId?: string
  ) => {
    const allTransactions = await getTransactions();
    const updatedTransactions = allTransactions.map(t => 
      t.id === transactionId 
        ? { 
            ...t, 
            status, 
            stripePaymentIntentId,
            completedAt: status === 'completed' ? new Date().toISOString() : t.completedAt 
          }
        : t
    );
    
    await saveTransactions(updatedTransactions);
    setTransactions(prev => prev.map(t => 
      t.id === transactionId 
        ? { 
            ...t, 
            status, 
            stripePaymentIntentId,
            completedAt: status === 'completed' ? new Date().toISOString() : t.completedAt 
          }
        : t
    ));
  };

  const depositFunds = async (amount: number): Promise<boolean> => {
    if (!authState.user) return false;

    // On web, show alert that payments are not supported
    if (Platform.OS === 'web') {
      Alert.alert('Payment Not Available', 'Real payments are not supported on web. For demo purposes, we\'ll add the funds directly to your wallet.');
      
      // For demo purposes on web, just add the funds directly
      const transaction = await createTransaction(
        'deposit',
        amount,
        `Demo deposit $${amount} to wallet (web)`
      );
      
      await updateTransactionStatus(transaction.id, 'completed');
      const newBalance = authState.user.balance + amount;
      await updateUserBalance(newBalance);
      
      Alert.alert('Demo Success', `$${amount} has been added to your wallet! (This is a demo - no real payment was processed)`);
      return true;
    }

    setLoading(true);
    try {
      // Create pending transaction
      const transaction = await createTransaction(
        'deposit',
        amount,
        `Deposit $${amount} to wallet`
      );

      // Initialize Stripe payment sheet
      const initialized = await initializePaymentSheet(amount);
      if (!initialized) {
        await updateTransactionStatus(transaction.id, 'failed');
        Alert.alert('Error', 'Failed to initialize payment');
        return false;
      }

      // Process payment
      const paymentSuccess = await processPayment();
      if (paymentSuccess) {
        // Update transaction status
        await updateTransactionStatus(transaction.id, 'completed');
        
        // Update user balance
        const newBalance = authState.user.balance + amount;
        await updateUserBalance(newBalance);
        
        Alert.alert('Success', `$${amount} has been added to your wallet!`);
        return true;
      } else {
        await updateTransactionStatus(transaction.id, 'cancelled');
        Alert.alert('Payment Cancelled', 'Your payment was cancelled');
        return false;
      }
    } catch (error) {
      console.log('Error depositing funds:', error);
      Alert.alert('Error', 'Failed to process payment');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const withdrawFunds = async (amount: number): Promise<boolean> => {
    if (!authState.user || authState.user.balance < amount) {
      Alert.alert('Insufficient Funds', 'You do not have enough balance to withdraw this amount');
      return false;
    }

    setLoading(true);
    try {
      // Create pending transaction
      const transaction = await createTransaction(
        'withdrawal',
        amount,
        Platform.OS === 'web' 
          ? `Demo withdraw $${amount} from wallet (web)`
          : `Withdraw $${amount} from wallet`
      );

      // In a real app, you would process the withdrawal through Stripe
      // For demo purposes, we'll simulate it
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update transaction status
      await updateTransactionStatus(transaction.id, 'completed');
      
      // Update user balance
      const newBalance = authState.user.balance - amount;
      await updateUserBalance(newBalance);
      
      const message = Platform.OS === 'web' 
        ? `$${amount} has been withdrawn from your wallet! (This is a demo - no real withdrawal was processed)`
        : `$${amount} has been withdrawn from your wallet!`;
      
      Alert.alert('Success', message);
      return true;
    } catch (error) {
      console.log('Error withdrawing funds:', error);
      Alert.alert('Error', 'Failed to process withdrawal');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const createEscrowTransaction = async (betId: string, amount: number): Promise<string | null> => {
    if (!authState.user || authState.user.balance < amount) {
      Alert.alert('Insufficient Funds', 'You do not have enough balance for this bet');
      return null;
    }

    try {
      const transaction = await createTransaction(
        'bet_escrow',
        amount,
        `Escrow for bet`,
        betId
      );

      // Immediately mark as completed since it's using existing balance
      await updateTransactionStatus(transaction.id, 'completed');
      
      // Deduct from user balance
      const newBalance = authState.user.balance - amount;
      await updateUserBalance(newBalance);
      
      return transaction.id;
    } catch (error) {
      console.log('Error creating escrow transaction:', error);
      return null;
    }
  };

  const releaseBetPayout = async (betId: string, winnerId: string, amount: number): Promise<boolean> => {
    try {
      const transaction = await createTransaction(
        'bet_payout',
        amount,
        `Bet winnings payout`,
        betId
      );

      // Mark as completed
      await updateTransactionStatus(transaction.id, 'completed');
      
      // If the current user is the winner, add to their balance
      if (winnerId === authState.user?.id) {
        const newBalance = authState.user.balance + amount;
        await updateUserBalance(newBalance);
      }
      
      return true;
    } catch (error) {
      console.log('Error releasing bet payout:', error);
      return false;
    }
  };

  const processMarketplacePurchase = async (itemId: string, amount: number, sellerId: string): Promise<boolean> => {
    if (!authState.user || authState.user.balance < amount) {
      Alert.alert('Insufficient Funds', 'You do not have enough balance for this purchase');
      return false;
    }

    setLoading(true);
    try {
      // Create purchase transaction
      const purchaseTransaction = await createTransaction(
        'marketplace_purchase',
        amount,
        `Purchase marketplace item`,
        itemId
      );

      // Create sale transaction for seller
      const saleTransaction = await createTransaction(
        'marketplace_sale',
        amount * 0.95, // 5% platform fee
        `Sale of marketplace item`,
        itemId
      );

      // Mark transactions as completed
      await updateTransactionStatus(purchaseTransaction.id, 'completed');
      await updateTransactionStatus(saleTransaction.id, 'completed');
      
      // Update buyer balance
      const newBalance = authState.user.balance - amount;
      await updateUserBalance(newBalance);
      
      Alert.alert('Success', 'Purchase completed successfully!');
      return true;
    } catch (error) {
      console.log('Error processing marketplace purchase:', error);
      Alert.alert('Error', 'Failed to process purchase');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getRecentTransactions = (): Transaction[] => {
    return transactions
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);
  };

  const getPendingTransactions = (): Transaction[] => {
    return transactions.filter(t => t.status === 'pending');
  };

  return {
    transactions,
    loading,
    depositFunds,
    withdrawFunds,
    createEscrowTransaction,
    releaseBetPayout,
    processMarketplacePurchase,
    getRecentTransactions,
    getPendingTransactions,
    loadTransactions,
  };
};
