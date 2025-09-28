
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
import { useAuth } from '../hooks/useAuth';
import { useMarketplace } from '../hooks/useMarketplace';
import { commonStyles, colors, buttonStyles } from '../styles/commonStyles';

export default function CreateItemScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { createItem } = useMarketplace();
  const { authState } = useAuth();

  const handleCreateItem = async () => {
    if (!title.trim() || !description.trim() || !price.trim()) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }

    const itemPrice = parseFloat(price);
    if (isNaN(itemPrice) || itemPrice <= 0) {
      Alert.alert('Invalid Price', 'Please enter a valid price greater than $0');
      return;
    }

    if (itemPrice > 100000) {
      Alert.alert('Price Too High', 'Maximum item price is $100,000');
      return;
    }

    setLoading(true);
    try {
      const success = await createItem(
        authState.user!.id,
        authState.user!.username,
        title.trim(),
        description.trim(),
        itemPrice,
        imageUrl.trim() || undefined
      );

      if (success) {
        Alert.alert(
          'Item Listed!',
          'Your item has been listed in the marketplace.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else {
        Alert.alert('Error', 'Failed to create item. Please try again.');
      }
    } catch (error) {
      console.log('Error creating item:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fillSampleData = () => {
    setTitle('Sample Item');
    setDescription('This is a sample item description. Replace with your actual item details.');
    setPrice('50');
    setImageUrl('https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400');
  };

  if (loading) {
    return <LoadingSpinner message="Creating item..." />;
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
              <Text style={commonStyles.title}>List Item</Text>
              <View style={{ width: 24 }} />
            </View>

            {/* Form */}
            <View style={commonStyles.section}>
              <Text style={[commonStyles.text, { marginBottom: 8, fontWeight: '600' }]}>
                Item Title *
              </Text>
              <TextInput
                style={commonStyles.input}
                placeholder="What are you selling?"
                value={title}
                onChangeText={setTitle}
                maxLength={100}
              />

              <Text style={[commonStyles.text, { marginBottom: 8, fontWeight: '600' }]}>
                Description *
              </Text>
              <TextInput
                style={[commonStyles.input, { height: 100, textAlignVertical: 'top' }]}
                placeholder="Describe your item, its condition, and any important details..."
                value={description}
                onChangeText={setDescription}
                multiline
                maxLength={1000}
              />

              <Text style={[commonStyles.text, { marginBottom: 8, fontWeight: '600' }]}>
                Price *
              </Text>
              <TextInput
                style={commonStyles.input}
                placeholder="Enter price in USD"
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
              />

              <Text style={[commonStyles.text, { marginBottom: 8, fontWeight: '600' }]}>
                Image URL (Optional)
              </Text>
              <TextInput
                style={commonStyles.input}
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChangeText={setImageUrl}
                autoCapitalize="none"
                autoCorrect={false}
              />

              <TouchableOpacity
                style={[buttonStyles.secondary, { marginBottom: 16 }]}
                onPress={fillSampleData}
              >
                <Text style={[buttonStyles.text, buttonStyles.secondaryText]}>
                  Fill Sample Data
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={buttonStyles.primary}
                onPress={handleCreateItem}
                disabled={loading}
              >
                <Text style={[buttonStyles.text, buttonStyles.primaryText]}>
                  List Item
                </Text>
              </TouchableOpacity>
            </View>

            {/* Info Card */}
            <View style={[commonStyles.card, { backgroundColor: colors.backgroundAlt, marginTop: 32 }]}>
              <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 8 }]}>
                Marketplace Tips:
              </Text>
              <Text style={commonStyles.textSecondary}>
                • Use clear, descriptive titles{'\n'}
                • Include detailed condition information{'\n'}
                • Add high-quality images when possible{'\n'}
                • Price competitively for faster sales{'\n'}
                • Users can bid or buy at your asking price
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
