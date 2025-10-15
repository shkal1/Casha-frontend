import { createContext, useContext, useState } from 'react';
import walletAPI from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (email, username, password, isSignUp = false) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Authentication attempt:', { email, isSignUp });
      
      // For now, we'll use email as user_id since our backend expects it
      // In a real app, you'd have proper email/password authentication
      const userData = await walletAPI.registerUser({
        user_id: email,  // Using email as user_id for now
        username: username || email.split('@')[0] // Use email prefix as username if not provided
      });
      
      console.log('Authentication successful:', userData);
      
      const userObj = {
        userId: userData.user_id,
        username: userData.username,
        walletAddress: userData.wallet_address,
        balance: userData.balance,
        email: email,
        existingUser: userData.existing_user
      };
      
      setUser(userObj);
      return userObj;
      
    } catch (err) {
      console.error('Authentication error:', err);
      setError(err.response?.data?.error || 'Authentication failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    setError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};