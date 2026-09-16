import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export const ClearCartModal = ({
  visible,
  currentVendorName,
  newVendorName,
  onCancel,
  onConfirm
}) => {
  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <View style={styles.iconCircle}>
            <Ionicons name="repeat-outline" size={32} color="#dc2626" />
          </View>

          <Text style={styles.title}>Replace cart items?</Text>

          <Text style={styles.message}>
            Your cart already contains items from{' '}
            <Text style={styles.boldText}>{currentVendorName || 'another store'}</Text>.
            {'\n\n'}
            Farmart only supports ordering from <Text style={styles.boldText}>one store at a time</Text> to guarantee lightning-fast single-route delivery.
            {'\n\n'}
            Do you want to discard your current cart and add items from{' '}
            <Text style={styles.boldText}>{newVendorName || 'this store'}</Text>?
          </Text>

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onCancel} activeOpacity={0.7}>
              <Text style={styles.cancelText}>No, Keep Cart</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.confirmBtn} onPress={onConfirm} activeOpacity={0.85}>
              <Text style={styles.confirmText}>Clear Cart & Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 8
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#fee2e2'
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 10,
    textAlign: 'center'
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 24
  },
  boldText: {
    fontWeight: '700',
    color: '#0f172a'
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%'
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569'
  },
  confirmBtn: {
    flex: 1.2,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: '#dc2626'
  },
  confirmText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff'
  }
});
