import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  ScrollView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePartner } from '../context/PartnerContext';
import { colors } from '../theme/colors';

const DEMO_ACCOUNTS = [
  {
    name: 'Sunita Sharma',
    type: 'Home Chef & Sweets',
    phone: '9876543211',
    icon: '🍳',
    desc: 'Amritsari Mathri, Desi Chaas, Mithai'
  },
  {
    name: 'Sukhwinder Singh',
    type: 'Organic Farm Harvest',
    phone: '9876543212',
    icon: '🌾',
    desc: 'Fresh Vegetables, Tomatoes, Spinach'
  },
  {
    name: 'Gurpreet Kaur',
    type: 'Fruit Orchards',
    phone: '9876543213',
    icon: '🍎',
    desc: 'Kinnow, Farm Fresh Apples, Citrus'
  }
];

export const PartnerLoginScreen = () => {
  const { loginVendor } = usePartner();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('demo123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (overridePhone, overridePassword) => {
    const targetPhone = (overridePhone || phone).trim();
    const targetPass = overridePassword || password;

    if (!targetPhone) {
      setErrorMessage('Please enter your 10-digit registered phone number');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await loginVendor(targetPhone, targetPass);
      if (!res || !res.success) {
        setErrorMessage(res?.message || 'Invalid credentials. Please check phone and password.');
      }
    } catch (err) {
      setErrorMessage('Network connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (demo) => {
    setPhone(demo.phone);
    setPassword('demo123');
    handleLogin(demo.phone, 'demo123');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Brand Header */}
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Ionicons name="storefront" size={38} color="#ffffff" />
          </View>
          <Text style={styles.brandTitle}>Farmart Partner Hub</Text>
          <Text style={styles.brandSub}>
            Merchant Portal • Manage live store, incoming orders & inventory
          </Text>
        </View>

        {/* Login Form Box */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Partner Login</Text>
          <Text style={styles.cardSub}>
            Enter your credentials to access your store dashboard
          </Text>

          {errorMessage ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={18} color="#dc2626" />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* Phone Field */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>REGISTERED PHONE NUMBER</Text>
            <View style={styles.inputWrap}>
              <View style={styles.prefixBox}>
                <Text style={styles.prefixText}>🇮🇳 +91</Text>
              </View>
              <TextInput
                style={styles.textInput}
                placeholder="Enter 10-digit phone"
                placeholderTextColor="#94a3b8"
                value={phone}
                onChangeText={(txt) => {
                  setPhone(txt);
                  setErrorMessage('');
                }}
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>
          </View>

          {/* Password Field */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>PASSWORD</Text>
            <View style={styles.inputWrap}>
              <TextInput
                style={[styles.textInput, { paddingLeft: 14 }]}
                placeholder="Enter password (default: demo123)"
                placeholderTextColor="#94a3b8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#64748b"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.loginBtn, isLoading && { opacity: 0.75 }]}
            onPress={() => handleLogin()}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <Text style={styles.loginBtnText}>Log In to Store</Text>
                <Ionicons name="arrow-forward" size={18} color="#ffffff" />
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* 1-Tap Quick Fill Demo Merchants Section */}
        <View style={styles.demoSection}>
          <View style={styles.demoSectionHeader}>
            <View style={styles.demoDivider} />
            <Text style={styles.demoSectionTitle}>OR 1-TAP DEMO MERCHANTS</Text>
            <View style={styles.demoDivider} />
          </View>

          <Text style={styles.demoHint}>
            Tap any merchant below to instantly log into their store & orders:
          </Text>

          <View style={styles.demoList}>
            {DEMO_ACCOUNTS.map((d) => (
              <TouchableOpacity
                key={d.phone}
                style={styles.demoCard}
                onPress={() => handleQuickLogin(d)}
                activeOpacity={0.85}
              >
                <View style={styles.demoIconCircle}>
                  <Text style={{ fontSize: 22 }}>{d.icon}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.demoName}>{d.name}</Text>
                  <Text style={styles.demoType}>{d.type}</Text>
                  <Text style={styles.demoPhone}>📞 {d.phone}</Text>
                </View>
                <View style={styles.quickLoginBadge}>
                  <Text style={styles.quickLoginText}>LOG IN</Text>
                  <Ionicons name="chevron-forward" size={14} color="#15803d" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  scrollContent: {
    padding: 24,
    alignItems: 'center',
    paddingBottom: 40
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24
  },
  logoCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 8,
    marginBottom: 16
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.5
  },
  brandSub: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 320,
    lineHeight: 18
  },
  card: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: 'rgba(15, 23, 42, 0.08)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 6
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0f172a'
  },
  cardSub: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
    marginBottom: 18
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16
  },
  errorText: {
    fontSize: 12.5,
    color: '#b91c1c',
    fontWeight: '600',
    flex: 1
  },
  fieldGroup: {
    marginBottom: 16
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.5,
    marginBottom: 6
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    backgroundColor: '#f8fafc',
    overflow: 'hidden'
  },
  prefixBox: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#f1f5f9',
    borderRightWidth: 1,
    borderRightColor: '#e2e8f0'
  },
  prefixText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#334155'
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14.5,
    color: '#0f172a'
  },
  eyeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 12
  },
  loginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4
  },
  loginBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700'
  },
  demoSection: {
    width: '100%',
    maxWidth: 440,
    marginTop: 28
  },
  demoSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8
  },
  demoDivider: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0'
  },
  demoSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.6
  },
  demoHint: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 14
  },
  demoList: {
    gap: 10
  },
  demoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    shadowColor: 'rgba(15, 23, 42, 0.04)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2
  },
  demoIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  demoName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a'
  },
  demoType: {
    fontSize: 11.5,
    color: '#15803d',
    fontWeight: '600',
    marginTop: 1
  },
  demoPhone: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2
  },
  quickLoginBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#dcfce7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10
  },
  quickLoginText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803d',
    letterSpacing: 0.4
  }
});
