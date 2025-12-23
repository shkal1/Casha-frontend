import axios from 'axios';

// ✅ TEMPORARY FIX: FORCE LOCAL BACKEND FOR TESTING
const API_BASE = 'http://localhost:5000'; // ← CHANGED: Always use local
const DEV_API_BASE = 'http://localhost:5000';

// ✅ SIMPLE URL SELECTION: Always use local for now
const getApiBase = () => {
  console.log('🌍 DEVELOPMENT MODE: Using LOCAL backend');
  return 'http://localhost:5000'; // ← CHANGED: Always return local
};

const api = axios.create({
  baseURL: getApiBase(),
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// ✅ ENHANCED ERROR HANDLING
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
    console.log('❌ API Connection failed to local backend');
    return { 
      connected: false, 
      error: 'Cannot connect to local server',
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

// ✅ PPI PROTOCOL METHODS
const parsePPIURL = async (ppiUrl) => {
  try {
    console.log('🔗 Parsing PPI URL:', ppiUrl);
    const response = await api.post('/v1/protocol/parse', {
      ppi_url: ppiUrl
    });
    console.log('✅ PPI URL parsed successfully');
    return response.data;
  } catch (error) {
    console.error('❌ PPI URL parse error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || 'Failed to parse PPI URL');
  }
};

const generatePPIURL = async (operationType, parameters) => {
  try {
    console.log('🔗 Generating PPI URL for:', operationType, parameters);
    const response = await api.post('/v1/protocol/generate', {
      operation_type: operationType,
      parameters: parameters,
      target: 'casha-dag'
    });
    console.log('✅ PPI URL generated:', response.data.ppi_url);
    return response.data;
  } catch (error) {
    console.error('❌ PPI URL generation error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || 'Failed to generate PPI URL');
  }
};

const executePPIOperation = async (compiledOperation, userId) => {
  try {
    console.log('🚀 Executing PPI operation for user:', userId);
    const response = await api.post('/v1/execute', {
      compiled_operation: compiledOperation,
      user_id: userId
    });
    console.log('✅ PPI operation executed successfully');
    return response.data;
  } catch (error) {
    console.error('❌ PPI operation execution error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || 'Failed to execute PPI operation');
  }
};

const quickExecutePPIURL = async (ppiUrl, userId) => {
  try {
    console.log('⚡ Quick executing PPI URL:', ppiUrl);
    const response = await api.post('/v1/protocol/execute', {
      ppi_url: ppiUrl,
      user_id: userId
    });
    console.log('✅ Quick PPI execution successful');
    return response.data;
  } catch (error) {
    console.error('❌ Quick PPI execution error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || 'Failed to quick execute PPI URL');
  }
};

const getPPIExamples = async () => {
  try {
    const response = await api.get('/v1/protocol/examples');
    console.log('✅ PPI examples fetched');
    return response.data;
  } catch (error) {
    console.error('❌ PPI examples error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || 'Failed to fetch PPI examples');
  }
};

// ✅ PPI Operation Creation Methods
const createPPISend = async (amount, to, message = '') => {
  try {
    const response = await api.post('/v1/ppi/send', {
      amount: amount,
      to: to,
      message: message,
      target: 'casha-dag'
    });
    console.log('✅ PPI Send operation created');
    return response.data;
  } catch (error) {
    console.error('❌ PPI Send creation error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || 'Failed to create PPI Send operation');
  }
};

// ✅ ENVIRONMENT INFO - Log on import
console.log('🚀 Casha Wallet API Configuration:');
console.log('   Base URL:', api.defaults.baseURL);
console.log('   Environment: development (FORCED LOCAL)');
console.log('   Production URL: DISABLED FOR TESTING');
console.log('   Development URL:', DEV_API_BASE);
console.log('   EXPO_PUBLIC_API_URL: OVERRIDDEN FOR LOCAL TESTING');

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
  getServerInfo,
  // PPI Protocol Methods
  parsePPIURL,
  generatePPIURL,
  executePPIOperation,
  quickExecutePPIURL,
  getPPIExamples,
  createPPISend
};

// Also export as default for flexibility
export default walletAPI;

// ✅ Auto-check connection on app start in development
setTimeout(async () => {
  const connection = await checkConnection();
  console.log('🔌 Initial Connection Check:', connection);
}, 1000);