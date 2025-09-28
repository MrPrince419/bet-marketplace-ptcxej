
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Icon from '../components/Icon';
import SimpleBottomSheet from '../components/BottomSheet';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';
import { usePayments } from '../hooks/usePayments';
import { commonStyles, colors, buttonStyles } from '../styles/commonStyles';

export default function WalletScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [showDepositSheet, setShowDepositSheet] = useState(false);
  const [showWithdrawSheet, setShowWithdrawSheet] = useState(false);
  
  const { authState } = useAuth();
  const { 
    transactions, 
    loading, 
    depositFunds, 
    withdrawFunds, 
    getRecentTransactions,
    loadTransactions 
  } = usePayments();

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  };

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount greater than $0');
      return;
    }

    if (amount > 10000) {
      Alert.alert('Amount Too Large', 'Maximum deposit amount is $10,000');
      return;
    }

    const success = await depositFunds(amount);
    if (success) {
      setDepositAmount('');
      setShowDepositSheet(false);
    }
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount greater than $0');
      return;
    }

    if (!authState.user || amount > authState.user.balance) {
      Alert.alert('Insufficient Funds', 'You do not have enough balance to withdraw this amount');
      return;
    }

    const success = await withdrawFunds(amount);
    if (success) {
      setWithdrawAmount('');
      setShowWithdrawSheet(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getTransactionIcon = (type: string): keyof typeof Icon => {
    switch (type) {
      case 'deposit': return 'add-circle';
      case 'withdrawal': return 'remove-circle';
      case 'bet_escrow': return 'lock-closed';
      case 'bet_payout': return 'trophy';
      case 'marketplace_purchase': return 'bag';
      case 'marketplace_sale': return 'cash';
      default: return 'swap-horizontal';
    }
  };

  const getTransactionColor = (type: string): string => {
    switch (type) {
      case 'deposit':
      case 'bet_payout':
      case 'marketplace_sale':
        return colors.success;
      case 'withdrawal':
      case 'bet_escrow':
      case 'marketplace_purchase':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const getTransactionAmount = (transaction: any): string => {
    const isPositive = ['deposit', 'bet_payout', 'marketplace_sale'].includes(transaction.type);
    const sign = isPositive ? '+' : '-';
    return `${sign}$${transaction.amount.toFixed(2)}`;
  };

  if (loading && transactions.length === 0) {
    return <LoadingSpinner message="Loading wallet..." />;
  }

  const recentTransactions = getRecentTransactions();

  return (
    <SafeAreaView style={commonStyles.wrapper}>
      <View style={commonStyles.container}>
        {/* Header */}
        <View style={[commonStyles.content, { paddingBottom: 0 }]}>
          <View style={commonStyles.row}>
            <TouchableOpacity onPress={() => router.back()}>
              <Icon name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={commonStyles.title}>Wallet</Text>
            <View style={{ width: 24 }} />
          </View>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Balance Card */}
          <View style={[commonStyles.content, { paddingTop: 0 }]}>
            <View style={[commonStyles.card, { alignItems: 'center', padding: 32 }]}>
              <Text style={commonStyles.textSecondary}>Current Balance</Text>
              <Text style={[commonStyles.title, { fontSize: 36, marginBottom: 0 }]}>
                ${authState.user?.balance.toFixed(2) || '0.00'}
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={[commonStyles.row, { marginBottom: 24 }]}>
              <TouchableOpacity
                style={[buttonStyles.primary, { flex: 1, marginRight: 8 }]}
                onPress={() => setShowDepositSheet(true)}
                disabled={loading}
              >
                <Text style={[buttonStyles.text, buttonStyles.primaryText]}>
                  Deposit
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[buttonStyles.secondary, { flex: 1, marginLeft: 8 }]}
                onPress={() => setShowWithdrawSheet(true)}
                disabled={loading}
              >
                <Text style={[buttonStyles.text, buttonStyles.secondaryText]}>
                  Withdraw
                </Text>
              </TouchableOpacity>
            </View>

            {/* Recent Transactions */}
            <Text style={commonStyles.subtitle}>Recent Transactions</Text>
            {recentTransactions.length === 0 ? (
              <View style={[commonStyles.card, commonStyles.center, { padding: 40 }]}>
                <Icon name="receipt" size={48} color={colors.textSecondary} />
                <Text style={[commonStyles.textSecondary, { marginTop: 16 }]}>
                  No transactions yet
                </Text>
              </View>
            ) : (
              recentTransactions.map((transaction) => (
                <View key={transaction.id} style={commonStyles.card}>
                  <View style={commonStyles.row}>
                    <View style={[commonStyles.row, { flex: 1 }]}>
                      <Icon
                        name={getTransactionIcon(transaction.type)}
                        size={24}
                        color={getTransactionColor(transaction.type)}
                        style={{ marginRight: 12 }}
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={commonStyles.text}>{transaction.description}</Text>
                        <Text style={commonStyles.textSecondary}>
                          {formatDate(transaction.createdAt)}
                        </Text>
                      </View>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text
                        style={[
                          commonStyles.text,
                          { 
                            color: getTransactionColor(transaction.type),
                            fontWeight: '600' 
                          }
                        ]}
                      >
                        {getTransactionAmount(transaction)}
                      </Text>
                      <Text style={[commonStyles.textSecondary, { fontSize: 12 }]}>
                        {transaction.status}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>

        {/* Deposit Bottom Sheet */}
        <SimpleBottomSheet
          isVisible={showDepositSheet}
          onClose={() => setShowDepositSheet(false)}
        >
          <View style={{ padding: 20 }}>
            <Text style={[commonStyles.subtitle, { textAlign: 'center', marginBottom: 20 }]}>
              Deposit Funds
            </Text>
            <TextInput
              style={commonStyles.input}
              placeholder="Enter amount"
              value={depositAmount}
              onChangeText={setDepositAmount}
              keyboardType="numeric"
              autoFocus
            />
            <TouchableOpacity
              style={[buttonStyles.primary, { marginTop: 16 }]}
              onPress={handleDeposit}
              disabled={loading}
            >
              <Text style={[buttonStyles.text, buttonStyles.primaryText]}>
                {loading ? 'Processing...' : 'Deposit'}
              </Text>
            </TouchableOpacity>
          </View>
        </SimpleBottomSheet>

        {/* Withdraw Bottom Sheet */}
        <SimpleBottomSheet
          isVisible={showWithdrawSheet}
          onClose={() => setShowWithdrawSheet(false)}
        >
          <View style={{ padding: 20 }}>
            <Text style={[commonStyles.subtitle, { textAlign: 'center', marginBottom: 20 }]}>
              Withdraw Funds
            </Text>
            <TextInput
              style={commonStyles.input}
              placeholder="Enter amount"
              value={withdrawAmount}
              onChangeText={setWithdrawAmount}
              keyboardType="numeric"
              autoFocus
            />
            <Text style={[commonStyles.textSecondary, { marginBottom: 16 }]}>
              Available: ${authState.user?.balance.toFixed(2) || '0.00'}
            </Text>
            <TouchableOpacity
              style={[buttonStyles.primary, { marginTop: 16 }]}
              onPress={handleWithdraw}
              disabled={loading}
            >
              <Text style={[buttonStyles.text, buttonStyles.primaryText]}>
                {loading ? 'Processing...' : 'Withdraw'}
              </Text>
            </TouchableOpacity>
          </View>
        </SimpleBottomSheet>
      </View>
    </SafeAreaView>
  );
}
