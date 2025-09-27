
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { useBets } from '../../hooks/useBets';
import { commonStyles, colors, buttonStyles } from '../../styles/commonStyles';
import Icon from '../../components/Icon';
import { Bet } from '../../types';

export default function BetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [bet, setBet] = useState<Bet | null>(null);
  const [loading, setLoading] = useState(false);
  
  const { authState, updateUserBalance } = useAuth();
  const { bets, acceptBet, settleBet } = useBets();

  useEffect(() => {
    const foundBet = bets.find(b => b.id === id);
    setBet(foundBet || null);
  }, [id, bets]);

  const handleAcceptBet = async () => {
    if (!authState.user || !bet) return;

    if (authState.user.balance < bet.amount) {
      Alert.alert('Error', 'Insufficient balance to accept this bet');
      return;
    }

    Alert.alert(
      'Accept Bet',
      `Are you sure you want to accept this bet for $${bet.amount}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: async () => {
            setLoading(true);
            const success = await acceptBet(bet.id, authState.user!.id, authState.user!.username);
            if (success) {
              // Deduct amount from user balance (escrow)
              await updateUserBalance(authState.user!.balance - bet.amount);
              Alert.alert('Success', 'Bet accepted successfully!');
              router.back();
            } else {
              Alert.alert('Error', 'Failed to accept bet');
            }
            setLoading(false);
          }
        }
      ]
    );
  };

  const handleSettleBet = (winnerId: string, winnerName: string) => {
    Alert.alert(
      'Settle Bet',
      `Declare ${winnerName} as the winner?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setLoading(true);
            const success = await settleBet(bet!.id, winnerId);
            if (success) {
              // Award winnings to winner (2x the bet amount)
              if (winnerId === authState.user?.id) {
                await updateUserBalance(authState.user.balance + (bet!.amount * 2));
              }
              Alert.alert('Success', 'Bet settled successfully!');
              router.back();
            } else {
              Alert.alert('Error', 'Failed to settle bet');
            }
            setLoading(false);
          }
        }
      ]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (!bet) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={[commonStyles.content, commonStyles.center]}>
          <Text style={commonStyles.text}>Bet not found</Text>
          <TouchableOpacity
            style={[buttonStyles.primary, { marginTop: 20 }]}
            onPress={() => router.back()}
          >
            <Text style={[buttonStyles.text, buttonStyles.primaryText]}>
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isCreator = authState.user?.id === bet.creatorId;
  const isAcceptor = authState.user?.id === bet.acceptorId;
  const canAccept = bet.status === 'open' && authState.user && !isCreator;
  const canSettle = bet.status === 'accepted' && (isCreator || isAcceptor);

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={commonStyles.content}>
        <View style={[commonStyles.row, { marginBottom: 20 }]}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginRight: 16 }}
          >
            <Icon name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={commonStyles.title}>Bet Details</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={[commonStyles.card, { marginBottom: 20 }]}>
            <View style={[commonStyles.row, { marginBottom: 12 }]}>
              <Text style={[commonStyles.subtitle, { flex: 1 }]}>
                {bet.title}
              </Text>
              <View style={{
                backgroundColor: bet.status === 'open' ? colors.warning : 
                               bet.status === 'accepted' ? colors.primary : colors.success,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 6,
              }}>
                <Text style={[commonStyles.text, { 
                  color: colors.background, 
                  fontSize: 14,
                  fontWeight: '600'
                }]}>
                  {bet.status.toUpperCase()}
                </Text>
              </View>
            </View>
            
            <Text style={[commonStyles.text, { marginBottom: 16 }]}>
              {bet.description}
            </Text>
            
            <View style={[commonStyles.row, { marginBottom: 12 }]}>
              <Text style={[commonStyles.text, { fontWeight: '600' }]}>
                Bet Amount:
              </Text>
              <Text style={[commonStyles.text, { fontWeight: '600', color: colors.primary }]}>
                ${bet.amount}
              </Text>
            </View>
            
            <View style={[commonStyles.row, { marginBottom: 12 }]}>
              <Text style={commonStyles.textSecondary}>Created by:</Text>
              <Text style={commonStyles.text}>@{bet.creatorUsername}</Text>
            </View>
            
            {bet.acceptorUsername && (
              <View style={[commonStyles.row, { marginBottom: 12 }]}>
                <Text style={commonStyles.textSecondary}>Accepted by:</Text>
                <Text style={commonStyles.text}>@{bet.acceptorUsername}</Text>
              </View>
            )}
            
            <View style={[commonStyles.row, { marginBottom: 12 }]}>
              <Text style={commonStyles.textSecondary}>Created:</Text>
              <Text style={commonStyles.text}>{formatDate(bet.createdAt)}</Text>
            </View>
            
            {bet.settledAt && (
              <View style={[commonStyles.row, { marginBottom: 12 }]}>
                <Text style={commonStyles.textSecondary}>Settled:</Text>
                <Text style={commonStyles.text}>{formatDate(bet.settledAt)}</Text>
              </View>
            )}
            
            {bet.winner && (
              <View style={[commonStyles.row, { marginBottom: 12 }]}>
                <Text style={commonStyles.textSecondary}>Winner:</Text>
                <Text style={[commonStyles.text, { color: colors.success, fontWeight: '600' }]}>
                  @{bet.winner === bet.creatorId ? bet.creatorUsername : bet.acceptorUsername}
                </Text>
              </View>
            )}
          </View>

          {authState.user && (
            <View style={[commonStyles.card, { marginBottom: 20 }]}>
              <Text style={[commonStyles.text, { marginBottom: 8 }]}>
                Your Balance: ${authState.user.balance}
              </Text>
              {bet.status === 'accepted' && (
                <Text style={commonStyles.textSecondary}>
                  Winner will receive: ${bet.amount * 2}
                </Text>
              )}
            </View>
          )}

          {canAccept && (
            <TouchableOpacity
              style={[buttonStyles.primary, { marginBottom: 16 }]}
              onPress={handleAcceptBet}
              disabled={loading}
            >
              <Text style={[buttonStyles.text, buttonStyles.primaryText]}>
                {loading ? 'Accepting...' : `Accept Bet ($${bet.amount})`}
              </Text>
            </TouchableOpacity>
          )}

          {canSettle && (
            <View style={{ marginBottom: 16 }}>
              <Text style={[commonStyles.subtitle, { marginBottom: 12 }]}>
                Settle Bet
              </Text>
              <Text style={[commonStyles.textSecondary, { marginBottom: 16 }]}>
                Who won this bet?
              </Text>
              
              <TouchableOpacity
                style={[buttonStyles.primary, { marginBottom: 12 }]}
                onPress={() => handleSettleBet(bet.creatorId, bet.creatorUsername)}
                disabled={loading}
              >
                <Text style={[buttonStyles.text, buttonStyles.primaryText]}>
                  @{bet.creatorUsername} Won
                </Text>
              </TouchableOpacity>
              
              {bet.acceptorId && bet.acceptorUsername && (
                <TouchableOpacity
                  style={[buttonStyles.primary, { marginBottom: 12 }]}
                  onPress={() => handleSettleBet(bet.acceptorId!, bet.acceptorUsername!)}
                  disabled={loading}
                >
                  <Text style={[buttonStyles.text, buttonStyles.primaryText]}>
                    @{bet.acceptorUsername} Won
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          <TouchableOpacity
            style={buttonStyles.secondary}
            onPress={() => router.back()}
          >
            <Text style={[buttonStyles.text, buttonStyles.secondaryText]}>
              Back to Bets
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
