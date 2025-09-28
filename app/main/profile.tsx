
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { commonStyles, colors, buttonStyles } from '../../styles/commonStyles';
import Icon from '../../components/Icon';
import { useAuth } from '../../hooks/useAuth';
import { useBets } from '../../hooks/useBets';
import { useMarketplace } from '../../hooks/useMarketplace';
import { usePayments } from '../../hooks/usePayments';

export default function ProfileScreen() {
  const { authState, logout } = useAuth();
  const { bets } = useBets();
  const { items } = useMarketplace();
  const { transactions } = usePayments();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/auth/login');
          }
        },
      ]
    );
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  const getUserStats = () => {
    const userBets = bets.filter(bet => 
      bet.creatorId === authState.user?.id || bet.acceptorId === authState.user?.id
    );
    const userItems = items.filter(item => item.sellerId === authState.user?.id);
    const userTransactions = transactions;

    const settledBets = userBets.filter(bet => bet.status === 'settled');
    const wonBets = settledBets.filter(bet => bet.winner === authState.user?.id);
    const soldItems = userItems.filter(item => item.status === 'sold');

    return {
      totalBets: userBets.length,
      wonBets: wonBets.length,
      winRate: settledBets.length > 0 ? Math.round((wonBets.length / settledBets.length) * 100) : 0,
      totalItems: userItems.length,
      soldItems: soldItems.length,
      totalTransactions: userTransactions.length,
    };
  };

  const stats = getUserStats();

  return (
    <SafeAreaView style={commonStyles.wrapper}>
      <View style={commonStyles.container}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 }}>
          <View style={commonStyles.content}>
            {/* Header */}
            <Text style={[commonStyles.title, { marginBottom: 32 }]}>Profile</Text>

            {/* User Info Card */}
            <View style={[commonStyles.card, { alignItems: 'center', padding: 32 }]}>
              <View style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
              }}>
                <Text style={{
                  color: colors.background,
                  fontSize: 32,
                  fontWeight: '700',
                }}>
                  {authState.user?.username.charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text style={[commonStyles.subtitle, { marginBottom: 4 }]}>
                {authState.user?.username}
              </Text>
              <Text style={commonStyles.textSecondary}>
                {authState.user?.email}
              </Text>
              <Text style={[commonStyles.textSecondary, { marginTop: 8 }]}>
                Member since {formatDate(authState.user?.createdAt || '')}
              </Text>
            </View>

            {/* Balance Card */}
            <View style={[commonStyles.card, { alignItems: 'center', padding: 24 }]}>
              <Text style={commonStyles.textSecondary}>Current Balance</Text>
              <Text style={[commonStyles.title, { fontSize: 32, marginBottom: 16 }]}>
                ${authState.user?.balance.toFixed(2) || '0.00'}
              </Text>
              <TouchableOpacity
                style={[buttonStyles.secondary, { paddingHorizontal: 32 }]}
                onPress={() => router.push('/wallet')}
              >
                <Text style={[buttonStyles.text, buttonStyles.secondaryText]}>
                  Manage Wallet
                </Text>
              </TouchableOpacity>
            </View>

            {/* Stats Cards */}
            <Text style={[commonStyles.subtitle, { marginBottom: 16 }]}>Statistics</Text>
            
            <View style={[commonStyles.row, { marginBottom: 12 }]}>
              <View style={[commonStyles.card, { flex: 1, marginRight: 6, alignItems: 'center', padding: 20 }]}>
                <Text style={[commonStyles.title, { fontSize: 24, marginBottom: 4 }]}>
                  {stats.totalBets}
                </Text>
                <Text style={commonStyles.textSecondary}>Total Bets</Text>
              </View>
              <View style={[commonStyles.card, { flex: 1, marginLeft: 6, alignItems: 'center', padding: 20 }]}>
                <Text style={[commonStyles.title, { fontSize: 24, marginBottom: 4 }]}>
                  {stats.winRate}%
                </Text>
                <Text style={commonStyles.textSecondary}>Win Rate</Text>
              </View>
            </View>

            <View style={[commonStyles.row, { marginBottom: 24 }]}>
              <View style={[commonStyles.card, { flex: 1, marginRight: 6, alignItems: 'center', padding: 20 }]}>
                <Text style={[commonStyles.title, { fontSize: 24, marginBottom: 4 }]}>
                  {stats.totalItems}
                </Text>
                <Text style={commonStyles.textSecondary}>Items Listed</Text>
              </View>
              <View style={[commonStyles.card, { flex: 1, marginLeft: 6, alignItems: 'center', padding: 20 }]}>
                <Text style={[commonStyles.title, { fontSize: 24, marginBottom: 4 }]}>
                  {stats.soldItems}
                </Text>
                <Text style={commonStyles.textSecondary}>Items Sold</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={commonStyles.section}>
              <TouchableOpacity
                style={[commonStyles.card, commonStyles.row, { padding: 16 }]}
                onPress={() => router.push('/wallet')}
              >
                <Icon name="wallet" size={24} color={colors.primary} style={{ marginRight: 16 }} />
                <View style={{ flex: 1 }}>
                  <Text style={commonStyles.text}>Wallet</Text>
                  <Text style={commonStyles.textSecondary}>Manage your funds</Text>
                </View>
                <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[commonStyles.card, commonStyles.row, { padding: 16 }]}
                onPress={() => Alert.alert('Coming Soon', 'Transaction history will be available soon!')}
              >
                <Icon name="receipt" size={24} color={colors.primary} style={{ marginRight: 16 }} />
                <View style={{ flex: 1 }}>
                  <Text style={commonStyles.text}>Transaction History</Text>
                  <Text style={commonStyles.textSecondary}>{stats.totalTransactions} transactions</Text>
                </View>
                <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[commonStyles.card, commonStyles.row, { padding: 16 }]}
                onPress={() => Alert.alert('Coming Soon', 'Settings will be available soon!')}
              >
                <Icon name="settings" size={24} color={colors.primary} style={{ marginRight: 16 }} />
                <View style={{ flex: 1 }}>
                  <Text style={commonStyles.text}>Settings</Text>
                  <Text style={commonStyles.textSecondary}>App preferences</Text>
                </View>
                <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Logout Button */}
            <TouchableOpacity
              style={[buttonStyles.secondary, { 
                borderColor: colors.error,
                backgroundColor: colors.background,
                marginTop: 24,
              }]}
              onPress={handleLogout}
            >
              <Text style={[buttonStyles.text, { color: colors.error }]}>
                Logout
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
