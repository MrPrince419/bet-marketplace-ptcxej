
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
import { useAuth } from '../../hooks/useAuth';
import { useMarketplace } from '../../hooks/useMarketplace';
import { commonStyles, colors, buttonStyles } from '../../styles/commonStyles';
import Icon from '../../components/Icon';
import { MarketplaceItem } from '../../types';

export default function MarketplaceScreen() {
  const { authState } = useAuth();
  const { items, loading, getAvailableItems, getUserItems, loadItems } = useMarketplace();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadItems();
    setRefreshing(false);
  };

  const availableItems = getAvailableItems();
  const userItems = authState.user ? getUserItems(authState.user.id) : [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getHighestBid = (item: MarketplaceItem) => {
    if (item.bids.length === 0) return null;
    return Math.max(...item.bids.map(bid => bid.amount));
  };

  const renderItemCard = (item: MarketplaceItem, isUserItem: boolean = false) => (
    <View key={item.id} style={commonStyles.card}>
      {item.imageUrl && (
        <Image
          source={{ uri: item.imageUrl }}
          style={{
            width: '100%',
            height: 200,
            borderRadius: 8,
            marginBottom: 12,
          }}
          resizeMode="cover"
        />
      )}
      
      <View style={[commonStyles.row, { marginBottom: 8 }]}>
        <Text style={[commonStyles.text, { fontWeight: '600', flex: 1 }]}>
          {item.title}
        </Text>
        <View style={{
          backgroundColor: item.status === 'available' ? colors.success : colors.textSecondary,
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 4,
        }}>
          <Text style={[commonStyles.textSecondary, { 
            color: colors.background, 
            fontSize: 12,
            fontWeight: '500'
          }]}>
            {item.status.toUpperCase()}
          </Text>
        </View>
      </View>
      
      <Text style={[commonStyles.textSecondary, { marginBottom: 8 }]}>
        {item.description}
      </Text>
      
      <View style={[commonStyles.row, { marginBottom: 8 }]}>
        <Text style={[commonStyles.text, { fontWeight: '600' }]}>
          ${item.price}
        </Text>
        <Text style={commonStyles.textSecondary}>
          by @{item.sellerUsername}
        </Text>
      </View>
      
      {item.bids.length > 0 && (
        <Text style={[commonStyles.textSecondary, { marginBottom: 8 }]}>
          Highest bid: ${getHighestBid(item)} ({item.bids.length} bids)
        </Text>
      )}
      
      <Text style={[commonStyles.textSecondary, { fontSize: 12 }]}>
        Listed: {formatDate(item.createdAt)}
      </Text>
      
      {!isUserItem && item.status === 'available' && authState.user && item.sellerId !== authState.user.id && (
        <View style={[commonStyles.row, { marginTop: 12, gap: 8 }]}>
          <TouchableOpacity
            style={[buttonStyles.secondary, { flex: 1 }]}
            onPress={() => router.push(`/item/${item.id}?action=bid`)}
          >
            <Text style={[buttonStyles.text, buttonStyles.secondaryText]}>
              Place Bid
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[buttonStyles.primary, { flex: 1 }]}
            onPress={() => router.push(`/item/${item.id}?action=buy`)}
          >
            <Text style={[buttonStyles.text, buttonStyles.primaryText]}>
              Buy Now
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={commonStyles.content}>
        <View style={[commonStyles.row, { marginBottom: 20 }]}>
          <Text style={commonStyles.title}>Marketplace</Text>
          <TouchableOpacity
            style={[buttonStyles.primary, { paddingHorizontal: 16, paddingVertical: 8 }]}
            onPress={() => router.push('/create-item')}
          >
            <Text style={[buttonStyles.text, buttonStyles.primaryText, { fontSize: 14 }]}>
              List Item
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {authState.user && (
            <View style={{ marginBottom: 24 }}>
              <Text style={[commonStyles.subtitle, { marginBottom: 12 }]}>
                Your Balance: ${authState.user.balance}
              </Text>
            </View>
          )}

          <View style={{ marginBottom: 24 }}>
            <Text style={[commonStyles.subtitle, { marginBottom: 12 }]}>
              Your Items ({userItems.length})
            </Text>
            {userItems.length === 0 ? (
              <View style={[commonStyles.card, commonStyles.center, { padding: 40 }]}>
                <Icon name="bag-outline" size={48} color={colors.textSecondary} />
                <Text style={[commonStyles.textSecondary, { marginTop: 12 }]}>
                  You haven&apos;t listed any items yet
                </Text>
              </View>
            ) : (
              userItems.map(item => renderItemCard(item, true))
            )}
          </View>

          <View>
            <Text style={[commonStyles.subtitle, { marginBottom: 12 }]}>
              Available Items ({availableItems.length})
            </Text>
            {availableItems.length === 0 ? (
              <View style={[commonStyles.card, commonStyles.center, { padding: 40 }]}>
                <Icon name="storefront-outline" size={48} color={colors.textSecondary} />
                <Text style={[commonStyles.textSecondary, { marginTop: 12 }]}>
                  No items available
                </Text>
              </View>
            ) : (
              availableItems.map(item => renderItemCard(item))
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
