
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Bet } from '../../types';
import { commonStyles, colors, buttonStyles } from '../../styles/commonStyles';
import Icon from '../../components/Icon';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';
import { useBets } from '../../hooks/useBets';

export default function BetsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const { authState } = useAuth();
  const { bets, loading, loadBets } = useBets();

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBets();
    setRefreshing(false);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'open': return colors.primary;
      case 'accepted': return colors.warning;
      case 'settled': return colors.success;
      case 'cancelled': return colors.textSecondary;
      default: return colors.textSecondary;
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'open': return 'Open';
      case 'accepted': return 'In Progress';
      case 'settled': return 'Settled';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const renderBetCard = (bet: Bet, isUserBet: boolean) => (
    <TouchableOpacity
      key={bet.id}
      style={commonStyles.card}
      onPress={() => router.push(`/bet/${bet.id}`)}
      activeOpacity={0.7}
    >
      <View style={commonStyles.row}>
        <View style={{ flex: 1 }}>
          <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 4 }]}>
            {bet.title}
          </Text>
          <Text style={[commonStyles.textSecondary, { marginBottom: 8 }]} numberOfLines={2}>
            {bet.description}
          </Text>
          <View style={commonStyles.row}>
            <Text style={[commonStyles.textSecondary, { fontSize: 12 }]}>
              by {isUserBet ? 'You' : bet.creatorUsername}
            </Text>
            <Text style={[commonStyles.textSecondary, { fontSize: 12 }]}>
              {formatDate(bet.createdAt)}
            </Text>
          </View>
        </View>
        <View style={{ alignItems: 'flex-end', marginLeft: 12 }}>
          <Text style={[commonStyles.text, { fontWeight: '700', fontSize: 18 }]}>
            ${bet.amount}
          </Text>
          <View style={{
            backgroundColor: getStatusColor(bet.status),
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 12,
            marginTop: 4,
          }}>
            <Text style={{
              color: colors.background,
              fontSize: 10,
              fontWeight: '600',
            }}>
              {getStatusText(bet.status)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading && bets.length === 0) {
    return <LoadingSpinner message="Loading bets..." />;
  }

  const userBets = bets.filter(bet => 
    bet.creatorId === authState.user?.id || bet.acceptorId === authState.user?.id
  );
  const otherBets = bets.filter(bet => 
    bet.creatorId !== authState.user?.id && bet.acceptorId !== authState.user?.id
  );

  return (
    <SafeAreaView style={commonStyles.wrapper}>
      <View style={commonStyles.container}>
        {/* Header */}
        <View style={commonStyles.content}>
          <View style={[commonStyles.row, { marginBottom: 20 }]}>
            <View>
              <Text style={commonStyles.title}>Bets</Text>
              <Text style={commonStyles.textSecondary}>
                Balance: ${authState.user?.balance.toFixed(2) || '0.00'}
              </Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/wallet')}>
              <Icon name="wallet" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Create Bet Button */}
          <TouchableOpacity
            style={[buttonStyles.primary, { marginBottom: 24 }]}
            onPress={() => router.push('/create-bet')}
          >
            <Text style={[buttonStyles.text, buttonStyles.primaryText]}>
              Create New Bet
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={commonStyles.content}>
            {/* Your Bets */}
            {userBets.length > 0 && (
              <>
                <Text style={[commonStyles.subtitle, { marginBottom: 16 }]}>
                  Your Bets
                </Text>
                {userBets.map(bet => renderBetCard(bet, true))}
              </>
            )}

            {/* Available Bets */}
            <Text style={[commonStyles.subtitle, { marginBottom: 16, marginTop: userBets.length > 0 ? 24 : 0 }]}>
              Available Bets
            </Text>
            {otherBets.length === 0 ? (
              <View style={[commonStyles.card, commonStyles.center, { padding: 40 }]}>
                <Icon name="dice" size={48} color={colors.textSecondary} />
                <Text style={[commonStyles.textSecondary, { marginTop: 16, textAlign: 'center' }]}>
                  No bets available right now.{'\n'}Create the first one!
                </Text>
              </View>
            ) : (
              otherBets.map(bet => renderBetCard(bet, false))
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
