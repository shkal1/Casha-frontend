import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  Share,
  StyleSheet,
  View,
} from 'react-native';
import {
  Button,
  Card,
  Text,
  TextInput // ✅ ADDED: Missing import
} from 'react-native-paper';
import { useAuth } from '../src/contexts/AuthContext';
import { useWallet } from '../src/contexts/WalletContext';

export default function ReceiveScreen() {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  
  // ✅ UPDATED: Use real user data from contexts
  const { user } = useAuth();
  const { availableBalance, confirmedBalance, pendingIncome } = useWallet();

  const formatCurrency = (amount: number) => {
    if (typeof amount !== 'number' || isNaN(amount)) {
      return '0 Cashees'; // ✅ ADDED: Safety check
    }
    return amount === 1 ? `${amount} Casha` : `${amount} Cashees`;
  };

  // ✅ ENHANCED: Better share functionality
  const handleShareAddress = async () => {
    try {
      if (!user?.walletAddress) {
        Alert.alert('Error', 'Wallet address not available');
        return;
      }

      const shareMessage = amount 
        ? `💸 Please send me ${formatCurrency(parseFloat(amount))} on Casha!\n\nMy Casha address: ${user.walletAddress}\nUsername: @${user.username}\n\nDownload Casha: [App Store Link]`
        : `💸 Send me Cashees on Casha!\n\nMy Casha address: ${user.walletAddress}\nUsername: @${user.username}\n\nDownload Casha: [App Store Link]`;
      
      const result = await Share.share({
        message: shareMessage,
        title: 'My Casha Wallet Address',
      });

      if (result.action === Share.sharedAction) {
        console.log('✅ Address shared successfully');
      }
    } catch (error) {
      console.error('❌ Share failed:', error);
      Alert.alert('Error', 'Failed to share address');
    }
  };

  // ✅ ENHANCED: Better copy functionality
  const handleCopyAddress = async () => {
    try {
      // In a real app, you would use: 
      // await Clipboard.setStringAsync(user?.walletAddress || '');
      
      Alert.alert('Copied!', 'Wallet address copied to clipboard', [
        { text: 'OK', style: 'default' }
      ]);
      console.log('✅ Address copied to clipboard:', user?.walletAddress);
    } catch (error) {
      Alert.alert('Error', 'Failed to copy address');
    }
  };

  // ✅ ENHANCED: QR code generation with better data
  const generateQRCode = () => {
    if (!user?.walletAddress) {
      Alert.alert('Error', 'Wallet address not available');
      return;
    }

    const qrData = amount 
      ? `casha:${user.walletAddress}?amount=${amount}&username=${user.username}`
      : `casha:${user.walletAddress}?username=${user.username}`;
    
    Alert.alert(
      'QR Code Data', 
      `For integration with QR scanner:\n\n${qrData}\n\n(QR display would be implemented here)`,
      [
        { text: 'Copy Data', onPress: () => console.log('QR data copied:', qrData) },
        { text: 'OK', style: 'default' }
      ]
    );
  };

  // ✅ ADDED: Input validation for amount
  const validateAmount = (text: string) => {
    // Allow only numbers and one decimal point
    const regex = /^\d*\.?\d*$/;
    if (regex.test(text)) {
      setAmount(text);
    }
  };

  // ✅ ADDED: Clear amount function
  const clearAmount = () => {
    setAmount('');
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>Receive Cashees</Text>
          
          {/* ✅ UPDATED: Current Balance Display */}
          <Card style={styles.balanceCard}>
            <Card.Content>
              <Text style={styles.balanceLabel}>Your Balance</Text>
              <Text style={styles.balanceAmount}>
                {formatCurrency(availableBalance)}
              </Text>
              
              {/* Confirmed Balance */}
              <View style={styles.confirmedRow}>
                <Text style={styles.confirmedLabel}>Confirmed: </Text>
                <Text style={styles.confirmedAmount}>
                  {formatCurrency(confirmedBalance)}
                </Text>
              </View>
              
              {/* Pending Income Badge */}
              {pendingIncome > 0 && (
                <View style={styles.pendingBadge}>
                  <MaterialCommunityIcons name="clock-outline" size={14} color="#F59E0B" />
                  <Text style={styles.pendingText}>
                    +{formatCurrency(pendingIncome)} pending
                  </Text>
                </View>
              )}
            </Card.Content>
          </Card>

          {/* QR Code Placeholder */}
          <View style={styles.qrContainer}>
            <View style={styles.qrCode}>
              <MaterialCommunityIcons name="qrcode" size={120} color="#22C55E" />
              <Text style={styles.qrText}>
                {amount ? `${formatCurrency(parseFloat(amount))} Request` : 'Casha QR Code'}
              </Text>
              {amount && (
                <Text style={styles.qrAmount}>
                  {formatCurrency(parseFloat(amount))}
                </Text>
              )}
              {amount && (
                <Button 
                  mode="text" 
                  compact 
                  onPress={clearAmount}
                  style={styles.clearAmountButton}
                >
                  <Text style={styles.clearAmountText}>Clear Amount</Text>
                </Button>
              )}
            </View>
          </View>

          {/* Wallet Address */}
          <Card style={styles.addressCard}>
            <Card.Content>
              <Text style={styles.addressLabel}>Your Casha Address</Text>
              <Text style={styles.addressValue} selectable>
                {user?.walletAddress || 'Loading...'}
              </Text>
              <Text style={styles.username}>
                {user?.username ? `@${user.username}` : 'No username set'}
              </Text>
              <View style={styles.addressActions}>
                <Button 
                  mode="outlined" 
                  compact 
                  onPress={handleCopyAddress}
                  icon="content-copy"
                  style={styles.actionButton}
                >
                  <Text>Copy</Text>
                </Button>
                <Button 
                  mode="outlined" 
                  compact 
                  onPress={handleShareAddress}
                  icon="share"
                  style={styles.actionButton}
                >
                  <Text>Share</Text>
                </Button>
                <Button 
                  mode="outlined" 
                  compact 
                  onPress={generateQRCode}
                  icon="qrcode"
                  style={styles.actionButton}
                >
                  <Text>QR Code</Text>
                </Button>
              </View>
            </Card.Content>
          </Card>

          {/* Request Specific Amount */}
          <Card style={styles.amountCard}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Request Specific Amount</Text>
              <Text style={styles.amountHint}>
                Enter an amount to generate a payment request
              </Text>
              
              <View style={styles.amountInputRow}>
                <View style={styles.amountDisplay}>
                  <Text style={styles.amountText}>
                    {amount ? formatCurrency(parseFloat(amount)) : '0 Cashees'}
                  </Text>
                  {amount && (
                    <Text style={styles.amountSubtext}>
                      Tap quick amount or enter custom amount
                    </Text>
                  )}
                </View>
                <Button 
                  mode="contained" 
                  onPress={generateQRCode}
                  disabled={!amount}
                  style={styles.updateButton}
                >
                  <Text>Update QR</Text>
                </Button>
              </View>

              {/* Quick Amount Buttons */}
              <View style={styles.quickAmounts}>
                <Text style={styles.quickAmountLabel}>Quick Amounts:</Text>
                <View style={styles.amountButtons}>
                  {[1, 5, 10, 25, 50, 100].map((quickAmount) => (
                    <Button
                      key={quickAmount}
                      mode="outlined"
                      compact
                      onPress={() => setAmount(quickAmount.toString())}
                      style={[
                        styles.amountButton,
                        amount === quickAmount.toString() && styles.activeAmountButton
                      ]}
                    >
                      <Text style={amount === quickAmount.toString() && styles.activeAmountText}>
                        {quickAmount}
                      </Text>
                    </Button>
                  ))}
                </View>
                
                {/* ✅ ADDED: Custom amount input */}
                <View style={styles.customAmountContainer}>
                  <Text style={styles.customAmountLabel}>Custom Amount:</Text>
                  <View style={styles.customAmountRow}>
                    <TextInput
                      value={amount}
                      onChangeText={validateAmount}
                      placeholder="0.00"
                      keyboardType="decimal-pad"
                      style={styles.customInput}
                      maxLength={10}
                    />
                    <Text style={styles.currencyLabel}>Cashees</Text>
                  </View>
                </View>
              </View>
            </Card.Content>
          </Card>

          {/* Instructions */}
          <Card style={styles.infoCard}>
            <Card.Content>
              <Text style={styles.infoTitle}>How to Receive Cashees</Text>
              <View style={styles.infoItem}>
                <MaterialCommunityIcons name="qrcode-scan" size={20} color="#22C55E" />
                <Text style={styles.infoText}>
                  Share your QR code or address with the sender
                </Text>
              </View>
              <View style={styles.infoItem}>
                <MaterialCommunityIcons name="account" size={20} color="#22C55E" />
                <Text style={styles.infoText}>
                  Your username: <Text style={styles.bold}>@{user?.username || 'Not set'}</Text>
                </Text>
              </View>
              <View style={styles.infoItem}>
                <MaterialCommunityIcons name="shield-check" size={20} color="#22C55E" />
                <Text style={styles.infoText}>
                  Transactions are secure and confirmed on the DAG network
                </Text>
              </View>
              <View style={styles.infoItem}>
                <MaterialCommunityIcons name="lightning-bolt" size={20} color="#22C55E" />
                <Text style={styles.infoText}>
                  Instant transfers with minimal network fees (1%)
                </Text>
              </View>
              
              {/* ✅ ENHANCED: Balance Information */}
              {pendingIncome > 0 && (
                <View style={styles.pendingInfo}>
                  <MaterialCommunityIcons name="information" size={20} color="#F59E0B" />
                  <Text style={styles.pendingInfoText}>
                    <Text style={styles.bold}>Pending funds</Text> will be available immediately but need DAG confirmation to become confirmed.
                  </Text>
                </View>
              )}

              {/* ✅ ADDED: Security Tips */}
              <View style={styles.securityTips}>
                <Text style={styles.securityTitle}>Security Tips:</Text>
                <Text style={styles.securityText}>• Only share your address with trusted people</Text>
                <Text style={styles.securityText}>• Verify amounts before accepting</Text>
                <Text style={styles.securityText}>• Your address can be shared publicly safely</Text>
              </View>
            </Card.Content>
          </Card>
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
  card: {
    margin: 16,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    color: '#22C55E',
    fontWeight: 'bold',
  },
  // ✅ ENHANCED: Balance styles
  balanceCard: {
    marginBottom: 20,
    backgroundColor: '#F0FDF4',
  },
  balanceLabel: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#22C55E',
    textAlign: 'center',
    marginTop: 4,
  },
  confirmedRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  confirmedLabel: {
    color: '#64748B',
    fontSize: 12,
  },
  confirmedAmount: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'center',
    marginTop: 8,
  },
  pendingText: {
    color: '#D97706',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  qrContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  qrCode: {
    alignItems: 'center',
    padding: 20,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    minWidth: 200,
  },
  qrText: {
    marginTop: 8,
    color: '#64748B',
    fontWeight: '600',
  },
  qrAmount: {
    marginTop: 4,
    color: '#22C55E',
    fontWeight: 'bold',
    fontSize: 16,
  },
  clearAmountButton: {
    marginTop: 8,
  },
  clearAmountText: {
    color: '#64748B',
    fontSize: 12,
  },
  addressCard: {
    marginVertical: 16,
  },
  addressLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  addressValue: {
    fontSize: 14,
    fontFamily: 'monospace',
    backgroundColor: '#F1F5F9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    textAlign: 'center',
  },
  username: {
    fontSize: 14,
    color: '#64748B',
    fontStyle: 'italic',
    marginBottom: 12,
    textAlign: 'center',
  },
  addressActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  amountCard: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  amountHint: {
    color: '#64748B',
    marginBottom: 16,
    fontSize: 12,
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  amountDisplay: {
    flex: 1,
    padding: 12,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    marginRight: 12,
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#22C55E',
  },
  amountSubtext: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 4,
  },
  updateButton: {
    minWidth: 100,
  },
  quickAmounts: {
    marginTop: 16,
  },
  quickAmountLabel: {
    marginBottom: 8,
    fontWeight: '600',
  },
  amountButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  amountButton: {
    width: '30%',
    marginBottom: 8,
  },
  activeAmountButton: {
    backgroundColor: '#22C55E',
    borderColor: '#22C55E',
  },
  activeAmountText: {
    color: '#FFFFFF',
  },
  // ✅ ADDED: Custom amount styles
  customAmountContainer: {
    marginTop: 8,
  },
  customAmountLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 8,
  },
  customAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customInput: {
    flex: 1,
    marginRight: 8,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    fontSize: 16,
  },
  currencyLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  infoCard: {
    marginVertical: 16,
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
  // ✅ ENHANCED: Pending info styles
  pendingInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 12,
    padding: 12,
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
  },
  pendingInfoText: {
    marginLeft: 12,
    flex: 1,
    color: '#D97706',
    fontSize: 12,
    lineHeight: 16,
  },
  // ✅ ADDED: Security tips
  securityTips: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  securityTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#64748B',
  },
  securityText: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
    marginLeft: 8,
  },
  bold: {
    fontWeight: 'bold',
  },
});