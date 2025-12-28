import axios from 'axios';

// ✅ RAILWAY PRODUCTION CONFIG: Always use Railway URL
const API_BASE = 'https://casha-backend-production.up.railway.app';

// ✅ SIMPLE CONFIG: Always use production URL
const getApiBase = () => {
  console.log('🚀 Using RAILWAY PRODUCTION BACKEND');
  return API_BASE;
};

const api = axios.create({
  baseURL: getApiBase(),
  timeout: 30000, // Increased timeout for production
  headers: {
    'Content-Type': 'application/json',
  }
});

// ✅ ENHANCED ERROR HANDLING FOR PRODUCTION
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Success:', response.config.url, response.status);
    return response;
  },
  async (error) => {
    console.error('❌ API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      code: error.code
    });
    
    return Promise.reject(error);
  }
);

// ✅ ALL API FUNCTIONS WITH PRODUCTION OPTIMIZATION
const checkConnection = async () => {
  try {
    const response = await api.get('/health');
    console.log('✅ API Connection successful:', {
      environment: response.data.environment,
      url: api.defaults.baseURL,
      status: response.data.status
    });
    return { 
      connected: true, 
      environment: response.data.environment,
      url: api.defaults.baseURL,
      users_count: response.data.users_count || 0
    };
  } catch (error) {
    console.log('❌ API Connection failed to Railway backend');
    return { 
      connected: false, 
      error: 'Cannot connect to Railway server',
      url: api.defaults.baseURL
    };
  }
};

