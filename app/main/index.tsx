
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { useBets } from '../../hooks/useBets';
import { commonStyles, colors, buttonStyles } from '../../styles/commonStyles';
import Icon from '../../components/Icon';
import { Bet } from '../../types';

export default function BetsScreen() {
  const { authState } = useAuth();
  const { bets, loading, getOpenBets, getUserBets, loadBets } = useBets();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBets();
    setRefreshing(false);
  };

  const openBets = getOpenBets();
  const userBets = authState.user ? getUserBets(authState.user.id) : [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const renderBetCard = (bet: Bet, isUserBet: boolean = false) => (
    <View key={bet.id} style={commonStyles.card}>
      <View style={[commonStyles.row, { marginBottom: 8 }]}>
        <Text style={[commonStyles.text, { fontWeight: '600', flex: 1 }]}>
          {bet.title}
        </Text>
        <View style={{
          backgroundColor: bet.status === 'open' ? colors.warning : 
                         bet.status === 'accepted' ? colors.primary : colors.success,
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 4,
        }}>
          <Text style={[commonStyles.textSecondary, { 
            color: colors.background, 
            fontSize: 12,
            fontWeight: '500'
          }]}>
            {bet.status.toUpperCase()}
          </Text>
        </View>
      </View>
      
      <Text style={[commonStyles.textSecondary, { marginBottom: 8 }]}>
        {bet.description}
      </Text>
      
      <View style={[commonStyles.row, { marginBottom: 8 }]}>
        <Text style={commonStyles.text}>Amount: ${bet.amount}</Text>
        <Text style={commonStyles.textSecondary}>
          by @{bet.creatorUsername}
        </Text>
      </View>
      
      {bet.acceptorUsername && (
        <Text style={[commonStyles.textSecondary, { marginBottom: 8 }]}>
          Accepted by @{bet.acceptorUsername}
        </Text>
      )}
      
      <Text style={[commonStyles.textSecondary, { fontSize: 12 }]}>
        Created: {formatDate(bet.createdAt)}
      </Text>
      
      {!isUserBet && bet.status === 'open' && authState.user && bet.creatorId !== authState.user.id && (
        <TouchableOpacity
          style={[buttonStyles.primary, { marginTop: 12 }]}
          onPress={() => router.push(`/bet/${bet.id}`)}
        >
          <Text style={[buttonStyles.text, buttonStyles.primaryText]}>
            Accept Bet
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={commonStyles.content}>
        <View style={[commonStyles.row, { marginBottom: 20 }]}>
          <Text style={commonStyles.title}>Betting</Text>
          <TouchableOpacity
            style={[buttonStyles.primary, { paddingHorizontal: 16, paddingVertical: 8 }]}
            onPress={() => router.push('/create-bet')}
          >
            <Text style={[buttonStyles.text, buttonStyles.primaryText, { fontSize: 14 }]}>
              Create Bet
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {authState.user && (
            <View style={{ marginBottom: 24 }}>
              <Text style={[commonStyles.subtitle, { marginBottom: 12 }]}>
                Your Balance: ${authState.user.balance}
              </Text>
            </View>
          )}

          <View style={{ marginBottom: 24 }}>
            <Text style={[commonStyles.subtitle, { marginBottom: 12 }]}>
              Your Bets ({userBets.length})
            </Text>
            {userBets.length === 0 ? (
              <View style={[commonStyles.card, commonStyles.center, { padding: 40 }]}>
                <Icon name="dice-outline" size={48} color={colors.textSecondary} />
                <Text style={[commonStyles.textSecondary, { marginTop: 12 }]}>
                  You haven&apos;t created any bets yet
                </Text>
              </View>
            ) : (
              userBets.map(bet => renderBetCard(bet, true))
            )}
          </View>

          <View>
            <Text style={[commonStyles.subtitle, { marginBottom: 12 }]}>
              Open Bets ({openBets.length})
            </Text>
            {openBets.length === 0 ? (
              <View style={[commonStyles.card, commonStyles.center, { padding: 40 }]}>
                <Icon name="storefront-outline" size={48} color={colors.textSecondary} />
                <Text style={[commonStyles.textSecondary, { marginTop: 12 }]}>
                  No open bets available
                </Text>
              </View>
            ) : (
              openBets.map(bet => renderBetCard(bet))
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
