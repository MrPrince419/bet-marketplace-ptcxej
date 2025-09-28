
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
import { Bet } from '../../types';
import { commonStyles, colors, buttonStyles } from '../../styles/commonStyles';
import Icon from '../../components/Icon';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import { useBets } from '../../hooks/useBets';
import { usePayments } from '../../hooks/usePayments';
import { useAuth } from '../../hooks/useAuth';

export default function BetDetailScreen() {
  const { id } = useLocalSearchParams();
  const [bet, setBet] = useState<Bet | null>(null);
  const [loading, setLoading] = useState(true);
  
  const { bets, acceptBet, settleBet, cancelBet } = useBets();
  const { authState } = useAuth();
  const { createEscrowTransaction, releaseBetPayout } = usePayments();

  useEffect(() => {
    if (id && bets.length > 0) {
      const foundBet = bets.find(b => b.id === id);
      setBet(foundBet || null);
      setLoading(false);
    }
  }, [id, bets]);

  const handleAcceptBet = async () => {
    if (!bet || !authState.user) return;

    if (authState.user.balance < bet.amount) {
      Alert.alert('Insufficient Funds', 'You do not have enough balance to accept this bet');
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
            const success = await acceptBet(
              bet.id,
              authState.user!.id,
              authState.user!.username,
              createEscrowTransaction
            );
            if (success) {
              Alert.alert('Bet Accepted!', 'The bet has been accepted and funds are in escrow.');
            }
          }
        }
      ]
    );
  };

  const handleSettleBet = (winnerId: string, winnerName: string) => {
    if (!bet) return;

    Alert.alert(
      'Settle Bet',
      `Declare ${winnerName} as the winner?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            const success = await settleBet(bet.id, winnerId, winnerName, releaseBetPayout);
            if (success) {
              Alert.alert('Bet Settled!', `${winnerName} has been declared the winner.`);
            }
          }
        }
      ]
    );
  };

  const handleCancelBet = () => {
    if (!bet) return;

    Alert.alert(
      'Cancel Bet',
      'Are you sure you want to cancel this bet?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            const success = await cancelBet(bet.id);
            if (success) {
              Alert.alert('Bet Cancelled', 'The bet has been cancelled.');
              router.back();
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
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
      case 'open': return 'Open for Acceptance';
      case 'accepted': return 'In Progress';
      case 'settled': return 'Settled';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading bet details..." />;
  }

  if (!bet) {
    return (
      <ErrorMessage
        message="Bet not found"
        onRetry={() => router.back()}
        retryText="Go Back"
      />
    );
  }

  const isCreator = bet.creatorId === authState.user?.id;
  const isAcceptor = bet.acceptorId === authState.user?.id;
  const isParticipant = isCreator || isAcceptor;
  const canAccept = bet.status === 'open' && !isCreator && authState.user;
  const canSettle = bet.status === 'accepted' && isParticipant;
  const canCancel = bet.status === 'open' && isCreator;

  return (
    <SafeAreaView style={commonStyles.wrapper}>
      <View style={commonStyles.container}>
        {/* Header */}
        <View style={[commonStyles.content, { paddingBottom: 0 }]}>
          <View style={[commonStyles.row, { marginBottom: 24 }]}>
            <TouchableOpacity onPress={() => router.back()}>
              <Icon name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={commonStyles.title}>Bet Details</Text>
            <View style={{ width: 24 }} />
          </View>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 }}>
          <View style={commonStyles.content}>
            {/* Bet Info Card */}
            <View style={commonStyles.card}>
              <View style={[commonStyles.row, { marginBottom: 16 }]}>
                <Text style={[commonStyles.subtitle, { flex: 1 }]}>
                  {bet.title}
                </Text>
                <View style={{
                  backgroundColor: getStatusColor(bet.status),
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 16,
                }}>
                  <Text style={{
                    color: colors.background,
                    fontSize: 12,
                    fontWeight: '600',
                  }}>
                    {getStatusText(bet.status)}
                  </Text>
                </View>
              </View>

              <Text style={[commonStyles.text, { marginBottom: 16, lineHeight: 24 }]}>
                {bet.description}
              </Text>

              <View style={[commonStyles.row, { marginBottom: 8 }]}>
                <Text style={commonStyles.textSecondary}>Amount:</Text>
                <Text style={[commonStyles.text, { fontWeight: '700', fontSize: 18 }]}>
                  ${bet.amount}
                </Text>
              </View>

              <View style={[commonStyles.row, { marginBottom: 8 }]}>
                <Text style={commonStyles.textSecondary}>Created by:</Text>
                <Text style={commonStyles.text}>{bet.creatorUsername}</Text>
              </View>

              {bet.acceptorUsername && (
                <View style={[commonStyles.row, { marginBottom: 8 }]}>
                  <Text style={commonStyles.textSecondary}>Accepted by:</Text>
                  <Text style={commonStyles.text}>{bet.acceptorUsername}</Text>
                </View>
              )}

              <View style={[commonStyles.row, { marginBottom: bet.settledAt ? 8 : 0 }]}>
                <Text style={commonStyles.textSecondary}>Created:</Text>
                <Text style={commonStyles.text}>{formatDate(bet.createdAt)}</Text>
              </View>

              {bet.settledAt && (
                <View style={commonStyles.row}>
                  <Text style={commonStyles.textSecondary}>Settled:</Text>
                  <Text style={commonStyles.text}>{formatDate(bet.settledAt)}</Text>
                </View>
              )}
            </View>

            {/* Winner Info */}
            {bet.status === 'settled' && bet.winner && (
              <View style={[commonStyles.card, { backgroundColor: colors.backgroundAlt }]}>
                <View style={[commonStyles.row, { alignItems: 'center' }]}>
                  <Icon name="trophy" size={24} color={colors.warning} style={{ marginRight: 12 }} />
                  <View>
                    <Text style={[commonStyles.text, { fontWeight: '600' }]}>Winner</Text>
                    <Text style={commonStyles.textSecondary}>
                      {bet.winner === bet.creatorId ? bet.creatorUsername : bet.acceptorUsername}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Action Buttons */}
            <View style={commonStyles.section}>
              {canAccept && (
                <TouchableOpacity
                  style={buttonStyles.primary}
                  onPress={handleAcceptBet}
                >
                  <Text style={[buttonStyles.text, buttonStyles.primaryText]}>
                    Accept Bet - ${bet.amount}
                  </Text>
                </TouchableOpacity>
              )}

              {canSettle && (
                <>
                  <Text style={[commonStyles.subtitle, { marginBottom: 16 }]}>
                    Settle Bet
                  </Text>
                  <TouchableOpacity
                    style={[buttonStyles.primary, { marginBottom: 12 }]}
                    onPress={() => handleSettleBet(bet.creatorId, bet.creatorUsername)}
                  >
                    <Text style={[buttonStyles.text, buttonStyles.primaryText]}>
                      {bet.creatorUsername} Wins
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={buttonStyles.secondary}
                    onPress={() => handleSettleBet(bet.acceptorId!, bet.acceptorUsername!)}
                  >
                    <Text style={[buttonStyles.text, buttonStyles.secondaryText]}>
                      {bet.acceptorUsername} Wins
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              {canCancel && (
                <TouchableOpacity
                  style={[buttonStyles.secondary, { 
                    borderColor: colors.error,
                    backgroundColor: colors.background,
                  }]}
                  onPress={handleCancelBet}
                >
                  <Text style={[buttonStyles.text, { color: colors.error }]}>
                    Cancel Bet
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Info */}
            {bet.status === 'open' && !isCreator && (
              <View style={[commonStyles.card, { backgroundColor: colors.backgroundAlt }]}>
                <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 8 }]}>
                  How it works:
                </Text>
                <Text style={commonStyles.textSecondary}>
                  When you accept this bet, ${bet.amount * 2} will be held in escrow. 
                  The winner gets the full amount when the bet is settled.
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
