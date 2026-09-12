import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { useCustomerStore } from './src/state/customerStore';
import { ThemeProvider } from './src/theme';

export default function App() {
  const { fetchStateAndContext } = useCustomerStore();

  useEffect(() => {
    fetchStateAndContext();
  }, []);

  return (
    <ThemeProvider>
      <View style={styles.root}>
        <AppNavigator />
      </View>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
