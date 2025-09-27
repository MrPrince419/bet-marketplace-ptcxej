
import { useState, useEffect } from 'react';
import { MarketplaceItem, Bid } from '../types';
import { getMarketplaceItems, saveMarketplaceItems } from '../utils/storage';
import uuid from 'react-native-uuid';

export const useMarketplace = () => {
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const allItems = await getMarketplaceItems();
      setItems(allItems);
    } catch (error) {
      console.log('Error loading marketplace items:', error);
    }
  };

  const createItem = async (
    sellerId: string,
    sellerUsername: string,
    title: string,
    description: string,
    price: number,
    imageUrl?: string
  ): Promise<boolean> => {
    setLoading(true);
    try {
      const newItem: MarketplaceItem = {
        id: uuid.v4() as string,
        sellerId,
        sellerUsername,
        title,
        description,
        price,
        imageUrl,
        status: 'available',
        createdAt: new Date().toISOString(),
        bids: [],
      };

      const updatedItems = [...items, newItem];
      await saveMarketplaceItems(updatedItems);
      setItems(updatedItems);
      
      console.log('Item created successfully');
      return true;
    } catch (error) {
      console.log('Error creating item:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const placeBid = async (
    itemId: string,
    bidderId: string,
    bidderUsername: string,
    amount: number
  ): Promise<boolean> => {
    setLoading(true);
    try {
      const item = items.find(i => i.id === itemId);
      if (!item) {
        console.log('Item not found');
        return false;
      }

      const newBid: Bid = {
        id: uuid.v4() as string,
        bidderId,
        bidderUsername,
        amount,
        status: 'active',
        createdAt: new Date().toISOString(),
      };

      const updatedItem: MarketplaceItem = {
        ...item,
        bids: [...item.bids, newBid],
      };

      const updatedItems = items.map(i => i.id === itemId ? updatedItem : i);
      await saveMarketplaceItems(updatedItems);
      setItems(updatedItems);
      
      console.log('Bid placed successfully');
      return true;
    } catch (error) {
      console.log('Error placing bid:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const buyItem = async (
    itemId: string,
    buyerId: string,
    processMarketplacePurchase: (itemId: string, amount: number, sellerId: string) => Promise<boolean>
  ): Promise<boolean> => {
    setLoading(true);
    try {
      const item = items.find(i => i.id === itemId);
      if (!item) {
        console.log('Item not found');
        return false;
      }

      if (item.status !== 'available') {
        console.log('Item is not available');
        return false;
      }

      // Process payment
      const paymentSuccess = await processMarketplacePurchase(itemId, item.price, item.sellerId);
      if (!paymentSuccess) {
        console.log('Payment failed');
        return false;
      }

      const updatedItem: MarketplaceItem = {
        ...item,
        status: 'sold',
      };

      const updatedItems = items.map(i => i.id === itemId ? updatedItem : i);
      await saveMarketplaceItems(updatedItems);
      setItems(updatedItems);
      
      console.log('Item purchased successfully');
      return true;
    } catch (error) {
      console.log('Error buying item:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const acceptBid = async (
    itemId: string,
    bidId: string,
    processMarketplacePurchase: (itemId: string, amount: number, sellerId: string) => Promise<boolean>
  ): Promise<boolean> => {
    setLoading(true);
    try {
      const item = items.find(i => i.id === itemId);
      if (!item) {
        console.log('Item not found');
        return false;
      }

      const bid = item.bids.find(b => b.id === bidId);
      if (!bid) {
        console.log('Bid not found');
        return false;
      }

      // Process payment for the bid amount
      const paymentSuccess = await processMarketplacePurchase(itemId, bid.amount, item.sellerId);
      if (!paymentSuccess) {
        console.log('Payment failed');
        return false;
      }

      const updatedBids = item.bids.map(b => 
        b.id === bidId 
          ? { ...b, status: 'accepted' as const }
          : { ...b, status: 'rejected' as const }
      );

      const updatedItem: MarketplaceItem = {
        ...item,
        status: 'sold',
        bids: updatedBids,
      };

      const updatedItems = items.map(i => i.id === itemId ? updatedItem : i);
      await saveMarketplaceItems(updatedItems);
      setItems(updatedItems);
      
      console.log('Bid accepted successfully');
      return true;
    } catch (error) {
      console.log('Error accepting bid:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (itemId: string): Promise<boolean> => {
    setLoading(true);
    try {
      const updatedItems = items.filter(i => i.id !== itemId);
      await saveMarketplaceItems(updatedItems);
      setItems(updatedItems);
      
      console.log('Item removed successfully');
      return true;
    } catch (error) {
      console.log('Error removing item:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    items,
    loading,
    createItem,
    placeBid,
    buyItem,
    acceptBid,
    removeItem,
    loadItems,
  };
};
