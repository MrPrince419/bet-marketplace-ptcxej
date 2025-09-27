
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
import { useAuth } from '../../hooks/useAuth';
import { useBets } from '../../hooks/useBets';
import { useMarketplace } from '../../hooks/useMarketplace';
import { commonStyles, colors, buttonStyles } from '../../styles/commonStyles';
import Icon from '../../components/Icon';

export default function ProfileScreen() {
  const { authState, logout } = useAuth();
  const { getUserBets } = useBets();
  const { getUserItems } = useMarketplace();

  if (!authState.user) {
    return null;
  }

  const userBets = getUserBets(authState.user.id);
  const userItems = getUserItems(authState.user.id);
  
  const activeBets = userBets.filter(bet => bet.status !== 'settled').length;
  const settledBets = userBets.filter(bet => bet.status === 'settled').length;
  const wonBets = userBets.filter(bet => bet.status === 'settled' && bet.winner === authState.user?.id).length;
  
  const activeItems = userItems.filter(item => item.status === 'available').length;
  const soldItems = userItems.filter(item => item.status === 'sold').length;

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={commonStyles.content}>
        <Text style={[commonStyles.title, { marginBottom: 20 }]}>Profile</Text>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* User Info */}
          <View style={[commonStyles.card, { marginBottom: 20 }]}>
            <View style={[commonStyles.center, { marginBottom: 16 }]}>
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
                  color: colors.background,
                  fontSize: 32,
                  fontWeight: '600',
                }}>
                  {authState.user.username.charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text style={[commonStyles.subtitle, { marginBottom: 4 }]}>
                @{authState.user.username}
              </Text>
              <Text style={commonStyles.textSecondary}>
                {authState.user.email}
              </Text>
            </View>
            
            <View style={[commonStyles.row, { marginBottom: 12 }]}>
              <Text style={commonStyles.text}>Balance:</Text>
              <Text style={[commonStyles.text, { fontWeight: '600', color: colors.success }]}>
                ${authState.user.balance}
              </Text>
            </View>
            
            <Text style={[commonStyles.textSecondary, { fontSize: 12 }]}>
              Member since: {formatDate(authState.user.createdAt)}
            </Text>
          </View>

          {/* Stats */}
          <View style={[commonStyles.card, { marginBottom: 20 }]}>
            <Text style={[commonStyles.subtitle, { marginBottom: 16 }]}>Statistics</Text>
            
            <View style={{ marginBottom: 16 }}>
              <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 8 }]}>
                Betting
              </Text>
              <View style={[commonStyles.row, { marginBottom: 4 }]}>
                <Text style={commonStyles.textSecondary}>Total Bets:</Text>
                <Text style={commonStyles.text}>{userBets.length}</Text>
              </View>
              <View style={[commonStyles.row, { marginBottom: 4 }]}>
                <Text style={commonStyles.textSecondary}>Active Bets:</Text>
                <Text style={commonStyles.text}>{activeBets}</Text>
              </View>
              <View style={[commonStyles.row, { marginBottom: 4 }]}>
                <Text style={commonStyles.textSecondary}>Settled Bets:</Text>
                <Text style={commonStyles.text}>{settledBets}</Text>
              </View>
              <View style={[commonStyles.row, { marginBottom: 4 }]}>
                <Text style={commonStyles.textSecondary}>Won Bets:</Text>
                <Text style={[commonStyles.text, { color: colors.success }]}>{wonBets}</Text>
              </View>
            </View>
            
            <View>
              <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 8 }]}>
                Marketplace
              </Text>
              <View style={[commonStyles.row, { marginBottom: 4 }]}>
                <Text style={commonStyles.textSecondary}>Total Items:</Text>
                <Text style={commonStyles.text}>{userItems.length}</Text>
              </View>
              <View style={[commonStyles.row, { marginBottom: 4 }]}>
                <Text style={commonStyles.textSecondary}>Active Listings:</Text>
                <Text style={commonStyles.text}>{activeItems}</Text>
              </View>
              <View style={[commonStyles.row, { marginBottom: 4 }]}>
                <Text style={commonStyles.textSecondary}>Sold Items:</Text>
                <Text style={[commonStyles.text, { color: colors.success }]}>{soldItems}</Text>
              </View>
            </View>
          </View>

          {/* Actions */}
          <View style={[commonStyles.card, { marginBottom: 20 }]}>
            <Text style={[commonStyles.subtitle, { marginBottom: 16 }]}>Actions</Text>
            
            <TouchableOpacity
              style={[buttonStyles.secondary, { marginBottom: 12 }]}
              onPress={() => router.push('/create-bet')}
            >
              <View style={[commonStyles.row, { justifyContent: 'center' }]}>
                <Icon name="dice" size={20} color={colors.text} style={{ marginRight: 8 }} />
                <Text style={[buttonStyles.text, buttonStyles.secondaryText]}>
                  Create New Bet
                </Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[buttonStyles.secondary, { marginBottom: 12 }]}
              onPress={() => router.push('/create-item')}
            >
              <View style={[commonStyles.row, { justifyContent: 'center' }]}>
                <Icon name="add-circle" size={20} color={colors.text} style={{ marginRight: 8 }} />
                <Text style={[buttonStyles.text, buttonStyles.secondaryText]}>
                  List New Item
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Logout */}
          <TouchableOpacity
            style={[buttonStyles.secondary, { 
              borderColor: colors.error,
              backgroundColor: colors.background,
              marginBottom: 40,
            }]}
            onPress={handleLogout}
          >
            <View style={[commonStyles.row, { justifyContent: 'center' }]}>
              <Icon name="log-out" size={20} color={colors.error} style={{ marginRight: 8 }} />
              <Text style={[buttonStyles.text, { color: colors.error }]}>
                Logout
              </Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
