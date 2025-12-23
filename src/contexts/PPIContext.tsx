// C:\Casha\CashaWallet\src\contexts\PPIContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Alert } from 'react-native';
import walletAPI from '../services/api';

interface PPIProtocolResult {
  success: boolean;
  parsed: any;
  operation: string;
  compiled: any;
  ppi_url: string;
}

interface PPIContextType {
  isProcessingPPI: boolean;
  currentPPIOperation: PPIProtocolResult | null;
  processPPIURL: (ppiUrl: string) => Promise<void>;
  clearPPIOperation: () => void;
  generatePPIURL: (operationType: string, parameters: any) => Promise<any>;
}

const PPIContext = createContext<PPIContextType | undefined>(undefined);

export const PPIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isProcessingPPI, setIsProcessingPPI] = useState(false);
  const [currentPPIOperation, setCurrentPPIOperation] = useState<PPIProtocolResult | null>(null);

  const processPPIURL = async (ppiUrl: string) => {
    if (!ppiUrl.startsWith('ppi://')) return;
    
    setIsProcessingPPI(true);
    try {
      console.log('🔗 Processing PPI URL:', ppiUrl);
      
      // Use your existing walletAPI to call PPI endpoints
      const result = await walletAPI.parsePPIURL(ppiUrl);
      
      if (result.success) {
        setCurrentPPIOperation(result);
        // Show preview alert to user
        Alert.alert(
          'PPI Operation Detected',
          `Operation: ${result.operation}\n\nWould you like to view this operation?`,
          [
            { text: 'Cancel', style: 'cancel', onPress: clearPPIOperation },
            { 
              text: 'View Operation', 
              onPress: () => {
                // Operation will be shown in the ppi-operation screen
                console.log('User wants to view PPI operation');
              }
            }
          ]
        );
      } else {
        Alert.alert('PPI Error', result.error || 'Failed to parse PPI URL');
      }
    } catch (error) {
      console.error('PPI URL processing failed:', error);
      Alert.alert('PPI Error', 'Failed to process PPI URL');
    } finally {
      setIsProcessingPPI(false);
    }
  };

  const generatePPIURL = async (operationType: string, parameters: any) => {
    try {
      const result = await walletAPI.generatePPIURL(operationType, parameters);
      return result;
    } catch (error) {
      console.error('PPI URL generation failed:', error);
      throw error;
    }
  };

  const clearPPIOperation = () => {
    setCurrentPPIOperation(null);
  };

  const value: PPIContextType = {
    isProcessingPPI,
    currentPPIOperation,
    processPPIURL,
    clearPPIOperation,
    generatePPIURL
  };

  return (
    <PPIContext.Provider value={value}>
      {children}
    </PPIContext.Provider>
  );
};

export const usePPI = () => {
  const context = useContext(PPIContext);
  if (context === undefined) {
    throw new Error('usePPI must be used within a PPIProvider');
  }
  return context;
};