import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  ActivityIndicator,
  Avatar,
  Button,
  Card,
  Text,
} from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';
import { useWallet } from '../contexts/WalletContext';

const DashboardScreen = () => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { 
    availableBalance,
    confirmedBalance,
    pendingIncome,
    transactions, 
    loading, 
    refreshData,
    error, // ✅ ADDED: Error state from wallet context
    clearError // ✅ ADDED: Clear error function
  } = useWallet();

  // ✅ ENHANCED: Auto-clear errors when component mounts
  React.useEffect(() => {
    if (error) {
      clearError?.();
    }
  }, []);

  // ✅ ENHANCED: Better currency formatting
  const formatCurrency = (amount) => {
    if (typeof amount !== 'number' || isNaN(amount)) {
      return '0 Cashees'; // ✅ Safety check
    }
    return amount === 1 ? `${amount} Casha` : `${amount} Cashees`;
  };

  const handleRefresh = async () => {
    await refreshData();
  };

  // ✅ ENHANCED: Safe transaction slicing
  const recentTransactions = Array.isArray(transactions) 
    ? transactions.slice(0, 5) 
    : [];

  // ✅ ENHANCED: Contact count with safety
  const uniqueContacts = new Set();
  if (Array.isArray(transactions)) {
    transactions.forEach(tx => {
      if (tx.from_user) uniqueContacts.add(tx.from_user);
      if (tx.to_user) uniqueContacts.add(tx.to_user);
    });
  }

  // ✅ ADD: Error display
  const renderErrorAlert = () => {
    if (error) {
      return (
        <Card style={styles.errorCard}>
          <Card.Content>
            <Text style={styles.errorText}>⚠️ {error}</Text>
            <Button mode="text" onPress={clearError}>
              <Text>Dismiss</Text>
            </Button>
          </Card.Content>
        </Card>
      );
    }
    return null;
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
      }
    >
      {/* ✅ ADD: Error Alert */}
      {renderErrorAlert()}

      {/* Balance Card */}
      <Card style={styles.balanceCard}>
        <Card.Content>
          <View style={styles.balanceHeader}>
            <MaterialCommunityIcons name="wallet" size={24} color="#22C55E" />
            <Text style={styles.balanceLabel}>Your Balance</Text>
          </View>
          
          {/* Available Balance - Main Display */}
          <Text style={styles.balanceAmount}>
            {formatCurrency(availableBalance)}
          </Text>
          
          {/* Confirmed Balance - Sub Display */}
          <View style={styles.confirmedRow}>
            <Text style={styles.confirmedLabel}>Confirmed: </Text>
            <Text style={styles.confirmedAmount}>
              {formatCurrency(confirmedBalance)}
            </Text>
          </View>
          
          {/* Pending Income Badge */}
          {pendingIncome > 0 && (
            <View style={styles.pendingBadge}>
              <MaterialCommunityIcons name="clock-outline" size={16} color="#F59E0B" />
              <Text style={styles.pendingText}>
                +{formatCurrency(pendingIncome)} pending
              </Text>
            </View>
          )}
          
          <Text style={styles.balanceSubtitle}>
            ≈ ${(availableBalance * 1.5).toFixed(2)} USD
          </Text>

          <View style={styles.balanceActions}>
            <Button 
              mode="contained" 
              style={styles.actionButton}
              icon="arrow-up"
              onPress={() => router.push('/send')}
            >
              <Text>Send</Text>
            </Button>
            <Button 
              mode="outlined" 
              style={styles.actionButton}
              icon="arrow-down"
              onPress={() => router.push('/receive')}
            >
              <Text>Receive</Text>
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <MaterialCommunityIcons name="swap-horizontal" size={20} color="#22C55E" />
            <Text style={styles.statNumber}>
              {Array.isArray(transactions) ? transactions.length : 0}
            </Text>
            <Text style={styles.statLabel}>Transactions</Text>
          </Card.Content>
        </Card>
        
        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <MaterialCommunityIcons name="account-group" size={20} color="#22C55E" />
            <Text style={styles.statNumber}>
              {uniqueContacts.size}
            </Text>
            <Text style={styles.statLabel}>Contacts</Text>
          </Card.Content>
        </Card>
        
        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <MaterialCommunityIcons name="link" size={20} color="#22C55E" />
            <Text style={styles.statNumber}>
              {Array.isArray(transactions) ? 
                transactions.filter(tx => tx.references && tx.references.length > 0).length : 0
              }
            </Text>
            <Text style={styles.statLabel}>DAG Links</Text>
          </Card.Content>
        </Card>
      </View>

      {/* Recent Transactions */}
      <Card style={styles.transactionsCard}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <Button 
              mode="text" 
              onPress={() => router.push('/history')}
            >
              <Text>View All</Text>
            </Button>
          </View>

          {loading ? (
            <ActivityIndicator style={styles.loading} />
          ) : recentTransactions.length === 0 ? (
            <Text style={styles.noTransactions}>No transactions yet</Text>
          ) : (
            recentTransactions.map((transaction, index) => (
              <View key={transaction.transaction_id || index} style={styles.transactionItem}>
                <Avatar.Icon 
                  size={40}
                  icon={transaction.type === 'sent' ? 'arrow-up' : 'arrow-down'}
                  style={[
                    styles.transactionIcon,
                    transaction.type === 'sent' ? styles.sentIcon : styles.receivedIcon
                  ]}
                />
                <View style={styles.transactionDetails}>
                  <Text style={styles.transactionPerson}>
                    {transaction.type === 'sent' 
                      ? `To: ${transaction.to_username || transaction.to_user}` 
                      : `From: ${transaction.from_username || transaction.from_user}`
                    }
                  </Text>
                  <Text style={styles.transactionTime}>
                    {new Date(transaction.timestamp).toLocaleDateString()}
                    {transaction.confirmations && (
                      <Text style={styles.confirmationText}> • {transaction.confirmations}</Text>
                    )}
                  </Text>
                </View>
                <View style={styles.transactionAmount}>
                  <Text style={[
                    styles.amountText,
                    transaction.type === 'sent' ? styles.sentAmount : styles.receivedAmount
                  ]}>
                    {transaction.type === 'sent' ? '-' : '+'}{formatCurrency(transaction.amount)}
                  </Text>
                </View>
              </View>
            ))
          )}
        </Card.Content>
      </Card>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Button 
          mode="outlined" 
          icon="history"
          onPress={() => router.push('/history')}
          style={styles.quickActionButton}
        >
          <Text>History</Text>
        </Button>
        <Button 
          mode="outlined" 
          icon="link"
          onPress={() => router.push('/blockchain')}
          style={styles.quickActionButton}
        >
          <Text>DAG Explorer</Text>
        </Button>
        <Button 
          mode="outlined" 
          icon="account"
          onPress={() => {
            logout();
            router.push('/');
          }}
          style={styles.quickActionButton}
        >
          <Text>Logout</Text>
        </Button>
      </View>

      {/* User Info (for debugging) */}
      <Card style={styles.debugCard}>
        <Card.Content>
          <Text style={styles.debugText}>Logged in as: {user?.username}</Text>
          <Text style={styles.debugText}>User ID: {user?.userId}</Text>
          <Text style={styles.debugText}>Available: {availableBalance} | Confirmed: {confirmedBalance} | Pending: {pendingIncome}</Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  balanceCard: {
    margin: 16,
    elevation: 4,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceLabel: {
    marginLeft: 8,
    fontSize: 16,
    color: '#64748B',
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#22C55E',
    marginVertical: 8,
  },
  balanceSubtitle: {
    color: '#94A3B8',
    marginBottom: 16,
  },
  balanceActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  // NEW STYLES FOR TWO-BALANCE SYSTEM
  confirmedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  confirmedLabel: {
    color: '#64748B',
    fontSize: 14,
  },
  confirmedAmount: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  pendingText: {
    color: '#D97706',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  confirmationText: {
    color: '#94A3B8',
    fontSize: 11,
  },
  // END NEW STYLES
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    elevation: 2,
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  transactionsCard: {
    margin: 16,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  transactionIcon: {
    backgroundColor: '#F1F5F9',
  },
  sentIcon: {
    backgroundColor: '#FEE2E2',
  },
  receivedIcon: {
    backgroundColor: '#DCFCE7',
  },
  transactionDetails: {
    flex: 1,
    marginLeft: 12,
  },
  transactionPerson: {
    fontWeight: '600',
  },
  transactionTime: {
    color: '#94A3B8',
    fontSize: 12,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontWeight: 'bold',
  },
  sentAmount: {
    color: '#EF4444',
  },
  receivedAmount: {
    color: '#22C55E',
  },
  loading: {
    marginVertical: 20,
  },
  noTransactions: {
    textAlign: 'center',
    color: '#94A3B8',
    fontStyle: 'italic',
    marginVertical: 20,
  },
  quickActions: {
    flexDirection: 'row',
    padding: 16,
  },
  quickActionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  debugCard: {
    margin: 16,
    backgroundColor: '#F1F5F9',
  },
  debugText: {
    fontSize: 12,
    color: '#64748B',
  },
  // ✅ ADDED: Error alert styles
  errorCard: {
    margin: 16,
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
  },
});

export default DashboardScreen;