
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { commonStyles, colors, buttonStyles } from '../../styles/commonStyles';
import { useAuth } from '../../hooks/useAuth';
import { useMarketplace } from '../../hooks/useMarketplace';
import { useBets } from '../../hooks/useBets';
import { usePayments } from '../../hooks/usePayments';
import Icon from '../../components/Icon';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const { authState, logout } = useAuth();
  const { items } = useMarketplace();
  const { bets } = useBets();
  const { getRecentTransactions } = usePayments();

  const userItems = items.filter(item => item.sellerId === authState.user?.id);
  const userBets = bets.filter(bet => 
    bet.creatorId === authState.user?.id || bet.acceptorId === authState.user?.id
  );
  const recentTransactions = getRecentTransactions();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <ScrollView style={commonStyles.content}>
        {/* Profile Header */}
        <View style={[commonStyles.card, { marginBottom: 20 }]}>
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <View style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12,
            }}>
              <Text style={{
                fontSize: 32,
                fontWeight: 'bold',
                color: 'white',
              }}>
                {authState.user?.username.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={commonStyles.title}>{authState.user?.username}</Text>
            <Text style={commonStyles.caption}>{authState.user?.email}</Text>
          </View>

          {/* Balance and Wallet Button */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: colors.background,
            padding: 16,
            borderRadius: 12,
            marginBottom: 20,
          }}>
            <View>
              <Text style={commonStyles.caption}>Current Balance</Text>
              <Text style={[commonStyles.title, { color: colors.primary }]}>
                ${authState.user?.balance?.toFixed(2) || '0.00'}
              </Text>
            </View>
            <TouchableOpacity
              style={buttonStyles.primary}
              onPress={() => router.push('/wallet')}
            >
              <Icon name="credit-card" size={20} color="white" />
              <Text style={buttonStyles.primaryText}>Wallet</Text>
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-around',
            paddingVertical: 16,
            borderTopWidth: 1,
            borderTopColor: colors.border,
          }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={[commonStyles.title, { color: colors.primary }]}>
                {userBets.length}
              </Text>
              <Text style={commonStyles.caption}>Bets</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={[commonStyles.title, { color: colors.primary }]}>
                {userItems.length}
              </Text>
              <Text style={commonStyles.caption}>Items</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={[commonStyles.title, { color: colors.primary }]}>
                {recentTransactions.length}
              </Text>
              <Text style={commonStyles.caption}>Transactions</Text>
            </View>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={[commonStyles.card, { marginBottom: 20 }]}>
          <Text style={[commonStyles.subtitle, { marginBottom: 15 }]}>
            Recent Activity
          </Text>
          
          {/* Recent Bets */}
          {userBets.slice(0, 3).map((bet) => (
            <TouchableOpacity
              key={bet.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              }}
              onPress={() => router.push(`/bet/${bet.id}`)}
            >
              <View style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: colors.background,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}>
                <Icon name="target" size={20} color={colors.primary} />
              </View>
              
              <View style={{ flex: 1 }}>
                <Text style={commonStyles.text} numberOfLines={1}>
                  {bet.title}
                </Text>
                <Text style={commonStyles.caption}>
                  {bet.status} • ${bet.amount} • {formatDate(bet.createdAt)}
                </Text>
              </View>
              
              <Icon name="chevron-right" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          ))}

          {/* Recent Items */}
          {userItems.slice(0, 3).map((item) => (
            <TouchableOpacity
              key={item.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              }}
              onPress={() => router.push(`/item/${item.id}`)}
            >
              <View style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: colors.background,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}>
                <Icon name="shopping-bag" size={20} color={colors.success} />
              </View>
              
              <View style={{ flex: 1 }}>
                <Text style={commonStyles.text} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={commonStyles.caption}>
                  {item.status} • ${item.price} • {formatDate(item.createdAt)}
                </Text>
              </View>
              
              <Icon name="chevron-right" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          ))}

          {userBets.length === 0 && userItems.length === 0 && (
            <Text style={[commonStyles.caption, { textAlign: 'center', padding: 20 }]}>
              No recent activity
            </Text>
          )}
        </View>

        {/* Account Actions */}
        <View style={[commonStyles.card, { marginBottom: 20 }]}>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 16,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
            onPress={() => router.push('/wallet')}
          >
            <Icon name="credit-card" size={24} color={colors.text} />
            <Text style={[commonStyles.text, { marginLeft: 12, flex: 1 }]}>
              Wallet & Payments
            </Text>
            <Icon name="chevron-right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 16,
            }}
            onPress={handleLogout}
          >
            <Icon name="log-out" size={24} color={colors.error} />
            <Text style={[commonStyles.text, { marginLeft: 12, color: colors.error }]}>
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
