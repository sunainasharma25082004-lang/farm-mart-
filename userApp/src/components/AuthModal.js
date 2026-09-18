import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Alert,
  Platform,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/api';
import { showAlert } from '../utils/alert';

const LOGO = require('../../assets/farmart24_logo.jpg');

export const AuthModal = ({
  visible,
  title = 'Order place karne ke liye login karein',
  subtitle = 'Apna phone number daal kar seedha connect karein.',
  onClose,
  onSuccess
}) => {
  const { loginUser } = useApp();
  const [step, setStep] = useState('PHONE'); // 'PHONE' | 'OTP'
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [devOtpHint, setDevOtpHint] = useState(null);

  if (!visible) return null;

  const handleSendOtp = async () => {
    const cleanPhone = phone.trim();
    if (!cleanPhone || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      showAlert('Invalid Mobile', 'Kripya ek valid 10-digit Indian mobile number enter karein.');
      return;
    }

    setLoading(true);
    try {
      const res = await apiService.requestOtp(cleanPhone);
      setLoading(false);
      if (res && (res.ok || res.success)) {
        if (res.devOtp) setDevOtpHint(res.devOtp);
        setStep('OTP');
      } else {
        showAlert('OTP Error', res?.message || 'OTP bhejne me problem aayi. Kripya punah prayas karein.');
      }
    } catch (err) {
      setLoading(false);
      // Dev mode fallback
      setDevOtpHint('123456');
      setStep('OTP');
    }
  };

  const handleVerifyOtp = async () => {
    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length < 4) {
      showAlert('Invalid OTP', 'Kripya 6-digit OTP enter karein.');
      return;
    }

    setLoading(true);
    try {
      const res = await apiService.verifyOtp(phone.trim(), cleanOtp);
      setLoading(false);
      if (res && (res.ok || res.success) && res.user) {
        await loginUser(res.user);
        if (onSuccess) onSuccess(res.user);
      } else {
        showAlert('Verification Failed', res?.message || 'Galat OTP. Kripya dobara dekhein.');
      }
    } catch (err) {
      setLoading(false);
      // Fallback for demo phone
      if (phone.trim() === '9876543210' || cleanOtp === '123456') {
        const u = await loginUser('9876543210', 'demo123');
        if (onSuccess) onSuccess(u);
      } else {
        showAlert('Verification Error', err?.message || 'OTP verification fail hua.');
      }
    }
  };

  const handleInstantDemoLogin = async () => {
    setLoading(true);
    try {
      const u = await loginUser('9876543210', 'demo123');
      setLoading(false);
      if (onSuccess) onSuccess(u);
    } catch (e) {
      setLoading(false);
      console.warn('Demo login failed:', e);
    }
  };

  const handleDismiss = () => {
    setStep('PHONE');
    setPhone('');
    setOtp('');
    setDevOtpHint(null);
    if (onClose) onClose();
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={handleDismiss}
    >
      <TouchableWithoutFeedback onPress={handleDismiss}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.sheet}>
              {/* Top Handle & Close */}
              <View style={styles.sheetHeader}>
                <View style={styles.dragPill} />
                <TouchableOpacity
                  onPress={handleDismiss}
                  style={styles.closeBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close" size={22} color="#64748b" />
                </TouchableOpacity>
              </View>

              {/* Branding and Contextual Header */}
              <View style={styles.brandRow}>
                <Image source={LOGO} style={styles.logo} resizeMode="contain" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.title}>{title}</Text>
                  <Text style={styles.subtitle}>{subtitle}</Text>
                </View>
              </View>

              {step === 'PHONE' ? (
                <View style={styles.form}>
                  <Text style={styles.inputLabel}>Mobile Number</Text>
                  <View style={styles.phoneInputWrap}>
                    <Text style={styles.countryCode}>+91</Text>
                    <View style={styles.verticalDivider} />
                    <TextInput
                      style={styles.phoneInput}
                      placeholder="9876543210"
                      keyboardType="phone-pad"
                      maxLength={10}
                      value={phone}
                      onChangeText={setPhone}
                      placeholderTextColor="#94a3b8"
                      autoFocus
                    />
                  </View>

                  <TouchableOpacity
                    style={[styles.primaryBtn, loading && styles.disabledBtn]}
                    onPress={handleSendOtp}
                    disabled={loading}
                    activeOpacity={0.85}
                  >
                    {loading ? (
                      <ActivityIndicator color="#ffffff" />
                    ) : (
                      <View style={styles.btnInner}>
                        <Text style={styles.primaryBtnText}>OTP Paayein</Text>
                        <Ionicons name="arrow-forward" size={16} color="#ffffff" />
                      </View>
                    )}
                  </TouchableOpacity>

                  {/* 1-Tap Quick Demo Login */}
                  <TouchableOpacity
                    style={styles.demoLoginCard}
                    onPress={handleInstantDemoLogin}
                    disabled={loading}
                    activeOpacity={0.8}
                  >
                    <View style={styles.demoIcon}>
                      <Ionicons name="flash" size={18} color="#10b981" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.demoTitle}>⚡ 1-Tap Demo Customer Login</Text>
                      <Text style={styles.demoSubtitle}>Rajesh Kumar • 9876543210</Text>
                    </View>
                    <Ionicons name="arrow-forward-circle" size={22} color="#10b981" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.form}>
                  <View style={styles.otpHeaderRow}>
                    <Text style={styles.otpSentText}>
                      OTP sent to <Text style={{ fontWeight: '700' }}>+91 {phone}</Text>
                    </Text>
                    <TouchableOpacity onPress={() => setStep('PHONE')}>
                      <Text style={styles.editPhoneText}>Badlein</Text>
                    </TouchableOpacity>
                  </View>

                  {devOtpHint ? (
                    <View style={styles.devHintBox}>
                      <Ionicons name="key" size={14} color="#047857" />
                      <Text style={styles.devHintText}>Auto Test OTP: {devOtpHint}</Text>
                    </View>
                  ) : null}

                  <TextInput
                    style={styles.otpInput}
                    placeholder="Enter 6-digit OTP"
                    keyboardType="number-pad"
                    maxLength={6}
                    value={otp}
                    onChangeText={setOtp}
                    placeholderTextColor="#94a3b8"
                    autoFocus
                  />

                  <TouchableOpacity
                    style={[styles.primaryBtn, loading && styles.disabledBtn]}
                    onPress={handleVerifyOtp}
                    disabled={loading}
                    activeOpacity={0.85}
                  >
                    {loading ? (
                      <ActivityIndicator color="#ffffff" />
                    ) : (
                      <View style={styles.btnInner}>
                        <Text style={styles.primaryBtnText}>Verify Karein & Aage Badhein</Text>
                        <Ionicons name="checkmark-circle" size={16} color="#ffffff" />
                      </View>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.resendBtn}
                    onPress={handleSendOtp}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.resendText}>OTP dobara bhejein</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end'
  },
  sheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 22,
    paddingBottom: Platform.OS === 'ios' ? 40 : 28,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 20
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    height: 28,
    marginBottom: 8
  },
  dragPill: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#cbd5e1'
  },
  closeBtn: {
    position: 'absolute',
    right: 0,
    top: 2,
    padding: 4
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 20,
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 12
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    lineHeight: 20
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2
  },
  form: {
    gap: 14
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155'
  },
  phoneInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50
  },
  countryCode: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a'
  },
  verticalDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#cbd5e1',
    marginHorizontal: 10
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    color: '#0f172a',
    fontWeight: '600',
    letterSpacing: 1
  },
  otpHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  otpSentText: {
    fontSize: 13,
    color: '#475569'
  },
  editPhoneText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary
  },
  devHintBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#dcfce7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8
  },
  devHintText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#047857'
  },
  otpInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    height: 52,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 6,
    color: '#0f172a'
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4
  },
  disabledBtn: {
    opacity: 0.7
  },
  btnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700'
  },
  demoLoginCard: {
    marginTop: 8,
    backgroundColor: '#ecfdf5',
    borderWidth: 1.5,
    borderColor: '#6ee7b7',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  demoIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#d1fae5',
    alignItems: 'center',
    justifyContent: 'center'
  },
  demoTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#065f46'
  },
  demoSubtitle: {
    fontSize: 11,
    color: '#047857',
    marginTop: 1
  },
  resendBtn: {
    alignSelf: 'center',
    paddingVertical: 6
  },
  resendText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600'
  }
});

export default AuthModal;
