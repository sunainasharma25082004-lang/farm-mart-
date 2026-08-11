import React, { useEffect, Component } from 'react';
import { StyleSheet, StatusBar, Platform, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { AppProvider } from './src/context/AppContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { apiService } from './src/services/api';
import { colors } from './src/theme/colors';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled app error caught by ErrorBoundary:', error, errorInfo);
  }

  handleRestart = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorScreen}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorSub}>
            Farmart encountered an issue. Tap below to restart the app cleanly.
          </Text>
          <TouchableOpacity style={styles.restartBtn} onPress={this.handleRestart}>
            <Text style={styles.restartBtnText}>Reload App</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  useEffect(() => {
    apiService.checkHealth().then((data) => {
      console.log('Farmart API Health:', data);
    }).catch(() => {
      // Backend may be offline during local UI work
    });
  }, []);

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <AppProvider>
          <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.card} />
            <NavigationContainer>
              <RootNavigator />
            </NavigationContainer>
          </View>
        </AppProvider>
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
    padding: 24,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
  },
  errorSub: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  restartBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  restartBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
});
