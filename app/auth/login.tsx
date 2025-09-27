
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

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    const success = await login(email, password);
    setLoading(false);

    if (success) {
      router.replace('/main');
    } else {
      Alert.alert('Error', 'Invalid email or password');
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
              <Text style={commonStyles.title}>Welcome Back</Text>
              <Text style={commonStyles.textSecondary}>
                Sign in to your account to continue
              </Text>
            </View>

            <View style={{ marginBottom: 24 }}>
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

            <View style={{ marginBottom: 32 }}>
              <Text style={[commonStyles.text, { marginBottom: 8 }]}>Password</Text>
              <TextInput
                style={commonStyles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <TouchableOpacity
              style={[buttonStyles.primary, { marginBottom: 16 }]}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={[buttonStyles.text, buttonStyles.primaryText]}>
                {loading ? 'Signing In...' : 'Sign In'}
              </Text>
            </TouchableOpacity>

            <View style={[commonStyles.row, { justifyContent: 'center' }]}>
              <Text style={commonStyles.textSecondary}>Don&apos;t have an account? </Text>
              <Link href="/auth/register" asChild>
                <TouchableOpacity>
                  <Text style={[commonStyles.text, { color: colors.primary }]}>
                    Sign Up
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
