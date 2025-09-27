
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { useMarketplace } from '../../hooks/useMarketplace';
import { commonStyles, colors, buttonStyles } from '../../styles/commonStyles';
import Icon from '../../components/Icon';
import { MarketplaceItem } from '../../types';

export default function ItemDetailScreen() {
  const { id, action } = useLocalSearchParams<{ id: string; action?: string }>();
  const [item, setItem] = useState<MarketplaceItem | null>(null);
  const [bidAmount, setBidAmount] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { authState, updateUserBalance } = useAuth();
  const { items, placeBid, buyItem } = useMarketplace();

  useEffect(() => {
    const foundItem = items.find(i => i.id === id);
    setItem(foundItem || null);
  }, [id, items]);

  const handlePlaceBid = async () => {
    if (!authState.user || !item) return;

    const bid = parseFloat(bidAmount);
    if (isNaN(bid) || bid <= 0) {
      Alert.alert('Error', 'Please enter a valid bid amount');
      return;
    }

    if (bid > authState.user.balance) {
      Alert.alert('Error', 'Insufficient balance');
      return;
    }

    const highestBid = getHighestBid();
    if (highestBid && bid <= highestBid) {
      Alert.alert('Error', `Bid must be higher than current highest bid of $${highestBid}`);
      return;
    }

    if (bid >= item.price) {
      Alert.alert('Error', `Bid must be lower than the buy-now price of $${item.price}`);
      return;
    }

    setLoading(true);
    const success = await placeBid(item.id, authState.user.id, authState.user.username, bid);
    
    if (success) {
      Alert.alert('Success', 'Bid placed successfully!');
      setBidAmount('');
    } else {
      Alert.alert('Error', 'Failed to place bid');
    }
    setLoading(false);
  };

  const handleBuyNow = async () => {
    if (!authState.user || !item) return;

    if (item.price > authState.user.balance) {
      Alert.alert('Error', 'Insufficient balance');
      return;
    }

    Alert.alert(
      'Buy Item',
      `Are you sure you want to buy "${item.title}" for $${item.price}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Buy Now',
          onPress: async () => {
            setLoading(true);
            const success = await buyItem(item.id);
            if (success) {
              await updateUserBalance(authState.user!.balance - item.price);
              Alert.alert('Success', 'Item purchased successfully!');
              router.back();
            } else {
              Alert.alert('Error', 'Failed to purchase item');
            }
            setLoading(false);
          }
        }
      ]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getHighestBid = () => {
    if (!item || item.bids.length === 0) return null;
    return Math.max(...item.bids.map(bid => bid.amount));
  };

  if (!item) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={[commonStyles.content, commonStyles.center]}>
          <Text style={commonStyles.text}>Item not found</Text>
          <TouchableOpacity
            style={[buttonStyles.primary, { marginTop: 20 }]}
            onPress={() => router.back()}
          >
            <Text style={[buttonStyles.text, buttonStyles.primaryText]}>
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isSeller = authState.user?.id === item.sellerId;
  const canInteract = item.status === 'available' && authState.user && !isSeller;
  const highestBid = getHighestBid();

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={commonStyles.content}>
        <View style={[commonStyles.row, { marginBottom: 20 }]}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginRight: 16 }}
          >
            <Icon name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={commonStyles.title}>Item Details</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={[commonStyles.card, { marginBottom: 20 }]}>
            {item.imageUrl && (
              <Image
                source={{ uri: item.imageUrl }}
                style={{
                  width: '100%',
                  height: 250,
                  borderRadius: 8,
                  marginBottom: 16,
                }}
                resizeMode="cover"
              />
            )}
            
            <View style={[commonStyles.row, { marginBottom: 12 }]}>
              <Text style={[commonStyles.subtitle, { flex: 1 }]}>
                {item.title}
              </Text>
              <View style={{
                backgroundColor: item.status === 'available' ? colors.success : colors.textSecondary,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 6,
              }}>
                <Text style={[commonStyles.text, { 
                  color: colors.background, 
                  fontSize: 14,
                  fontWeight: '600'
                }]}>
                  {item.status.toUpperCase()}
                </Text>
              </View>
            </View>
            
            <Text style={[commonStyles.text, { marginBottom: 16 }]}>
              {item.description}
            </Text>
            
            <View style={[commonStyles.row, { marginBottom: 12 }]}>
              <Text style={[commonStyles.text, { fontWeight: '600' }]}>
                Price:
              </Text>
              <Text style={[commonStyles.text, { fontWeight: '600', color: colors.primary }]}>
                ${item.price}
              </Text>
            </View>
            
            <View style={[commonStyles.row, { marginBottom: 12 }]}>
              <Text style={commonStyles.textSecondary}>Seller:</Text>
              <Text style={commonStyles.text}>@{item.sellerUsername}</Text>
            </View>
            
            <View style={[commonStyles.row, { marginBottom: 12 }]}>
              <Text style={commonStyles.textSecondary}>Listed:</Text>
              <Text style={commonStyles.text}>{formatDate(item.createdAt)}</Text>
            </View>
            
            {highestBid && (
              <View style={[commonStyles.row, { marginBottom: 12 }]}>
                <Text style={commonStyles.textSecondary}>Highest Bid:</Text>
                <Text style={[commonStyles.text, { color: colors.success, fontWeight: '600' }]}>
                  ${highestBid}
                </Text>
              </View>
            )}
            
            <View style={[commonStyles.row, { marginBottom: 12 }]}>
              <Text style={commonStyles.textSecondary}>Total Bids:</Text>
              <Text style={commonStyles.text}>{item.bids.length}</Text>
            </View>
          </View>

          {item.bids.length > 0 && (
            <View style={[commonStyles.card, { marginBottom: 20 }]}>
              <Text style={[commonStyles.subtitle, { marginBottom: 12 }]}>
                Recent Bids
              </Text>
              {item.bids
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, 5)
                .map((bid) => (
                  <View key={bid.id} style={[commonStyles.row, { marginBottom: 8 }]}>
                    <Text style={commonStyles.text}>@{bid.bidderUsername}</Text>
                    <Text style={[commonStyles.text, { fontWeight: '600' }]}>
                      ${bid.amount}
                    </Text>
                  </View>
                ))}
            </View>
          )}

          {authState.user && (
            <View style={[commonStyles.card, { marginBottom: 20 }]}>
              <Text style={[commonStyles.text, { marginBottom: 8 }]}>
                Your Balance: ${authState.user.balance}
              </Text>
            </View>
          )}

          {canInteract && (action === 'bid' || !action) && (
            <View style={[commonStyles.card, { marginBottom: 20 }]}>
              <Text style={[commonStyles.subtitle, { marginBottom: 12 }]}>
                Place a Bid
              </Text>
              <Text style={[commonStyles.textSecondary, { marginBottom: 12 }]}>
                {highestBid 
                  ? `Current highest bid: $${highestBid}` 
                  : 'Be the first to place a bid!'
                }
              </Text>
              
              <TextInput
                style={[commonStyles.input, { marginBottom: 12 }]}
                value={bidAmount}
                onChangeText={setBidAmount}
                placeholder={`Enter bid amount ${highestBid ? `(> $${highestBid})` : ''}`}
                keyboardType="numeric"
              />
              
              <TouchableOpacity
                style={[buttonStyles.primary, { marginBottom: 12 }]}
                onPress={handlePlaceBid}
                disabled={loading}
              >
                <Text style={[buttonStyles.text, buttonStyles.primaryText]}>
                  {loading ? 'Placing Bid...' : 'Place Bid'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {canInteract && (
            <TouchableOpacity
              style={[buttonStyles.primary, { marginBottom: 16 }]}
              onPress={handleBuyNow}
              disabled={loading}
            >
              <Text style={[buttonStyles.text, buttonStyles.primaryText]}>
                {loading ? 'Processing...' : `Buy Now - $${item.price}`}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={buttonStyles.secondary}
            onPress={() => router.back()}
          >
            <Text style={[buttonStyles.text, buttonStyles.secondaryText]}>
              Back to Marketplace
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
