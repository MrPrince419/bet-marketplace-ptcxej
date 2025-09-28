
import { User, Bet, MarketplaceItem } from '../types';
import { getAllUsers, saveAllUsers, getBets, saveBets, getMarketplaceItems, saveMarketplaceItems } from './storage';
import uuid from 'react-native-uuid';

export const seedInitialData = async (): Promise<void> => {
  try {
    // Check if data already exists
    const existingUsers = await getAllUsers();
    const existingBets = await getBets();
    const existingItems = await getMarketplaceItems();

    // Only seed if no data exists
    if (existingUsers.length === 0) {
      await seedUsers();
    }
    
    if (existingBets.length === 0) {
      await seedBets();
    }
    
    if (existingItems.length === 0) {
      await seedMarketplaceItems();
    }

    console.log('Initial data seeding completed');
  } catch (error) {
    console.log('Error seeding initial data:', error);
  }
};

const seedUsers = async (): Promise<void> => {
  const demoUsers: User[] = [
    {
      id: 'demo-user-1',
      email: 'alice@demo.com',
      username: 'alice_demo',
      balance: 2500,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
    },
    {
      id: 'demo-user-2',
      email: 'bob@demo.com',
      username: 'bob_trader',
      balance: 1800,
      createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(), // 25 days ago
    },
    {
      id: 'demo-user-3',
      email: 'charlie@demo.com',
      username: 'charlie_bets',
      balance: 3200,
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days ago
    },
  ];

  await saveAllUsers(demoUsers);
  console.log('Demo users seeded');
};

const seedBets = async (): Promise<void> => {
  const demoBets: Bet[] = [
    {
      id: uuid.v4() as string,
      creatorId: 'demo-user-1',
      creatorUsername: 'alice_demo',
      title: 'Will it rain tomorrow?',
      description: 'Betting on whether it will rain in the city tomorrow based on weather forecast',
      amount: 50,
      status: 'open',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    },
    {
      id: uuid.v4() as string,
      creatorId: 'demo-user-2',
      creatorUsername: 'bob_trader',
      title: 'Stock market will close higher',
      description: 'S&P 500 will close higher than it opened today',
      amount: 100,
      acceptorId: 'demo-user-3',
      acceptorUsername: 'charlie_bets',
      status: 'accepted',
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    },
    {
      id: uuid.v4() as string,
      creatorId: 'demo-user-3',
      creatorUsername: 'charlie_bets',
      title: 'Coffee shop will be busy at lunch',
      description: 'The local coffee shop will have more than 20 customers during lunch hour',
      amount: 25,
      status: 'open',
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    },
  ];

  await saveBets(demoBets);
  console.log('Demo bets seeded');
};

const seedMarketplaceItems = async (): Promise<void> => {
  const demoItems: MarketplaceItem[] = [
    {
      id: uuid.v4() as string,
      sellerId: 'demo-user-1',
      sellerUsername: 'alice_demo',
      title: 'Vintage Camera',
      description: 'Beautiful vintage film camera in excellent condition. Perfect for photography enthusiasts.',
      price: 150,
      imageUrl: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400',
      status: 'available',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      bids: [
        {
          id: uuid.v4() as string,
          bidderId: 'demo-user-2',
          bidderUsername: 'bob_trader',
          amount: 120,
          status: 'active',
          createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
        },
      ],
    },
    {
      id: uuid.v4() as string,
      sellerId: 'demo-user-2',
      sellerUsername: 'bob_trader',
      title: 'Gaming Headset',
      description: 'High-quality gaming headset with noise cancellation. Used for 6 months.',
      price: 80,
      imageUrl: 'https://images.unsplash.com/photo-1599669454699-248893623440?w=400',
      status: 'available',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      bids: [],
    },
    {
      id: uuid.v4() as string,
      sellerId: 'demo-user-3',
      sellerUsername: 'charlie_bets',
      title: 'Smartphone',
      description: 'Latest model smartphone, barely used. Comes with original box and accessories.',
      price: 400,
      imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',
      status: 'available',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      bids: [
        {
          id: uuid.v4() as string,
          bidderId: 'demo-user-1',
          bidderUsername: 'alice_demo',
          amount: 350,
          status: 'active',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        },
        {
          id: uuid.v4() as string,
          bidderId: 'demo-user-2',
          bidderUsername: 'bob_trader',
          amount: 375,
          status: 'active',
          createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
        },
      ],
    },
  ];

  await saveMarketplaceItems(demoItems);
  console.log('Demo marketplace items seeded');
};
