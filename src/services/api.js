import axios from 'axios';

// ✅ PRODUCTION CONFIG: Railway deployment URL for CASHA
// This will be set via environment variable in Railway
const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'https://casha-backend-production.up.railway.app';

// ✅ DEVELOPMENT FALLBACK: Alternative local URL
const DEV_API_BASE = 'http://localhost:5000';

// ✅ SMART URL SELECTION: Auto-detect environment
const getApiBase = () => {
  // If we have an explicit production URL, use it
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  
  // If we're in production mode, use production URL
  if (process.env.NODE_ENV === 'production') {
    return API_BASE;
  }
  
  // Development: Try production first, then fallback to local
  console.log('🌍 Development mode: Using production URL with local fallback');
  return API_BASE;
};

const api = axios.create({
  baseURL: getApiBase(),
  timeout: 15000, // Increased for production
  headers: {
    'Content-Type': 'application/json',
  }
});

// ✅ ENHANCED ERROR HANDLING WITH AUTO-FALLBACK
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Success:', response.config.url);
    return response;
  },
  async (error) => {
    console.error('❌ API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message
    });
    
    // Auto-retry with development URL if production fails in development
    if ((error.code === 'ECONNREFUSED' || error.response?.status >= 500) && 
        process.env.NODE_ENV !== 'production') {
      console.log('🔄 Production API unavailable, switching to development URL...');
      api.defaults.baseURL = DEV_API_BASE;
      
      // Retry the request with development URL
      try {
        const retryResponse = await axios({
          ...error.config,
          baseURL: DEV_API_BASE
        });
        console.log('✅ Retry successful with development URL');
        return retryResponse;
      } catch (retryError) {
        console.error('❌ Development URL also failed');
      }
    }
    
    return Promise.reject(error);
  }
);

// ✅ ALL API FUNCTIONS DEFINED
const checkConnection = async () => {
  try {
    const response = await api.get('/health');
    console.log('✅ API Connection successful:', {
      environment: response.data.environment,
      url: api.defaults.baseURL
    });
    return { 
      connected: true, 
      environment: response.data.environment,
      url: api.defaults.baseURL 
    };
  } catch (error) {
    console.log('❌ API Connection failed, trying development URL...');
    
    // Try development URL as fallback
    if (process.env.NODE_ENV !== 'production') {
      api.defaults.baseURL = DEV_API_BASE;
      try {
        const devResponse = await api.get('/health');
        return { 
          connected: true, 
          environment: 'development', 
          fallback: true,
          url: api.defaults.baseURL
        };
      } catch (devError) {
        return { 
          connected: false, 
          error: 'Cannot connect to any server',
          url: api.defaults.baseURL
        };
      }
    }
    
    return { 
      connected: false, 
      error: 'Production server unavailable',
      url: api.defaults.baseURL
    };
  }
};

const registerUser = async (userData) => {
  try {
    const response = await api.post('/register', userData);
    console.log('✅ User registration successful');
    return response.data;
  } catch (error) {
    console.error('❌ Registration error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || 'Registration failed');
  }
};

const getBalance = async (userId) => {
  try {
    const response = await api.get(`/debug/user/${userId}`);
    console.log('✅ Balance fetch successful:', response.data.balance);
    return response.data;
  } catch (error) {
    console.error('❌ Balance fetch error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || 'Failed to fetch balance');
  }
};

// ✅ ENHANCED: Pending balance endpoint for two-balance system
const getPendingBalance = async (userId) => {
  try {
    const response = await api.get(`/user/pending-balance/${userId}`);
    console.log('✅ Pending balance fetched:', {
      available: response.data.available_balance,
      pending: response.data.pending_income,
      confirmed: response.data.confirmed_balance
    });
    return response.data;
  } catch (error) {
    console.error('❌ Pending balance fetch error:', error.response?.data || error.message);
    // Enhanced fallback to regular balance
    console.log('🔄 Falling back to regular balance endpoint...');
    try {
      const fallbackResponse = await api.get(`/debug/user/${userId}`);
      return {
        user_id: userId,
        available_balance: fallbackResponse.data.balance || 0,
        confirmed_balance: fallbackResponse.data.balance || 0,
        pending_income: 0,
        status: 'success_fallback'
      };
    } catch (fallbackError) {
      throw new Error('Both balance endpoints failed');
    }
  }
};

const sendTransaction = async (transactionData) => {
  try {
    console.log('🔄 Sending transaction:', transactionData);
    const response = await api.post('/transaction', {
      transaction: transactionData
    });
    console.log('✅ Transaction successful:', response.data.transaction_id);
    return response.data;
  } catch (error) {
    console.error('❌ Transaction error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || 'Transaction failed');
  }
};

const getTransactionHistory = async (userId) => {
  try {
    const response = await api.get(`/transactions/user/${userId}`);
    console.log('✅ Transaction history fetched:', response.data.transactions?.length, 'transactions');
    return response.data;
  } catch (error) {
    console.error('❌ Transaction history error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || 'Failed to fetch transaction history');
  }
};

// ✅ ENHANCED: DAG endpoints with better error handling
const getDAGInfo = async () => {
  try {
    const response = await api.get('/dag/info');
    console.log('✅ DAG info fetched');
    return response.data;
  } catch (error) {
    console.error('❌ DAG info error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || 'Failed to fetch DAG info');
  }
};

const getDAGTransactions = async () => {
  try {
    const response = await api.get('/dag/transactions');
    console.log('✅ DAG transactions fetched:', response.data.transactions?.length, 'transactions');
    return response.data;
  } catch (error) {
    console.error('❌ DAG transactions error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || 'Failed to fetch DAG transactions');
  }
};

const getRecentTransactions = async () => {
  try {
    const response = await api.get('/transactions/recent');
    console.log('✅ Recent transactions fetched:', response.data.recent_transactions?.length, 'transactions');
    return response.data;
  } catch (error) {
    console.error('❌ Recent transactions error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || 'Failed to fetch recent transactions');
  }
};

// ✅ NEW: Debug endpoint for development
const debugBalance = async (userId) => {
  try {
    const response = await api.get(`/debug/balance/${userId}`);
    console.log('🔧 Debug balance:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Debug balance error:', error.response?.data || error.message);
    throw error;
  }
};

// ✅ NEW: Get server info
const getServerInfo = async () => {
  try {
    const response = await api.get('/');
    return response.data;
  } catch (error) {
    console.error('❌ Server info error:', error.response?.data || error.message);
    throw error;
  }
};

// ✅ ENVIRONMENT INFO - Log on import
console.log('🚀 Casha Wallet API Configuration:');
console.log('   Base URL:', api.defaults.baseURL);
console.log('   Environment:', process.env.NODE_ENV || 'development');
console.log('   Production URL:', API_BASE);
console.log('   Development URL:', DEV_API_BASE);
console.log('   EXPO_PUBLIC_API_URL:', process.env.EXPO_PUBLIC_API_URL || 'Not set');

// ✅ FIXED: CONSISTENT EXPORTS - BOTH NAMED AND DEFAULT
export const walletAPI = {
  checkConnection,
  registerUser,
  getBalance,
  getPendingBalance,
  sendTransaction,
  getTransactionHistory,
  getDAGInfo,
  getDAGTransactions,
  getRecentTransactions,
  debugBalance,
  getServerInfo
};

// Also export as default for flexibility
export default walletAPI;

// ✅ Auto-check connection on app start in development
if (process.env.NODE_ENV !== 'production') {
  setTimeout(async () => {
    const connection = await checkConnection();
    console.log('🔌 Initial Connection Check:', connection);
  }, 1000);
}