const registerUser = async (userData) => {
  try {
    console.log('🔄 Registering user on Railway:', userData.user_id);
    const response = await api.post('/register', userData);
    console.log('✅ User registration successful on Railway');
    return response.data;
  } catch (error) {
    console.error('❌ Registration error on Railway:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    throw new Error(error.response?.data?.error || 'Registration failed on Railway server');
  }
};

const getBalance = async (userId) => {
  try {
    const response = await api.get(`/debug/user/${userId}`);
    console.log('✅ Balance fetch successful from Railway');
    return response.data;
  } catch (error) {
    console.error('❌ Balance fetch error from Railway:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || 'Failed to fetch balance from Railway');
  }
};

const getPendingBalance = async (userId) => {
  try {
    const response = await api.get(`/user/pending-balance/${userId}`);
    console.log('✅ Pending balance fetched from Railway');
    return response.data;
  } catch (error) {
    console.error('❌ Pending balance fetch error:', error.response?.data || error.message);
    // Fallback to regular balance
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
      throw new Error('Both balance endpoints failed on Railway');
    }
  }
};

const sendTransaction = async (transactionData) => {
  try {
    console.log('🔄 Sending transaction via Railway:', transactionData);
    const response = await api.post('/transaction', {
      transaction: transactionData
    });
    console.log('✅ Transaction successful on Railway');
    return response.data;
  } catch (error) {
    console.error('❌ Transaction error on Railway:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || 'Transaction failed on Railway');
  }
};

const getTransactionHistory = async (userId) => {
  try {
    const response = await api.get(`/transactions/user/${userId}`);
    console.log('✅ Transaction history fetched from Railway');
    return response.data;
  } catch (error) {
    console.error('❌ Transaction history error on Railway:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || 'Failed to fetch transaction history from Railway');
  }
};

const getDAGInfo = async () => {
  try {
    const response = await api.get('/dag/info');
    console.log('✅ DAG info fetched from Railway');
    return response.data;
  } catch (error) {
    console.error('❌ DAG info error on Railway:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || 'Failed to fetch DAG info from Railway');
  }
};

const getDAGTransactions = async () => {
  try {
    const response = await api.get('/dag/transactions');
    console.log('✅ DAG transactions fetched from Railway');
    return response.data;
  } catch (error) {
    console.error('❌ DAG transactions error on Railway:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || 'Failed to fetch DAG transactions from Railway');
  }
};

const getRecentTransactions = async () => {
  try {
    const response = await api.get('/transactions/recent');
    console.log('✅ Recent transactions fetched from Railway');
    return response.data;
  } catch (error) {
    console.error('❌ Recent transactions error on Railway:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || 'Failed to fetch recent transactions from Railway');
  }
};

const debugBalance = async (userId) => {
  try {
    const response = await api.get(`/debug/balance/${userId}`);
    console.log('🔧 Debug balance from Railway');
    return response.data;
  } catch (error) {
    console.error('❌ Debug balance error on Railway:', error.response?.data || error.message);
    throw error;
  }
};

const getServerInfo = async () => {
  try {
    const response = await api.get('/');
    return response.data;
  } catch (error) {
    console.error('❌ Server info error on Railway:', error.response?.data || error.message);
    throw error;
  }
};

// ✅ PPI PROTOCOL METHODS
const parsePPIURL = async (ppiUrl) => {
  try {
    console.log('🔗 Parsing PPI URL on Railway');
    const response = await api.post('/v1/protocol/parse', {
      ppi_url: ppiUrl
    });
    console.log('✅ PPI URL parsed successfully on Railway');
    return response.data;
  } catch (error) {
    console.error('❌ PPI URL parse error on Railway:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || 'Failed to parse PPI URL on Railway');
  }
};

const generatePPIURL = async (operationType, parameters) => {
  try {
    console.log('🔗 Generating PPI URL on Railway');
    const response = await api.post('/v1/protocol/generate', {
      operation_type: operationType,
      parameters: parameters,
      target: 'casha-dag'
    });
    console.log('✅ PPI URL generated on Railway');
    return response.data;
  } catch (error) {
    console.error('❌ PPI URL generation error on Railway:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || 'Failed to generate PPI URL on Railway');
  }
};

const executePPIOperation = async (compiledOperation, userId) => {
  try {
    console.log('🚀 Executing PPI operation on Railway');
    const response = await api.post('/v1/execute', {
      compiled_operation: compiledOperation,
      user_id: userId
    });
    console.log('✅ PPI operation executed successfully on Railway');
    return response.data;
  } catch (error) {
    console.error('❌ PPI operation execution error on Railway:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || 'Failed to execute PPI operation on Railway');
  }
};

const quickExecutePPIURL = async (ppiUrl, userId) => {
  try {
    console.log('⚡ Quick executing PPI URL on Railway');
    const response = await api.post('/v1/protocol/execute', {
      ppi_url: ppiUrl,
      user_id: userId
    });
    console.log('✅ Quick PPI execution successful on Railway');
    return response.data;
  } catch (error) {
    console.error('❌ Quick PPI execution error on Railway:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || 'Failed to quick execute PPI URL on Railway');
  }
};

const getPPIExamples = async () => {
  try {
    const response = await api.get('/v1/protocol/examples');
    console.log('✅ PPI examples fetched from Railway');
    return response.data;
  } catch (error) {
    console.error('❌ PPI examples error on Railway:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || 'Failed to fetch PPI examples from Railway');
  }
};

const createPPISend = async (amount, to, message = '') => {
  try {
    const response = await api.post('/v1/ppi/send', {
      amount: amount,
      to: to,
      message: message,
      target: 'casha-dag'
    });
    console.log('✅ PPI Send operation created on Railway');
    return response.data;
  } catch (error) {
    console.error('❌ PPI Send creation error on Railway:', error.response?.data || error.message);
    throw new Error(error.response?.data?.error || 'Failed to create PPI Send operation on Railway');
  }
};

// ✅ ENVIRONMENT INFO - Log on import
console.log('🚀 Casha Wallet API Configuration for RAILWAY:');
console.log('   Base URL:', api.defaults.baseURL);
console.log('   Environment: PRODUCTION (Railway)');
console.log('   Server:', API_BASE);
console.log('   Timeout:', api.defaults.timeout, 'ms');

// ✅ EXPORTS
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

export default walletAPI;

// ✅ Auto-check connection on app start
setTimeout(async () => {
  const connection = await checkConnection();
  console.log('🔌 Railway Connection Check:', connection);
}, 1000);