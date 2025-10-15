// =============================================
// ✅ CORE WALLET TYPES
// =============================================

export interface WalletContextType {
  // ✅ Two-balance system (NEW)
  availableBalance: number;
  confirmedBalance: number;
  pendingIncome: number;
  
  // ✅ Legacy balance for compatibility
  balance: number;
  
  // ✅ Enhanced with production fields
  transactions: Transaction[];
  dagInfo: DAGInfo | null;
  loading: boolean;
  error: string | null;
  lastUpdate?: string;
  
  // ✅ Methods
  sendTransaction: (transactionData: TransactionRequest) => Promise<TransactionResponse>;
  refreshData: () => Promise<void>;
  clearError?: () => void;
  setError: (error: string | null) => void;
  
  // ✅ PRODUCTION: Additional helpers
  totalBalance?: number; // availableBalance + pendingIncome
  isDataStale?: boolean; // For cache invalidation
}

// =============================================
// ✅ AUTHENTICATION TYPES
// =============================================

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, username: string, password?: string, isSignUp?: boolean) => Promise<LoginResponse>;
  logout: () => void;
  setError: (error: string | null) => void;
}

// =============================================
// ✅ USER & PROFILE TYPES
// =============================================

export interface User {
  userId: string;
  username: string;
  email?: string;
  walletAddress: string;
  publicKey?: string;
  privateKey?: string; // Note: Consider security implications
  balance?: number;
  isOnline?: boolean;
  createdAt?: string;
  lastSeen?: string;
}

export interface UserStats {
  totalSent: number;
  totalReceived: number;
  transactionCount: number;
  successRate: number;
  favoriteRecipient?: string;
  joinedDate: string;
}

// =============================================
// ✅ TRANSACTION TYPES
// =============================================

export interface Transaction {
  transaction_id: string;
  from_user: string;
  to_user: string;
  from_username?: string;
  to_username?: string;
  amount: number;
  fee: number;
  type: 'sent' | 'received';
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: string;
  signature?: string;
  references?: string[];
  reference_count?: number;
  confirmations?: string;
  
  // ✅ DAG-specific fields
  is_confirmed?: boolean;
  net_amount?: number;
  explorer_url?: string;
  
  // ✅ UI fields
  note?: string;
  isExpanded?: boolean; // For UI state
}

export interface TransactionRequest {
  from_user: string;
  to_user: string;
  amount: number;
  note?: string;
  fee?: number; // Optional override
}

export interface TransactionResponse {
  status: 'success' | 'error';
  transaction_id: string;
  amount: number;
  fee: number;
  total_debit: number;
  new_balance: number;
  receiver_new_balance: number;
  signature: string;
  confirmation: 'instant' | 'pending';
  dag_references: string[];
  debug?: {
    sender_before: number;
    sender_after: number;
    receiver_before: number;
    receiver_after: number;
    balance_changes_verified: boolean;
  };
  error?: string; // Only present when status is 'error'
}

// =============================================
// ✅ DAG NETWORK TYPES
// =============================================

export interface DAGInfo {
  total_transactions: number;
  pending_transactions: number;
  confirmed_transactions: number;
  confirmation_threshold: number;
  tips_count?: number;
  network_type: string;
  timestamp?: string;
  
  // ✅ PRODUCTION: Additional metrics
  network_health?: 'excellent' | 'good' | 'degraded' | 'poor';
  average_confirmation_time?: number;
  active_nodes?: number;
}

export interface DAGTransaction {
  transaction_id: string;
  from_user: string;
  to_user: string;
  amount: number;
  fee: number;
  signature: string;
  timestamp: string;
  references: string[];
  reference_count: number;
  status: 'pending' | 'confirmed';
  confirmations: string;
}

// =============================================
// ✅ BALANCE TYPES
// =============================================

export interface PendingBalanceResponse {
  user_id: string;
  available_balance: number;
  confirmed_balance: number;
  pending_income: number;
  status: 'success' | 'success_fallback' | 'error_fallback';
}

export interface BalanceBreakdown {
  available: number;
  confirmed: number;
  pending: number;
  total: number; // available + pending
}

// =============================================
// ✅ API RESPONSE TYPES
// =============================================

export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
}

export interface LoginResponse {
  status: 'success' | 'error';
  user_id: string;
  wallet_address: string;
  public_key?: string;
  balance: number;
  existing_user: boolean;
  error?: string;
}

export interface RegistrationResponse {
  status: 'success' | 'error';
  user_id: string;
  wallet_address: string;
  public_key: string;
  balance: number;
  existing_user: boolean;
  error?: string;
}

// =============================================
// ✅ ERROR TYPES
// =============================================

export interface ApiError {
  status: number;
  message: string;
  code?: string;
  details?: any;
  timestamp?: string;
}

export interface WalletError {
  type: 'transaction' | 'balance' | 'network' | 'authentication';
  message: string;
  code?: string;
  recoverable: boolean;
}

// =============================================
// ✅ COMPONENT PROP TYPES
// =============================================

export interface BalanceCardProps {
  availableBalance: number;
  confirmedBalance: number;
  pendingIncome: number;
  loading?: boolean;
  onRefresh?: () => void;
}

export interface TransactionItemProps {
  transaction: Transaction;
  currentUserId: string;
  onPress?: (transaction: Transaction) => void;
}

export interface SendFormData {
  recipient: string;
  amount: string;
  note?: string;
}

// =============================================
// ✅ NAVIGATION TYPES (if using TypeScript with React Navigation)
// =============================================

export type RootStackParamList = {
  Dashboard: undefined;
  Send: undefined;
  Receive: undefined;
  History: undefined;
  Profile: undefined;
  TransactionDetails: { transactionId: string };
  QRScanner: undefined;
};

// =============================================
// ✅ ENVIRONMENT TYPES
// =============================================

export interface AppConfig {
  API_BASE_URL: string;
  ENVIRONMENT: 'development' | 'staging' | 'production';
  TRANSACTION_FEE_RATE: number;
  MIN_FEE: number;
  MAX_FEE: number;
  DAG_CONFIRMATION_THRESHOLD: number;
}

// =============================================
// ✅ LEGACY TYPES (for compatibility)
// =============================================

/**
 * @deprecated Use DAGInfo instead
 */
export interface BlockchainInfo {
  total_blocks?: number;
  total_transactions?: number;
  current_difficulty?: string;
  block_size_limit?: number;
  last_block_time?: string;
}