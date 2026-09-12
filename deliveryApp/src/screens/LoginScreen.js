import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useDelivery } from '../context/DeliveryContext';

export const LoginScreen = () => {
  const { loginUser } = useDelivery();
  const [riderId, setRiderId] = useState('');
  const [password, setPassword] = useState('');
  const [focusedInput, setFocusedInput] = useState(null);

  // Animation values
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePressIn = () => Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: true }).start();
  const handlePressOut = () => Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();

  const handleLogin = () => {
    if (riderId.trim() && password.trim()) {
      loginUser({ riderId, password });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.innerContainer, { opacity: fadeAnim }]}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={styles.keyboardView}
        >
        <View style={styles.header}>
          <View style={styles.logoBox}>
            <Ionicons name="bicycle" size={40} color="#0284c7" />
          </View>
          <Text style={styles.title}>Rider Duty</Text>
          <Text style={styles.subtitle}>Enter the ID and password assigned to you by the Hub Manager.</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Rider ID</Text>
          <View style={[styles.inputWrap, focusedInput === 'id' && styles.inputWrapFocused]}>
            <Ionicons name="id-card-outline" size={20} color={focusedInput === 'id' ? '#0284c7' : '#94a3b8'} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="e.g. RDR-4091"
              placeholderTextColor="#94a3b8"
              value={riderId}
              onChangeText={setRiderId}
              onFocus={() => setFocusedInput('id')}
              onBlur={() => setFocusedInput(null)}
              autoCapitalize="characters"
            />
          </View>

          <Text style={styles.label}>Password</Text>
          <View style={[styles.inputWrap, focusedInput === 'password' && styles.inputWrapFocused]}>
            <Ionicons name="lock-closed-outline" size={20} color={focusedInput === 'password' ? '#0284c7' : '#94a3b8'} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#94a3b8"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              onFocus={() => setFocusedInput('password')}
              onBlur={() => setFocusedInput(null)}
            />
          </View>

          <Animated.View style={{ transform: [{ scale: scaleAnim }], marginTop: 10 }}>
            <TouchableOpacity onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={handleLogin} activeOpacity={0.9}>
              <LinearGradient
                colors={['#0284c7', '#0369a1']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.loginBtn}
              >
                <Text style={styles.loginBtnText}>Start Duty</Text>
                <Ionicons name="log-in-outline" size={20} color="#ffffff" />
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>

        <View style={styles.footer}>
          <Ionicons name="location-outline" size={14} color="#64748b" />
          <Text style={styles.footerText}>GPS Tracking Enabled during Duty</Text>
        </View>
      </KeyboardAvoidingView>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  innerContainer: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24
  },
  header: {
    alignItems: 'center',
    marginBottom: 40
  },
  logoBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#e0f2fe',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#bae6fd'
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 20
  },
  form: {
    width: '100%'
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
    marginBottom: 8
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 20
  },
  inputWrapFocused: {
    borderColor: '#0284c7',
    shadowColor: '#0284c7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4
  },
  inputIcon: {
    marginRight: 12
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#0f172a',
    fontWeight: '500'
  },
  loginBtn: {
    flexDirection: 'row',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#0284c7',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8
  },
  loginBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600'
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
    gap: 6
  },
  footerText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500'
  }
});
