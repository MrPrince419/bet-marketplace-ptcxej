
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MarketplaceItem } from '../../types';
import { commonStyles, colors, buttonStyles } from '../../styles/commonStyles';
import Icon from '../../components/Icon';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';
import { useMarketplace } from '../../hooks/useMarketplace';

export default function MarketplaceScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const { authState } = useAuth();
  const { items, loading, loadItems } = useMarketplace();

  const onRefresh = async () => {
    setRefreshing(true);
    await loadItems();
    setRefreshing(false);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const getHighestBid = (item: MarketplaceItem): number => {
    if (item.bids.length === 0) return 0;
    return Math.max(...item.bids.map(bid => bid.amount));
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

  const renderItemCard = (item: MarketplaceItem, isUserItem: boolean) => {
    const highestBid = getHighestBid(item);
    
    return (
      <TouchableOpacity
        key={item.id}
        style={commonStyles.card}
        onPress={() => router.push(`/item/${item.id}`)}
        activeOpacity={0.7}
      >
        {item.imageUrl && (
          <Image
            source={{ uri: item.imageUrl }}
            style={{
              width: '100%',
              height: 150,
              borderRadius: 8,
              marginBottom: 12,
            }}
            resizeMode="cover"
          />
        )}
        
        <View style={commonStyles.row}>
          <View style={{ flex: 1 }}>
            <Text style={[commonStyles.text, { fontWeight: '600', marginBottom: 4 }]}>
              {item.title}
            </Text>
            <Text style={[commonStyles.textSecondary, { marginBottom: 8 }]} numberOfLines={2}>
              {item.description}
            </Text>
            <View style={commonStyles.row}>
              <Text style={[commonStyles.textSecondary, { fontSize: 12 }]}>
                by {isUserItem ? 'You' : item.sellerUsername}
              </Text>
              <Text style={[commonStyles.textSecondary, { fontSize: 12 }]}>
                {formatDate(item.createdAt)}
              </Text>
            </View>
          </View>
          
          <View style={{ alignItems: 'flex-end', marginLeft: 12 }}>
            <Text style={[commonStyles.text, { fontWeight: '700', fontSize: 18 }]}>
              ${item.price}
            </Text>
            {highestBid > 0 && (
              <Text style={[commonStyles.textSecondary, { fontSize: 12 }]}>
                Highest bid: ${highestBid}
              </Text>
            )}
            <View style={{
              backgroundColor: getStatusColor(item.status),
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 12,
              marginTop: 4,
            }}>
              <Text style={{
                color: colors.background,
                fontSize: 10,
                fontWeight: '600',
              }}>
                {getStatusText(item.status)}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && items.length === 0) {
    return <LoadingSpinner message="Loading marketplace..." />;
  }

  const userItems = items.filter(item => item.sellerId === authState.user?.id);
  const otherItems = items.filter(item => item.sellerId !== authState.user?.id);

  return (
    <SafeAreaView style={commonStyles.wrapper}>
      <View style={commonStyles.container}>
        {/* Header */}
        <View style={commonStyles.content}>
          <View style={[commonStyles.row, { marginBottom: 20 }]}>
            <View>
              <Text style={commonStyles.title}>Marketplace</Text>
              <Text style={commonStyles.textSecondary}>
                Balance: ${authState.user?.balance.toFixed(2) || '0.00'}
              </Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/wallet')}>
              <Icon name="wallet" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Create Item Button */}
          <TouchableOpacity
            style={[buttonStyles.primary, { marginBottom: 24 }]}
            onPress={() => router.push('/create-item')}
          >
            <Text style={[buttonStyles.text, buttonStyles.primaryText]}>
              List New Item
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={commonStyles.content}>
            {/* Your Items */}
            {userItems.length > 0 && (
              <>
                <Text style={[commonStyles.subtitle, { marginBottom: 16 }]}>
                  Your Items
                </Text>
                {userItems.map(item => renderItemCard(item, true))}
              </>
            )}

            {/* Available Items */}
            <Text style={[commonStyles.subtitle, { marginBottom: 16, marginTop: userItems.length > 0 ? 24 : 0 }]}>
              Available Items
            </Text>
            {otherItems.length === 0 ? (
              <View style={[commonStyles.card, commonStyles.center, { padding: 40 }]}>
                <Icon name="storefront" size={48} color={colors.textSecondary} />
                <Text style={[commonStyles.textSecondary, { marginTop: 16, textAlign: 'center' }]}>
                  No items available right now.{'\n'}List the first one!
                </Text>
              </View>
            ) : (
              otherItems.map(item => renderItemCard(item, false))
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
