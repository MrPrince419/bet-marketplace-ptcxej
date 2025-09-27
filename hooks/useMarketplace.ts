
import { useState, useEffect } from 'react';
import { MarketplaceItem, Bid } from '../types';
import { getMarketplaceItems, saveMarketplaceItems } from '../utils/storage';
import uuid from 'react-native-uuid';

export const useMarketplace = () => {
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const allItems = await getMarketplaceItems();
      setItems(allItems);
    } catch (error) {
      console.log('Error loading marketplace items:', error);
    } finally {
      setLoading(false);
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
    }
  };

  const placeBid = async (
    itemId: string,
    bidderId: string,
    bidderUsername: string,
    amount: number
  ): Promise<boolean> => {
    try {
      const newBid: Bid = {
        id: uuid.v4() as string,
        bidderId,
        bidderUsername,
        amount,
        createdAt: new Date().toISOString(),
      };

      const updatedItems = items.map(item => 
        item.id === itemId 
          ? { ...item, bids: [...item.bids, newBid] }
          : item
      );
      
      await saveMarketplaceItems(updatedItems);
      setItems(updatedItems);
      
      console.log('Bid placed successfully');
      return true;
    } catch (error) {
      console.log('Error placing bid:', error);
      return false;
    }
  };

  const buyItem = async (itemId: string): Promise<boolean> => {
    try {
      const updatedItems = items.map(item => 
        item.id === itemId 
          ? { ...item, status: 'sold' as const }
          : item
      );
      
      await saveMarketplaceItems(updatedItems);
      setItems(updatedItems);
      
      console.log('Item purchased successfully');
      return true;
    } catch (error) {
      console.log('Error purchasing item:', error);
      return false;
    }
  };

  const getAvailableItems = () => items.filter(item => item.status === 'available');
  const getUserItems = (userId: string) => items.filter(item => item.sellerId === userId);

  return {
    items,
    loading,
    createItem,
    placeBid,
    buyItem,
    getAvailableItems,
    getUserItems,
    loadItems,
  };
};
