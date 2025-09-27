
import { useState, useEffect } from 'react';
import { Bet } from '../types';
import { getBets, saveBets, getAllUsers } from '../utils/storage';
import { usePayments } from './usePayments';
import uuid from 'react-native-uuid';

export const useBets = () => {
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadBets();
  }, []);

  const loadBets = async () => {
    try {
      const allBets = await getBets();
      setBets(allBets);
    } catch (error) {
      console.log('Error loading bets:', error);
    }
  };

  const createBet = async (
    creatorId: string,
    creatorUsername: string,
    title: string,
    description: string,
    amount: number
  ): Promise<boolean> => {
    setLoading(true);
    try {
      const newBet: Bet = {
        id: uuid.v4() as string,
        creatorId,
        creatorUsername,
        title,
        description,
        amount,
        status: 'open',
        createdAt: new Date().toISOString(),
      };

      const updatedBets = [...bets, newBet];
      await saveBets(updatedBets);
      setBets(updatedBets);
      
      console.log('Bet created successfully');
      return true;
    } catch (error) {
      console.log('Error creating bet:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const acceptBet = async (
    betId: string,
    acceptorId: string,
    acceptorUsername: string,
    createEscrowTransaction: (betId: string, amount: number) => Promise<string | null>
  ): Promise<boolean> => {
    setLoading(true);
    try {
      const bet = bets.find(b => b.id === betId);
      if (!bet) {
        console.log('Bet not found');
        return false;
      }

      // Create escrow transaction for the total bet amount (both sides)
      const escrowTransactionId = await createEscrowTransaction(betId, bet.amount * 2);
      if (!escrowTransactionId) {
        console.log('Failed to create escrow transaction');
        return false;
      }

      const updatedBet: Bet = {
        ...bet,
        acceptorId,
        acceptorUsername,
        status: 'accepted',
        escrowTransactionId,
      };

      const updatedBets = bets.map(b => b.id === betId ? updatedBet : b);
      await saveBets(updatedBets);
      setBets(updatedBets);
      
      console.log('Bet accepted successfully');
      return true;
    } catch (error) {
      console.log('Error accepting bet:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const settleBet = async (
    betId: string,
    winnerId: string,
    winnerName: string,
    releaseBetPayout: (betId: string, winnerId: string, amount: number) => Promise<boolean>
  ): Promise<boolean> => {
    setLoading(true);
    try {
      const bet = bets.find(b => b.id === betId);
      if (!bet) {
        console.log('Bet not found');
        return false;
      }

      // Release payout to winner (total bet amount)
      const payoutSuccess = await releaseBetPayout(betId, winnerId, bet.amount * 2);
      if (!payoutSuccess) {
        console.log('Failed to release payout');
        return false;
      }

      const updatedBet: Bet = {
        ...bet,
        status: 'settled',
        winner: winnerId,
        settledAt: new Date().toISOString(),
      };

      const updatedBets = bets.map(b => b.id === betId ? updatedBet : b);
      await saveBets(updatedBets);
      setBets(updatedBets);
      
      console.log('Bet settled successfully');
      return true;
    } catch (error) {
      console.log('Error settling bet:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const cancelBet = async (betId: string): Promise<boolean> => {
    setLoading(true);
    try {
      const bet = bets.find(b => b.id === betId);
      if (!bet) {
        console.log('Bet not found');
        return false;
      }

      if (bet.status !== 'open') {
        console.log('Can only cancel open bets');
        return false;
      }

      const updatedBet: Bet = {
        ...bet,
        status: 'cancelled',
      };

      const updatedBets = bets.map(b => b.id === betId ? updatedBet : b);
      await saveBets(updatedBets);
      setBets(updatedBets);
      
      console.log('Bet cancelled successfully');
      return true;
    } catch (error) {
      console.log('Error cancelling bet:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    bets,
    loading,
    createBet,
    acceptBet,
    settleBet,
    cancelBet,
    loadBets,
  };
};
