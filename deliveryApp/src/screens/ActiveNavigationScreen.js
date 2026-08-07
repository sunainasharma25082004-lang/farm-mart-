import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDelivery } from '../context/DeliveryContext';
import { colors } from '../theme/colors';

export const ActiveNavigationScreen = ({ navigation }) => {
  const { currentTask, updateTaskStatus, completeDelivery } = useDelivery();
  const [otpInput, setOtpInput] = useState('');

  if (!currentTask) {
    return (
      <View style={[styles.container, styles.center]}>
        <Ionicons name="checkmark-circle-outline" size={54} color={colors.secondary} />
        <Text style={styles.emptyTitle}>No Active Delivery Assigned</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('Duty')}>
          <Text style={styles.backBtnText}>Return to Duty Queue</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleArrivedVendor = () => {
    updateTaskStatus(currentTask.id, 'ARRIVED_AT_VENDOR');
    Alert.alert('Status Updated', 'Arrived at vendor location.');
  };

  const handlePickedUp = () => {
    updateTaskStatus(currentTask.id, 'OUT_FOR_DELIVERY');
    Alert.alert('Order Picked Up!', 'Proceed to customer delivery address.');
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
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Live Trip Route ({currentTask.id})</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{currentTask.status.replace(/_/g, ' ')}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
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
            <Ionicons name="compass-outline" size={16} color={colors.primary} />
            <Text style={styles.navText}>Estimated Distance: {currentTask.distanceKm} km • 12 Mins</Text>
          </View>
        </View>

        {/* Pickup Details */}
        <View style={styles.card}>
          <Text style={styles.cardHeaderTitle}>Pickup Point</Text>
          <Text style={styles.cardMainText}>{currentTask.pickupLocation}</Text>
          <Text style={styles.cardSubText}>{currentTask.pickupAddress}</Text>

          {currentTask.status === 'ASSIGNED' && (
            <TouchableOpacity style={styles.actionBtn} onPress={handleArrivedVendor}>
              <Ionicons name="pin-outline" size={18} color="#ffffff" />
              <Text style={styles.actionBtnText}>Confirm Arrived at Vendor</Text>
            </TouchableOpacity>
          )}

          {currentTask.status === 'ARRIVED_AT_VENDOR' && (
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.secondary }]} onPress={handlePickedUp}>
              <Ionicons name="bag-check-outline" size={18} color="#ffffff" />
              <Text style={styles.actionBtnText}>Confirm Items Picked Up</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Customer Delivery Details */}
        <View style={styles.card}>
          <Text style={styles.cardHeaderTitle}>Delivery Point</Text>
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
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                maxLength={4}
                value={otpInput}
                onChangeText={setOtpInput}
              />
              <TouchableOpacity style={styles.completeBtn} onPress={handleComplete}>
                <Ionicons name="checkmark-done" size={18} color="#ffffff" />
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
        <Text style={styles.headerTitle}>Rider Earnings & Wednesday Payouts</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.payBox}>
          <Text style={styles.payLabel}>Total Earnings Today</Text>
          <Text style={styles.payAmount}>₹{profile.todayEarnings}</Text>
          <Text style={styles.paySub}>Scheduled for Wednesday Direct Settlement</Text>
        </View>

        <Text style={styles.sectionTitle}>Weekly Delivery Trip History</Text>
        {weeklyEarningsHistory.map((item, idx) => (
          <View key={idx} style={styles.earnCard}>
            <View style={styles.earnHeader}>
              <Text style={styles.earnDate}>{item.date}</Text>
              <Text style={styles.earnStatus}>{item.status}</Text>
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
  container: { flex: 1, backgroundColor: colors.background },
  center: { justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: colors.textPrimary, marginTop: 12 },
  backBtn: { backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, marginTop: 16 },
  backBtnText: { color: '#ffffff', fontWeight: '800' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerTitle: { fontSize: 15, fontWeight: '800', color: colors.textPrimary },
  statusBadge: { backgroundColor: colors.primaryLight, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: '800', color: colors.primaryDark },
  scrollContent: { padding: 16 },
  mapSimulatedBox: { backgroundColor: colors.card, borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: colors.border },
  mapPinRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 4 },
  pinDotGreen: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.secondary },
  pinDotRed: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.error },
  mapPinText: { fontSize: 13, fontWeight: '700', color: colors.textPrimary },
  mapLine: { width: 2, height: 20, backgroundColor: colors.border, marginLeft: 5 },
  navBarFooter: { flexDirection: 'row', alignItems: 'center', gap: 6, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10, marginTop: 10 },
  navText: { fontSize: 11, fontWeight: '700', color: colors.textSecondary },
  card: { backgroundColor: colors.card, borderRadius: 16, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: colors.border },
  cardHeaderTitle: { fontSize: 10, fontWeight: '800', color: colors.textMuted, letterSpacing: 0.5 },
  cardMainText: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, marginTop: 4 },
  cardSubText: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, borderRadius: 10, paddingVertical: 10, marginTop: 12, gap: 6 },
  actionBtnText: { color: '#ffffff', fontSize: 13, fontWeight: '800' },
  itemsBox: { backgroundColor: colors.cardLight, padding: 10, borderRadius: 10, marginTop: 10 },
  itemsBoxTitle: { fontSize: 11, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 },
  itemText: { fontSize: 11, color: colors.textSecondary },
  otpContainer: { marginTop: 14, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12 },
  otpLabel: { fontSize: 12, fontWeight: '700', color: colors.textPrimary, marginBottom: 6 },
  otpInput: { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 10, fontSize: 14, color: colors.textPrimary, marginBottom: 10, textAlign: 'center', letterSpacing: 2 },
  completeBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.secondary, borderRadius: 10, paddingVertical: 12, gap: 6 },
  completeBtnText: { color: '#ffffff', fontSize: 13, fontWeight: '800' },
  payBox: { backgroundColor: colors.primaryDark, padding: 16, borderRadius: 16, marginBottom: 16, alignItems: 'center' },
  payLabel: { fontSize: 12, color: '#e0f2fe' },
  payAmount: { fontSize: 28, fontWeight: '800', color: '#ffffff', marginTop: 4 },
  paySub: { fontSize: 10, color: '#bae6fd', marginTop: 4 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: colors.textPrimary, marginBottom: 12 },
  earnCard: { backgroundColor: colors.card, padding: 12, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: colors.border },
  earnHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  earnDate: { fontSize: 13, fontWeight: '700', color: colors.textPrimary },
  earnStatus: { fontSize: 10, fontWeight: '800', color: colors.secondary },
  earnDetailsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  earnDetailText: { fontSize: 11, color: colors.textSecondary },
  earnTotalText: { fontSize: 13, fontWeight: '800', color: colors.textPrimary }
});
