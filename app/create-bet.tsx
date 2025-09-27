
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
import { useAuth } from '../hooks/useAuth';
import { useBets } from '../hooks/useBets';
import { commonStyles, colors, buttonStyles } from '../styles/commonStyles';
import Icon from '../components/Icon';

export default function CreateBetScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { authState, updateUserBalance } = useAuth();
  const { createBet } = useBets();

  const handleCreateBet = async () => {
    if (!authState.user) {
      Alert.alert('Error', 'You must be logged in to create a bet');
      return;
    }

    if (!title || !description || !amount) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const betAmount = parseFloat(amount);
    if (isNaN(betAmount) || betAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (betAmount > authState.user.balance) {
      Alert.alert('Error', 'Insufficient balance');
      return;
    }

    setLoading(true);
    
    const success = await createBet(
      authState.user.id,
      authState.user.username,
      title,
      description,
      betAmount
    );

    if (success) {
      // Deduct amount from user balance (escrow)
      await updateUserBalance(authState.user.balance - betAmount);
      Alert.alert('Success', 'Bet created successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } else {
      Alert.alert('Error', 'Failed to create bet');
    }
    
    setLoading(false);
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={commonStyles.content}>
          <View style={[commonStyles.row, { marginBottom: 20 }]}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ marginRight: 16 }}
            >
              <Icon name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={commonStyles.title}>Create Bet</Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {authState.user && (
              <View style={[commonStyles.card, { marginBottom: 20 }]}>
                <Text style={[commonStyles.text, { marginBottom: 8 }]}>
                  Your Balance: ${authState.user.balance}
                </Text>
                <Text style={commonStyles.textSecondary}>
                  The bet amount will be held in escrow until settled
                </Text>
              </View>
            )}

            <View style={{ marginBottom: 16 }}>
              <Text style={[commonStyles.text, { marginBottom: 8 }]}>Bet Title</Text>
              <TextInput
                style={commonStyles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="e.g., Will it rain tomorrow?"
                multiline={false}
              />
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text style={[commonStyles.text, { marginBottom: 8 }]}>Description</Text>
              <TextInput
                style={[commonStyles.input, { height: 100, textAlignVertical: 'top' }]}
                value={description}
                onChangeText={setDescription}
                placeholder="Provide details about the bet conditions and how it will be settled..."
                multiline={true}
              />
            </View>

            <View style={{ marginBottom: 32 }}>
              <Text style={[commonStyles.text, { marginBottom: 8 }]}>Bet Amount ($)</Text>
              <TextInput
                style={commonStyles.input}
                value={amount}
                onChangeText={setAmount}
                placeholder="Enter amount"
                keyboardType="numeric"
              />
            </View>

            <TouchableOpacity
              style={[buttonStyles.primary, { marginBottom: 16 }]}
              onPress={handleCreateBet}
              disabled={loading}
            >
              <Text style={[buttonStyles.text, buttonStyles.primaryText]}>
                {loading ? 'Creating Bet...' : 'Create Bet'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={buttonStyles.secondary}
              onPress={() => router.back()}
            >
              <Text style={[buttonStyles.text, buttonStyles.secondaryText]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
