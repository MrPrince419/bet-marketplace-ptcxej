
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { commonStyles, colors, buttonStyles } from '../../styles/commonStyles';
import { useBets } from '../../hooks/useBets';
import { usePayments } from '../../hooks/usePayments';
import { Bet } from '../../types';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import Icon from '../../components/Icon';

export default function BetDetailScreen() {
  const { id } = useLocalSearchParams();
  const { bets, acceptBet, settleBet, cancelBet } = useBets();
  const { createEscrowTransaction, releaseBetPayout } = usePayments();
  const [bet, setBet] = useState<Bet | null>(null);
  const { authState } = useAuth();

  useEffect(() => {
    if (id && bets.length > 0) {
      const foundBet = bets.find(b => b.id === id);
      setBet(foundBet || null);
    }
  }, [id, bets]);

  const handleAcceptBet = async () => {
    if (!bet || !authState.user) return;

    if (authState.user.balance < bet.amount) {
      Alert.alert(
        'Insufficient Funds',
        `You need $${bet.amount} to accept this bet. Your current balance is $${authState.user.balance.toFixed(2)}.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Add Funds', onPress: () => router.push('/wallet') },
        ]
      );
      return;
    }

    Alert.alert(
      'Accept Bet',
      `Are you sure you want to accept this bet for $${bet.amount}? This amount will be held in escrow until the bet is settled.`,
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
              Alert.alert('Success', 'Bet accepted! Funds have been placed in escrow.');
            } else {
              Alert.alert('Error', 'Failed to accept bet. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleSettleBet = (winnerId: string, winnerName: string) => {
    if (!bet) return;

    Alert.alert(
      'Settle Bet',
      `Are you sure ${winnerName} won this bet? The winner will receive $${(bet.amount * 2).toFixed(2)}.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            const success = await settleBet(bet.id, winnerId, winnerName, releaseBetPayout);
            if (success) {
              Alert.alert('Success', 'Bet has been settled and winnings have been paid out.');
            } else {
              Alert.alert('Error', 'Failed to settle bet. Please try again.');
            }
          },
        },
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
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            const success = await cancelBet(bet.id);
            if (success) {
              Alert.alert('Success', 'Bet has been cancelled.');
              router.back();
            } else {
              Alert.alert('Error', 'Failed to cancel bet. Please try again.');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!bet) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={commonStyles.header}>
          <TouchableOpacity
            style={commonStyles.backButton}
            onPress={() => router.back()}
          >
            <Icon name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={commonStyles.headerTitle}>Bet Details</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={[commonStyles.content, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={commonStyles.text}>Bet not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isCreator = bet.creatorId === authState.user?.id;
  const isAcceptor = bet.acceptorId === authState.user?.id;
  const canAccept = bet.status === 'open' && !isCreator && authState.user;
  const canSettle = bet.status === 'accepted' && (isCreator || isAcceptor);
  const canCancel = bet.status === 'open' && isCreator;

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
        <Text style={commonStyles.headerTitle}>Bet Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={commonStyles.content}>
        {/* Bet Info */}
        <View style={[commonStyles.card, { marginBottom: 20 }]}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 16,
          }}>
            <View style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 16,
              backgroundColor: bet.status === 'open' ? colors.warning + '20' :
                              bet.status === 'accepted' ? colors.primary + '20' :
                              bet.status === 'settled' ? colors.success + '20' :
                              colors.error + '20',
            }}>
              <Text style={{
                fontSize: 12,
                fontWeight: '600',
                color: bet.status === 'open' ? colors.warning :
                       bet.status === 'accepted' ? colors.primary :
                       bet.status === 'settled' ? colors.success :
                       colors.error,
                textTransform: 'uppercase',
              }}>
                {bet.status}
              </Text>
            </View>
            <View style={{ flex: 1 }} />
            <Text style={[commonStyles.title, { color: colors.primary }]}>
              ${bet.amount}
            </Text>
          </View>

          <Text style={[commonStyles.title, { marginBottom: 12 }]}>
            {bet.title}
          </Text>
          
          <Text style={[commonStyles.text, { marginBottom: 20 }]}>
            {bet.description}
          </Text>

          {/* Participants */}
          <View style={{
            backgroundColor: colors.background,
            padding: 16,
            borderRadius: 12,
            marginBottom: 16,
          }}>
            <Text style={[commonStyles.subtitle, { marginBottom: 12 }]}>
              Participants
            </Text>
            
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 8,
            }}>
              <Icon name="user" size={20} color={colors.primary} />
              <Text style={[commonStyles.text, { marginLeft: 8 }]}>
                Creator: {bet.creatorUsername}
                {isCreator && ' (You)'}
              </Text>
            </View>
            
            {bet.acceptorUsername ? (
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}>
                <Icon name="user-check" size={20} color={colors.success} />
                <Text style={[commonStyles.text, { marginLeft: 8 }]}>
                  Acceptor: {bet.acceptorUsername}
                  {isAcceptor && ' (You)'}
                </Text>
              </View>
            ) : (
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}>
                <Icon name="user-plus" size={20} color={colors.textSecondary} />
                <Text style={[commonStyles.caption, { marginLeft: 8 }]}>
                  Waiting for someone to accept...
                </Text>
              </View>
            )}
          </View>

          {/* Bet Details */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingTop: 16,
            borderTopWidth: 1,
            borderTopColor: colors.border,
          }}>
            <View>
              <Text style={commonStyles.caption}>Created</Text>
              <Text style={commonStyles.text}>
                {formatDate(bet.createdAt)}
              </Text>
            </View>
            
            {bet.settledAt && (
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={commonStyles.caption}>Settled</Text>
                <Text style={commonStyles.text}>
                  {formatDate(bet.settledAt)}
                </Text>
              </View>
            )}
          </View>

          {bet.status === 'settled' && bet.winner && (
            <View style={{
              backgroundColor: colors.success + '20',
              padding: 16,
              borderRadius: 12,
              marginTop: 16,
              alignItems: 'center',
            }}>
              <Icon name="trophy" size={32} color={colors.success} />
              <Text style={[commonStyles.subtitle, { 
                color: colors.success, 
                marginTop: 8,
                textAlign: 'center' 
              }]}>
                Winner: {bet.winner === bet.creatorId ? bet.creatorUsername : bet.acceptorUsername}
              </Text>
              <Text style={[commonStyles.caption, { textAlign: 'center', marginTop: 4 }]}>
                Winnings: ${(bet.amount * 2).toFixed(2)}
              </Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={[commonStyles.card, { marginBottom: 20 }]}>
          {canAccept && (
            <TouchableOpacity
              style={[buttonStyles.primary, { marginBottom: 12 }]}
              onPress={handleAcceptBet}
            >
              <Icon name="check" size={20} color="white" />
              <Text style={buttonStyles.primaryText}>
                Accept Bet (${bet.amount})
              </Text>
            </TouchableOpacity>
          )}

          {canSettle && (
            <View>
              <Text style={[commonStyles.subtitle, { marginBottom: 16, textAlign: 'center' }]}>
                Who won this bet?
              </Text>
              
              <TouchableOpacity
                style={[buttonStyles.primary, { marginBottom: 12 }]}
                onPress={() => handleSettleBet(bet.creatorId, bet.creatorUsername)}
              >
                <Icon name="trophy" size={20} color="white" />
                <Text style={buttonStyles.primaryText}>
                  {bet.creatorUsername} Won
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={buttonStyles.primary}
                onPress={() => handleSettleBet(bet.acceptorId!, bet.acceptorUsername!)}
              >
                <Icon name="trophy" size={20} color="white" />
                <Text style={buttonStyles.primaryText}>
                  {bet.acceptorUsername} Won
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {canCancel && (
            <TouchableOpacity
              style={[buttonStyles.secondary, { 
                borderColor: colors.error,
                marginBottom: 12 
              }]}
              onPress={handleCancelBet}
            >
              <Icon name="x" size={20} color={colors.error} />
              <Text style={[buttonStyles.secondaryText, { color: colors.error }]}>
                Cancel Bet
              </Text>
            </TouchableOpacity>
          )}

          {!canAccept && !canSettle && !canCancel && bet.status === 'open' && (
            <View style={{
              padding: 16,
              backgroundColor: colors.background,
              borderRadius: 12,
              alignItems: 'center',
            }}>
              <Icon name="clock" size={32} color={colors.textSecondary} />
              <Text style={[commonStyles.text, { 
                textAlign: 'center', 
                marginTop: 8 
              }]}>
                Waiting for someone to accept this bet
              </Text>
            </View>
          )}

          {bet.status === 'settled' && (
            <View style={{
              padding: 16,
              backgroundColor: colors.success + '20',
              borderRadius: 12,
              alignItems: 'center',
            }}>
              <Icon name="check-circle" size={32} color={colors.success} />
              <Text style={[commonStyles.text, { 
                textAlign: 'center', 
                marginTop: 8,
                color: colors.success 
              }]}>
                This bet has been settled
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
