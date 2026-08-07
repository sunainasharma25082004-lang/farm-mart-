import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
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
            <Ionicons name="storefront-outline" size={20} color="#ffffff" />
          </View>
          <View>
            <Text style={styles.storeName}>{vendor.storeName}</Text>
            <Text style={styles.ownerText}>{vendor.ownerName}</Text>
          </View>
        </View>

        <View style={styles.statusBox}>
          <Text style={[styles.statusText, { color: vendor.isStoreOpen ? colors.secondary : colors.error }]}>
            {vendor.isStoreOpen ? 'STORE OPEN' : 'CLOSED'}
          </Text>
          <Switch
            value={vendor.isStoreOpen}
            onValueChange={toggleStoreStatus}
            trackColor={{ false: '#cbd5e1', true: '#16a34a' }}
            thumbColor="#ffffff"
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Quick Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statVal}>₹{vendor.wednesdaySettlement}</Text>
            <Text style={styles.statLabel}>Wed Settlement</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statVal}>{orders.length}</Text>
            <Text style={styles.statLabel}>Active Customer Orders</Text>
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
          <Ionicons name="add-circle-outline" size={20} color="#ffffff" />
          <Text style={styles.addProdText}>Add New Product / Dish / Produce</Text>
        </TouchableOpacity>

        {/* Incoming Customer Orders */}
        <Text style={styles.sectionTitle}>Incoming Customer Orders</Text>
        {orders.map((order) => (
          <View key={order.id} style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <View>
                <Text style={styles.orderId}>{order.id}</Text>
                <Text style={styles.orderTime}>{order.time} • {order.customerName}</Text>
              </View>
              <View style={styles.statusPill}>
                <Text style={styles.statusPillText}>{order.status.replace(/_/g, ' ')}</Text>
              </View>
            </View>

            <View style={styles.itemsContainer}>
              {order.items.map((item, idx) => (
                <Text key={idx} style={styles.itemRowText}>
                  • {item.name} x {item.qty} (₹{item.price * item.qty})
                </Text>
              ))}
            </View>

            <View style={styles.orderFooter}>
              <Text style={styles.totalText}>Order Amount: ₹{order.total}</Text>

              {order.status === 'NEW_ORDER' && (
                <TouchableOpacity
                  style={styles.acceptBtn}
                  onPress={() => updateOrderStatus(order.id, 'ACCEPTED')}
                >
                  <Ionicons name="checkmark-circle-outline" size={16} color="#ffffff" />
                  <Text style={styles.btnText}>Accept Order</Text>
                </TouchableOpacity>
              )}

              {order.status === 'ACCEPTED' && (
                <TouchableOpacity
                  style={[styles.acceptBtn, { backgroundColor: colors.accent }]}
                  onPress={() => updateOrderStatus(order.id, 'READY_FOR_RIDER')}
                >
                  <Ionicons name="bag-handle-outline" size={16} color="#ffffff" />
                  <Text style={styles.btnText}>Mark Ready for Rider</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  storeBadge: { width: 38, height: 38, borderRadius: 10, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  storeName: { fontSize: 15, fontWeight: '800', color: colors.textPrimary },
  ownerText: { fontSize: 11, color: colors.textSecondary },
  statusBox: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  scrollContent: { padding: 16, paddingBottom: 24 },
  statsGrid: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border
  },
  statVal: { fontSize: 15, fontWeight: '800', color: colors.primaryDark },
  statLabel: { fontSize: 10, color: colors.textSecondary, marginTop: 2, textAlign: 'center' },
  addProdBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 12,
    gap: 8,
    marginBottom: 16
  },
  addProdText: { color: '#ffffff', fontSize: 14, fontWeight: '800' },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: colors.textPrimary, marginBottom: 10 },
  orderCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border
  },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderId: { fontSize: 14, fontWeight: '800', color: colors.textPrimary },
  orderTime: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  statusPill: { backgroundColor: colors.primaryLight, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusPillText: { fontSize: 10, fontWeight: '800', color: colors.primaryDark },
  itemsContainer: { backgroundColor: colors.background, padding: 10, borderRadius: 10, marginVertical: 10 },
  itemRowText: { fontSize: 12, color: colors.textPrimary, marginBottom: 2 },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10 },
  totalText: { fontSize: 13, fontWeight: '800', color: colors.textPrimary },
  acceptBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.secondary, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, gap: 4 },
  btnText: { color: '#ffffff', fontSize: 12, fontWeight: '800' }
});
