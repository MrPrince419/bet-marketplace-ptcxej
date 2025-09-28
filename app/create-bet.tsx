
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
import { router } from 'expo-router';
import Icon from '../components/Icon';
import LoadingSpinner from '../components/LoadingSpinner';
import { useBets } from '../hooks/useBets';
import { useAuth } from '../hooks/useAuth';
import { commonStyles, colors, buttonStyles } from '../styles/commonStyles';

export default function CreateBetScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { createBet } = useBets();
  const { authState } = useAuth();

  const handleCreateBet = async () => {
    if (!title.trim() || !description.trim() || !amount.trim()) {
      Alert.alert('Missing Information', 'Please fill in all fields');
      return;
    }

    const betAmount = parseFloat(amount);
    if (isNaN(betAmount) || betAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount greater than $0');
      return;
    }

    if (betAmount > 10000) {
      Alert.alert('Amount Too Large', 'Maximum bet amount is $10,000');
      return;
    }

    if (!authState.user || betAmount > authState.user.balance) {
      Alert.alert('Insufficient Funds', 'You do not have enough balance for this bet');
      return;
    }

    setLoading(true);
    try {
      const success = await createBet(
        authState.user.id,
        authState.user.username,
        title.trim(),
        description.trim(),
        betAmount
      );

      if (success) {
        Alert.alert(
          'Bet Created!',
          'Your bet has been created and is now available for others to accept.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else {
        Alert.alert('Error', 'Failed to create bet. Please try again.');
      }
    } catch (error) {
      console.log('Error creating bet:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Creating bet..." />;
  }

  return (
    <SafeAreaView style={commonStyles.wrapper}>
      <KeyboardAvoidingView
        style={commonStyles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={commonStyles.content}>
            {/* Header */}
            <View style={[commonStyles.row, { marginBottom: 32 }]}>
              <TouchableOpacity onPress={() => router.back()}>
                <Icon name="arrow-back" size={24} color={colors.text} />
              </TouchableOpacity>
              <Text style={commonStyles.title}>Create Bet</Text>
              <View style={{ width: 24 }} />
            </View>

            {/* Form */}
            <View style={commonStyles.section}>
              <Text style={[commonStyles.text, { marginBottom: 8, fontWeight: '600' }]}>
                Bet Title
              </Text>
              <TextInput
                style={commonStyles.input}
                placeholder="What are you betting on?"
                value={title}
                onChangeText={setTitle}
                maxLength={100}
              />

              <Text style={[commonStyles.text, { marginBottom: 8, fontWeight: '600' }]}>
                Description
              </Text>
              <TextInput
                style={[commonStyles.input, { height: 100, textAlignVertical: 'top' }]}
                placeholder="Provide details about the bet conditions and how it will be settled..."
                value={description}
                onChangeText={setDescription}
                multiline
                maxLength={500}
              />

              <Text style={[commonStyles.text, { marginBottom: 8, fontWeight: '600' }]}>
                Bet Amount
              </Text>
              <TextInput
                style={commonStyles.input}
                placeholder="Enter amount in USD"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
              />

              <Text style={[commonStyles.textSecondary, { marginBottom: 24 }]}>
                Available balance: ${authState.user?.balance.toFixed(2) || '0.00'}
              </Text>

              <TouchableOpacity
                style={buttonStyles.primary}
                onPress={handleCreateBet}
                disabled={loading}
              >
                <Text style={[buttonStyles.text, buttonStyles.primaryText]}>
                  Create Bet
                </Text>
              </TouchableOpacity>
            </View>

            {/* Info Card */}
            <View style={[commonStyles.card, { backgroundColor: colors.backgroundAlt, marginTop: 32 }]}>
              <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 8 }]}>
                How it works:
              </Text>
              <Text style={commonStyles.textSecondary}>
                • Your bet will be visible to all users{'\n'}
                • When someone accepts, both amounts go into escrow{'\n'}
                • The winner gets the full amount when settled{'\n'}
                • Be clear about settlement conditions
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
