
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
import { commonStyles, colors, buttonStyles } from '../../styles/commonStyles';
import { useMarketplace } from '../../hooks/useMarketplace';
import { usePayments } from '../../hooks/usePayments';
import { MarketplaceItem } from '../../types';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import Icon from '../../components/Icon';

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams();
  const { items, placeBid, buyItem, acceptBid } = useMarketplace();
  const { processMarketplacePurchase } = usePayments();
  const [item, setItem] = useState<MarketplaceItem | null>(null);
  const [bidAmount, setBidAmount] = useState('');
  const { authState } = useAuth();

  useEffect(() => {
    if (id && items.length > 0) {
      const foundItem = items.find(i => i.id === id);
      setItem(foundItem || null);
    }
  }, [id, items]);

  const handlePlaceBid = async () => {
    if (!item || !authState.user) return;

    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid bid amount');
      return;
    }

    if (amount >= item.price) {
      Alert.alert(
        'High Bid',
        'Your bid is equal to or higher than the asking price. Would you like to buy it now instead?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Place Bid', onPress: () => placeBidConfirm(amount) },
          { text: 'Buy Now', onPress: handleBuyNow },
        ]
      );
      return;
    }

    placeBidConfirm(amount);
  };

  const placeBidConfirm = async (amount: number) => {
    if (!item || !authState.user) return;

    const success = await placeBid(
      item.id,
      authState.user.id,
      authState.user.username,
      amount
    );

    if (success) {
      setBidAmount('');
      Alert.alert('Success', 'Your bid has been placed!');
    } else {
      Alert.alert('Error', 'Failed to place bid. Please try again.');
    }
  };

  const handleBuyNow = async () => {
    if (!item || !authState.user) return;

    if (authState.user.balance < item.price) {
      Alert.alert(
        'Insufficient Funds',
        `You need $${item.price} to buy this item. Your current balance is $${authState.user.balance.toFixed(2)}.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Add Funds', onPress: () => router.push('/wallet') },
        ]
      );
      return;
    }

    Alert.alert(
      'Confirm Purchase',
      `Are you sure you want to buy "${item.title}" for $${item.price}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Buy Now',
          onPress: async () => {
            const success = await buyItem(item.id, authState.user!.id, processMarketplacePurchase);
            if (success) {
              Alert.alert('Success', 'Item purchased successfully!');
            } else {
              Alert.alert('Error', 'Failed to purchase item. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleAcceptBid = (bidId: string, bidAmount: number, bidderName: string) => {
    if (!item) return;

    Alert.alert(
      'Accept Bid',
      `Accept bid of $${bidAmount} from ${bidderName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: async () => {
            const success = await acceptBid(item.id, bidId, processMarketplacePurchase);
            if (success) {
              Alert.alert('Success', 'Bid accepted! Sale completed.');
            } else {
              Alert.alert('Error', 'Failed to accept bid. Please try again.');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getHighestBid = () => {
    if (!item || item.bids.length === 0) return null;
    return item.bids.reduce((highest, bid) => 
      bid.amount > highest.amount ? bid : highest
    );
  };

  if (!item) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={commonStyles.header}>
          <TouchableOpacity
            style={commonStyles.backButton}
            onPress={() => router.back()}
          >
            <Icon name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={commonStyles.headerTitle}>Item Details</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={[commonStyles.content, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={commonStyles.text}>Item not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isOwner = item.sellerId === authState.user?.id;
  const highestBid = getHighestBid();
  const canBuy = item.status === 'available' && !isOwner && authState.user;
  const canBid = item.status === 'available' && !isOwner && authState.user;

  return (
    <SafeAreaView style={commonStyles.container}>
      {/* Header */}
      <View style={commonStyles.header}>
        <TouchableOpacity
          style={commonStyles.backButton}
          onPress={() => router.back()}
        >
          <Icon name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={commonStyles.headerTitle}>Item Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={commonStyles.content}>
        {/* Item Image */}
        {item.imageUrl && (
          <View style={{ marginBottom: 20 }}>
            <Image
              source={{ uri: item.imageUrl }}
              style={{
                width: '100%',
                height: 200,
                borderRadius: 12,
                backgroundColor: colors.background,
              }}
              resizeMode="cover"
            />
          </View>
        )}

        {/* Item Info */}
        <View style={[commonStyles.card, { marginBottom: 20 }]}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 16,
          }}>
            <View style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 16,
              backgroundColor: item.status === 'available' ? colors.success + '20' : colors.error + '20',
            }}>
              <Text style={{
                fontSize: 12,
                fontWeight: '600',
                color: item.status === 'available' ? colors.success : colors.error,
                textTransform: 'uppercase',
              }}>
                {item.status}
              </Text>
            </View>
            <View style={{ flex: 1 }} />
            <Text style={[commonStyles.title, { color: colors.primary }]}>
              ${item.price}
            </Text>
          </View>

          <Text style={[commonStyles.title, { marginBottom: 12 }]}>
            {item.title}
          </Text>
          
          <Text style={[commonStyles.text, { marginBottom: 20 }]}>
            {item.description}
          </Text>

          {/* Seller Info */}
          <View style={{
            backgroundColor: colors.background,
            padding: 16,
            borderRadius: 12,
            marginBottom: 16,
          }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}>
              <Icon name="user" size={20} color={colors.primary} />
              <Text style={[commonStyles.text, { marginLeft: 8 }]}>
                Seller: {item.sellerUsername}
                {isOwner && ' (You)'}
              </Text>
            </View>
            <Text style={[commonStyles.caption, { marginTop: 4 }]}>
              Listed on {formatDate(item.createdAt)}
            </Text>
          </View>

          {/* Highest Bid */}
          {highestBid && (
            <View style={{
              backgroundColor: colors.warning + '20',
              padding: 16,
              borderRadius: 12,
              marginBottom: 16,
            }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <View>
                  <Text style={[commonStyles.subtitle, { color: colors.warning }]}>
                    Highest Bid
                  </Text>
                  <Text style={commonStyles.caption}>
                    by {highestBid.bidderUsername}
                  </Text>
                </View>
                <Text style={[commonStyles.title, { color: colors.warning }]}>
                  ${highestBid.amount}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        {canBuy && (
          <View style={[commonStyles.card, { marginBottom: 20 }]}>
            <TouchableOpacity
              style={[buttonStyles.primary, { marginBottom: 12 }]}
              onPress={handleBuyNow}
            >
              <Icon name="shopping-cart" size={20} color="white" />
              <Text style={buttonStyles.primaryText}>
                Buy Now - ${item.price}
              </Text>
            </TouchableOpacity>

            {canBid && (
              <View>
                <Text style={[commonStyles.label, { marginBottom: 8 }]}>
                  Place a Bid
                </Text>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TextInput
                    style={[commonStyles.input, { flex: 1 }]}
                    value={bidAmount}
                    onChangeText={setBidAmount}
                    placeholder="Enter bid amount"
                    keyboardType="numeric"
                  />
                  <TouchableOpacity
                    style={buttonStyles.secondary}
                    onPress={handlePlaceBid}
                  >
                    <Text style={buttonStyles.secondaryText}>Bid</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Seller Actions */}
        {isOwner && item.bids.length > 0 && item.status === 'available' && (
          <View style={[commonStyles.card, { marginBottom: 20 }]}>
            <Text style={[commonStyles.subtitle, { marginBottom: 16 }]}>
              Bids ({item.bids.length})
            </Text>
            
            {item.bids
              .sort((a, b) => b.amount - a.amount)
              .map((bid) => (
                <View
                  key={bid.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={commonStyles.text}>
                      {bid.bidderUsername}
                    </Text>
                    <Text style={commonStyles.caption}>
                      {formatDate(bid.createdAt)}
                    </Text>
                  </View>
                  
                  <Text style={[commonStyles.text, { 
                    fontWeight: '600',
                    marginRight: 12 
                  }]}>
                    ${bid.amount}
                  </Text>
                  
                  <TouchableOpacity
                    style={[buttonStyles.primary, { paddingHorizontal: 16 }]}
                    onPress={() => handleAcceptBid(bid.id, bid.amount, bid.bidderUsername)}
                  >
                    <Text style={buttonStyles.primaryText}>Accept</Text>
                  </TouchableOpacity>
                </View>
              ))}
          </View>
        )}

        {/* Status Messages */}
        {!canBuy && !canBid && !isOwner && (
          <View style={[commonStyles.card, { marginBottom: 20 }]}>
            <View style={{
              padding: 16,
              backgroundColor: colors.background,
              borderRadius: 12,
              alignItems: 'center',
            }}>
              <Icon 
                name={item.status === 'sold' ? 'check-circle' : 'x-circle'} 
                size={32} 
                color={item.status === 'sold' ? colors.success : colors.error} 
              />
              <Text style={[commonStyles.text, { 
                textAlign: 'center', 
                marginTop: 8 
              }]}>
                {item.status === 'sold' ? 'This item has been sold' : 'This item is no longer available'}
              </Text>
            </View>
          </View>
        )}

        {isOwner && (
          <View style={[commonStyles.card, { marginBottom: 20 }]}>
            <View style={{
              padding: 16,
              backgroundColor: colors.primary + '20',
              borderRadius: 12,
              alignItems: 'center',
            }}>
              <Icon name="user" size={32} color={colors.primary} />
              <Text style={[commonStyles.text, { 
                textAlign: 'center', 
                marginTop: 8,
                color: colors.primary 
              }]}>
                This is your listing
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
