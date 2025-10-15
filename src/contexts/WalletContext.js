import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { walletAPI } from '../services/api';
import { useAuth } from './AuthContext';

const WalletContext = createContext();

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

export const WalletProvider = ({ children }) => {
  const { user } = useAuth();
  const [availableBalance, setAvailableBalance] = useState(0);
  const [confirmedBalance, setConfirmedBalance] = useState(0);
  const [pendingIncome, setPendingIncome] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [dagInfo, setDagInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  // ✅ PRODUCTION: Memoized data loading to prevent unnecessary re-renders
  const loadWalletData = useCallback(async (userId) => {
    if (!userId) {
      console.warn('⚠️ No user ID provided for wallet data load');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Loading wallet data for user:', userId);
      
      // ✅ PRODUCTION: Parallel API calls for better performance
      const [balanceData, txHistory, dagData] = await Promise.allSettled([
        loadBalanceData(userId),
        walletAPI.getTransactionHistory(userId),
        walletAPI.getDAGInfo()
      ]);

      // ✅ Handle balance data (with enhanced fallback)
      if (balanceData.status === 'fulfilled') {
        console.log('✅ Balance data loaded:', {
          available: balanceData.value.available_balance,
          confirmed: balanceData.value.confirmed_balance,
          pending: balanceData.value.pending_income
        });
        
        setAvailableBalance(balanceData.value.available_balance || 0);
        setConfirmedBalance(balanceData.value.confirmed_balance || 0);
        setPendingIncome(balanceData.value.pending_income || 0);
      } else {
        console.error('❌ Balance data failed:', balanceData.reason);
        setError('Failed to load balance data');
      }

      // ✅ Handle transaction history
      if (txHistory.status === 'fulfilled') {
        console.log('✅ Transactions loaded:', txHistory.value.transactions?.length, 'transactions');
        setTransactions(txHistory.value.transactions || []);
      } else {
        console.error('❌ Transactions failed:', txHistory.reason);
        // Don't set error for transactions - they're less critical
      }

      // ✅ Handle DAG info
      if (dagData.status === 'fulfilled') {
        setDagInfo(dagData.value);
      }

      setLastUpdate(new Date().toISOString());
      
    } catch (err) {
      console.error('💥 Wallet data load error:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data
      });
      setError('Failed to load wallet data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ PRODUCTION: Dedicated balance loader with robust fallback
  const loadBalanceData = async (userId) => {
    try {
      // Try new pending balance endpoint first
      return await walletAPI.getPendingBalance(userId);
    } catch (pendingError) {
      console.log('🔄 Pending balance endpoint not available, trying regular balance...');
      
      try {
        // Fallback to regular balance endpoint
        const fallbackData = await walletAPI.getBalance(userId);
        console.log('✅ Using fallback balance data');
        
        // Convert old format to new two-balance format
        return {
          available_balance: fallbackData.balance || 0,
          confirmed_balance: fallbackData.balance || 0,
          pending_income: 0,
          status: 'success_fallback'
        };
      } catch (balanceError) {
        console.error('❌ All balance endpoints failed');
        // Final fallback - zero balances
        return {
          available_balance: 0,
          confirmed_balance: 0,
          pending_income: 0,
          status: 'error_fallback'
        };
      }
    }
  };

  // ✅ PRODUCTION: Auto-refresh when user changes
  useEffect(() => {
    if (user && user.userId) {
      console.log('👤 User detected, loading wallet data...');
      loadWalletData(user.userId);
    } else {
      console.log('👤 No user, resetting wallet data');
      // Reset all wallet state
      setAvailableBalance(0);
      setConfirmedBalance(0);
      setPendingIncome(0);
      setTransactions([]);
      setDagInfo(null);
      setError(null);
      setLastUpdate(null);
    }
  }, [user, loadWalletData]);

  // ✅ PRODUCTION: Enhanced transaction sending with better state management
  const sendTransaction = async (transactionData) => {
    if (!transactionData?.from_user) {
      throw new Error('Invalid transaction data: missing from_user');
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('💸 Sending transaction:', {
        from: transactionData.from_user,
        to: transactionData.to_user,
        amount: transactionData.amount
      });
      
      const result = await walletAPI.sendTransaction(transactionData);
      console.log('✅ Transaction successful:', result.transaction_id);
      
      // ✅ IMMEDIATE UI UPDATE: Use backend response for instant feedback
      if (result.new_balance !== undefined) {
        setAvailableBalance(result.new_balance);
      }
      
      if (result.receiver_new_balance !== undefined && user?.userId === transactionData.to_user) {
        // If current user is the receiver, update their balance too
        setAvailableBalance(result.receiver_new_balance);
      }

      // ✅ FORCE REFRESH: Reload all data to ensure consistency
      await loadWalletData(transactionData.from_user);
      
      return result;
      
    } catch (err) {
      console.error('❌ Transaction failed:', {
        message: err.message,
        response: err.response?.data
      });
      
      const errorMessage = err.response?.data?.error || err.message || 'Transaction failed';
      setError(errorMessage);
      throw new Error(errorMessage);
      
    } finally {
      setLoading(false);
    }
  };

  // ✅ PRODUCTION: Memoized refresh function
  const refreshData = useCallback(async () => {
    if (user?.userId) {
      console.log('🔄 Manual refresh triggered');
      await loadWalletData(user.userId);
    }
  }, [user, loadWalletData]);

  // ✅ PRODUCTION: Clear error function
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = {
    // ✅ Two-balance system (NEW)
    availableBalance,
    confirmedBalance,
    pendingIncome,
    
    // ✅ Transaction data
    transactions,
    dagInfo,
    
    // ✅ UI state
    loading,
    error,
    lastUpdate,
    
    // ✅ Methods
    sendTransaction,
    refreshData,
    clearError,
    
    // ✅ Legacy compatibility (points to availableBalance)
    balance: availableBalance,
    
    // ✅ Production helpers
    totalBalance: availableBalance + pendingIncome, // Shows pending as "incoming"
    isDataStale: lastUpdate ? (Date.now() - new Date(lastUpdate).getTime()) > 30000 : true // 30 seconds
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};