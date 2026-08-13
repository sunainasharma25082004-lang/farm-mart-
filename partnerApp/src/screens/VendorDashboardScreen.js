import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePartner } from '../context/PartnerContext';
import { colors } from '../theme/colors';

export const VendorDashboardScreen = ({ navigation }) => {
  const { vendor, toggleStoreStatus, orders, updateOrderStatus } = usePartner();

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
            <Text style={styles.storeName} numberOfLines={1}>{vendor.storeName}</Text>
            <Text style={styles.ownerText}>👨‍🍳 {vendor.ownerName}</Text>
          </View>
        </View>

        <View style={styles.statusBox}>
          <View style={[styles.statusDot, { backgroundColor: vendor.isStoreOpen ? '#10b981' : '#ef4444' }]} />
          <Text style={[styles.statusText, { color: vendor.isStoreOpen ? '#15803d' : '#b91c1c' }]}>
            {vendor.isStoreOpen ? 'STORE OPEN' : 'CLOSED'}
          </Text>
          <Switch
            value={vendor.isStoreOpen}
            onValueChange={toggleStoreStatus}
            trackColor={{ false: '#cbd5e1', true: '#bbf7d0' }}
            thumbColor={vendor.isStoreOpen ? '#16a34a' : '#94a3b8'}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Store Welcome Banner */}
        <View style={styles.bannerCard}>
          <View style={styles.bannerContent}>
            <Text style={styles.bannerTag}>PARTNER DASHBOARD</Text>
            <Text style={styles.bannerTitle}>Manage Produce & Live Orders 🌾</Text>
            <Text style={styles.bannerSub}>Accept incoming customer requests and dispatch for quick delivery.</Text>
          </View>
        </View>

        {/* Quick Metrics Grid */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }]}>
            <View style={styles.statIconBox}>
              <Ionicons name="wallet-outline" size={18} color="#16a34a" />
            </View>
            <Text style={styles.statVal}>₹{vendor.wednesdaySettlement}</Text>
            <Text style={styles.statLabel}>Wed Settlement</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }]}>
            <View style={styles.statIconBox}>
              <Ionicons name="receipt-outline" size={18} color="#2563eb" />
            </View>
            <Text style={[styles.statVal, { color: '#1d4ed8' }]}>{orders.length}</Text>
            <Text style={styles.statLabel}>Active Orders</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#fffbeb', borderColor: '#fde68a' }]}>
            <View style={styles.statIconBox}>
              <Ionicons name="star" size={18} color="#d97706" />
            </View>
            <Text style={[styles.statVal, { color: '#b45309' }]}>★ {vendor.rating}</Text>
            <Text style={styles.statLabel}>Rating</Text>
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
          <Text style={styles.addProdText}>Add New Product / Produce</Text>
          <Ionicons name="chevron-forward" size={18} color="#ffffff" style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>

        {/* Incoming Customer Orders Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Incoming Customer Orders</Text>
          <View style={styles.orderCountBadge}>
            <Text style={styles.orderCountText}>{orders.length} Live</Text>
          </View>
        </View>

        {orders.length === 0 ? (
          <View style={styles.emptyBox}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="receipt-outline" size={38} color="#94a3b8" />
            </View>
            <Text style={styles.emptyTitle}>No Orders Pending</Text>
            <Text style={styles.emptySub}>When customers order from your store, they will appear here in real time.</Text>
          </View>
        ) : (
          orders.map((order) => {
            const isNew = order.status === 'NEW_ORDER';
            const isAccepted = order.status === 'ACCEPTED';

            return (
              <View key={order.id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <View>
                    <View style={styles.orderIdRow}>
                      <Text style={styles.orderId}>#{order.id}</Text>
                      <View style={styles.typeBadge}>
                        <Ionicons name="flash-outline" size={11} color="#6366f1" />
                        <Text style={styles.typeBadgeText}>Express</Text>
                      </View>
                    </View>
                    <Text style={styles.orderTime}>⏰ {order.time} • 👤 {order.customerName}</Text>
                  </View>

                  <View
                    style={[
                      styles.statusPill,
                      {
                        backgroundColor: isNew ? '#fef3c7' : isAccepted ? '#e0e7ff' : '#dcfce7',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusPillText,
                        {
                          color: isNew ? '#b45309' : isAccepted ? '#4338ca' : '#15803d',
                        },
                      ]}
                    >
                      {order.status.replace(/_/g, ' ')}
                    </Text>
                  </View>
                </View>

                {/* Items Box */}
                <View style={styles.itemsContainer}>
                  {order.items.map((item, idx) => (
                    <View key={idx} style={styles.itemRow}>
                      <View style={styles.itemQtyBadge}>
                        <Text style={styles.itemQtyText}>{item.qty}x</Text>
                      </View>
                      <Text style={styles.itemRowText} numberOfLines={1}>{item.name}</Text>
                      <Text style={styles.itemPrice}>₹{item.price * item.qty}</Text>
                    </View>
                  ))}
                </View>

                {/* Order Footer */}
                <View style={styles.orderFooter}>
                  <View>
                    <Text style={styles.totalLabel}>Total Payout</Text>
                    <Text style={styles.totalText}>₹{order.total}</Text>
                  </View>

                  {isNew && (
                    <TouchableOpacity
                      style={styles.acceptBtn}
                      onPress={() => updateOrderStatus(order.id, 'ACCEPTED')}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.btnText}>Accept Order</Text>
                      <Ionicons name="checkmark-circle" size={18} color="#ffffff" />
                    </TouchableOpacity>
                  )}

                  {isAccepted && (
                    <TouchableOpacity
                      style={[styles.acceptBtn, { backgroundColor: '#ea580c' }]}
                      onPress={() => updateOrderStatus(order.id, 'READY_FOR_RIDER')}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.btnText}>Ready for Rider</Text>
                      <Ionicons name="bicycle" size={18} color="#ffffff" />
                    </TouchableOpacity>
                  )}
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
    backgroundColor: '#f8fafc',
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
      android: { elevation: 3 },
    }),
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
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
    elevation: 4,
  },
  storeTextContainer: {
    flex: 1,
  },
  storeName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0f172a',
    letterSpacing: -0.2,
  },
  ownerText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
    fontWeight: '500',
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.4,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  bannerCard: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    padding: 20,
    marginBottom: 18,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  bannerContent: {
    gap: 4,
  },
  bannerTag: {
    fontSize: 11,
    fontWeight: '500',
    color: '#10b981',
    letterSpacing: 1,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#ffffff',
    marginTop: 2,
  },
  bannerSub: {
    fontSize: 12.5,
    color: '#94a3b8',
    lineHeight: 18,
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  statCard: {
    flex: 1,
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  statIconBox: {
    marginBottom: 6,
  },
  statVal: {
    fontSize: 17,
    fontWeight: '500',
    color: colors.primaryDark,
  },
  statLabel: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
    fontWeight: '500',
    textAlign: 'center',
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
    elevation: 6,
  },
  addProdIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addProdText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#0f172a',
    letterSpacing: -0.3,
  },
  orderCountBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  orderCountText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#15803d',
  },
  emptyBox: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 36,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0f172a',
  },
  emptySub: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
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
    elevation: 4,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  orderIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0f172a',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 3,
  },
  typeBadgeText: {
    fontSize: 10.5,
    fontWeight: '500',
    color: '#4338ca',
  },
  orderTime: {
    fontSize: 12.5,
    color: '#64748b',
    marginTop: 4,
    fontWeight: '500',
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  itemsContainer: {
    backgroundColor: '#f8fafc',
    padding: 14,
    borderRadius: 14,
    marginBottom: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemQtyBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  itemQtyText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#15803d',
  },
  itemRowText: {
    flex: 1,
    fontSize: 13.5,
    color: '#1e293b',
    fontWeight: '500',
  },
  itemPrice: {
    fontSize: 13.5,
    fontWeight: '500',
    color: '#0f172a',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 14,
  },
  totalLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
  },
  totalText: {
    fontSize: 19,
    fontWeight: '500',
    color: '#0f172a',
    marginTop: 2,
  },
  acceptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 11,
    gap: 6,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  btnText: {
    color: '#ffffff',
    fontSize: 13.5,
    fontWeight: '500',
  },
});

