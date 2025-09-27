
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
import { useAuth } from '../../hooks/useAuth';
import { commonStyles, colors, buttonStyles } from '../../styles/commonStyles';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleRegister = async () => {
    if (!email || !username || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const success = await register(email, username, password);
    setLoading(false);

    if (success) {
      router.replace('/main');
    } else {
      Alert.alert('Error', 'User with this email or username already exists');
    }
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={[commonStyles.content, { justifyContent: 'center' }]}>
            <View style={{ marginBottom: 40 }}>
              <Text style={commonStyles.title}>Create Account</Text>
              <Text style={commonStyles.textSecondary}>
                Join our community and start betting and trading
              </Text>
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text style={[commonStyles.text, { marginBottom: 8 }]}>Email</Text>
              <TextInput
                style={commonStyles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text style={[commonStyles.text, { marginBottom: 8 }]}>Username</Text>
              <TextInput
                style={commonStyles.input}
                value={username}
                onChangeText={setUsername}
                placeholder="Choose a username"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text style={[commonStyles.text, { marginBottom: 8 }]}>Password</Text>
              <TextInput
                style={commonStyles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Create a password"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={{ marginBottom: 32 }}>
              <Text style={[commonStyles.text, { marginBottom: 8 }]}>Confirm Password</Text>
              <TextInput
                style={commonStyles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm your password"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <TouchableOpacity
              style={[buttonStyles.primary, { marginBottom: 16 }]}
              onPress={handleRegister}
              disabled={loading}
            >
              <Text style={[buttonStyles.text, buttonStyles.primaryText]}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </Text>
            </TouchableOpacity>

            <View style={[commonStyles.row, { justifyContent: 'center' }]}>
              <Text style={commonStyles.textSecondary}>Already have an account? </Text>
              <Link href="/auth/login" asChild>
                <TouchableOpacity>
                  <Text style={[commonStyles.text, { color: colors.primary }]}>
                    Sign In
                  </Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
