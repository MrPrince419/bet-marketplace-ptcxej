
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
import { MarketplaceItem } from '../../types';
import { commonStyles, colors, buttonStyles } from '../../styles/commonStyles';
import Icon from '../../components/Icon';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import SimpleBottomSheet from '../../components/BottomSheet';
import { useMarketplace } from '../../hooks/useMarketplace';
import { usePayments } from '../../hooks/usePayments';
import { useAuth } from '../../hooks/useAuth';

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams();
  const [item, setItem] = useState<MarketplaceItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState('');
  const [showBidSheet, setShowBidSheet] = useState(false);
  
  const { items, placeBid, buyItem, acceptBid } = useMarketplace();
  const { authState } = useAuth();
  const { processMarketplacePurchase } = usePayments();

  useEffect(() => {
    if (id && items.length > 0) {
      const foundItem = items.find(i => i.id === id);
      setItem(foundItem || null);
      setLoading(false);
    }
  }, [id, items]);

  const handlePlaceBid = () => {
    if (!item || !authState.user) return;

    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid bid amount');
      return;
    }

    if (amount >= item.price) {
      Alert.alert('Bid Too High', 'Your bid should be lower than the asking price. Use "Buy Now" instead.');
      return;
    }

    const highestBid = getHighestBid();
    if (amount <= highestBid) {
      Alert.alert('Bid Too Low', `Your bid must be higher than the current highest bid of $${highestBid}`);
      return;
    }

    if (amount > authState.user.balance) {
      Alert.alert('Insufficient Funds', 'You do not have enough balance for this bid');
      return;
    }

    placeBidConfirm(amount);
  };

  const placeBidConfirm = async (amount: number) => {
    if (!item || !authState.user) return;

    Alert.alert(
      'Place Bid',
      `Place a bid of $${amount} for "${item.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Place Bid',
          onPress: async () => {
            const success = await placeBid(
              item.id,
              authState.user!.id,
              authState.user!.username,
              amount
            );
            if (success) {
              setBidAmount('');
              setShowBidSheet(false);
              Alert.alert('Bid Placed!', 'Your bid has been placed successfully.');
            }
          }
        }
      ]
    );
  };

  const handleBuyNow = async () => {
    if (!item || !authState.user) return;

    if (authState.user.balance < item.price) {
      Alert.alert('Insufficient Funds', 'You do not have enough balance to buy this item');
      return;
    }

    Alert.alert(
      'Buy Now',
      `Purchase "${item.title}" for $${item.price}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Buy Now',
          onPress: async () => {
            const success = await buyItem(item.id, authState.user!.id, processMarketplacePurchase);
            if (success) {
              Alert.alert('Purchase Successful!', 'You have successfully purchased this item.');
              router.back();
            }
          }
        }
      ]
    );
  };

  const handleAcceptBid = (bidId: string, bidAmount: number, bidderName: string) => {
    if (!item) return;

    Alert.alert(
      'Accept Bid',
      `Accept ${bidderName}'s bid of $${bidAmount}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: async () => {
            const success = await acceptBid(item.id, bidId, processMarketplacePurchase);
            if (success) {
              Alert.alert('Bid Accepted!', `You have accepted ${bidderName}'s bid.`);
              router.back();
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  const getHighestBid = (): number => {
    if (!item || item.bids.length === 0) return 0;
    return Math.max(...item.bids.filter(bid => bid.status === 'active').map(bid => bid.amount));
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'available': return colors.success;
      case 'sold': return colors.textSecondary;
      case 'reserved': return colors.warning;
      default: return colors.textSecondary;
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'available': return 'Available';
      case 'sold': return 'Sold';
      case 'reserved': return 'Reserved';
      default: return status;
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading item details..." />;
  }

  if (!item) {
    return (
      <ErrorMessage
        message="Item not found"
        onRetry={() => router.back()}
        retryText="Go Back"
      />
    );
  }

  const isSeller = item.sellerId === authState.user?.id;
  const canBuy = item.status === 'available' && !isSeller && authState.user;
  const canBid = item.status === 'available' && !isSeller && authState.user;
  const activeBids = item.bids.filter(bid => bid.status === 'active');
  const highestBid = getHighestBid();

  return (
    <SafeAreaView style={commonStyles.wrapper}>
      <View style={commonStyles.container}>
        {/* Header */}
        <View style={[commonStyles.content, { paddingBottom: 0 }]}>
          <View style={[commonStyles.row, { marginBottom: 24 }]}>
            <TouchableOpacity onPress={() => router.back()}>
              <Icon name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={commonStyles.title}>Item Details</Text>
            <View style={{ width: 24 }} />
          </View>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 }}>
          <View style={commonStyles.content}>
            {/* Item Image */}
            {item.imageUrl && (
              <Image
                source={{ uri: item.imageUrl }}
                style={{
                  width: '100%',
                  height: 250,
                  borderRadius: 12,
                  marginBottom: 20,
                }}
                resizeMode="cover"
              />
            )}

            {/* Item Info Card */}
            <View style={commonStyles.card}>
              <View style={[commonStyles.row, { marginBottom: 16 }]}>
                <Text style={[commonStyles.subtitle, { flex: 1 }]}>
                  {item.title}
                </Text>
                <View style={{
                  backgroundColor: getStatusColor(item.status),
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 16,
                }}>
                  <Text style={{
                    color: colors.background,
                    fontSize: 12,
                    fontWeight: '600',
                  }}>
                    {getStatusText(item.status)}
                  </Text>
                </View>
              </View>

              <Text style={[commonStyles.text, { marginBottom: 16, lineHeight: 24 }]}>
                {item.description}
              </Text>

              <View style={[commonStyles.row, { marginBottom: 8 }]}>
                <Text style={commonStyles.textSecondary}>Price:</Text>
                <Text style={[commonStyles.text, { fontWeight: '700', fontSize: 18 }]}>
                  ${item.price}
                </Text>
              </View>

              <View style={[commonStyles.row, { marginBottom: 8 }]}>
                <Text style={commonStyles.textSecondary}>Seller:</Text>
                <Text style={commonStyles.text}>{item.sellerUsername}</Text>
              </View>

              <View style={[commonStyles.row, { marginBottom: highestBid > 0 ? 8 : 0 }]}>
                <Text style={commonStyles.textSecondary}>Listed:</Text>
                <Text style={commonStyles.text}>{formatDate(item.createdAt)}</Text>
              </View>

              {highestBid > 0 && (
                <View style={commonStyles.row}>
                  <Text style={commonStyles.textSecondary}>Highest bid:</Text>
                  <Text style={[commonStyles.text, { fontWeight: '600', color: colors.primary }]}>
                    ${highestBid}
                  </Text>
                </View>
              )}
            </View>

            {/* Action Buttons */}
            {canBuy && (
              <View style={commonStyles.section}>
                <TouchableOpacity
                  style={buttonStyles.primary}
                  onPress={handleBuyNow}
                >
                  <Text style={[buttonStyles.text, buttonStyles.primaryText]}>
                    Buy Now - ${item.price}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[buttonStyles.secondary, { marginTop: 12 }]}
                  onPress={() => setShowBidSheet(true)}
                >
                  <Text style={[buttonStyles.text, buttonStyles.secondaryText]}>
                    Place Bid
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Bids Section */}
            {activeBids.length > 0 && (
              <>
                <Text style={[commonStyles.subtitle, { marginBottom: 16 }]}>
                  Current Bids ({activeBids.length})
                </Text>
                {activeBids
                  .sort((a, b) => b.amount - a.amount)
                  .map((bid) => (
                    <View key={bid.id} style={commonStyles.card}>
                      <View style={commonStyles.row}>
                        <View style={{ flex: 1 }}>
                          <Text style={[commonStyles.text, { fontWeight: '600' }]}>
                            ${bid.amount}
                          </Text>
                          <Text style={commonStyles.textSecondary}>
                            by {bid.bidderUsername}
                          </Text>
                          <Text style={[commonStyles.textSecondary, { fontSize: 12 }]}>
                            {formatDate(bid.createdAt)}
                          </Text>
                        </View>
                        {isSeller && (
                          <TouchableOpacity
                            style={[buttonStyles.primary, { paddingHorizontal: 16, paddingVertical: 8 }]}
                            onPress={() => handleAcceptBid(bid.id, bid.amount, bid.bidderUsername)}
                          >
                            <Text style={[buttonStyles.text, buttonStyles.primaryText, { fontSize: 14 }]}>
                              Accept
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  ))}
              </>
            )}

            {/* Info for buyers */}
            {canBuy && (
              <View style={[commonStyles.card, { backgroundColor: colors.backgroundAlt }]}>
                <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 8 }]}>
                  How it works:
                </Text>
                <Text style={commonStyles.textSecondary}>
                  • Buy now to purchase immediately at the listed price{'\n'}
                  • Place a bid to negotiate a lower price{'\n'}
                  • The seller can accept your bid at any time{'\n'}
                  • Payment is processed when purchase is confirmed
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Bid Bottom Sheet */}
        <SimpleBottomSheet
          isVisible={showBidSheet}
          onClose={() => setShowBidSheet(false)}
        >
          <View style={{ padding: 20 }}>
            <Text style={[commonStyles.subtitle, { textAlign: 'center', marginBottom: 20 }]}>
              Place Bid
            </Text>
            <Text style={[commonStyles.textSecondary, { marginBottom: 8 }]}>
              Item: {item.title}
            </Text>
            <Text style={[commonStyles.textSecondary, { marginBottom: 16 }]}>
              Asking price: ${item.price}
              {highestBid > 0 && ` • Highest bid: $${highestBid}`}
            </Text>
            <TextInput
              style={commonStyles.input}
              placeholder="Enter bid amount"
              value={bidAmount}
              onChangeText={setBidAmount}
              keyboardType="numeric"
              autoFocus
            />
            <Text style={[commonStyles.textSecondary, { marginBottom: 16 }]}>
              Available balance: ${authState.user?.balance.toFixed(2) || '0.00'}
            </Text>
            <TouchableOpacity
              style={buttonStyles.primary}
              onPress={handlePlaceBid}
            >
              <Text style={[buttonStyles.text, buttonStyles.primaryText]}>
                Place Bid
              </Text>
            </TouchableOpacity>
          </View>
        </SimpleBottomSheet>
      </View>
    </SafeAreaView>
  );
}
