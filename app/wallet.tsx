
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
import { commonStyles, colors, buttonStyles } from '../styles/commonStyles';
import { useAuth } from '../hooks/useAuth';
import { usePayments } from '../hooks/usePayments';
import Icon from '../components/Icon';
import { router } from 'expo-router';
import SimpleBottomSheet from '../components/BottomSheet';

export default function WalletScreen() {
  const { authState } = useAuth();
  const { 
    loading, 
    depositFunds, 
    withdrawFunds, 
    getRecentTransactions, 
    getPendingTransactions,
    loadTransactions 
  } = usePayments();
  
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [showDepositSheet, setShowDepositSheet] = useState(false);
  const [showWithdrawSheet, setShowWithdrawSheet] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const recentTransactions = getRecentTransactions();
  const pendingTransactions = getPendingTransactions();

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  };

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    if (amount < 1) {
      Alert.alert('Minimum Deposit', 'Minimum deposit amount is $1');
      return;
    }

    if (amount > 10000) {
      Alert.alert('Maximum Deposit', 'Maximum deposit amount is $10,000');
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
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    if (amount < 1) {
      Alert.alert('Minimum Withdrawal', 'Minimum withdrawal amount is $1');
      return;
    }

    if (amount > (authState.user?.balance || 0)) {
      Alert.alert('Insufficient Funds', 'You do not have enough balance');
      return;
    }

    const success = await withdrawFunds(amount);
    if (success) {
      setWithdrawAmount('');
      setShowWithdrawSheet(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'plus';
      case 'withdrawal':
        return 'minus';
      case 'bet_escrow':
        return 'lock';
      case 'bet_payout':
        return 'trophy';
      case 'marketplace_purchase':
        return 'shopping-cart';
      case 'marketplace_sale':
        return 'dollar-sign';
      default:
        return 'activity';
    }
  };

  const getTransactionColor = (type: string) => {
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
        return colors.text;
    }
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      {/* Header */}
      <View style={commonStyles.header}>
        <TouchableOpacity
          style={commonStyles.backButton}
          onPress={() => router.back()}
        >
          <Icon name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={commonStyles.headerTitle}>Wallet</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={commonStyles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Balance Card */}
        <View style={[commonStyles.card, { marginBottom: 20 }]}>
          <Text style={[commonStyles.subtitle, { textAlign: 'center', marginBottom: 10 }]}>
            Current Balance
          </Text>
          <Text style={[commonStyles.title, { 
            textAlign: 'center', 
            fontSize: 36, 
            color: colors.primary,
            marginBottom: 20 
          }]}>
            ${authState.user?.balance?.toFixed(2) || '0.00'}
          </Text>
          
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity
              style={[buttonStyles.primary, { flex: 1 }]}
              onPress={() => setShowDepositSheet(true)}
              disabled={loading}
            >
              <Icon name="plus" size={20} color="white" />
              <Text style={buttonStyles.primaryText}>Deposit</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[buttonStyles.secondary, { flex: 1 }]}
              onPress={() => setShowWithdrawSheet(true)}
              disabled={loading || (authState.user?.balance || 0) <= 0}
            >
              <Icon name="minus" size={20} color={colors.primary} />
              <Text style={buttonStyles.secondaryText}>Withdraw</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Pending Transactions */}
        {pendingTransactions.length > 0 && (
          <View style={[commonStyles.card, { marginBottom: 20 }]}>
            <Text style={[commonStyles.subtitle, { marginBottom: 15 }]}>
              Pending Transactions
            </Text>
            {pendingTransactions.map((transaction) => (
              <View key={transaction.id} style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              }}>
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: colors.background,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}>
                  <Icon 
                    name={getTransactionIcon(transaction.type)} 
                    size={20} 
                    color={colors.warning} 
                  />
                </View>
                
                <View style={{ flex: 1 }}>
                  <Text style={commonStyles.text}>{transaction.description}</Text>
                  <Text style={[commonStyles.caption, { color: colors.warning }]}>
                    Pending • {formatDate(transaction.createdAt)}
                  </Text>
                </View>
                
                <Text style={[commonStyles.text, { 
                  color: colors.warning,
                  fontWeight: '600' 
                }]}>
                  ${transaction.amount.toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Recent Transactions */}
        <View style={commonStyles.card}>
          <Text style={[commonStyles.subtitle, { marginBottom: 15 }]}>
            Recent Transactions
          </Text>
          
          {recentTransactions.length === 0 ? (
            <Text style={[commonStyles.caption, { textAlign: 'center', padding: 20 }]}>
              No transactions yet
            </Text>
          ) : (
            recentTransactions.map((transaction, index) => (
              <View key={transaction.id} style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 12,
                borderBottomWidth: index < recentTransactions.length - 1 ? 1 : 0,
                borderBottomColor: colors.border,
              }}>
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: colors.background,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}>
                  <Icon 
                    name={getTransactionIcon(transaction.type)} 
                    size={20} 
                    color={getTransactionColor(transaction.type)} 
                  />
                </View>
                
                <View style={{ flex: 1 }}>
                  <Text style={commonStyles.text}>{transaction.description}</Text>
                  <Text style={commonStyles.caption}>
                    {transaction.status === 'completed' ? 'Completed' : transaction.status} • {formatDate(transaction.createdAt)}
                  </Text>
                </View>
                
                <Text style={[commonStyles.text, { 
                  color: getTransactionColor(transaction.type),
                  fontWeight: '600' 
                }]}>
                  {transaction.type === 'deposit' || transaction.type === 'bet_payout' || transaction.type === 'marketplace_sale' ? '+' : '-'}
                  ${transaction.amount.toFixed(2)}
                </Text>
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
          <Text style={[commonStyles.title, { marginBottom: 20, textAlign: 'center' }]}>
            Deposit Funds
          </Text>
          
          <Text style={[commonStyles.label, { marginBottom: 8 }]}>Amount</Text>
          <TextInput
            style={commonStyles.input}
            value={depositAmount}
            onChangeText={setDepositAmount}
            placeholder="Enter amount"
            keyboardType="numeric"
            autoFocus
          />
          
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
            <TouchableOpacity
              style={[buttonStyles.secondary, { flex: 1 }]}
              onPress={() => setShowDepositSheet(false)}
            >
              <Text style={buttonStyles.secondaryText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[buttonStyles.primary, { flex: 1 }]}
              onPress={handleDeposit}
              disabled={loading}
            >
              <Text style={buttonStyles.primaryText}>
                {loading ? 'Processing...' : 'Deposit'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SimpleBottomSheet>

      {/* Withdraw Bottom Sheet */}
      <SimpleBottomSheet
        isVisible={showWithdrawSheet}
        onClose={() => setShowWithdrawSheet(false)}
      >
        <View style={{ padding: 20 }}>
          <Text style={[commonStyles.title, { marginBottom: 20, textAlign: 'center' }]}>
            Withdraw Funds
          </Text>
          
          <Text style={[commonStyles.label, { marginBottom: 8 }]}>Amount</Text>
          <TextInput
            style={commonStyles.input}
            value={withdrawAmount}
            onChangeText={setWithdrawAmount}
            placeholder="Enter amount"
            keyboardType="numeric"
            autoFocus
          />
          
          <Text style={[commonStyles.caption, { marginTop: 8, marginBottom: 20 }]}>
            Available balance: ${authState.user?.balance?.toFixed(2) || '0.00'}
          </Text>
          
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity
              style={[buttonStyles.secondary, { flex: 1 }]}
              onPress={() => setShowWithdrawSheet(false)}
            >
              <Text style={buttonStyles.secondaryText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[buttonStyles.primary, { flex: 1 }]}
              onPress={handleWithdraw}
              disabled={loading}
            >
              <Text style={buttonStyles.primaryText}>
                {loading ? 'Processing...' : 'Withdraw'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SimpleBottomSheet>
    </SafeAreaView>
  );
}
