import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDelivery } from '../context/DeliveryContext';
import { colors } from '../theme/colors';

export const ActiveNavigationScreen = ({ navigation }) => {
  const { currentTask, updateTaskStatus, completeDelivery } = useDelivery();
  const [otpInput, setOtpInput] = useState('');

  if (!currentTask) {
    return (
      <View style={[styles.container, styles.center]}>
        <View style={styles.iconCircleWrapperLarge}>
          <Ionicons name="checkmark-circle-outline" size={64} color="#16a34a" />
        </View>
        <Text style={styles.emptyTitle}>No Active Delivery Assigned</Text>
        <Text style={styles.emptySub}>You are currently available for new orders.</Text>
        <TouchableOpacity style={styles.backBtnPill} onPress={() => navigation.navigate('Duty')} activeOpacity={0.8}>
          <Text style={styles.backBtnText}>Return to Duty Queue</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleArrivedVendor = () => {
    updateTaskStatus(currentTask.id, 'ARRIVED_AT_VENDOR');
  };

  const handlePickedUp = () => {
    updateTaskStatus(currentTask.id, 'OUT_FOR_DELIVERY');
  };

  const handleComplete = () => {
    if (otpInput !== currentTask.otpRequired) {
      Alert.alert('Invalid OTP', `Customer OTP should be ${currentTask.otpRequired} for demo.`);
      return;
    }
    completeDelivery(currentTask.id);
    Alert.alert('Delivery Completed!', `Payout of ₹${currentTask.estEarnings} added to today's earnings!`, [
      { text: 'Great!', onPress: () => navigation.navigate('Duty') }
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Live Trip: #{currentTask.id}</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{currentTask.status.replace(/_/g, ' ')}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Visual Simulated Route Map Box */}
        <View style={styles.mapSimulatedBox}>
          <View style={styles.mapPinRow}>
            <View style={styles.pinDotGreen} />
            <Text style={styles.mapPinText}>Vendor: {currentTask.pickupLocation}</Text>
          </View>
          <View style={styles.mapLine} />
          <View style={styles.mapPinRow}>
            <View style={styles.pinDotRed} />
            <Text style={styles.mapPinText}>Customer: {currentTask.customerName}</Text>
          </View>
          <View style={styles.navBarFooter}>
            <Ionicons name="compass-outline" size={18} color="#0284c7" />
            <Text style={styles.navText}>Estimated Distance: {currentTask.distanceKm} km • 12 Mins</Text>
          </View>
        </View>

        {/* Pickup Details */}
        <View style={styles.card}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Ionicons name="storefront" size={20} color="#f97316" />
            <Text style={styles.cardHeaderTitle}>PICKUP POINT</Text>
          </View>
          <Text style={styles.cardMainText}>{currentTask.pickupLocation}</Text>
          <Text style={styles.cardSubText}>{currentTask.pickupAddress}</Text>

          {currentTask.status === 'ASSIGNED' && (
            <TouchableOpacity style={styles.actionBtnPill} onPress={handleArrivedVendor} activeOpacity={0.85}>
              <Ionicons name="location-outline" size={20} color="#ffffff" />
              <Text style={styles.actionBtnText}>Confirm Arrived at Vendor</Text>
            </TouchableOpacity>
          )}

          {currentTask.status === 'ARRIVED_AT_VENDOR' && (
            <TouchableOpacity style={[styles.actionBtnPill, { backgroundColor: '#16a34a' }]} onPress={handlePickedUp} activeOpacity={0.85}>
              <Ionicons name="bag-check-outline" size={20} color="#ffffff" />
              <Text style={styles.actionBtnText}>Confirm Items Picked Up</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Customer Delivery Details */}
        <View style={styles.card}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Ionicons name="person" size={20} color="#0284c7" />
            <Text style={styles.cardHeaderTitle}>DELIVERY POINT</Text>
          </View>
          <Text style={styles.cardMainText}>{currentTask.customerName} ({currentTask.customerPhone})</Text>
          <Text style={styles.cardSubText}>{currentTask.deliveryAddress}</Text>

          <View style={styles.itemsBox}>
            <Text style={styles.itemsBoxTitle}>Items to Deliver ({currentTask.itemsCount}):</Text>
            {currentTask.items.map((item, idx) => (
              <Text key={idx} style={styles.itemText}>• {item}</Text>
            ))}
          </View>

          {currentTask.status === 'OUT_FOR_DELIVERY' && (
            <View style={styles.otpContainer}>
              <Text style={styles.otpLabel}>Ask Customer for 4-Digit Delivery OTP:</Text>
              <TextInput
                style={styles.otpInput}
                placeholder={`Demo OTP: ${currentTask.otpRequired}`}
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
                maxLength={4}
                value={otpInput}
                onChangeText={setOtpInput}
              />
              <TouchableOpacity style={styles.completeBtnPill} onPress={handleComplete} activeOpacity={0.85}>
                <Ionicons name="checkmark-done" size={20} color="#ffffff" />
                <Text style={styles.completeBtnText}>Verify OTP & Complete Delivery</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export const EarningsScreen = ({ navigation }) => {
  const { profile, weeklyEarningsHistory } = useDelivery();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitleLarge}>Payouts & Earnings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.payBoxGradient}>
          <Text style={styles.payLabel}>Total Earnings Today</Text>
          <Text style={styles.payAmount}>₹{profile.todayEarnings}</Text>
          <Text style={styles.paySub}>Scheduled for Wednesday Direct Settlement</Text>
        </View>

        <Text style={styles.sectionTitle}>Weekly Trip History</Text>
        {weeklyEarningsHistory.map((item, idx) => (
          <View key={idx} style={styles.earnCard}>
            <View style={styles.earnHeader}>
              <Text style={styles.earnDate}>{item.date}</Text>
              <View style={styles.earnStatusBadge}>
                <Text style={styles.earnStatus}>{item.status}</Text>
              </View>
            </View>
            <View style={styles.earnDetailsRow}>
              <Text style={styles.earnDetailText}>{item.trips} Trips Completed</Text>
              <Text style={styles.earnTotalText}>+₹{item.total}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  center: { justifyContent: 'center', alignItems: 'center', padding: 24 },
  iconCircleWrapperLarge: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#dcfce7', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#0f172a', marginTop: 12 },
  emptySub: { fontSize: 14, color: '#475569', marginTop: 6, marginBottom: 24, textAlign: 'center' },
  backBtnPill: { backgroundColor: '#0284c7', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 30 },
  backBtnText: { color: '#ffffff', fontWeight: '700', fontSize: 15 },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 16, 
    backgroundColor: '#ffffff', 
    borderBottomWidth: 1, 
    borderBottomColor: '#e2e8f0',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
      android: { elevation: 2 }
    })
  },
  iconBtn: { padding: 4 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  headerTitleLarge: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
  statusBadge: { backgroundColor: '#e0e7ff', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: '700', color: '#4338ca' },
  scrollContent: { padding: 20 },
  mapSimulatedBox: { 
    backgroundColor: '#ffffff', 
    borderRadius: 18, 
    padding: 20, 
    marginBottom: 20, 
    borderWidth: 1,
    borderColor: '#e2e8f0',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 8 },
      android: { elevation: 3 }
    })
  },
  mapPinRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 4 },
  pinDotGreen: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#16a34a' },
  pinDotRed: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#ef4444' },
  mapPinText: { fontSize: 14, fontWeight: '700', color: '#0f172a' },
  mapLine: { width: 2, height: 24, backgroundColor: '#cbd5e1', marginLeft: 6 },
  navBarFooter: { flexDirection: 'row', alignItems: 'center', gap: 8, borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 14, marginTop: 14 },
  navText: { fontSize: 13, fontWeight: '600', color: '#475569' },
  card: { 
    backgroundColor: '#ffffff', 
    borderRadius: 18, 
    padding: 20, 
    marginBottom: 16, 
    borderWidth: 1,
    borderColor: '#e2e8f0',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 8 },
      android: { elevation: 3 }
    })
  },
  cardHeaderTitle: { fontSize: 11, fontWeight: '800', color: '#64748b', letterSpacing: 1 },
  cardMainText: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginTop: 4 },
  cardSubText: { fontSize: 13, color: '#475569', marginTop: 4, lineHeight: 18 },
  actionBtnPill: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0284c7', borderRadius: 30, paddingVertical: 14, marginTop: 20, gap: 8 },
  actionBtnText: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
  itemsBox: { backgroundColor: '#f8fafc', padding: 14, borderRadius: 12, marginTop: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  itemsBoxTitle: { fontSize: 13, fontWeight: '700', color: '#0f172a', marginBottom: 6 },
  itemText: { fontSize: 13, color: '#475569', marginBottom: 4, fontWeight: '500' },
  otpContainer: { marginTop: 20, borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 16 },
  otpLabel: { fontSize: 14, fontWeight: '700', color: '#0f172a', marginBottom: 10 },
  otpInput: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 12, padding: 14, fontSize: 18, color: '#0f172a', marginBottom: 16, textAlign: 'center', letterSpacing: 4, fontWeight: '700' },
  completeBtnPill: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#16a34a', borderRadius: 30, paddingVertical: 14, gap: 8 },
  completeBtnText: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
  payBoxGradient: { backgroundColor: '#0f172a', padding: 24, borderRadius: 20, marginBottom: 24, alignItems: 'center' },
  payLabel: { fontSize: 13, color: '#94a3b8', fontWeight: '600' },
  payAmount: { fontSize: 36, fontWeight: '800', color: '#ffffff', marginTop: 8 },
  paySub: { fontSize: 12, color: '#cbd5e1', marginTop: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 16 },
  earnCard: { backgroundColor: '#ffffff', padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0', ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 4 }, android: { elevation: 1 } }) },
  earnHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  earnDate: { fontSize: 14, fontWeight: '700', color: '#0f172a' },
  earnStatusBadge: { backgroundColor: '#dcfce7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  earnStatus: { fontSize: 11, fontWeight: '800', color: '#15803d' },
  earnDetailsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, alignItems: 'center' },
  earnDetailText: { fontSize: 13, color: '#475569', fontWeight: '500' },
  earnTotalText: { fontSize: 16, fontWeight: '800', color: '#0f172a' }
});
