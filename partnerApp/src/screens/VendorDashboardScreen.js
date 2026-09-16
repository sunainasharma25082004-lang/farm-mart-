import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePartner } from '../context/PartnerContext';
import { useSocket } from '../context/SocketContext';
import { colors } from '../theme/colors';

const DEMO_VENDORS = [
  { name: 'Sunita Sharma (Home Chef)', phone: '9876543211', icon: '🍳' },
  { name: 'Sukhwinder Singh (Farmer)', phone: '9876543212', icon: '🌾' },
  { name: 'Gurpreet Kaur (Orchards)', phone: '9876543213', icon: '🍎' }
];

export const VendorDashboardScreen = ({ navigation }) => {
  const {
    vendor,
    toggleStoreStatus,
    orders,
    updateOrderStatus,
    stats,
    loginVendor,
    fetchOrders
  } = usePartner();

  const { connectionMode } = useSocket();

  const isStoreOpen = vendor?.isOpen ?? true;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Top Header Bar */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.storeBadgeCircle}>
            <Ionicons name="storefront" size={22} color="#ffffff" />
          </View>
          <View style={styles.storeTextContainer}>
            <Text style={styles.storeName} numberOfLines={1}>
              {vendor?.storeName || 'Sunita Home Restro'}
            </Text>
            <Text style={styles.ownerText}>
              👤 {vendor?.ownerName || 'Vendor Portal'} • {vendor?.phone || '9876543211'}
            </Text>
          </View>
        </View>

        <View style={styles.statusBox}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: isStoreOpen ? '#10b981' : '#ef4444' }
            ]}
          />
          <Text
            style={[
              styles.statusText,
              { color: isStoreOpen ? '#15803d' : '#b91c1c' }
            ]}
          >
            {isStoreOpen ? 'ONLINE' : 'OFFLINE'}
          </Text>
          <Switch
            value={isStoreOpen}
            onValueChange={toggleStoreStatus}
            trackColor={{ false: '#cbd5e1', true: '#bbf7d0' }}
            thumbColor={isStoreOpen ? '#16a34a' : '#94a3b8'}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Connection Status & Vendor Switcher Bar */}
        <View style={styles.connectionBar}>
          <View style={styles.connIndicator}>
            <View
              style={[
                styles.livePulse,
                {
                  backgroundColor:
                    connectionMode === 'REALTIME'
                      ? '#10b981'
                      : connectionMode === 'POLLING'
                      ? '#f59e0b'
                      : '#ef4444'
                }
              ]}
            />
            <Text style={styles.connText}>
              {connectionMode === 'REALTIME'
                ? '⚡ Live Real-Time Socket'
                : connectionMode === 'POLLING'
                ? '🔄 10s Live Polling Sync'
                : '🔴 Offline'}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.refreshBtn}
            onPress={() => fetchOrders(vendor?._id)}
          >
            <Ionicons name="refresh" size={14} color="#475569" />
            <Text style={styles.refreshText}>Sync</Text>
          </TouchableOpacity>
        </View>

        {/* Demo Vendor Switcher Tabs */}
        <View style={styles.switcherWrapper}>
          <Text style={styles.switcherLabel}>SWITCH STORE ACCOUNT:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.switcherRow}>
            {DEMO_VENDORS.map((v) => {
              const isCurrent = vendor?.phone === v.phone;
              return (
                <TouchableOpacity
                  key={v.phone}
                  style={[styles.switchChip, isCurrent && styles.switchChipActive]}
                  onPress={() => loginVendor(v.phone)}
                >
                  <Text style={styles.switchIcon}>{v.icon}</Text>
                  <Text style={[styles.switchName, isCurrent && styles.switchNameActive]}>
                    {v.name.split(' (')[0]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Quick Metrics Grid */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }]}>
            <View style={styles.statIconBox}>
              <Ionicons name="wallet-outline" size={18} color="#16a34a" />
            </View>
            <Text style={styles.statVal}>₹{stats.todaySales || 0}</Text>
            <Text style={styles.statLabel}>Today's Sales</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }]}>
            <View style={styles.statIconBox}>
              <Ionicons name="receipt-outline" size={18} color="#2563eb" />
            </View>
            <Text style={[styles.statVal, { color: '#1d4ed8' }]}>
              {orders.filter((o) => ['NEW_ORDER', 'ACCEPTED', 'PREPARING', 'READY_FOR_RIDER'].includes(o.status)).length}
            </Text>
            <Text style={styles.statLabel}>Active Orders</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#fffbeb', borderColor: '#fde68a' }]}>
            <View style={styles.statIconBox}>
              <Ionicons name="star" size={18} color="#d97706" />
            </View>
            <Text style={[styles.statVal, { color: '#b45309' }]}>★ {vendor?.rating || 4.8}</Text>
            <Text style={styles.statLabel}>Store Rating</Text>
          </View>
        </View>

        {/* Add Product Action Button */}
        <TouchableOpacity
          style={styles.addProdBtn}
          onPress={() => navigation.navigate('AddProduct')}
          activeOpacity={0.85}
        >
          <View style={styles.addProdIconCircle}>
            <Ionicons name="add" size={20} color="#0f172a" />
          </View>
          <Text style={styles.addProdText}>Add New Product / Dish</Text>
          <Ionicons name="chevron-forward" size={18} color="#ffffff" style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>

        {/* Incoming Customer Orders Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Live Orders Queue</Text>
          <View style={styles.orderCountBadge}>
            <Text style={styles.orderCountText}>{orders.length} Total</Text>
          </View>
        </View>

        {orders.length === 0 ? (
          <View style={styles.emptyBox}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="receipt-outline" size={38} color="#94a3b8" />
            </View>
            <Text style={styles.emptyTitle}>No Orders Yet</Text>
            <Text style={styles.emptySub}>
              Incoming orders from customer app will trigger instant audio chime and show up here.
            </Text>
          </View>
        ) : (
          orders.map((order) => {
            const isNew = order.status === 'NEW_ORDER';
            const isAccepted = order.status === 'ACCEPTED';
            const isPreparing = order.status === 'PREPARING';
            const isReady = order.status === 'READY_FOR_RIDER';
            const isOut = order.status === 'OUT_FOR_DELIVERY';
            const isDelivered = order.status === 'DELIVERED';
            const isCancelled = ['CANCELLED', 'REJECTED'].includes(order.status);

            const cust = order.customer || order.address || {};

            return (
              <View key={order._id || order.orderId} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <View>
                    <View style={styles.orderIdRow}>
                      <Text style={styles.orderId}>#{order.orderNumber || order.orderId}</Text>
                      <View style={styles.typeBadge}>
                        <Ionicons name="flash-outline" size={11} color="#6366f1" />
                        <Text style={styles.typeBadgeText}>Express</Text>
                      </View>
                    </View>
                    <Text style={styles.orderTime}>
                      👤 {cust.name || 'Customer'} • 📞 {cust.phone || 'N/A'}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.statusPill,
                      {
                        backgroundColor: isNew
                          ? '#fef3c7'
                          : isAccepted
                          ? '#e0e7ff'
                          : isPreparing
                          ? '#ffedd5'
                          : isReady
                          ? '#dcfce7'
                          : isOut
                          ? '#cffafe'
                          : isDelivered
                          ? '#dcfce7'
                          : '#fee2e2'
                      }
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusPillText,
                        {
                          color: isNew
                            ? '#b45309'
                            : isAccepted
                            ? '#4338ca'
                            : isPreparing
                            ? '#c2410c'
                            : isReady
                            ? '#15803d'
                            : isOut
                            ? '#0e7490'
                            : isDelivered
                            ? '#15803d'
                            : '#b91c1c'
                        }
                      ]}
                    >
                      {(order.status || 'NEW_ORDER').replace(/_/g, ' ')}
                    </Text>
                  </View>
                </View>

                {/* Items Box */}
                <View style={styles.itemsContainer}>
                  {order.items?.map((item, idx) => (
                    <View key={idx} style={styles.itemRow}>
                      <View style={styles.itemQtyBadge}>
                        <Text style={styles.itemQtyText}>{item.qty}x</Text>
                      </View>
                      <Text style={styles.itemRowText} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text style={styles.itemPrice}>
                        ₹{item.lineTotal || item.price * item.qty}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Order Footer */}
                <View style={styles.orderFooter}>
                  <View>
                    <Text style={styles.totalLabel}>Bill Amount</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={styles.totalText}>
                        ₹{order.pricing?.grandTotal || order.totalAmount || 0}
                      </Text>
                      <View
                        style={{
                          backgroundColor:
                            order.payment?.method === 'COD' || order.paymentMethod === 'COD'
                              ? '#fee2e2'
                              : '#dcfce7',
                          paddingHorizontal: 6,
                          paddingVertical: 2,
                          borderRadius: 6
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 10,
                            color:
                              order.payment?.method === 'COD' || order.paymentMethod === 'COD'
                                ? '#991b1b'
                                : '#16a34a',
                            fontWeight: '600'
                          }}
                        >
                          {order.payment?.method || 'COD'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Progressive Action Workflow */}
                  <View style={styles.btnRow}>
                    {isNew && (
                      <>
                        <TouchableOpacity
                          style={styles.rejectSmallBtn}
                          onPress={() => updateOrderStatus(order._id, 'REJECTED', 'Kitchen is busy')}
                        >
                          <Text style={styles.rejectSmallText}>Reject</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.acceptBtn}
                          onPress={() => updateOrderStatus(order._id, 'ACCEPTED')}
                          activeOpacity={0.85}
                        >
                          <Text style={styles.btnText}>Accept</Text>
                          <Ionicons name="checkmark-circle" size={16} color="#ffffff" />
                        </TouchableOpacity>
                      </>
                    )}

                    {isAccepted && (
                      <TouchableOpacity
                        style={[styles.acceptBtn, { backgroundColor: '#ea580c' }]}
                        onPress={() => updateOrderStatus(order._id, 'PREPARING')}
                        activeOpacity={0.85}
                      >
                        <Text style={styles.btnText}>Start Cooking & Packing</Text>
                        <Ionicons name="flame" size={16} color="#ffffff" />
                      </TouchableOpacity>
                    )}

                    {isPreparing && (
                      <TouchableOpacity
                        style={[styles.acceptBtn, { backgroundColor: '#16a34a' }]}
                        onPress={() => updateOrderStatus(order._id, 'READY_FOR_RIDER')}
                        activeOpacity={0.85}
                      >
                        <Text style={styles.btnText}>Order is Packed</Text>
                        <Ionicons name="cube" size={16} color="#ffffff" />
                      </TouchableOpacity>
                    )}

                    {isReady && (
                      <TouchableOpacity
                        style={[styles.acceptBtn, { backgroundColor: '#0284c7' }]}
                        onPress={() => updateOrderStatus(order._id, 'OUT_FOR_DELIVERY')}
                        activeOpacity={0.85}
                      >
                        <Text style={styles.btnText}>Handover to Rider</Text>
                        <Ionicons name="paper-plane" size={16} color="#ffffff" />
                      </TouchableOpacity>
                    )}

                    {isOut && (
                      <TouchableOpacity
                        style={[styles.acceptBtn, { backgroundColor: '#15803d' }]}
                        onPress={() => updateOrderStatus(order._id, 'DELIVERED')}
                        activeOpacity={0.85}
                      >
                        <Text style={styles.btnText}>Mark Delivered</Text>
                        <Ionicons name="checkmark-done" size={16} color="#ffffff" />
                      </TouchableOpacity>
                    )}

                    {isDelivered && (
                      <View style={styles.completedBadge}>
                        <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
                        <Text style={styles.completedText}>Delivered</Text>
                      </View>
                    )}

                    {isCancelled && (
                      <View style={styles.cancelledBadge}>
                        <Ionicons name="close-circle" size={16} color="#ef4444" />
                        <Text style={styles.cancelledText}>
                          {order.status === 'REJECTED' ? 'Rejected' : 'Cancelled'}
                        </Text>
                      </View>
                    )}
                  </View>
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
    backgroundColor: '#f8fafc'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    ...Platform.select({
      ios: { shadowColor: '#0f172a', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6 },
      android: { elevation: 3 }
    })
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1
  },
  storeBadgeCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4
  },
  storeTextContainer: {
    flex: 1
  },
  storeName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a'
  },
  ownerText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
    fontWeight: '500'
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 6
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40
  },
  connectionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  connIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  livePulse: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  connText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155'
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#f1f5f9'
  },
  refreshText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569'
  },
  switcherWrapper: {
    marginBottom: 16
  },
  switcherLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 6,
    letterSpacing: 0.5
  },
  switcherRow: {
    gap: 8
  },
  switchChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    gap: 6
  },
  switchChipActive: {
    borderColor: colors.primary,
    backgroundColor: '#f0fdf4'
  },
  switchIcon: {
    fontSize: 14
  },
  switchName: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#475569'
  },
  switchNameActive: {
    color: '#15803d',
    fontWeight: '700'
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18
  },
  statCard: {
    flex: 1,
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1.5
  },
  statIconBox: {
    marginBottom: 6
  },
  statVal: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.primaryDark
  },
  statLabel: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
    fontWeight: '500',
    textAlign: 'center'
  },
  addProdBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 14,
    marginBottom: 22,
    gap: 12,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6
  },
  addProdIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center'
  },
  addProdText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600'
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.3
  },
  orderCountBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  orderCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#15803d'
  },
  emptyBox: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 36,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a'
  },
  emptySub: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18
  },
  orderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: 'rgba(15, 23, 42, 0.06)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 4
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14
  },
  orderIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  orderId: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a'
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 3
  },
  typeBadgeText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#4338ca'
  },
  orderTime: {
    fontSize: 12.5,
    color: '#64748b',
    marginTop: 4,
    fontWeight: '500'
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3
  },
  itemsContainer: {
    backgroundColor: '#f8fafc',
    padding: 14,
    borderRadius: 14,
    marginBottom: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9'
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  itemQtyBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8
  },
  itemQtyText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563eb'
  },
  itemRowText: {
    flex: 1,
    fontSize: 13.5,
    color: '#1e293b',
    fontWeight: '500'
  },
  itemPrice: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0f172a'
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 14
  },
  totalLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500'
  },
  totalText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 2
  },
  btnRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center'
  },
  rejectSmallBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fca5a5',
    backgroundColor: '#fff1f2'
  },
  rejectSmallText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ef4444'
  },
  acceptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6
  },
  btnText: {
    color: '#ffffff',
    fontSize: 12.5,
    fontWeight: '700'
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10
  },
  completedText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#16a34a'
  },
  cancelledBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fef2f2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10
  },
  cancelledText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ef4444'
  }
});
