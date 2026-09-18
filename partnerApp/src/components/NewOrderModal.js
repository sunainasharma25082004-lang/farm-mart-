import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { soundAlert } from '../utils/soundAlert';

export const NewOrderModal = ({ order, onAccept, onReject, onClose }) => {
  const [timeLeft, setTimeLeft] = useState(60);
  const [isMuted, setIsMuted] = useState(false);
  const [showRejectReason, setShowRejectReason] = useState(false);
  const [rejectReason, setRejectReason] = useState('Item out of stock');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasAutoAcceptedRef = useRef(false);
  const orderRef = useRef(order);
  orderRef.current = order;

  const handleAccept = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    soundAlert.stop();
    try {
      const targetOrder = orderRef.current || order;
      if (targetOrder) {
        await onAccept(targetOrder.orderId || targetOrder._id);
      }
    } catch (err) {
      console.warn('Accept order error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcceptRef = useRef(handleAccept);
  handleAcceptRef.current = handleAccept;

  useEffect(() => {
    if (!order) return;

    hasAutoAcceptedRef.current = false;
    soundAlert.start();
    setTimeLeft(60);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          soundAlert.stop();
          if (!hasAutoAcceptedRef.current) {
            hasAutoAcceptedRef.current = true;
            console.log('⏰ 60 seconds expired: Auto-accepting order for preparation:', order.orderNumber || order._id);
            handleAcceptRef.current();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      soundAlert.stop();
    };
  }, [order]);

  const toggleMute = () => {
    if (isMuted) {
      soundAlert.start();
      setIsMuted(false);
    } else {
      soundAlert.stop();
      setIsMuted(true);
    }
  };

  const handleReject = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    soundAlert.stop();
    try {
      await onReject(order.orderId || order._id, rejectReason);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!order) return null;

  return (
    <Modal visible={!!order} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header Banner */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.pulseDot} />
              <Text style={styles.headerTitle}>NEW ORDER RECEIVED</Text>
            </View>
            <TouchableOpacity style={styles.muteBtn} onPress={toggleMute}>
              <Ionicons
                name={isMuted ? 'volume-mute' : 'volume-high'}
                size={20}
                color="#ffffff"
              />
              <Text style={styles.muteText}>{isMuted ? 'Unmute' : 'Mute'}</Text>
            </TouchableOpacity>
          </View>

          {/* Countdown Bar */}
          <View style={styles.timerBarWrapper}>
            <View
              style={[
                styles.timerBarFill,
                { width: `${(timeLeft / 60) * 100}%` },
                timeLeft <= 15 && { backgroundColor: '#ea580c' }
              ]}
            />
          </View>
          <View style={styles.timerInfo}>
            <Ionicons name="time-outline" size={15} color="#ea580c" />
            <Text style={styles.timerLabel}>
              {timeLeft > 0
                ? 'Auto-accepts for preparation in:'
                : isSubmitting
                ? 'Auto-accepting for preparation...'
                : 'Auto-accepted for preparation!'}
            </Text>
            <Text style={[styles.timerSeconds, timeLeft <= 10 && { color: '#dc2626' }]}>
              {timeLeft}s
            </Text>
          </View>

          {/* Order Details Header */}
          <View style={styles.orderSummary}>
            <View>
              <Text style={styles.orderNum}>#{order.orderNumber || 'ORD-NEW'}</Text>
              <Text style={styles.custName}>
                👤 {order.customer?.fullName || order.customer?.name || order.address?.name || 'Customer'} ({order.customer?.phone || order.address?.phone || 'N/A'})
              </Text>
            </View>
            <View style={styles.amountBox}>
              <Text style={styles.amountLabel}>Total Bill</Text>
              <Text style={styles.amountVal}>₹{order.pricing?.grandTotal || order.totalAmount || 0}</Text>
            </View>
          </View>

          {/* Item Breakdown List */}
          <Text style={styles.sectionTitle}>ITEMS TO PREPARE ({order.items?.length || 0})</Text>
          <ScrollView style={styles.itemsList} showsVerticalScrollIndicator={false}>
            {order.items?.map((item, idx) => {
              const qty = item.qty ?? item.quantity ?? 1;
              const price = item.price || 0;
              return (
                <View key={idx} style={styles.itemRow}>
                  <View style={styles.itemQtyBadge}>
                    <Text style={styles.itemQtyText}>{qty}x</Text>
                  </View>
                  <View style={styles.itemMeta}>
                    <Text style={styles.itemName}>{item.name || 'Item'}</Text>
                    <Text style={styles.itemUnit}>{item.unit || 'unit'}</Text>
                  </View>
                  <Text style={styles.itemPrice}>₹{item.lineTotal || (price * qty)}</Text>
                </View>
              );
            })}
          </ScrollView>

          {/* Reject Reason Selector (if triggered) */}
          {showRejectReason ? (
            <View style={styles.rejectBox}>
              <Text style={styles.rejectLabel}>Select Reason for Rejection:</Text>
              <View style={styles.reasonButtons}>
                {['Item out of stock', 'Kitchen closing soon', 'Too busy right now'].map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={[
                      styles.reasonOption,
                      rejectReason === r && styles.reasonOptionActive
                    ]}
                    onPress={() => setRejectReason(r)}
                  >
                    <Text
                      style={[
                        styles.reasonText,
                        rejectReason === r && styles.reasonTextActive
                      ]}
                    >
                      {r}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.rejectActions}>
                <TouchableOpacity
                  style={styles.cancelRejectBtn}
                  onPress={() => setShowRejectReason(false)}
                >
                  <Text style={styles.cancelRejectText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.confirmRejectBtn}
                  onPress={handleReject}
                >
                  <Text style={styles.confirmRejectText}>Confirm Reject</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            /* Action Buttons: Accept & Reject */
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[styles.rejectBtn, isSubmitting && { opacity: 0.6 }]}
                onPress={() => setShowRejectReason(true)}
                disabled={isSubmitting}
              >
                <Ionicons name="close-circle-outline" size={20} color="#ef4444" />
                <Text style={styles.rejectBtnText}>Reject</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.acceptBtn, isSubmitting && { opacity: 0.6 }]}
                onPress={handleAccept}
                disabled={isSubmitting}
              >
                <Ionicons name="checkmark-circle" size={22} color="#ffffff" />
                <Text style={styles.acceptBtnText}>{isSubmitting ? 'ACCEPTING...' : 'ACCEPT ORDER'}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16
  },
  modalCard: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12
  },
  header: {
    backgroundColor: '#dc2626',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  pulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ffffff',
    marginRight: 10
  },
  headerTitle: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 0.5
  },
  muteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  muteText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4
  },
  timerBarWrapper: {
    height: 6,
    backgroundColor: '#fee2e2'
  },
  timerBarFill: {
    height: '100%',
    backgroundColor: '#ef4444'
  },
  timerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#fff1f2',
    borderBottomWidth: 1,
    borderBottomColor: '#fecdd3'
  },
  timerLabel: {
    fontSize: 12,
    color: '#9f1239',
    fontWeight: '500'
  },
  timerSeconds: {
    fontSize: 14,
    color: '#e11d48',
    fontWeight: '800'
  },
  orderSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9'
  },
  orderNum: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a'
  },
  custName: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4
  },
  amountBox: {
    alignItems: 'flex-end',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#bbf7d0'
  },
  amountLabel: {
    fontSize: 11,
    color: '#166534',
    fontWeight: '600'
  },
  amountVal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#15803d'
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6
  },
  itemsList: {
    maxHeight: 180,
    paddingHorizontal: 16
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc'
  },
  itemQtyBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    marginRight: 10
  },
  itemQtyText: {
    color: '#2563eb',
    fontWeight: '700',
    fontSize: 13
  },
  itemMeta: {
    flex: 1
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b'
  },
  itemUnit: {
    fontSize: 11,
    color: '#64748b'
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a'
  },
  actionsRow: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9'
  },
  rejectBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#fca5a5',
    backgroundColor: '#fff1f2'
  },
  rejectBtnText: {
    color: '#ef4444',
    fontWeight: '700',
    fontSize: 14,
    marginLeft: 6
  },
  acceptBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#16a34a'
  },
  acceptBtnText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: 0.5,
    marginLeft: 6
  },
  rejectBox: {
    padding: 16,
    backgroundColor: '#f8fafc',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0'
  },
  rejectLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8
  },
  reasonButtons: {
    gap: 6,
    marginBottom: 12
  },
  reasonOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff'
  },
  reasonOptionActive: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2'
  },
  reasonText: {
    fontSize: 13,
    color: '#475569'
  },
  reasonTextActive: {
    color: '#b91c1c',
    fontWeight: '700'
  },
  rejectActions: {
    flexDirection: 'row',
    gap: 10
  },
  cancelRejectBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#e2e8f0'
  },
  cancelRejectText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569'
  },
  confirmRejectBtn: {
    flex: 2,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#ef4444'
  },
  confirmRejectText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff'
  }
});
