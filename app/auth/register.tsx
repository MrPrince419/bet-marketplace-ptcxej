
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
import { Link, router } from 'expo-router';
import { commonStyles, colors, buttonStyles } from '../../styles/commonStyles';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleRegister = async () => {
    if (!email.trim() || !username.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Missing Information', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters long');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    if (username.length < 3) {
      Alert.alert('Invalid Username', 'Username must be at least 3 characters long');
      return;
    }

    setLoading(true);
    try {
      const success = await register(email.trim(), username.trim(), password);
      if (success) {
        Alert.alert(
          'Welcome!',
          'Your account has been created successfully. You start with $1,000 in your wallet!',
          [{ text: 'OK', onPress: () => router.replace('/main') }]
        );
      } else {
        Alert.alert('Registration Failed', 'An account with this email or username already exists');
      }
    } catch (error) {
      console.log('Registration error:', error);
      Alert.alert('Error', 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Creating account..." />;
  }

  return (
    <SafeAreaView style={commonStyles.wrapper}>
      <KeyboardAvoidingView
        style={commonStyles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={[commonStyles.content, { justifyContent: 'center', flex: 1 }]}>
            <View style={{ alignItems: 'center', marginBottom: 48 }}>
              <Text style={[commonStyles.title, { fontSize: 32, marginBottom: 8 }]}>
                Create Account
              </Text>
              <Text style={commonStyles.textSecondary}>
                Join the betting and marketplace community
              </Text>
            </View>

            <View style={commonStyles.section}>
              <TextInput
                style={commonStyles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />

              <TextInput
                style={commonStyles.input}
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
              />

              <TextInput
                style={commonStyles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />

              <TextInput
                style={commonStyles.input}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
              />

              <TouchableOpacity
                style={buttonStyles.primary}
                onPress={handleRegister}
                disabled={loading}
              >
                <Text style={[buttonStyles.text, buttonStyles.primaryText]}>
                  Create Account
                </Text>
              </TouchableOpacity>
            </View>

            <View style={{ alignItems: 'center', marginTop: 32 }}>
              <Text style={commonStyles.textSecondary}>
                Already have an account?{' '}
                <Link href="/auth/login" style={{ color: colors.primary, fontWeight: '600' }}>
                  Sign in
                </Link>
              </Text>
            </View>

            {/* Welcome Bonus Info */}
            <View style={[commonStyles.card, { marginTop: 32, backgroundColor: colors.backgroundAlt }]}>
              <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 8 }]}>
                🎉 Welcome Bonus
              </Text>
              <Text style={commonStyles.textSecondary}>
                New users receive $1,000 starting balance to begin betting and shopping!
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
