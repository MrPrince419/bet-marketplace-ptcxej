
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

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing Information', 'Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      const success = await login(email.trim(), password);
      if (success) {
        router.replace('/main');
      } else {
        Alert.alert('Login Failed', 'Invalid email or password. Try using one of the demo accounts:\n\n• alice@demo.com\n• bob@demo.com\n• charlie@demo.com');
      }
    } catch (error) {
      console.log('Login error:', error);
      Alert.alert('Error', 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = () => {
    setEmail('alice@demo.com');
    setPassword('demo123');
  };

  if (loading) {
    return <LoadingSpinner message="Logging in..." />;
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
                Welcome Back
              </Text>
              <Text style={commonStyles.textSecondary}>
                Sign in to your account
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
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />

              <TouchableOpacity
                style={buttonStyles.primary}
                onPress={handleLogin}
                disabled={loading}
              >
                <Text style={[buttonStyles.text, buttonStyles.primaryText]}>
                  Sign In
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[buttonStyles.secondary, { marginTop: 12 }]}
                onPress={fillDemoAccount}
              >
                <Text style={[buttonStyles.text, buttonStyles.secondaryText]}>
                  Try Demo Account
                </Text>
              </TouchableOpacity>
            </View>

            <View style={{ alignItems: 'center', marginTop: 32 }}>
              <Text style={commonStyles.textSecondary}>
                Don&apos;t have an account?{' '}
                <Link href="/auth/register" style={{ color: colors.primary, fontWeight: '600' }}>
                  Sign up
                </Link>
              </Text>
            </View>

            {/* Demo Info */}
            <View style={[commonStyles.card, { marginTop: 32, backgroundColor: colors.backgroundAlt }]}>
              <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 8 }]}>
                Demo Accounts Available:
              </Text>
              <Text style={commonStyles.textSecondary}>
                • alice@demo.com{'\n'}
                • bob@demo.com{'\n'}
                • charlie@demo.com{'\n'}
                (Any password works)
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
