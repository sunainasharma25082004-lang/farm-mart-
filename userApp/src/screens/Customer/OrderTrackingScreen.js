import React, { Fragment } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { useApp } from '../../context/AppContext';
import { colors } from '../../theme/colors';

const statusMeta = {
  PLACED: { label: 'Placed', color: colors.info, bg: '#dbeafe' },
  PACKED: { label: 'Packed', color: colors.accent, bg: colors.accentLight },
  IN_TRANSIT: { label: 'On the way', color: colors.orange, bg: colors.orangeLight },
  DELIVERED: { label: 'Delivered', color: colors.success, bg: colors.primaryLight }
};

export const OrderTrackingScreen = ({ navigation }) => {
  const { orders } = useApp();

  const getStepState = (orderStatus, step) => {
    const order = ['PLACED', 'PACKED', 'IN_TRANSIT', 'DELIVERED'];
    // Treat unknown as at least PLACED
    let idx = order.indexOf(orderStatus);
    if (idx < 0) idx = 0;
    // Map PACKED into timeline: PLACED -> PACKED (hub) -> IN_TRANSIT -> DELIVERED
    // Our steps: 0 placed, 1 packed, 2 transit, 3 delivered
    if (orderStatus === 'PLACED' && step === 0) return 'done';
    if (orderStatus === 'PLACED' && step === 1) return 'current';
    if (orderStatus === 'IN_TRANSIT' && step <= 2) return step < 2 ? 'done' : 'current';
    if (orderStatus === 'DELIVERED') return 'done';
    if (step < idx) return 'done';
    if (step === idx) return 'current';
    return 'todo';
  };

  return (
    <View style={styles.container}>
      <Header navigation={navigation} title="Your Orders" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {orders.length === 0 ? (
          <View style={styles.emptyView}>
            <View style={styles.emptyIcon}>
              <Ionicons name="cube-outline" size={40} color={colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>No orders yet</Text>
            <Text style={styles.emptyText}>Your recent orders will show up here</Text>
          </View>
        ) : (
          orders.map((order) => {
            const meta = statusMeta[order.status] || statusMeta.PLACED;
            const steps = [
              { key: 0, title: 'Placed', icon: 'checkmark' },
              { key: 1, title: 'Packed', icon: 'cube' },
              { key: 2, title: 'On way', icon: 'bicycle' },
              { key: 3, title: 'Done', icon: 'home' }
            ];

            return (
              <View key={order.id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <View>
                    <Text style={styles.orderId}>{order.id}</Text>
                    <Text style={styles.orderDate}>{order.date}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: meta.bg }]}>
                    <Text style={[styles.statusText, { color: meta.color }]}>{meta.label}</Text>
                  </View>
                </View>

                <View style={styles.itemsBox}>
                  {order.items.map((item, idx) => (
                    <View key={idx} style={styles.itemRow}>
                      <Text style={styles.itemText} numberOfLines={1}>
                        {item.name} × {item.qty}
                      </Text>
                      <Text style={styles.itemPrice}>₹{item.price * item.qty}</Text>
                    </View>
                  ))}
                  {order.total != null && (
                    <View style={[styles.itemRow, styles.totalLine]}>
                      <Text style={styles.totalLabel}>Total</Text>
                      <Text style={styles.totalPrice}>₹{order.total}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.timeline}>
                  {steps.map((step, i) => {
                    const state = getStepState(order.status, step.key);
                    const active = state === 'done' || state === 'current';
                    return (
                      <Fragment key={step.key}>
                        <View style={styles.timelineStep}>
                          <View
                            style={[
                              styles.stepDot,
                              active && styles.stepActive,
                              state === 'current' && styles.stepCurrent
                            ]}
                          >
                            <Ionicons
                              name={step.icon}
                              size={11}
                              color={active ? '#ffffff' : colors.textMuted}
                            />
                          </View>
                          <Text style={[styles.stepTitle, active && styles.stepTitleActive]}>
                            {step.title}
                          </Text>
                        </View>
                        {i < steps.length - 1 && (
                          <View style={[styles.stepLine, active && i < 2 && styles.stepLineActive]} />
                        )}
                      </Fragment>
                    );
                  })}
                </View>

                <View style={styles.hubFooter}>
                  <Ionicons name="business" size={14} color={colors.primary} />
                  <Text style={styles.hubText}>
                    {order.hubName || order.deliveryAddress || 'Village Hub'}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 28
  },
  emptyView: {
    alignItems: 'center',
    paddingVertical: 60
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary
  },
  emptyText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4
  },
  orderCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 10,
    marginBottom: 10
  },
  orderId: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary
  },
  orderDate: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800'
  },
  itemsBox: {
    backgroundColor: colors.background,
    padding: 10,
    borderRadius: 12,
    marginBottom: 14
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  itemText: {
    flex: 1,
    fontSize: 12,
    color: colors.textPrimary,
    fontWeight: '600',
    marginRight: 8
  },
  itemPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary
  },
  totalLine: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 6,
    paddingTop: 6,
    marginBottom: 0
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textPrimary
  },
  totalPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primaryDark
  },
  timeline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginVertical: 8
  },
  timelineStep: {
    alignItems: 'center',
    width: 58
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center'
  },
  stepActive: {
    backgroundColor: colors.primary
  },
  stepCurrent: {
    borderWidth: 2,
    borderColor: colors.primaryLight
  },
  stepTitle: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textMuted,
    marginTop: 4,
    textAlign: 'center'
  },
  stepTitleActive: {
    color: colors.primaryDark
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: colors.border,
    marginBottom: 14
  },
  stepLineActive: {
    backgroundColor: colors.primary
  },
  hubFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
    marginTop: 6
  },
  hubText: {
    flex: 1,
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600'
  }
});
