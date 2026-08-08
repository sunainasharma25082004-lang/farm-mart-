import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePartner } from '../context/PartnerContext';
import { colors } from '../theme/colors';

export const VendorDashboardScreen = ({ navigation }) => {
  const { vendor, toggleStoreStatus, orders, updateOrderStatus } = usePartner();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.storeBadge}>
            <Ionicons name="storefront" size={24} color="#ffffff" />
          </View>
          <View>
            <Text style={styles.storeName}>{vendor.storeName}</Text>
            <Text style={styles.ownerText}>{vendor.ownerName}</Text>
          </View>
        </View>

        <View style={styles.statusBox}>
          <Text style={[styles.statusText, { color: vendor.isStoreOpen ? '#10b981' : colors.error }]}>
            {vendor.isStoreOpen ? 'STORE OPEN' : 'CLOSED'}
          </Text>
          <Switch
            value={vendor.isStoreOpen}
            onValueChange={toggleStoreStatus}
            trackColor={{ false: '#e2e8f0', true: '#10b981' }}
            thumbColor="#ffffff"
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Quick Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statVal}>₹{vendor.wednesdaySettlement}</Text>
            <Text style={styles.statLabel}>Wed Settlement</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statVal}>{orders.length}</Text>
            <Text style={styles.statLabel}>Active Orders</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statVal}>★ {vendor.rating}</Text>
            <Text style={styles.statLabel}>Customer Rating</Text>
          </View>
        </View>

        {/* Quick Action Button */}
        <TouchableOpacity
          style={styles.addProdBtn}
          onPress={() => navigation.navigate('AddProduct')}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={24} color="#ffffff" />
          <Text style={styles.addProdText}>Add New Product / Produce</Text>
        </TouchableOpacity>

        {/* Incoming Customer Orders */}
        <Text style={styles.sectionTitle}>Incoming Customer Orders</Text>
        {orders.length === 0 ? (
           <View style={{ alignItems: 'center', padding: 40 }}>
             <Ionicons name="receipt-outline" size={48} color={colors.textMuted} />
             <Text style={{ marginTop: 12, color: colors.textSecondary, fontWeight: '500' }}>No active orders at the moment.</Text>
           </View>
        ) : (
          orders.map((order) => (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <View>
                  <Text style={styles.orderId}>Order #{order.id}</Text>
                  <Text style={styles.orderTime}>{order.time} • {order.customerName}</Text>
                </View>
                <View style={[styles.statusPill, { backgroundColor: order.status === 'NEW_ORDER' ? '#fef3c7' : '#e0e7ff' }]}>
                  <Text style={[styles.statusPillText, { color: order.status === 'NEW_ORDER' ? '#d97706' : '#4338ca' }]}>
                    {order.status.replace(/_/g, ' ')}
                  </Text>
                </View>
              </View>

              <View style={styles.itemsContainer}>
                {order.items.map((item, idx) => (
                  <View key={idx} style={styles.itemRow}>
                    <Text style={styles.itemRowText}>
                      <Text style={{ fontWeight: '600', color: colors.primary }}>{item.qty}x</Text> {item.name}
                    </Text>
                    <Text style={styles.itemPrice}>₹{item.price * item.qty}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.orderFooter}>
                <View>
                  <Text style={styles.totalLabel}>Total Amount</Text>
                  <Text style={styles.totalText}>₹{order.total}</Text>
                </View>

                {order.status === 'NEW_ORDER' && (
                  <TouchableOpacity
                    style={styles.acceptBtn}
                    onPress={() => updateOrderStatus(order.id, 'ACCEPTED')}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.btnText}>Accept Order</Text>
                    <Ionicons name="arrow-forward" size={16} color="#ffffff" />
                  </TouchableOpacity>
                )}

                {order.status === 'ACCEPTED' && (
                  <TouchableOpacity
                    style={[styles.acceptBtn, { backgroundColor: colors.accent }]}
                    onPress={() => updateOrderStatus(order.id, 'READY_FOR_RIDER')}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.btnText}>Ready for Rider</Text>
                    <Ionicons name="checkmark-done" size={16} color="#ffffff" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
      android: { elevation: 2 }
    })
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  storeBadge: { width: 44, height: 44, borderRadius: 12, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  storeName: { fontSize: 16, fontWeight: '600', color: colors.textPrimary },
  ownerText: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  statusBox: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 8 },
      android: { elevation: 3 }
    })
  },
  statVal: { fontSize: 18, fontWeight: '700', color: colors.primaryDark },
  statLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 4, textAlign: 'center', fontWeight: '500' },
  addProdBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 30, // pill shape
    paddingVertical: 16,
    marginBottom: 24,
    gap: 8,
    ...Platform.select({
      ios: { shadowColor: '#0f172a', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
      android: { elevation: 4 }
    })
  },
  addProdText: { color: '#ffffff', fontSize: 15, fontWeight: '600' },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: colors.textPrimary, marginBottom: 16 },
  orderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 8 },
      android: { elevation: 3 }
    })
  },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  orderId: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  orderTime: { fontSize: 12, color: colors.textSecondary, marginTop: 4, fontWeight: '500' },
  statusPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statusPillText: { fontSize: 11, fontWeight: '700' },
  itemsContainer: { backgroundColor: '#f8fafc', padding: 16, borderRadius: 12, marginBottom: 16 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  itemRowText: { fontSize: 13, color: colors.textPrimary },
  itemPrice: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 16
  },
  totalLabel: { fontSize: 11, color: colors.textSecondary, fontWeight: '500' },
  totalText: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginTop: 2 },
  acceptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 30, // pill
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8
  },
  btnText: { color: '#ffffff', fontSize: 13, fontWeight: '600' }
});
