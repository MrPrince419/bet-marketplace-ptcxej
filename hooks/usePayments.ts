
import { useState, useEffect } from 'react';
import { Transaction } from '../types';
import { useAuth } from './useAuth';
import { mockPaymentService, MockPaymentResult } from '../services/mockPaymentService';
import { getTransactions, saveTransactions } from '../utils/storage';
import uuid from 'react-native-uuid';
import { Alert, Platform } from 'react-native';

export const usePayments = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const { authState, updateUserBalance } = useAuth();

  useEffect(() => {
    if (authState.user) {
      loadTransactions();
    }
  }, [authState.user]);

  const loadTransactions = async () => {
    try {
      const allTransactions = await getTransactions();
      const userTransactions = allTransactions.filter(t => t.userId === authState.user?.id);
      setTransactions(userTransactions.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
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
    
    setTransactions(prev => [transaction, ...prev]);
    return transaction;
  };

  const updateTransactionStatus = async (
    transactionId: string,
    status: Transaction['status'],
    mockTransactionId?: string
  ) => {
    const allTransactions = await getTransactions();
    const updatedTransactions = allTransactions.map(t => 
      t.id === transactionId 
        ? { 
            ...t, 
            status, 
            stripePaymentIntentId: mockTransactionId,
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
            stripePaymentIntentId: mockTransactionId,
            completedAt: status === 'completed' ? new Date().toISOString() : t.completedAt 
          }
        : t
    ));
  };

  const depositFunds = async (amount: number): Promise<boolean> => {
    if (!authState.user) {
      Alert.alert('Error', 'Please log in to deposit funds');
      return false;
    }

    if (amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount greater than $0');
      return false;
    }

    setLoading(true);
    try {
      // Show demo alert for web
      if (Platform.OS === 'web') {
        mockPaymentService.showPaymentNotSupportedAlert();
      }

      // Create pending transaction
      const transaction = await createTransaction(
        'deposit',
        amount,
        `Deposit $${amount} to wallet`
      );

      // Process mock payment
      const result: MockPaymentResult = await mockPaymentService.processPayment(
        amount,
        `Wallet deposit for ${authState.user.username}`
      );

      if (result.success) {
        // Update transaction status
        await updateTransactionStatus(transaction.id, 'completed', result.transactionId);
        
        // Update user balance
        const newBalance = authState.user.balance + amount;
        await updateUserBalance(newBalance);
        
        Alert.alert('Success', `$${amount} has been added to your wallet!`);
        return true;
      } else {
        await updateTransactionStatus(transaction.id, 'failed');
        Alert.alert('Payment Failed', result.error || 'Unknown error occurred');
        return false;
      }
    } catch (error) {
      console.log('Error depositing funds:', error);
      Alert.alert('Error', 'Failed to process deposit');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const withdrawFunds = async (amount: number): Promise<boolean> => {
    if (!authState.user) {
      Alert.alert('Error', 'Please log in to withdraw funds');
      return false;
    }

    if (amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount greater than $0');
      return false;
    }

    if (authState.user.balance < amount) {
      Alert.alert('Insufficient Funds', 'You do not have enough balance to withdraw this amount');
      return false;
    }

    setLoading(true);
    try {
      // Show demo alert for web
      if (Platform.OS === 'web') {
        mockPaymentService.showPaymentNotSupportedAlert();
      }

      // Create pending transaction
      const transaction = await createTransaction(
        'withdrawal',
        amount,
        `Withdraw $${amount} from wallet`
      );

      // Process mock withdrawal
      const result: MockPaymentResult = await mockPaymentService.processWithdrawal(
        amount,
        `Wallet withdrawal for ${authState.user.username}`
      );

      if (result.success) {
        // Update transaction status
        await updateTransactionStatus(transaction.id, 'completed', result.transactionId);
        
        // Update user balance
        const newBalance = authState.user.balance - amount;
        await updateUserBalance(newBalance);
        
        Alert.alert('Success', `$${amount} has been withdrawn from your wallet!`);
        return true;
      } else {
        await updateTransactionStatus(transaction.id, 'failed');
        Alert.alert('Withdrawal Failed', result.error || 'Unknown error occurred');
        return false;
      }
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

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mark transaction as completed
      await updateTransactionStatus(purchaseTransaction.id, 'completed');
      
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
    return transactions.slice(0, 10);
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
