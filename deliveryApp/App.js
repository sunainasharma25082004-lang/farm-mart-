import React from 'react';
import { StyleSheet, StatusBar, Platform } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { DeliveryProvider } from './src/context/DeliveryContext';
import { DeliveryNavigator } from './src/navigation/DeliveryNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <DeliveryProvider>
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
          <NavigationContainer>
            <DeliveryNavigator />
          </NavigationContainer>
        </SafeAreaView>
      </DeliveryProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    ...(Platform.OS === 'web' && { height: '100vh', width: '100vw' })
  }
});
