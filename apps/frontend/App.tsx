import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { useCustomerStore } from './src/state/customerStore';

export default function App() {
  const { fetchStateAndContext } = useCustomerStore();

  useEffect(() => {
    fetchStateAndContext();
  }, []);

  return (
    <View style={styles.root}>
      <AppNavigator />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
});
