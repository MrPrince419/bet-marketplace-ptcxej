
export interface User {
  id: string;
  email: string;
  username: string;
  balance: number;
  createdAt: string;
  stripeCustomerId?: string;
  paymentMethods?: PaymentMethod[];
}

export interface PaymentMethod {
  id: string;
  type: 'card';
  card: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
  isDefault: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'deposit' | 'withdrawal' | 'bet_escrow' | 'bet_payout' | 'marketplace_purchase' | 'marketplace_sale';
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  description: string;
  relatedId?: string; // bet ID or item ID
  stripePaymentIntentId?: string;
  createdAt: string;
  completedAt?: string;
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
  status: 'open' | 'accepted' | 'settled' | 'cancelled';
  winner?: string;
  createdAt: string;
  settledAt?: string;
  escrowTransactionId?: string;
  payoutTransactionId?: string;
}

export interface MarketplaceItem {
  id: string;
  sellerId: string;
  sellerUsername: string;
  title: string;
  description: string;
  price: number;
  imageUrl?: string;
  status: 'available' | 'sold' | 'reserved';
  createdAt: string;
  bids: Bid[];
  purchaseTransactionId?: string;
}

export interface Bid {
  id: string;
  bidderId: string;
  bidderUsername: string;
  amount: number;
  createdAt: string;
  status: 'active' | 'accepted' | 'rejected' | 'expired';
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

export interface WalletState {
  balance: number;
  pendingTransactions: Transaction[];
  recentTransactions: Transaction[];
}
