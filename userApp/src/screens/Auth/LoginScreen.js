import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { useApp } from '../../context/AppContext';
import { Image } from 'react-native';
const LOGO = require('../../../assets/farmart24_logo.jpg');

export const LoginScreen = ({ navigation }) => {
  const { loginUser } = useApp();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!phone || !password) {
      Alert.alert('Error', 'Please enter phone and password.');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password })
      });
      const data = await response.json();
      setLoading(false);

      if (data.success) {
        loginUser(data.user);
      } else {
        Alert.alert('Login Failed', data.message || 'Invalid credentials');
      }
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Could not connect to server.');
      console.error(error);
    }
  };

  // Skip login and go directly to home as guest
  const skipLogin = () => {
    // Set a dummy guest user and mark as authenticated
    loginUser({ name: 'Guest', phone: '' });
    navigation.replace('MainTabs');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.topSection}>
          <View style={styles.logoBox}>
            <Image source={LOGO} style={styles.logoImage} resizeMode="contain" />
          </View>
          <Text style={styles.title}>Welcome Back!</Text>
          <Text style={styles.subtitle}>Log in to get farm-fresh produce delivered in 15 mins.</Text>
        </View>

        <View style={styles.formSection}>
          <View style={styles.inputWrap}>
            <Ionicons name="call-outline" size={20} color="#64748b" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              placeholderTextColor="#94a3b8"
            />
          </View>
          
          <View style={styles.inputWrap}>
            <Ionicons name="lock-closed-outline" size={20} color="#64748b" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              placeholderTextColor="#94a3b8"
            />
          </View>
          
          <TouchableOpacity style={styles.forgotBtn}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.primaryBtn, loading && styles.disabledBtn]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.primaryBtnText}>Login</Text>
            )}
          </TouchableOpacity>

          {/* Skip button */}
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: colors.textMuted, marginTop: 12 }]}
            onPress={skipLogin}
          >
            <Text style={styles.primaryBtnText}>Skip</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footerSection}>
          <Text style={styles.footerText}>New to Farmart?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
            <Text style={styles.linkText}>Create an account</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff'
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 24
  },
  topSection: {
    marginTop: 60,
    alignItems: 'center'
  },
  logoBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 22
  },
  formSection: {
    flex: 1,
    justifyContent: 'center',
    gap: 16
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 56
  },
  inputIcon: {
    marginRight: 12
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#0f172a'
  },
  forgotBtn: {
    alignSelf: 'flex-end'
  },
  forgotText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600'
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4
  },
  logoImage: {
    width: 92,
    height: 40
  },
  disabledBtn: {
    opacity: 0.7
  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600'
  },
  footerSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20
  },
  footerText: {
    color: '#64748b',
    fontSize: 15
  },
  linkText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '700'
  }
});
