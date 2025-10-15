import React from 'react';
import { StyleSheet, View } from 'react-native';
import DashboardScreen from '../src/screens/DashboardScreen';

export default function Dashboard() {
  return (
    <View style={styles.container}>
      <DashboardScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
});