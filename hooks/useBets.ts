
import { useState, useEffect } from 'react';
import { Bet } from '../types';
import { getBets, saveBets, getAllUsers } from '../utils/storage';
import uuid from 'react-native-uuid';

export const useBets = () => {
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBets();
  }, []);

  const loadBets = async () => {
    try {
      const allBets = await getBets();
      setBets(allBets);
    } catch (error) {
      console.log('Error loading bets:', error);
    } finally {
      setLoading(false);
    }
  };

  const createBet = async (
    creatorId: string,
    creatorUsername: string,
    title: string,
    description: string,
    amount: number
  ): Promise<boolean> => {
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
    }
  };

  const acceptBet = async (betId: string, acceptorId: string, acceptorUsername: string): Promise<boolean> => {
    try {
      const updatedBets = bets.map(bet => 
        bet.id === betId 
          ? { ...bet, acceptorId, acceptorUsername, status: 'accepted' as const }
          : bet
      );
      
      await saveBets(updatedBets);
      setBets(updatedBets);
      
      console.log('Bet accepted successfully');
      return true;
    } catch (error) {
      console.log('Error accepting bet:', error);
      return false;
    }
  };

  const settleBet = async (betId: string, winnerId: string): Promise<boolean> => {
    try {
      const updatedBets = bets.map(bet => 
        bet.id === betId 
          ? { 
              ...bet, 
              status: 'settled' as const, 
              winner: winnerId,
              settledAt: new Date().toISOString()
            }
          : bet
      );
      
      await saveBets(updatedBets);
      setBets(updatedBets);
      
      console.log('Bet settled successfully');
      return true;
    } catch (error) {
      console.log('Error settling bet:', error);
      return false;
    }
  };

  const getOpenBets = () => bets.filter(bet => bet.status === 'open');
  const getUserBets = (userId: string) => bets.filter(bet => 
    bet.creatorId === userId || bet.acceptorId === userId
  );

  return {
    bets,
    loading,
    createBet,
    acceptBet,
    settleBet,
    getOpenBets,
    getUserBets,
    loadBets,
  };
};
