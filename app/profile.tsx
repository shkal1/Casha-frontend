import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  Avatar,
  Button,
  Card,
  Chip,
  Divider,
  List,
  Switch,
  Text,
} from 'react-native-paper';
import { useAuth } from '../src/contexts/AuthContext';
import { useWallet } from '../src/contexts/WalletContext';

// ✅ ADDED: TypeScript interfaces for better type safety
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

interface UserStats {
  totalSent: number;
  totalReceived: number;
  totalFees: number;
  transactionCount: number;
  netFlow: number;
  sentCount: number;
  receivedCount: number;
}

export default function ProfileScreen() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const [biometricAuth, setBiometricAuth] = useState(true);
  const [notifications, setNotifications] = useState(true);

  // ✅ UPDATED: Use real user data and wallet context
  const { user, logout } = useAuth();
  const { transactions, availableBalance, confirmedBalance, pendingIncome, dagInfo } = useWallet();

  // ✅ ENHANCED: Calculate real statistics from transactions with proper typing
  const calculateUserStats = (): UserStats => {
    const sentTransactions = transactions.filter((tx: Transaction) => tx.type === 'sent');
    const receivedTransactions = transactions.filter((tx: Transaction) => tx.type === 'received');
    
    const totalSent = sentTransactions.reduce((sum: number, tx: Transaction) => sum + tx.amount, 0);
    const totalReceived = receivedTransactions.reduce((sum: number, tx: Transaction) => sum + tx.amount, 0);
    const totalFees = sentTransactions.reduce((sum: number, tx: Transaction) => sum + (tx.fee || 0), 0);
    const netFlow = totalReceived - totalSent - totalFees;

    return {
      totalSent,
      totalReceived,
      totalFees,
      transactionCount: transactions.length,
      netFlow,
      sentCount: sentTransactions.length,
      receivedCount: receivedTransactions.length,
    };
  };

  const userStats = calculateUserStats();

  const formatCurrency = (amount: number) => {
    if (typeof amount !== 'number' || isNaN(amount)) {
      return '0 Cashees'; // ✅ ADDED: Safety check
    }
    return amount === 1 ? `${amount} Casha` : `${amount} Cashees`;
  };

  // ✅ ENHANCED: Better logout with confirmation
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout? You will need to log back in to access your wallet.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive', 
          onPress: () => {
            console.log('👤 User logging out:', user?.username);
            logout();
            router.push('/');
          }
        },
      ]
    );
  };

  // ✅ ENHANCED: Better wallet export with security warnings
  const handleExportWallet = () => {
    Alert.alert(
      '⚠️ Export Private Key',
      'WARNING: Your private key gives full access to your wallet and funds. Never share it with anyone!',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'I Understand, Show Key', 
          onPress: () => {
            Alert.alert(
              'Your Private Key',
              `🔐 ${user?.privateKey}\n\n⚠️ SECURITY WARNING:\n• Store this securely\n• Never share online\n• Anyone with this key can steal your funds\n• This cannot be recovered if lost`,
              [
                { text: 'Copy Key', onPress: () => console.log('Key copied') },
                { text: 'OK', style: 'default' }
              ]
            );
          }
        },
      ]
    );
  };

  // ✅ ENHANCED: Better copy functionality
  const handleCopyAddress = () => {
    // In real app: await Clipboard.setStringAsync(user?.walletAddress || '');
    Alert.alert('✅ Copied!', 'Wallet address copied to clipboard');
    console.log('📋 Address copied:', user?.walletAddress);
  };

  const handleCopyPublicKey = () => {
    // In real app: await Clipboard.setStringAsync(user?.publicKey || '');
    Alert.alert('✅ Copied!', 'Public key copied to clipboard');
    console.log('📋 Public key copied:', user?.publicKey?.substring(0, 20));
  };

  // ✅ ADDED: Format date for account creation
  const getAccountAge = () => {
    // This would come from user data in a real app
    return 'Recently';
  };

  // ✅ ADDED: Get network health status
  const getNetworkHealth = () => {
    if (!dagInfo) return { status: 'unknown', color: '#94A3B8', text: 'Checking...' };
    
    const confirmedRate = dagInfo.confirmed_transactions / dagInfo.total_transactions;
    
    if (confirmedRate > 0.9) return { status: 'excellent', color: '#22C55E', text: 'Excellent' };
    if (confirmedRate > 0.7) return { status: 'good', color: '#F59E0B', text: 'Good' };
    return { status: 'degraded', color: '#EF4444', text: 'Degraded' };
  };

  const networkHealth = getNetworkHealth();

  return (
    <ScrollView style={styles.container}>
      {/* ✅ ENHANCED: Profile Header */}
      <Card style={styles.profileCard}>
        <Card.Content style={styles.profileContent}>
          <Avatar.Icon 
            size={80} 
            icon="account" 
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.username}>{user?.username || 'User'}</Text>
            <Text style={styles.userId}>ID: {user?.userId || 'Loading...'}</Text>
            
            {/* ✅ ENHANCED: Current Balance Display */}
            <View style={styles.balanceContainer}>
              <Text style={styles.balanceLabel}>Current Balance</Text>
              <Text style={styles.balanceAmount}>
                {formatCurrency(availableBalance)}
              </Text>
              <View style={styles.balanceDetails}>
                <Text style={styles.confirmedBalance}>
                  ✅ Confirmed: {formatCurrency(confirmedBalance)}
                </Text>
                {pendingIncome > 0 && (
                  <Text style={styles.pendingBalance}>
                    ⏳ Pending: +{formatCurrency(pendingIncome)}
                  </Text>
                )}
              </View>
            </View>
            
            <Chip mode="outlined" style={styles.statusChip}>
              <MaterialCommunityIcons name="circle" size={12} color="#22C55E" />
              <Text style={styles.statusText}> Online • DAG Network</Text>
            </Chip>
          </View>
        </Card.Content>
      </Card>

      {/* ✅ ENHANCED: Wallet Stats */}
      <Card style={styles.statsCard}>
        <Card.Content>
          <Text style={styles.statsTitle}>📊 Wallet Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="arrow-up" size={20} color="#EF4444" />
              <Text style={styles.statNumber}>
                {formatCurrency(userStats.totalSent)}
              </Text>
              <Text style={styles.statLabel}>Total Sent</Text>
              <Text style={styles.statSubtext}>{userStats.sentCount} tx</Text>
            </View>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="arrow-down" size={20} color="#22C55E" />
              <Text style={styles.statNumber}>
                {formatCurrency(userStats.totalReceived)}
              </Text>
              <Text style={styles.statLabel}>Total Received</Text>
              <Text style={styles.statSubtext}>{userStats.receivedCount} tx</Text>
            </View>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="cash" size={20} color="#F59E0B" />
              <Text style={[
                styles.statNumber,
                { color: userStats.netFlow >= 0 ? '#22C55E' : '#EF4444' }
              ]}>
                {formatCurrency(userStats.netFlow)}
              </Text>
              <Text style={styles.statLabel}>Net Flow</Text>
              <Text style={styles.statSubtext}>
                {userStats.netFlow >= 0 ? 'Profit' : 'Loss'}
              </Text>
            </View>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="swap-horizontal" size={20} color="#8B5CF6" />
              <Text style={styles.statNumber}>{userStats.transactionCount}</Text>
              <Text style={styles.statLabel}>Transactions</Text>
              <Text style={styles.statSubtext}>Total</Text>
            </View>
          </View>
          
          {/* ✅ ENHANCED: Network Information */}
          {dagInfo && (
            <View style={styles.networkInfo}>
              <Divider style={styles.divider} />
              <View style={styles.networkHeader}>
                <Text style={styles.networkTitle}>🌐 DAG Network Status</Text>
                <Chip mode="outlined" compact style={[styles.healthChip, { backgroundColor: `${networkHealth.color}20` }]}>
                  <Text style={[styles.healthText, { color: networkHealth.color }]}>
                    {networkHealth.text}
                  </Text>
                </Chip>
              </View>
              <View style={styles.networkStats}>
                <Text style={styles.networkStat}>
                  📈 Total: <Text style={styles.bold}>{dagInfo.total_transactions || 0}</Text>
                </Text>
                <Text style={styles.networkStat}>
                  ⏳ Pending: <Text style={styles.bold}>{dagInfo.pending_transactions || 0}</Text>
                </Text>
                <Text style={styles.networkStat}>
                  ✅ Confirmed: <Text style={styles.bold}>{dagInfo.confirmed_transactions || 0}</Text>
                </Text>
                <Text style={styles.networkStat}>
                  🔗 Threshold: <Text style={styles.bold}>{dagInfo.confirmation_threshold || 3}</Text>
                </Text>
              </View>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* ✅ ENHANCED: Wallet Information */}
      <Card style={styles.infoCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>💳 Wallet Information</Text>
          <List.Item
            title={<Text style={styles.listTitle}>Wallet Address</Text>}
            description={<Text style={styles.monospace}>{user?.walletAddress || 'Loading...'}</Text>}
            left={props => <List.Icon {...props} icon="wallet" color="#22C55E" />}
            right={props => <List.Icon {...props} icon="content-copy" color="#64748B" />}
            onPress={handleCopyAddress}
            style={styles.listItem}
          />
          <Divider />
          <List.Item
            title={<Text style={styles.listTitle}>Public Key</Text>}
            description={<Text style={styles.monospace}>{user?.publicKey ? `${user.publicKey.substring(0, 20)}...` : 'Loading...'}</Text>}
            left={props => <List.Icon {...props} icon="key" color="#22C55E" />}
            right={props => <List.Icon {...props} icon="content-copy" color="#64748B" />}
            onPress={handleCopyPublicKey}
            style={styles.listItem}
          />
          <Divider />
          <List.Item
            title={<Text style={styles.listTitle}>Account Created</Text>}
            description={<Text>{getAccountAge()}</Text>}
            left={props => <List.Icon {...props} icon="calendar" color="#22C55E" />}
            style={styles.listItem}
          />
        </Card.Content>
      </Card>

      {/* ✅ ENHANCED: Settings */}
      <Card style={styles.settingsCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>⚙️ Settings</Text>
          <List.Item
            title={<Text style={styles.listTitle}>Dark Mode</Text>}
            description={<Text style={styles.listDescription}>Switch between light and dark theme</Text>}
            left={props => <List.Icon {...props} icon="theme-light-dark" color="#22C55E" />}
            right={() => (
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                color="#22C55E"
              />
            )}
            style={styles.listItem}
          />
          <Divider />
          <List.Item
            title={<Text style={styles.listTitle}>Biometric Authentication</Text>}
            description={<Text style={styles.listDescription}>Use fingerprint or face ID to secure your wallet</Text>}
            left={props => <List.Icon {...props} icon="fingerprint" color="#22C55E" />}
            right={() => (
              <Switch
                value={biometricAuth}
                onValueChange={setBiometricAuth}
                color="#22C55E"
              />
            )}
            style={styles.listItem}
          />
          <Divider />
          <List.Item
            title={<Text style={styles.listTitle}>Push Notifications</Text>}
            description={<Text style={styles.listDescription}>Receive alerts for transactions</Text>}
            left={props => <List.Icon {...props} icon="bell" color="#22C55E" />}
            right={() => (
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                color="#22C55E"
              />
            )}
            style={styles.listItem}
          />
        </Card.Content>
      </Card>

      {/* ✅ ENHANCED: Actions */}
      <Card style={styles.actionsCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>🔧 Wallet Actions</Text>
          <Button
            mode="outlined"
            icon="shield-key"
            onPress={handleExportWallet}
            style={styles.actionButton}
            textColor="#DC2626"
          >
            <Text>Export Private Keys</Text>
          </Button>
          <Button
            mode="outlined"
            icon="link"
            onPress={() => router.push('/blockchain')}
            style={styles.actionButton}
          >
            <Text>View DAG Explorer</Text>
          </Button>
          <Button
            mode="outlined"
            icon="cog"
            onPress={() => {}}
            style={styles.actionButton}
          >
            <Text>Advanced Settings</Text>
          </Button>
        </Card.Content>
      </Card>

      {/* ✅ ENHANCED: Danger Zone */}
      <Card style={styles.dangerCard}>
        <Card.Content>
          <Text style={styles.dangerTitle}>🚨 Danger Zone</Text>
          <Button
            mode="contained"
            buttonColor="#EF4444"
            onPress={handleLogout}
            icon="logout"
            style={styles.logoutButton}
          >
            <Text>Logout</Text>
          </Button>
          <Text style={styles.dangerText}>
            Logging out will require you to re-enter your credentials. Your funds are safe.
          </Text>
        </Card.Content>
      </Card>

      {/* ✅ ENHANCED: App Info */}
      <Card style={styles.appInfoCard}>
        <Card.Content>
          <Text style={styles.appName}>🚀 Casha Wallet</Text>
          <Text style={styles.appVersion}>Version 1.0.0 • Production</Text>
          <Text style={styles.appDescription}>
            Secure P2P cryptocurrency wallet with DAG technology
          </Text>
          <View style={styles.techStack}>
            <Text style={styles.techItem}>⚡ Instant Transactions</Text>
            <Text style={styles.techItem}>🔒 DAG Security</Text>
            <Text style={styles.techItem}>🌍 Global Network</Text>
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
  profileCard: {
    margin: 16,
    elevation: 4,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: '#22C55E',
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  userId: {
    color: '#64748B',
    marginBottom: 8,
    fontSize: 12,
    fontFamily: 'monospace',
  },
  // ✅ ENHANCED: Balance container styles
  balanceContainer: {
    marginBottom: 12,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#22C55E',
    marginBottom: 4,
  },
  balanceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  confirmedBalance: {
    fontSize: 12,
    color: '#64748B',
  },
  pendingBalance: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '600',
  },
  statusChip: {
    alignSelf: 'flex-start',
    backgroundColor: '#F0FDF4',
  },
  statusText: {
    color: '#22C55E',
    fontWeight: '600',
  },
  statsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
  },
  statsTitle: {
    fontSize: 18,
    marginBottom: 16,
    fontWeight: 'bold',
    color: '#1E293B',
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
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 4,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  statSubtext: {
    fontSize: 10,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 2,
  },
  // ✅ ENHANCED: Network info styles
  networkInfo: {
    marginTop: 16,
  },
  divider: {
    marginVertical: 12,
  },
  networkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  networkTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#475569',
  },
  healthChip: {
    height: 24,
  },
  healthText: {
    fontSize: 10,
    fontWeight: '600',
  },
  networkStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  networkStat: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 6,
    width: '48%',
  },
  infoCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
  },
  settingsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
  },
  actionsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1E293B',
  },
  // ✅ ADDED: List item styles
  listItem: {
    paddingVertical: 8,
  },
  listTitle: {
    fontWeight: '600',
    color: '#374151',
  },
  listDescription: {
    color: '#64748B',
    fontSize: 12,
  },
  actionButton: {
    marginBottom: 8,
  },
  dangerCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
    borderColor: '#FECACA',
    borderWidth: 1,
    backgroundColor: '#FEF2F2',
  },
  dangerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#EF4444',
  },
  logoutButton: {
    marginBottom: 12,
  },
  dangerText: {
    fontSize: 12,
    color: '#EF4444',
    textAlign: 'center',
  },
  appInfoCard: {
    margin: 16,
    elevation: 1,
    backgroundColor: '#F1F5F9',
  },
  appName: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
    color: '#1E293B',
  },
  appVersion: {
    textAlign: 'center',
    color: '#64748B',
    marginBottom: 4,
    fontSize: 12,
  },
  appDescription: {
    textAlign: 'center',
    color: '#64748B',
    fontSize: 12,
    marginBottom: 8,
  },
  // ✅ ADDED: Tech stack styles
  techStack: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  techItem: {
    fontSize: 10,
    color: '#64748B',
    marginHorizontal: 8,
    marginBottom: 4,
  },
  monospace: {
    fontFamily: 'monospace',
    fontSize: 12,
  },
  bold: {
    fontWeight: 'bold',
  },
});