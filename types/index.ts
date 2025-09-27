
export interface User {
  id: string;
  email: string;
  username: string;
  balance: number;
  createdAt: string;
}

export interface Bet {
  id: string;
  creatorId: string;
  creatorUsername: string;
  title: string;
  description: string;
  amount: number;
  acceptorId?: string;
  acceptorUsername?: string;
  status: 'open' | 'accepted' | 'settled';
  winner?: string;
  createdAt: string;
  settledAt?: string;
}

export interface MarketplaceItem {
  id: string;
  sellerId: string;
  sellerUsername: string;
  title: string;
  description: string;
  price: number;
  imageUrl?: string;
  status: 'available' | 'sold';
  createdAt: string;
  bids: Bid[];
}

export interface Bid {
  id: string;
  bidderId: string;
  bidderUsername: string;
  amount: number;
  createdAt: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}
