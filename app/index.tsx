import React from 'react';
import { StyleSheet, View } from 'react-native';
import LoginScreen from '../src/screens/LoginScreen';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <LoginScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
});