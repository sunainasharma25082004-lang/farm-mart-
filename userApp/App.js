import React, { useEffect } from 'react';
import { StyleSheet, StatusBar, Platform } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { AppProvider } from './src/context/AppContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { apiService } from './src/services/api';
import { colors } from './src/theme/colors';

export default function App() {
  useEffect(() => {
    apiService.checkHealth().then((data) => {
      console.log('Farmart API Health:', data);
    }).catch(() => {
      // Backend may be offline during local UI work
    });
  }, []);

  return (
    <SafeAreaProvider>
      <AppProvider>
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
          <StatusBar barStyle="dark-content" backgroundColor={colors.card} />
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </SafeAreaView>
      </AppProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    ...(Platform.OS === 'web' && { height: '100vh', width: '100vw' })
  }
});
