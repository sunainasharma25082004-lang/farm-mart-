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
  Image,
  Animated,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { usePartner } from '../context/PartnerContext';
import { colors } from '../theme/colors';

export const LoginScreen = () => {
  const { loginUser } = usePartner();
  const [partnerId, setPartnerId] = useState('');
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
    if (partnerId.trim() && password.trim()) {
      loginUser({ partnerId, password });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.innerContainer, { opacity: fadeAnim }]}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
          style={styles.keyboardView}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent} 
            showsVerticalScrollIndicator={false} 
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.header}>
              <View style={styles.logoBox}>
                <Ionicons name="storefront" size={40} color={colors.primary} />
              </View>
              <Text style={styles.title}>Partner Hub</Text>
              <Text style={styles.subtitle}>Enter the credentials provided by the Admin to access your store.</Text>
            </View>

            <View style={styles.form}>
              <Text style={styles.label}>Partner ID / Email</Text>
              <View style={[styles.inputWrap, focusedInput === 'id' && styles.inputWrapFocused]}>
                <Ionicons name="person-outline" size={20} color={focusedInput === 'id' ? colors.primary : '#94a3b8'} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. PRT-9821"
                  placeholderTextColor="#94a3b8"
                  value={partnerId}
                  onChangeText={setPartnerId}
                  onFocus={() => setFocusedInput('id')}
                  onBlur={() => setFocusedInput(null)}
                  autoCapitalize="none"
                />
              </View>

              <Text style={styles.label}>Password</Text>
              <View style={[styles.inputWrap, focusedInput === 'password' && styles.inputWrapFocused]}>
                <Ionicons name="lock-closed-outline" size={20} color={focusedInput === 'password' ? colors.primary : '#94a3b8'} style={styles.inputIcon} />
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
                    colors={['#16a34a', '#047857']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.loginBtn}
                  >
                    <Text style={styles.loginBtnText}>Secure Login</Text>
                    <Ionicons name="arrow-forward" size={18} color="#ffffff" />
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            </View>

            <View style={styles.footer}>
              <Ionicons name="shield-checkmark" size={14} color="#64748b" />
              <Text style={styles.footerText}>Secured by Farmart Admin</Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff'
  },
  innerContainer: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40
  },
  logoBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#bbf7d0'
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
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 20
  },
  inputWrapFocused: {
    borderColor: colors.primary,
    backgroundColor: '#ffffff',
    shadowColor: colors.primary,
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
    shadowColor: '#16a34a',
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
