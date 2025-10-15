import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MD3LightTheme, Provider as PaperProvider } from 'react-native-paper';
import { AuthProvider, useAuth } from '../src/contexts/AuthContext';
import { WalletProvider } from '../src/contexts/WalletContext';

// Fixed Casha Wallet Theme using MD3
const cashaTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#22C55E', // Casha green
    secondary: '#F59E0B', // Gold accent
    background: '#F8FAFC',
    surface: '#FFFFFF',
    onSurface: '#1E293B',
    error: '#EF4444',
  },
};

// Component to handle navigation based on auth state
function AppNavigator() {
  const { user } = useAuth();

  return (
    <>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#22C55E',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {!user ? (
          // Show login screen when not authenticated
          <Stack.Screen 
            name="index" 
            options={{ 
              title: 'Casha Wallet',
              headerShown: true
            }} 
          />
        ) : (
          // Show app screens when authenticated
          <>
            <Stack.Screen 
              name="index" 
              options={{ 
                title: 'Dashboard',
                headerShown: true
              }} 
            />
            <Stack.Screen 
              name="send" 
              options={{ 
                title: 'Send Casha',
                headerShown: true
              }} 
            />
            <Stack.Screen 
              name="receive" 
              options={{ 
                title: 'Receive Cashees',
                headerShown: true
              }} 
            />
            <Stack.Screen 
              name="history" 
              options={{ 
                title: 'Transaction History',
                headerShown: true
              }} 
            />
            <Stack.Screen 
              name="blockchain" 
              options={{ 
                title: 'Casha Network',
                headerShown: true
              }} 
            />
            <Stack.Screen 
              name="profile" 
              options={{ 
                title: 'My Account',
                headerShown: true
              }} 
            />
          </>
        )}
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <PaperProvider theme={cashaTheme}>
      <AuthProvider>
        <WalletProvider>
          <AppNavigator />
        </WalletProvider>
      </AuthProvider>
    </PaperProvider>
  );
}