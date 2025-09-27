
import { useState, useEffect } from 'react';
import { User, AuthState } from '../types';
import { getCurrentUser, saveCurrentUser, clearCurrentUser, getAllUsers, saveAllUsers } from '../utils/storage';
import uuid from 'react-native-uuid';

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const user = await getCurrentUser();
      if (user) {
        setAuthState({
          isAuthenticated: true,
          user,
        });
      }
    } catch (error) {
      console.log('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const users = await getAllUsers();
      const user = users.find(u => u.email === email);
      
      if (user) {
        await saveCurrentUser(user);
        setAuthState({
          isAuthenticated: true,
          user,
        });
        console.log('Login successful');
        return true;
      } else {
        console.log('User not found');
        return false;
      }
    } catch (error) {
      console.log('Login error:', error);
      return false;
    }
  };

  const register = async (email: string, username: string, password: string): Promise<boolean> => {
    try {
      const users = await getAllUsers();
      
      // Check if user already exists
      if (users.find(u => u.email === email || u.username === username)) {
        console.log('User already exists');
        return false;
      }

      const newUser: User = {
        id: uuid.v4() as string,
        email,
        username,
        balance: 1000, // Starting balance
        createdAt: new Date().toISOString(),
      };

      const updatedUsers = [...users, newUser];
      await saveAllUsers(updatedUsers);
      await saveCurrentUser(newUser);
      
      setAuthState({
        isAuthenticated: true,
        user: newUser,
      });
      
      console.log('Registration successful');
      return true;
    } catch (error) {
      console.log('Registration error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await clearCurrentUser();
      setAuthState({
        isAuthenticated: false,
        user: null,
      });
      console.log('Logout successful');
    } catch (error) {
      console.log('Logout error:', error);
    }
  };

  const updateUserBalance = async (newBalance: number) => {
    if (authState.user) {
      const updatedUser = { ...authState.user, balance: newBalance };
      await saveCurrentUser(updatedUser);
      
      // Update in all users list
      const users = await getAllUsers();
      const updatedUsers = users.map(u => 
        u.id === updatedUser.id ? updatedUser : u
      );
      await saveAllUsers(updatedUsers);
      
      setAuthState({
        isAuthenticated: true,
        user: updatedUser,
      });
    }
  };

  return {
    authState,
    loading,
    login,
    register,
    logout,
    updateUserBalance,
  };
};
