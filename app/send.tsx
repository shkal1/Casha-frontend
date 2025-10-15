import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  View
} from 'react-native';
import {
  ActivityIndicator,
  Button,
  Card,
  Divider,
  Text,
  TextInput
} from 'react-native-paper';
import { useAuth } from '../src/contexts/AuthContext';
import { useWallet } from '../src/contexts/WalletContext';

export default function SendScreen() {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);

  const { sendTransaction, availableBalance, confirmedBalance, pendingIncome, refreshData, loading: walletLoading } = useWallet();
  const { user } = useAuth();

  const formatCurrency = (amount: number) => {
    return amount === 1 ? `${amount} Casha` : `${amount} Cashees`;
  };

  // ✅ FIXED: Keep fee calculation for display only
  const calculateFee = (amt: number) => {
    const fee = Math.max(0.1, amt * 0.01);
    return Math.min(fee, 5.0);
  };

  // ✅ ADDED: Input validation helper
  const validateAmount = (text: string) => {
    // Allow only numbers and one decimal point
    const regex = /^\d*\.?\d*$/;
    if (regex.test(text)) {
      setAmount(text);
    }
  };

  const handleSend = async () => {
    if (!amount || !recipient) {
      Alert.alert('Error', 'Please enter both amount and recipient');
      return;
    }

    const sendAmount = parseFloat(amount);
    if (isNaN(sendAmount) || sendAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    // ✅ ADDED: Minimum amount check
    if (sendAmount < 0.01) {
      Alert.alert('Error', 'Minimum send amount is 0.01 Cashees');
      return;
    }

    // ✅ FIXED: Only check base amount for balance validation
    // Backend will handle the actual fee deduction
    if (sendAmount > availableBalance) {
      const shortfall = sendAmount - availableBalance;
      Alert.alert('Insufficient Balance', 
        `You need at least ${formatCurrency(sendAmount)} but only have ${formatCurrency(availableBalance)} available.\n\nShortfall: ${formatCurrency(shortfall)}`);
      return;
    }

    setSending(true);
    try {
      console.log('🔄 Sending transaction:', { 
        from: user?.userId, 
        to: recipient, 
        amount: sendAmount,
        note: note 
      });

      // Make real API call to backend
      const result = await sendTransaction({
        from_user: user?.userId,
        to_user: recipient,
        amount: sendAmount,
        note: note
      });

      console.log('✅ Transaction successful:', result);
      
      // ✅ ENHANCED: Better success message with actual fee from backend
      Alert.alert('Success!', 
        `Sent ${formatCurrency(sendAmount)} to ${recipient}\n\nTransaction ID: ${result.transaction_id?.substring(0, 16)}...\nFee: ${formatCurrency(result.fee)}`,
        [
          { 
            text: 'View History', 
            onPress: () => router.push('/history') 
          },
          { 
            text: 'Send More', 
            onPress: () => {
              // Clear form but keep recipient
              setAmount('');
              setNote('');
            }
          },
          { 
            text: 'OK', 
            onPress: () => {
              // Clear entire form
              setAmount('');
              setRecipient('');
              setNote('');
            }
          }
        ]
      );

      // ✅ ADDED: Auto-refresh wallet data
      await refreshData();

    } catch (error: any) {
      console.error('❌ Transaction failed:', error);
      
      // ✅ ENHANCED: Better error messages
      let errorMessage = 'Failed to send transaction';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Transaction Failed', errorMessage);
    } finally {
      setSending(false);
    }
  };

  // ✅ FIXED: Keep fee calculation for display purposes only
  const sendAmount = amount ? parseFloat(amount) : 0;
  const displayFee = calculateFee(sendAmount);
  const displayTotal = sendAmount + displayFee;

  if (walletLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#22C55E" />
        <Text style={styles.loadingText}>Loading wallet...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>Send Casha</Text>
          
          {/* Balance Display with two-balance system */}
          <Card style={styles.balanceCard}>
            <Card.Content>
              <Text style={styles.balanceLabel}>Available Balance</Text>
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
                  <Text style={styles.pendingText}>
                    +{formatCurrency(pendingIncome)} pending
                  </Text>
                </View>
              )}
            </Card.Content>
          </Card>

          {/* Recipient Input */}
          <TextInput
            label="Recipient Email or User ID"
            value={recipient}
            onChangeText={setRecipient}
            mode="outlined"
            style={styles.input}
            placeholder="Enter recipient's email or user ID"
            left={<TextInput.Icon icon="account" />}
          />

          {/* Amount Input */}
          <TextInput
            label="Amount"
            value={amount}
            onChangeText={validateAmount}
            mode="outlined"
            style={styles.input}
            keyboardType="decimal-pad"
            placeholder="0.00"
            left={<TextInput.Icon icon="cash" />}
            right={<TextInput.Affix text="Cashees" />}
          />

          {/* Note Input */}
          <TextInput
            label="Note (Optional)"
            value={note}
            onChangeText={setNote}
            mode="outlined"
            style={styles.input}
            multiline
            numberOfLines={2}
            placeholder="Add a note for this transaction"
          />

          {/* Transaction Summary - Keep as it was */}
          {amount && !isNaN(parseFloat(amount)) && (
            <Card style={styles.summaryCard}>
              <Card.Content>
                <Text style={styles.summaryTitle}>Transaction Summary</Text>
                <View style={styles.summaryRow}>
                  <Text>Amount:</Text>
                  <Text style={styles.amountText}>
                    {formatCurrency(sendAmount)}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text>Network Fee:</Text>
                  <Text>{formatCurrency(displayFee)}</Text>
                </View>
                <Divider style={styles.divider} />
                <View style={styles.summaryRow}>
                  <Text style={styles.totalLabel}>Total Deducted:</Text>
                  <Text style={styles.totalAmount}>
                    {formatCurrency(displayTotal)}
                  </Text>
                </View>
                
                {/* Balance check messages */}
                {sendAmount > availableBalance && (
                  <Text style={styles.insufficientText}>
                    Insufficient available balance
                  </Text>
                )}
                {sendAmount > confirmedBalance && sendAmount <= availableBalance && (
                  <Text style={styles.pendingWarningText}>
                    Note: Using pending funds for this transaction
                  </Text>
                )}
              </Card.Content>
            </Card>
          )}

          {/* Quick Amount Buttons */}
          <View style={styles.quickAmounts}>
            <Text style={styles.quickAmountLabel}>Quick Amount:</Text>
            <View style={styles.amountButtons}>
              {[1, 5, 10, 50].map((quickAmount) => {
                const quickTotal = quickAmount + calculateFee(quickAmount);
                const isDisabled = quickAmount > availableBalance; // ✅ FIXED: Only check base amount
                const usesPending = quickAmount > confirmedBalance && quickAmount <= availableBalance;
                
                return (
                  <Button
                    key={quickAmount}
                    mode="outlined"
                    compact
                    onPress={() => setAmount(quickAmount.toString())}
                    style={[
                      styles.amountButton,
                      usesPending && styles.pendingAmountButton
                    ]}
                    disabled={isDisabled}
                  >
                    <Text style={usesPending ? styles.pendingAmountText : {}}>
                      {quickAmount}
                    </Text>
                  </Button>
                );
              })}
            </View>
            <Text style={styles.quickAmountHelp}>
              {pendingIncome > 0 ? '🟡 Amounts may use pending funds' : ''}
            </Text>
          </View>

          {/* Send Button */}
          <Button
            mode="contained"
            onPress={handleSend}
            style={styles.sendButton}
            disabled={!amount || !recipient || sending || sendAmount > availableBalance}
            loading={sending}
          >
            <Text>
              {sending ? 'Sending...' : 
               sendAmount > availableBalance ? 'Insufficient Balance' :
               `Send ${amount ? formatCurrency(sendAmount) : 'Casha'}`}
            </Text>
          </Button>

          {/* Help Text */}
          <Text style={styles.helpText}>
            💡 Tip: Network fee (1% with min 0.1, max 5 Cashees) will be calculated and deducted automatically
          </Text>
          
          {/* Balance Information */}
          {pendingIncome > 0 && (
            <Card style={styles.infoCard}>
              <Card.Content>
                <Text style={styles.infoTitle}>Balance Information</Text>
                <Text style={styles.infoText}>
                  • <Text style={styles.bold}>Available Balance</Text>: Total funds you can spend (includes pending)
                </Text>
                <Text style={styles.infoText}>
                  • <Text style={styles.bold}>Confirmed Balance</Text>: Funds fully confirmed by the DAG network
                </Text>
                <Text style={styles.infoText}>
                  • <Text style={styles.bold}>Pending</Text>: Funds received but awaiting DAG confirmation
                </Text>
              </Card.Content>
            </Card>
          )}
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
  },
  card: {
    margin: 16,
    elevation: 4,
  },
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
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'center',
    marginTop: 8,
  },
  pendingText: {
    color: '#D97706',
    fontSize: 11,
    fontWeight: '600',
  },
  pendingWarningText: {
    color: '#D97706',
    textAlign: 'center',
    marginTop: 8,
    fontSize: 12,
    fontStyle: 'italic',
  },
  pendingAmountButton: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  pendingAmountText: {
    color: '#D97706',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    color: '#22C55E',
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 16,
  },
  summaryCard: {
    marginVertical: 16,
    backgroundColor: '#F8FAFC',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  amountText: {
    fontWeight: 'bold',
    color: '#22C55E',
  },
  divider: {
    marginVertical: 8,
  },
  totalLabel: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  totalAmount: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#22C55E',
  },
  insufficientText: {
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: 'bold',
  },
  quickAmounts: {
    marginVertical: 16,
  },
  quickAmountLabel: {
    marginBottom: 8,
    fontWeight: '600',
  },
  amountButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  amountButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  quickAmountHelp: {
    fontSize: 11,
    color: '#D97706',
    textAlign: 'center',
    marginTop: 4,
    fontStyle: 'italic',
  },
  sendButton: {
    marginTop: 16,
    paddingVertical: 8,
  },
  helpText: {
    textAlign: 'center',
    color: '#64748B',
    fontStyle: 'italic',
    marginTop: 16,
    fontSize: 12,
  },
  infoCard: {
    marginTop: 16,
    backgroundColor: '#EFF6FF',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1E40AF',
  },
  infoText: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  bold: {
    fontWeight: 'bold',
  },
});