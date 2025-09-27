
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { commonStyles, colors, buttonStyles } from '../styles/commonStyles';
import Icon from '../components/Icon';
import { useBets } from '../hooks/useBets';
import { useAuth } from '../hooks/useAuth';
import { router } from 'expo-router';

export default function CreateBetScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const { authState } = useAuth();
  const { createBet, loading } = useBets();

  const handleCreateBet = async () => {
    if (!authState.user) return;

    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please enter a title for your bet');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Missing Description', 'Please enter a description for your bet');
      return;
    }

    const betAmount = parseFloat(amount);
    if (isNaN(betAmount) || betAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid bet amount');
      return;
    }

    if (betAmount < 1) {
      Alert.alert('Minimum Bet', 'Minimum bet amount is $1');
      return;
    }

    if (betAmount > 10000) {
      Alert.alert('Maximum Bet', 'Maximum bet amount is $10,000');
      return;
    }

    if (betAmount > authState.user.balance) {
      Alert.alert(
        'Insufficient Funds',
        `You need $${betAmount} to create this bet. Your current balance is $${authState.user.balance.toFixed(2)}.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Add Funds', onPress: () => router.push('/wallet') },
        ]
      );
      return;
    }

    Alert.alert(
      'Create Bet',
      `Create a bet for $${betAmount}? This amount will be held when someone accepts your bet.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Create',
          onPress: async () => {
            const success = await createBet(
              authState.user!.id,
              authState.user!.username,
              title.trim(),
              description.trim(),
              betAmount
            );

            if (success) {
              Alert.alert('Success', 'Your bet has been created!', [
                { text: 'OK', onPress: () => router.back() }
              ]);
            } else {
              Alert.alert('Error', 'Failed to create bet. Please try again.');
            }
          },
        },
      ]
    );
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
        <Text style={commonStyles.headerTitle}>Create Bet</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={commonStyles.content}>
          {/* Balance Info */}
          <View style={[commonStyles.card, { marginBottom: 20 }]}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <Text style={commonStyles.text}>Your Balance:</Text>
              <Text style={[commonStyles.title, { color: colors.primary }]}>
                ${authState.user?.balance?.toFixed(2) || '0.00'}
              </Text>
            </View>
            <TouchableOpacity
              style={[buttonStyles.secondary, { marginTop: 12 }]}
              onPress={() => router.push('/wallet')}
            >
              <Icon name="plus" size={20} color={colors.primary} />
              <Text style={buttonStyles.secondaryText}>Add Funds</Text>
            </TouchableOpacity>
          </View>

          <View style={commonStyles.card}>
            <Text style={[commonStyles.label, { marginBottom: 8 }]}>
              Bet Title *
            </Text>
            <TextInput
              style={commonStyles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="e.g., Will it rain tomorrow?"
              maxLength={100}
            />

            <Text style={[commonStyles.label, { marginBottom: 8, marginTop: 20 }]}>
              Description *
            </Text>
            <TextInput
              style={[commonStyles.input, { height: 100, textAlignVertical: 'top' }]}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe the bet conditions and how it will be settled..."
              multiline
              maxLength={500}
            />

            <Text style={[commonStyles.label, { marginBottom: 8, marginTop: 20 }]}>
              Bet Amount *
            </Text>
            <TextInput
              style={commonStyles.input}
              value={amount}
              onChangeText={setAmount}
              placeholder="Enter amount in USD"
              keyboardType="numeric"
            />
            
            <Text style={[commonStyles.caption, { marginTop: 8 }]}>
              Both you and the acceptor will put up this amount. Winner takes all.
            </Text>

            <TouchableOpacity
              style={[buttonStyles.primary, { marginTop: 30 }]}
              onPress={handleCreateBet}
              disabled={loading}
            >
              <Icon name="plus" size={20} color="white" />
              <Text style={buttonStyles.primaryText}>
                {loading ? 'Creating...' : 'Create Bet'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
