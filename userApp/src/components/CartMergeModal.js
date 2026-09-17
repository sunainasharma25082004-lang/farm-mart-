import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export const CartMergeModal = ({
  visible,
  currentVendorName = 'Account Store',
  currentVendorItemCount = 1,
  guestVendorName = 'Guest Store',
  guestVendorItemCount = 1,
  onKeepAccountCart,
  onKeepGuestCart,
  onClose
}) => {
  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalCard}>
              <View style={styles.iconCircle}>
                <Ionicons name="swap-horizontal" size={28} color="#b45309" />
              </View>

              <Text style={styles.title}>Cart me antar mila</Text>

              <Text style={styles.body}>
                Aapke account me pehle se{' '}
                <Text style={styles.boldText}>{currentVendorName}</Text> ke{' '}
                <Text style={styles.boldText}>{currentVendorItemCount} items</Text> hain.{'\n\n'}
                Abhi aapne{' '}
                <Text style={styles.boldText}>{guestVendorName}</Text> ke{' '}
                <Text style={styles.boldText}>{guestVendorItemCount} items</Text> add kiye the. S-farmart 24 ek order me ek hi store se delivery karta hai. Kaunsa cart rakhna chahte hain?
              </Text>

              <View style={styles.btnRow}>
                <TouchableOpacity
                  style={styles.keepAccountBtn}
                  onPress={onKeepAccountCart}
                  activeOpacity={0.85}
                >
                  <Text style={styles.keepAccountBtnText}>Account Cart Rakhein</Text>
                  <Text style={styles.subtext}>({currentVendorName})</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.keepGuestBtn}
                  onPress={onKeepGuestCart}
                  activeOpacity={0.85}
                >
                  <Text style={styles.keepGuestBtnText}>Naya Cart Rakhein</Text>
                  <Text style={styles.guestSubtext}>({guestVendorName})</Text>
                </TouchableOpacity>
              </View>
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8
  },
  iconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#fef3c7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 12
  },
  body: {
    fontSize: 13.5,
    color: '#475569',
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 20
  },
  boldText: {
    fontWeight: '700',
    color: '#0f172a'
  },
  btnRow: {
    width: '100%',
    gap: 10
  },
  keepAccountBtn: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  keepAccountBtnText: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '700'
  },
  subtext: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2
  },
  keepGuestBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4
  },
  keepGuestBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700'
  },
  guestSubtext: {
    fontSize: 11,
    color: '#bbf7d0',
    marginTop: 2
  }
});

export default CartMergeModal;
