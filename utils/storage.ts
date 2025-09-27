
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Bet, MarketplaceItem } from '../types';

const STORAGE_KEYS = {
  USER: 'current_user',
  USERS: 'all_users',
  BETS: 'all_bets',
  MARKETPLACE_ITEMS: 'marketplace_items',
};

// User storage
export const saveCurrentUser = async (user: User): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    console.log('User saved successfully');
  } catch (error) {
    console.log('Error saving user:', error);
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const userString = await AsyncStorage.getItem(STORAGE_KEYS.USER);
    return userString ? JSON.parse(userString) : null;
  } catch (error) {
    console.log('Error getting current user:', error);
    return null;
  }
};

export const clearCurrentUser = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.USER);
    console.log('User cleared successfully');
  } catch (error) {
    console.log('Error clearing user:', error);
  }
};

// All users storage
export const saveAllUsers = async (users: User[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    console.log('All users saved successfully');
  } catch (error) {
    console.log('Error saving all users:', error);
  }
};

export const getAllUsers = async (): Promise<User[]> => {
  try {
    const usersString = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
    return usersString ? JSON.parse(usersString) : [];
  } catch (error) {
    console.log('Error getting all users:', error);
    return [];
  }
};

// Bets storage
export const saveBets = async (bets: Bet[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.BETS, JSON.stringify(bets));
    console.log('Bets saved successfully');
  } catch (error) {
    console.log('Error saving bets:', error);
  }
};

export const getBets = async (): Promise<Bet[]> => {
  try {
    const betsString = await AsyncStorage.getItem(STORAGE_KEYS.BETS);
    return betsString ? JSON.parse(betsString) : [];
  } catch (error) {
    console.log('Error getting bets:', error);
    return [];
  }
};

// Marketplace items storage
export const saveMarketplaceItems = async (items: MarketplaceItem[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.MARKETPLACE_ITEMS, JSON.stringify(items));
    console.log('Marketplace items saved successfully');
  } catch (error) {
    console.log('Error saving marketplace items:', error);
  }
};

export const getMarketplaceItems = async (): Promise<MarketplaceItem[]> => {
  try {
    const itemsString = await AsyncStorage.getItem(STORAGE_KEYS.MARKETPLACE_ITEMS);
    return itemsString ? JSON.parse(itemsString) : [];
  } catch (error) {
    console.log('Error getting marketplace items:', error);
    return [];
  }
};
