import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  ActivityIndicator,
  Button,
  Card,
  Chip,
  Divider,
  Text
} from 'react-native-paper';
import walletAPI from '../src/services/api';

// ✅ ENHANCED: Define TypeScript interfaces for DAG
interface DAGInfo {
  total_transactions?: number;
  confirmed_transactions?: number;
  pending_transactions?: number;
  tips_count?: number;
  confirmation_threshold?: number;
  network_type?: string;
  consensus?: string;
  timestamp?: string;
}

interface DAGTransaction {
  transaction_id?: string;
  from_user?: string;
  to_user?: string;
  from_username?: string;
  to_username?: string;
  amount?: number;
  timestamp?: string;
  status?: string;
  confirmations?: string;
  is_confirmed?: boolean;
  reference_count?: number;
  references?: string[]; // ✅ ADDED: Missing property
  fee?: number;
  signature?: string;
}

interface DAGTransactionsResponse {
  transactions?: DAGTransaction[];
  total_count?: number;
  status?: string;
}

export default function BlockchainScreen() {
  const api = walletAPI as any;
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('transactions');
  const [dagTransactions, setDagTransactions] = useState<DAGTransaction[]>([]);
  const [dagInfo, setDagInfo] = useState<DAGInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ ENHANCED: Load DAG data with better error handling
  const loadDAGData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Loading DAG network data...');
      
      // Load DAG info
      const info = await api.getDAGInfo();
      console.log('✅ DAG Info loaded:', info);
      setDagInfo(info);

      // Load DAG transactions
      const txData = await api.getDAGTransactions();
      console.log('✅ DAG Transactions loaded:', txData.transactions?.length);
      setDagTransactions(txData.transactions || []);

    } catch (err: any) {
      console.error('❌ Failed to load DAG data:', err);
      setError(err.response?.data?.error || 'Failed to load network data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDAGData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDAGData();
  };

  const formatCurrency = (amount: number | undefined) => {
    if (typeof amount !== 'number' || isNaN(amount)) {
      return '0 Cashees'; // ✅ ADDED: Safety check
    }
    return amount === 1 ? `${amount} Casha` : `${amount} Cashees`;
  };

  const formatHash = (hash: string | undefined) => {
    if (!hash) return 'Loading...';
    return `${hash.substring(0, 16)}...${hash.substring(hash.length - 8)}`;
  };

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'confirmed': return '#22C55E';
      case 'pending': return '#F59E0B';
      default: return '#64748B';
    }
  };

  const getStatusIcon = (status: string | undefined) => {
    switch (status) {
      case 'confirmed': return 'check-circle';
      case 'pending': return 'clock';
      default: return 'alert-circle';
    }
  };

  // ✅ ADDED: Get confirmation status with DAG references
  const getConfirmationStatus = (tx: DAGTransaction) => {
    if (tx.is_confirmed) {
      return { status: 'confirmed', label: '✅ Confirmed', color: '#22C55E' };
    }
    if (tx.reference_count && tx.reference_count > 0) {
      return { 
        status: 'confirming', 
        label: `⏳ ${tx.reference_count}/${dagInfo?.confirmation_threshold || 3} DAG`, 
        color: '#F59E0B' 
      };
    }
    return { status: 'pending', label: '🔄 0/3 DAG', color: '#EF4444' };
  };

  // ✅ ADDED: Calculate network health
  const getNetworkHealth = () => {
    if (!dagInfo) return { status: 'unknown', color: '#94A3B8', text: 'Checking...' };
    
    const confirmedRate = (dagInfo.confirmed_transactions || 0) / (dagInfo.total_transactions || 1);
    
    if (confirmedRate > 0.9) return { status: 'excellent', color: '#22C55E', text: 'Excellent' };
    if (confirmedRate > 0.7) return { status: 'good', color: '#F59E0B', text: 'Good' };
    return { status: 'degraded', color: '#EF4444', text: 'Degraded' };
  };

  const networkHealth = getNetworkHealth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#22C55E" />
        <Text style={styles.loadingText}>Loading DAG network data...</Text>
        <Text style={styles.loadingSubtext}>Fetching transaction history</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons name="alert-circle-outline" size={64} color="#EF4444" />
        <Text style={styles.errorText}>{error}</Text>
        <Button mode="contained" onPress={loadDAGData} style={styles.retryButton}>
          <Text>Retry Connection</Text>
        </Button>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh}
          colors={['#22C55E']}
          tintColor="#22C55E"
        />
      }
    >
      {/* ✅ ENHANCED: Network Stats */}
      <Card style={styles.statsCard}>
        <Card.Content>
          <View style={styles.networkHeader}>
            <Text style={styles.statsTitle}>🌐 Casha DAG Network</Text>
            <Chip mode="outlined" compact style={[styles.healthChip, { backgroundColor: `${networkHealth.color}20` }]}>
              <Text style={[styles.healthText, { color: networkHealth.color }]}>
                {networkHealth.text}
              </Text>
            </Chip>
          </View>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="swap-horizontal" size={24} color="#22C55E" />
              <Text style={styles.statNumber}>{dagInfo?.total_transactions || 0}</Text>
              <Text style={styles.statLabel}>Total TXs</Text>
            </View>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="check-circle" size={24} color="#22C55E" />
              <Text style={styles.statNumber}>{dagInfo?.confirmed_transactions || 0}</Text>
              <Text style={styles.statLabel}>Confirmed</Text>
            </View>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="clock" size={24} color="#F59E0B" />
              <Text style={styles.statNumber}>{dagInfo?.pending_transactions || 0}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="link" size={24} color="#8B5CF6" />
              <Text style={styles.statNumber}>{dagInfo?.tips_count || 0}</Text>
              <Text style={styles.statLabel}>Tips</Text>
            </View>
          </View>
          <Text style={styles.networkInfo}>
            {dagInfo?.network_type || 'DAG Network'} • {dagInfo?.consensus || 'Reference-based'} • {dagInfo?.confirmation_threshold || 3} refs to confirm
          </Text>
        </Card.Content>
      </Card>

      {/* Tab Navigation */}
      <Card style={styles.tabsCard}>
        <Card.Content>
          <View style={styles.tabs}>
            <Button
              mode={activeTab === 'transactions' ? 'contained' : 'outlined'}
              onPress={() => setActiveTab('transactions')}
              style={styles.tabButton}
              icon="swap-horizontal"
            >
              <Text>Transactions</Text>
            </Button>
            <Button
              mode={activeTab === 'network' ? 'contained' : 'outlined'}
              onPress={() => setActiveTab('network')}
              style={styles.tabButton}
              icon="graph"
            >
              <Text>Network Info</Text>
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Content based on active tab */}
      {activeTab === 'transactions' && (
        /* ✅ ENHANCED: DAG Transactions List */
        <Card style={styles.contentCard}>
          <Card.Content>
            <Text style={styles.contentTitle}>📊 Recent DAG Transactions</Text>
            {dagTransactions.length === 0 ? (
              <View style={styles.noDataContainer}>
                <MaterialCommunityIcons name="file-document-outline" size={48} color="#CBD5E1" />
                <Text style={styles.noData}>No recent transactions</Text>
                <Text style={styles.noDataSubtext}>Network transactions will appear here</Text>
              </View>
            ) : (
              dagTransactions.map((tx, index) => {
                const confirmation = getConfirmationStatus(tx);
                return (
                  <View key={tx.transaction_id || index}>
                    <View style={styles.txItem}>
                      <View style={styles.txHeader}>
                        <MaterialCommunityIcons 
                          name={getStatusIcon(tx.status)} 
                          size={20} 
                          color={confirmation.color} 
                        />
                        <Text style={styles.txId}>
                          TX {(tx.transaction_id || '').substring(0, 16)}...
                        </Text>
                        <Chip 
                          mode="outlined" 
                          compact 
                          style={[
                            styles.statusChip,
                            { backgroundColor: `${confirmation.color}20` }
                          ]}
                        >
                          <Text style={{ 
                            color: confirmation.color,
                            fontSize: 10 
                          }}>
                            {confirmation.label}
                          </Text>
                        </Chip>
                      </View>
                      <View style={styles.txDetails}>
                        <Text style={styles.txFromTo}>
                          👤 {tx.from_username || tx.from_user || 'Unknown'} → {tx.to_username || tx.to_user || 'Unknown'}
                        </Text>
                        <Text style={styles.txAmount}>
                          {formatCurrency(tx.amount)}
                        </Text>
                      </View>
                      <View style={styles.txFooter}>
                        <Text style={styles.txTime}>
                          🕒 {tx.timestamp ? new Date(tx.timestamp).toLocaleString() : 'Unknown'}
                        </Text>
                        {tx.references && tx.references.length > 0 && (
                          <Text style={styles.referencesText}>
                            🔗 {tx.references.length} refs
                          </Text>
                        )}
                      </View>
                    </View>
                    {index < dagTransactions.length - 1 && <Divider />}
                  </View>
                );
              })
            )}
          </Card.Content>
        </Card>
      )}

      {activeTab === 'network' && (
        /* ✅ ENHANCED: Network Information */
        <Card style={styles.contentCard}>
          <Card.Content>
            <Text style={styles.contentTitle}>🔧 DAG Network Information</Text>
            
            <View style={styles.networkItem}>
              <MaterialCommunityIcons name="graph" size={20} color="#22C55E" />
              <View style={styles.networkText}>
                <Text style={styles.networkLabel}>Network Type</Text>
                <Text style={styles.networkValue}>
                  {dagInfo?.network_type || 'Directed Acyclic Graph (DAG)'}
                </Text>
              </View>
            </View>
            
            <View style={styles.networkItem}>
              <MaterialCommunityIcons name="shield-check" size={20} color="#22C55E" />
              <View style={styles.networkText}>
                <Text style={styles.networkLabel}>Consensus Mechanism</Text>
                <Text style={styles.networkValue}>
                  {dagInfo?.consensus || 'Reference-based confirmation'}
                </Text>
              </View>
            </View>
            
            <View style={styles.networkItem}>
              <MaterialCommunityIcons name="link" size={20} color="#22C55E" />
              <View style={styles.networkText}>
                <Text style={styles.networkLabel}>Confirmation Threshold</Text>
                <Text style={styles.networkValue}>
                  {dagInfo?.confirmation_threshold || 3} DAG references required
                </Text>
              </View>
            </View>
            
            <View style={styles.networkItem}>
              <MaterialCommunityIcons name="lightning-bolt" size={20} color="#22C55E" />
              <View style={styles.networkText}>
                <Text style={styles.networkLabel}>Transaction Speed</Text>
                <Text style={styles.networkValue}>
                  Instant confirmations with parallel processing
                </Text>
              </View>
            </View>

            <View style={styles.networkItem}>
              <MaterialCommunityIcons name="security" size={20} color="#22C55E" />
              <View style={styles.networkText}>
                <Text style={styles.networkLabel}>Security</Text>
                <Text style={styles.networkValue}>
                  ECDSA signatures with DAG tamper resistance
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* ✅ ENHANCED: Network Info */}
      <Card style={styles.infoCard}>
        <Card.Content>
          <Text style={styles.infoTitle}>🚀 About Casha DAG Network</Text>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="lightning-bolt" size={20} color="#22C55E" />
            <Text style={styles.infoText}>
              <Text style={styles.bold}>Instant transactions</Text> with DAG technology - no block waiting times
            </Text>
          </View>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="link" size={20} color="#22C55E" />
            <Text style={styles.infoText}>
              <Text style={styles.bold}>Reference-based confirmation</Text> - transactions confirm after {dagInfo?.confirmation_threshold || 3} DAG references
            </Text>
          </View>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="cash" size={20} color="#22C55E" />
            <Text style={styles.infoText}>
              <Text style={styles.bold}>Low fees</Text> - 1% transaction fee (min 0.1, max 5 Cashees)
            </Text>
          </View>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="shield" size={20} color="#22C55E" />
            <Text style={styles.infoText}>
              <Text style={styles.bold}>Secure cryptography</Text> - ECDSA signatures with instant balance updates
            </Text>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginVertical: 16,
  },
  retryButton: {
    marginTop: 16,
  },
  statsCard: {
    margin: 16,
    elevation: 4,
  },
  networkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 20,
    color: '#22C55E',
    fontWeight: 'bold',
  },
  healthChip: {
    height: 24,
  },
  healthText: {
    fontSize: 10,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 4,
    color: '#1E293B',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  networkInfo: {
    textAlign: 'center',
    color: '#64748B',
    fontStyle: 'italic',
    marginTop: 8,
    fontSize: 12,
  },
  tabsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  tabButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  contentCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
  },
  contentTitle: {
    fontSize: 18,
    marginBottom: 16,
    color: '#1E293B',
    fontWeight: 'bold',
  },
  txItem: {
    paddingVertical: 12,
  },
  txHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  txId: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
    color: '#1E293B',
    fontFamily: 'monospace',
  },
  statusChip: {
    marginLeft: 8,
    height: 24,
  },
  txDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  txFromTo: {
    fontSize: 14,
    color: '#64748B',
    flex: 1,
  },
  txAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#22C55E',
  },
  txFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  txTime: {
    fontSize: 12,
    color: '#94A3B8',
  },
  referencesText: {
    fontSize: 11,
    color: '#64748B',
    fontStyle: 'italic',
  },
  confirmations: {
    fontSize: 12,
    color: '#64748B',
    fontStyle: 'italic',
  },
  networkItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  networkText: {
    marginLeft: 12,
    flex: 1,
  },
  networkLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  networkValue: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  infoCard: {
    margin: 16,
    backgroundColor: '#F0FDF4',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#22C55E',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  infoText: {
    marginLeft: 12,
    flex: 1,
    color: '#64748B',
    lineHeight: 20,
  },
  noDataContainer: {
    alignItems: 'center',
    padding: 32,
  },
  noData: {
    textAlign: 'center',
    color: '#64748B',
    fontStyle: 'italic',
    marginVertical: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  noDataSubtext: {
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 12,
  },
  bold: {
    fontWeight: 'bold',
  },
});