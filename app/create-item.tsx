
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
import { useMarketplace } from '../hooks/useMarketplace';
import { commonStyles, colors, buttonStyles } from '../styles/commonStyles';
import Icon from '../components/Icon';

export default function CreateItemScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { authState } = useAuth();
  const { createItem } = useMarketplace();

  const handleCreateItem = async () => {
    if (!authState.user) {
      Alert.alert('Error', 'You must be logged in to list an item');
      return;
    }

    if (!title || !description || !price) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const itemPrice = parseFloat(price);
    if (isNaN(itemPrice) || itemPrice <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    setLoading(true);
    
    const success = await createItem(
      authState.user.id,
      authState.user.username,
      title,
      description,
      itemPrice,
      imageUrl || undefined
    );

    if (success) {
      Alert.alert('Success', 'Item listed successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } else {
      Alert.alert('Error', 'Failed to list item');
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
            <Text style={commonStyles.title}>List Item</Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{ marginBottom: 16 }}>
              <Text style={[commonStyles.text, { marginBottom: 8 }]}>Item Title *</Text>
              <TextInput
                style={commonStyles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="e.g., iPhone 13 Pro Max"
                multiline={false}
              />
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text style={[commonStyles.text, { marginBottom: 8 }]}>Description *</Text>
              <TextInput
                style={[commonStyles.input, { height: 100, textAlignVertical: 'top' }]}
                value={description}
                onChangeText={setDescription}
                placeholder="Describe your item, its condition, and any important details..."
                multiline={true}
              />
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text style={[commonStyles.text, { marginBottom: 8 }]}>Price ($) *</Text>
              <TextInput
                style={commonStyles.input}
                value={price}
                onChangeText={setPrice}
                placeholder="Enter price"
                keyboardType="numeric"
              />
            </View>

            <View style={{ marginBottom: 32 }}>
              <Text style={[commonStyles.text, { marginBottom: 8 }]}>Image URL (Optional)</Text>
              <TextInput
                style={commonStyles.input}
                value={imageUrl}
                onChangeText={setImageUrl}
                placeholder="https://example.com/image.jpg"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Text style={[commonStyles.textSecondary, { fontSize: 12, marginTop: 4 }]}>
                You can use free stock images from Unsplash: https://images.unsplash.com/
              </Text>
            </View>

            <TouchableOpacity
              style={[buttonStyles.primary, { marginBottom: 16 }]}
              onPress={handleCreateItem}
              disabled={loading}
            >
              <Text style={[buttonStyles.text, buttonStyles.primaryText]}>
                {loading ? 'Listing Item...' : 'List Item'}
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
