import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  RefreshControl,
  SectionList,
  StyleSheet,
  View
} from 'react-native';
import {
  ActivityIndicator,
  Avatar,
  Card,
  Chip,
  Searchbar,
  Text
} from 'react-native-paper';
import { useWallet } from '../src/contexts/WalletContext';

// ✅ FIXED: TypeScript interfaces
interface Transaction {
  transaction_id: string;
  from_user: string;
  to_user: string;
  from_username?: string;
  to_username?: string;
  amount: number;
  fee: number;
  type: 'sent' | 'received';
  status: string;
  timestamp: string;
  signature?: string;
  references?: string[];
  reference_count?: number;
  confirmations?: string;
  is_confirmed?: boolean;
  net_amount?: number;
}

interface ConfirmationStatus {
  status: 'confirmed' | 'confirming' | 'pending';
  label: string;
  color: string;
}

interface SectionData {
  title: string;
  data: Transaction[];
}

export default function HistoryScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  
  const { transactions, loading, refreshData } = useWallet();

  // ✅ FIXED: Group transactions by date with proper typing
  const groupTransactionsByDate = (transactions: Transaction[]): SectionData[] => {
    const grouped: { [key: string]: Transaction[] } = {};
    
    transactions.forEach((transaction: Transaction) => {
      const date = new Date(transaction.timestamp);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      let dateKey: string;
      
      if (date.toDateString() === today.toDateString()) {
        dateKey = 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        dateKey = 'Yesterday';
      } else {
        dateKey = date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      }
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(transaction);
    });
    
    // Convert to SectionList format and sort by date (newest first)
    return Object.entries(grouped)
      .map(([title, data]) => ({ title, data }))
      .sort((a, b) => {
        if (a.title === 'Today') return -1;
        if (b.title === 'Today') return 1;
        if (a.title === 'Yesterday') return -1;
        if (b.title === 'Yesterday') return 1;
        return new Date(b.data[0]?.timestamp).getTime() - new Date(a.data[0]?.timestamp).getTime();
      });
  };

  const formatCurrency = (amount: number) => {
    if (typeof amount !== 'number' || isNaN(amount)) {
      return '0 Cashees';
    }
    return amount === 1 ? `${amount} Casha` : `${amount} Cashees`;
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // ✅ FIXED: Get DAG confirmation status with proper typing
  const getConfirmationStatus = (transaction: Transaction): ConfirmationStatus => {
    if (transaction.is_confirmed) {
      return { status: 'confirmed', label: '✅ Confirmed', color: '#22C55E' };
    }
    if (transaction.reference_count && transaction.reference_count > 0) {
      return { 
        status: 'confirming', 
        label: `⏳ ${transaction.reference_count}/3 DAG`, 
        color: '#F59E0B' 
      };
    }
    return { status: 'pending', label: '🔄 0/3 DAG', color: '#EF4444' };
  };

  // ✅ FIXED: Get transaction icon based on type and status
  const getTransactionIcon = (transaction: Transaction) => {
    if (transaction.type === 'sent') {
      return transaction.is_confirmed ? 'arrow-up' : 'arrow-up-bold';
    } else {
      return transaction.is_confirmed ? 'arrow-down' : 'arrow-down-bold';
    }
  };

  const transactionData = groupTransactionsByDate(transactions);

  const filteredData = transactionData.map(section => ({
    ...section,
    data: section.data.filter((transaction: Transaction) => {
      const matchesSearch = 
        transaction.to_username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.from_username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.to_user?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.from_user?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.transaction_id?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilter = filter === 'all' || 
                           (filter === 'sent' && transaction.type === 'sent') ||
                           (filter === 'received' && transaction.type === 'received');
      
      return matchesSearch && matchesFilter;
    }),
  })).filter(section => section.data.length > 0);

  // ✅ FIXED: Better refresh with error handling
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshData();
    } catch (error) {
      console.error('❌ Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // ✅ FIXED: Render transaction with better typing
  const renderTransaction = ({ item }: { item: Transaction }) => {
    const confirmation = getConfirmationStatus(item);
    
    return (
      <Card 
        style={styles.transactionCard} 
        key={item.transaction_id}
      >
        <Card.Content>
          <View style={styles.transactionRow}>
            <Avatar.Icon 
              size={40}
              icon={getTransactionIcon(item)}
              style={[
                styles.transactionIcon,
                item.type === 'sent' ? styles.sentIcon : styles.receivedIcon,
                item.is_confirmed && styles.confirmedIcon
              ]}
            />
            <View style={styles.transactionDetails}>
              <Text style={styles.transactionPerson}>
                {item.type === 'sent' 
                  ? `To: ${item.to_username || item.to_user}` 
                  : `From: ${item.from_username || item.from_user}`
                }
              </Text>
              <Text style={styles.transactionTime}>
                {formatTime(item.timestamp)}
                {item.is_confirmed && (
                  <Text style={styles.confirmedTime}> • Confirmed</Text>
                )}
              </Text>
              
              {/* ✅ FIXED: DAG Confirmation Status */}
              <View style={styles.statusContainer}>
                <Chip 
                  mode="outlined" 
                  compact 
                  style={[
                    styles.statusChip,
                    { backgroundColor: `${confirmation.color}20` }
                  ]}
                  textStyle={{ color: confirmation.color, fontSize: 10 }}
                >
                  <Text style={{ color: confirmation.color, fontSize: 10 }}>
                    {confirmation.label}
                  </Text>
                </Chip>
                
                {/* ✅ FIXED: Show DAG references */}
                {item.references && item.references.length > 0 && (
                  <Chip 
                    mode="outlined" 
                    compact 
                    style={styles.referencesChip}
                    textStyle={{ fontSize: 10 }}
                  >
                    <Text style={{ fontSize: 10 }}>
                      🔗 {item.references.length} refs
                    </Text>
                  </Chip>
                )}
              </View>
            </View>
            <View style={styles.transactionAmount}>
              <Text style={[
                styles.amountText,
                item.type === 'sent' ? styles.sentAmount : styles.receivedAmount
              ]}>
                {item.type === 'sent' ? '-' : '+'}{formatCurrency(item.amount)}
              </Text>
              {item.fee > 0 && item.type === 'sent' && (
                <Text style={styles.feeText}>
                  Fee: {formatCurrency(item.fee)}
                </Text>
              )}
              
              {/* Net amount display */}
              {item.net_amount && (
                <Text style={[
                  styles.netAmountText,
                  item.type === 'sent' ? styles.sentNetAmount : styles.receivedNetAmount
                ]}>
                  Net: {item.type === 'sent' ? '-' : '+'}{formatCurrency(item.net_amount)}
                </Text>
              )}
            </View>
          </View>
          
          {/* ✅ FIXED: Transaction ID for debugging */}
          {item.transaction_id && (
            <View style={styles.transactionIdContainer}>
              <Text style={styles.transactionIdText}>
                📋 ID: {item.transaction_id.substring(0, 16)}...
              </Text>
              {item.signature && (
                <Text style={styles.signatureText}>
                  🔒 Signed: {item.signature.substring(0, 12)}...
                </Text>
              )}
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  // ✅ FIXED: Render section header with proper typing
  const renderSectionHeader = ({ section }: { section: SectionData }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <Text style={styles.sectionCount}>{section.data.length} transactions</Text>
    </View>
  );

  // ✅ FIXED: List empty component
  const renderEmptyComponent = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons name="file-document-outline" size={64} color="#CBD5E1" />
      <Text style={styles.emptyStateText}>
        {searchQuery || filter !== 'all' 
          ? 'No matching transactions' 
          : 'No transactions yet'
        }
      </Text>
      <Text style={styles.emptyStateSubtext}>
        {searchQuery || filter !== 'all' 
          ? 'Try adjusting your search or filter' 
          : 'Your transaction history will appear here'
        }
      </Text>
      {(searchQuery || filter !== 'all') && (
        <Chip 
          mode="outlined" 
          onPress={() => {
            setSearchQuery('');
            setFilter('all');
          }}
          style={styles.resetChip}
        >
          <Text>Reset Filters</Text>
        </Chip>
      )}
    </View>
  );

  // ✅ FIXED: List footer component
  const renderFooterComponent = () => {
    if (transactions.length === 0) return null;
    
    return (
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          📊 Showing {filteredData.reduce((sum, section) => sum + section.data.length, 0)} of {transactions.length} transactions
        </Text>
        <Text style={styles.footerSubtext}>
          All transactions secured by DAG technology
        </Text>
      </View>
    );
  };

  // ✅ FIXED: Better loading state
  if (loading && transactions.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#22C55E" />
        <Text style={styles.loadingText}>Loading transaction history...</Text>
        <Text style={styles.loadingSubtext}>Fetching DAG network data</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Stats */}
      <Card style={styles.statsCard}>
        <Card.Content>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{transactions.length}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {transactions.filter((tx: Transaction) => tx.type === 'received').length}
              </Text>
              <Text style={styles.statLabel}>Received</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {transactions.filter((tx: Transaction) => tx.type === 'sent').length}
              </Text>
              <Text style={styles.statLabel}>Sent</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {transactions.filter((tx: Transaction) => tx.is_confirmed).length}
              </Text>
              <Text style={styles.statLabel}>Confirmed</Text>
            </View>
          </View>
          
          {/* Quick summary */}
          {transactions.length > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryText}>
                💰 Total Volume: {formatCurrency(
                  transactions.reduce((sum: number, tx: Transaction) => sum + tx.amount, 0)
                )}
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Search and Filter */}
      <Card style={styles.filterCard}>
        <Card.Content>
          <Searchbar
            placeholder="Search by name, address, or transaction ID..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
            clearIcon={searchQuery ? "close-circle" : "magnify"}
            onClearIconPress={() => setSearchQuery('')}
          />
          <View style={styles.filterChips}>
            <Chip
              selected={filter === 'all'}
              onPress={() => setFilter('all')}
              style={styles.filterChip}
              showSelectedCheck={false}
            >
              <Text>All ({transactions.length})</Text>
            </Chip>
            <Chip
              selected={filter === 'sent'}
              onPress={() => setFilter('sent')}
              style={styles.filterChip}
              showSelectedCheck={false}
            >
              <Text>Sent ({transactions.filter((tx: Transaction) => tx.type === 'sent').length})</Text>
            </Chip>
            <Chip
              selected={filter === 'received'}
              onPress={() => setFilter('received')}
              style={styles.filterChip}
              showSelectedCheck={false}
            >
              <Text>Received ({transactions.filter((tx: Transaction) => tx.type === 'received').length})</Text>
            </Chip>
          </View>
        </Card.Content>
      </Card>

      {/* ✅ FIXED: Transactions List with proper typing */}
      <SectionList
        sections={filteredData}
        keyExtractor={(item) => item.transaction_id || Math.random().toString()}
        renderItem={renderTransaction}
        renderSectionHeader={renderSectionHeader}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#22C55E']}
            tintColor="#22C55E"
          />
        }
        ListEmptyComponent={renderEmptyComponent}
        ListFooterComponent={renderFooterComponent}
      />
    </View>
  );
}

// Keep all your existing styles exactly the same
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 16,
    color: '#64748B',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingSubtext: {
    marginTop: 4,
    color: '#94A3B8',
    fontSize: 12,
  },
  statsCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#22C55E',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  summaryRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  summaryText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '600',
  },
  filterCard: {
    margin: 16,
    marginTop: 8,
    elevation: 2,
  },
  searchbar: {
    marginBottom: 12,
  },
  filterChips: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  filterChip: {
    flex: 1,
    marginHorizontal: 4,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  sectionHeader: {
    backgroundColor: '#F8FAFC',
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#475569',
  },
  sectionCount: {
    fontSize: 12,
    color: '#94A3B8',
  },
  transactionCard: {
    marginVertical: 4,
    elevation: 1,
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  confirmedIcon: {
    borderWidth: 2,
    borderColor: '#22C55E',
  },
  transactionDetails: {
    flex: 1,
    marginLeft: 12,
  },
  transactionPerson: {
    fontWeight: '600',
    fontSize: 16,
  },
  transactionTime: {
    color: '#94A3B8',
    fontSize: 14,
    marginTop: 2,
  },
  confirmedTime: {
    color: '#22C55E',
    fontWeight: '600',
  },
  statusContainer: {
    flexDirection: 'row',
    marginTop: 4,
  },
  statusChip: {
    height: 24,
    marginRight: 8,
  },
  referencesChip: {
    height: 24,
    backgroundColor: '#EFF6FF',
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  sentAmount: {
    color: '#EF4444',
  },
  receivedAmount: {
    color: '#22C55E',
  },
  feeText: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  netAmountText: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: '600',
  },
  sentNetAmount: {
    color: '#DC2626',
  },
  receivedNetAmount: {
    color: '#16A34A',
  },
  transactionIdContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  transactionIdText: {
    fontSize: 10,
    color: '#94A3B8',
    fontFamily: 'monospace',
  },
  signatureText: {
    fontSize: 9,
    color: '#94A3B8',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    marginTop: 50,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#64748B',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 8,
  },
  resetChip: {
    marginTop: 16,
  },
  footer: {
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginTop: 16,
  },
  footerText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  footerSubtext: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 4,
  },
});