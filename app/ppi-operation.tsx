// C:\Casha\CashaWallet\app\ppi-operation.tsx
import React from 'react';
import { View, Text, Alert, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { usePPI } from '../src/contexts/PPIContext';
import { useAuth } from '../src/contexts/AuthContext';
import { useWallet } from '../src/contexts/WalletContext';
import walletAPI from '../src/services/api';
import { useRouter } from 'expo-router';

export default function PPIOperationScreen() {
  const router = useRouter();
  const { currentPPIOperation, clearPPIOperation } = usePPI();
  const { user } = useAuth();
  const { refreshData } = useWallet();

  if (!currentPPIOperation) {
    return (
      <View style={styles.container}>
        <Text style={styles.noOperationText}>No PPI operation to display</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const executeOperation = async () => {
    try {
      const result = await walletAPI.executePPIOperation(
        currentPPIOperation.compiled,
        user.userId
      );

      if (result.success) {
        Alert.alert(
          '✅ Success', 
          `PPI operation executed successfully!\n\nTransaction ID: ${result.transaction_id?.substring(0, 16)}...`,
          [
            { 
              text: 'View History', 
              onPress: () => {
                clearPPIOperation();
                router.push('/history');
              }
            },
            { 
              text: 'OK', 
              onPress: () => {
                clearPPIOperation();
                router.back();
              }
            }
          ]
        );

        // Refresh wallet data
        await refreshData();
      } else {
        Alert.alert('❌ Failed', result.error || 'Operation failed');
      }
    } catch (error: any) {
      Alert.alert('❌ Error', error.message || 'Execution failed');
    }
  };

  const formatCurrency = (amount: number) => {
    return amount === 1 ? `${amount} Casha` : `${amount} Cashees`;
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>PPI Operation</Text>
      
      <View style={styles.operationCard}>
        <Text style={styles.operationType}>
          {currentPPIOperation.parsed.primitive}
        </Text>
        <Text style={styles.operationDetails}>
          {currentPPIOperation.operation}
        </Text>
        
        <Text style={styles.sectionTitle}>Parameters:</Text>
        {Object.entries(currentPPIOperation.parsed.parameters).map(([key, value]) => (
          <Text key={key} style={styles.parameter}>
            {key}: {JSON.stringify(value)}
          </Text>
        ))}

        {/* Display amount if available */}
        {currentPPIOperation.parsed.parameters.amount && (
          <View style={styles.amountSection}>
            <Text style={styles.amountLabel}>Amount:</Text>
            <Text style={styles.amountValue}>
              {formatCurrency(currentPPIOperation.parsed.parameters.amount)}
            </Text>
          </View>
        )}

        {/* Display recipient if available */}
        {currentPPIOperation.parsed.parameters.to && (
          <View style={styles.recipientSection}>
            <Text style={styles.recipientLabel}>To:</Text>
            <Text style={styles.recipientValue}>
              {currentPPIOperation.parsed.parameters.to}
            </Text>
          </View>
        )}

        {/* Display message if available */}
        {currentPPIOperation.parsed.parameters.message && (
          <View style={styles.messageSection}>
            <Text style={styles.messageLabel}>Message:</Text>
            <Text style={styles.messageValue}>
              {currentPPIOperation.parsed.parameters.message}
            </Text>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.executeButton} onPress={executeOperation}>
        <Text style={styles.executeButtonText}>Execute Operation</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelButton} onPress={() => {
        clearPPIOperation();
        router.back();
      }}>
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>About PPI Operations</Text>
        <Text style={styles.infoText}>
          This operation was created using a PPI URL. You can review the details before executing.
        </Text>
        <Text style={styles.ppiUrl}>
          PPI URL: {currentPPIOperation.ppi_url}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: '#F8FAFC' 
  },
  noOperationText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#64748B',
    marginTop: 100,
  },
  backButton: {
    backgroundColor: '#22C55E',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 20, 
    color: '#1E293B',
    textAlign: 'center'
  },
  operationCard: { 
    backgroundColor: '#FFFFFF', 
    padding: 20, 
    borderRadius: 12, 
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  operationType: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginBottom: 10, 
    color: '#22C55E',
    textAlign: 'center'
  },
  operationDetails: { 
    fontSize: 14, 
    marginBottom: 15, 
    color: '#64748B',
    fontFamily: 'monospace',
    textAlign: 'center'
  },
  sectionTitle: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    marginTop: 15, 
    marginBottom: 8,
    color: '#1E293B'
  },
  parameter: { 
    fontSize: 14, 
    marginBottom: 4,
    color: '#475569',
    fontFamily: 'monospace'
  },
  amountSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  amountLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  amountValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#22C55E',
  },
  recipientSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  recipientLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  recipientValue: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '500',
  },
  messageSection: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  messageLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  messageValue: {
    fontSize: 14,
    color: '#475569',
    fontStyle: 'italic',
  },
  executeButton: { 
    backgroundColor: '#22C55E', 
    padding: 16, 
    borderRadius: 10, 
    alignItems: 'center', 
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  executeButtonText: { 
    color: 'white', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
  cancelButton: { 
    padding: 16, 
    borderRadius: 10, 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: '#CBD5E1',
    marginBottom: 20,
  },
  cancelButtonText: { 
    color: '#64748B', 
    fontSize: 16 
  },
  infoCard: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#8B5CF6',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#7C3AED',
  },
  infoText: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 8,
    lineHeight: 16,
  },
  ppiUrl: {
    fontSize: 10,
    color: '#8B5CF6',
    fontFamily: 'monospace',
    backgroundColor: '#F3E8FF',
    padding: 8,
    borderRadius: 4,
  }
});