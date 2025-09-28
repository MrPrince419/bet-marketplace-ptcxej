
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, commonStyles, buttonStyles } from '../styles/commonStyles';
import Icon from './Icon';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  retryText?: string;
}

export default function ErrorMessage({ 
  message, 
  onRetry, 
  retryText = 'Try Again' 
}: ErrorMessageProps) {
  return (
    <View style={styles.container}>
      <Icon name="alert-circle" size={48} color={colors.error} />
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <TouchableOpacity 
          style={[buttonStyles.secondary, styles.retryButton]} 
          onPress={onRetry}
        >
          <Text style={[buttonStyles.secondaryText, buttonStyles.text]}>
            {retryText}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 20,
  },
  message: {
    ...commonStyles.text,
    color: colors.error,
    textAlign: 'center',
    marginVertical: 16,
    lineHeight: 24,
  },
  retryButton: {
    marginTop: 8,
    paddingHorizontal: 32,
  },
});
