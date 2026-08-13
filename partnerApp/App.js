import React, { Component } from 'react';
import { StyleSheet, StatusBar, Platform, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { PartnerProvider } from './src/context/PartnerContext';
import { PartnerNavigator } from './src/navigation/PartnerNavigator';
import { colors } from './src/theme/colors';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('PartnerApp Error Boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorScreen}>
          <Text style={styles.errorTitle}>Partner Hub Alert</Text>
          <Text style={styles.errorSub}>An unexpected error occurred in Partner Portal.</Text>
          <TouchableOpacity style={styles.reloadBtn} onPress={() => this.setState({ hasError: false })}>
            <Text style={styles.reloadText}>Reload Dashboard</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <PartnerProvider>
          <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.card} />
            <NavigationContainer>
              <PartnerNavigator />
            </NavigationContainer>
          </View>
        </PartnerProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    ...(Platform.OS === 'web' && { height: '100vh', width: '100vw' })
  },
  errorScreen: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: '#0f172a',
    marginBottom: 8
  },
  errorSub: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 20
  },
  reloadBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12
  },
  reloadText: {
    color: '#ffffff',
    fontWeight: '500',
    fontSize: 14
  }
});
