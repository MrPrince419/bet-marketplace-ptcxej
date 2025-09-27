
import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import { commonStyles, colors } from '../styles/commonStyles';

export default function Index() {
  const { authState, loading } = useAuth();

  if (loading) {
    return (
      <View style={[commonStyles.container, commonStyles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (authState.isAuthenticated) {
    return <Redirect href="/main" />;
  }

  return <Redirect href="/auth/login" />;
}
