import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDelivery } from '../context/DeliveryContext';
import { colors } from '../theme/colors';

export const ActiveNavigationScreen = ({ navigation }) => {
  const { currentTask, updateTaskStatus, completeDelivery } = useDelivery();
  const [otpInput, setOtpInput] = useState('');

  if (!currentTask) {
    return (
      <View style={[styles.container, styles.center]}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.iconCircleWrapperLarge}>
          <Ionicons name="checkmark-circle" size={54} color="#16a34a" />
        </View>
        <Text style={styles.emptyTitle}>No Active Trip in Progress</Text>
        <Text style={styles.emptySub}>You're ready to pick up your next delivery order.</Text>
        <TouchableOpacity
          style={styles.backBtnPill}
          onPress={() => navigation.navigate('Duty')}
          activeOpacity={0.85}
        >
          <Text style={styles.backBtnText}>Return to Duty Queue</Text>
          <Ionicons name="arrow-forward" size={16} color="#ffffff" />
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
    Alert.alert('Delivery Completed! 🎉', `Payout of ₹${currentTask.estEarnings} added to today's earnings!`, [
      { text: 'Great!', onPress: () => navigation.navigate('Duty') },
    ]);
  };

  const isAssigned = currentTask.status === 'ASSIGNED';
  const isArrived = currentTask.status === 'ARRIVED_AT_VENDOR';
  const isOutForDelivery = currentTask.status === 'OUT_FOR_DELIVERY';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.iconBtnCircle}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color="#0f172a" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Live Trip #{currentTask.id}</Text>

        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{currentTask.status.replace(/_/g, ' ')}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Visual Simulated Route Map Box */}
        <View style={styles.mapSimulatedBox}>
          <View style={styles.mapHeaderRow}>
            <Ionicons name="navigate" size={18} color="#0284c7" />
            <Text style={styles.mapHeaderTitle}>LIVE GPS ROUTE NAVIGATION</Text>
          </View>

          <View style={styles.mapPinsContainer}>
            <View style={styles.mapPinRow}>
              <View style={styles.pinDotGreen} />
              <View style={{ flex: 1 }}>
                <Text style={styles.mapPinLabel}>VENDOR PICKUP</Text>
                <Text style={styles.mapPinText}>{currentTask.pickupLocation}</Text>
              </View>
            </View>

            <View style={styles.mapLine} />

            <View style={styles.mapPinRow}>
              <View style={styles.pinDotRed} />
              <View style={{ flex: 1 }}>
                <Text style={styles.mapPinLabel}>CUSTOMER DESTINATION</Text>
                <Text style={styles.mapPinText}>{currentTask.customerName}</Text>
              </View>
            </View>
          </View>

          <View style={styles.navBarFooter}>
            <Ionicons name="compass-outline" size={18} color="#0284c7" />
            <Text style={styles.navText}>Estimated Distance: <Text style={{ color: '#0f172a', fontWeight: '500' }}>{currentTask.distanceKm} km</Text> • ~12 Mins ETA</Text>
          </View>
        </View>

        {/* Pickup Details Card */}
        <View style={styles.card}>
          <View style={styles.cardTagHeader}>
            <Ionicons name="storefront" size={18} color="#ea580c" />
            <Text style={[styles.cardHeaderTitle, { color: '#ea580c' }]}>PICKUP LOCATION</Text>
          </View>
          <Text style={styles.cardMainText}>{currentTask.pickupLocation}</Text>
          <Text style={styles.cardSubText}>{currentTask.pickupAddress}</Text>

          {isAssigned && (
            <TouchableOpacity style={styles.actionBtnPill} onPress={handleArrivedVendor} activeOpacity={0.85}>
              <Ionicons name="location-outline" size={18} color="#ffffff" />
              <Text style={styles.actionBtnText}>Confirm Arrived at Vendor</Text>
            </TouchableOpacity>
          )}

          {isArrived && (
            <TouchableOpacity style={[styles.actionBtnPill, { backgroundColor: '#16a34a' }]} onPress={handlePickedUp} activeOpacity={0.85}>
              <Ionicons name="bag-check-outline" size={18} color="#ffffff" />
              <Text style={styles.actionBtnText}>Confirm Items Picked Up</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Customer Delivery Details Card */}
        <View style={styles.card}>
          <View style={styles.cardTagHeader}>
            <Ionicons name="person" size={18} color="#0284c7" />
            <Text style={[styles.cardHeaderTitle, { color: '#0284c7' }]}>DELIVERY DESTINATION</Text>
          </View>
          <Text style={styles.cardMainText}>{currentTask.customerName} ({currentTask.customerPhone})</Text>
          <Text style={styles.cardSubText}>{currentTask.deliveryAddress}</Text>

          {/* Items Checklist */}
          <View style={styles.itemsBox}>
            <Text style={styles.itemsBoxTitle}>Items to Deliver ({currentTask.itemsCount}):</Text>
            {currentTask.items.map((item, idx) => (
              <View key={idx} style={styles.itemCheckRow}>
                <Ionicons name="checkmark-circle-outline" size={15} color="#16a34a" />
                <Text style={styles.itemText}>{item}</Text>
              </View>
            ))}
          </View>

          {isOutForDelivery && (
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
                <Ionicons name="checkmark-done-circle" size={20} color="#ffffff" />
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
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <View style={styles.header}>
        <Text style={styles.headerTitleLarge}>Payouts & Earnings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Dark Hero Pay Card */}
        <View style={styles.payBoxGradient}>
          <Text style={styles.payLabel}>TODAY'S TOTAL PAYOUT</Text>
          <Text style={styles.payAmount}>₹{profile.todayEarnings}</Text>
          <View style={styles.settleBadgeRow}>
            <Ionicons name="shield-checkmark" size={14} color="#10b981" />
            <Text style={styles.paySub}>Scheduled for Wednesday Direct Settlement</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Weekly Trip History</Text>
        {weeklyEarningsHistory.map((item, idx) => (
          <View key={idx} style={styles.earnCard}>
            <View style={styles.earnHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="calendar-outline" size={18} color="#0284c7" />
                <Text style={styles.earnDate}>{item.date}</Text>
              </View>
              <View style={styles.earnStatusBadge}>
                <Text style={styles.earnStatus}>{item.status}</Text>
              </View>
            </View>
            <View style={styles.earnDetailsRow}>
              <Text style={styles.earnDetailText}>🛵 {item.trips} Trips Completed</Text>
              <Text style={styles.earnTotalText}>+₹{item.total}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#ffffff',
  },
  iconCircleWrapperLarge: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: '#0f172a',
    marginTop: 8,
  },
  emptySub: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 6,
    marginBottom: 24,
    textAlign: 'center',
  },
  backBtnPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0284c7',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 20,
    gap: 8,
    shadowColor: '#0284c7',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  backBtnText: {
    color: '#ffffff',
    fontWeight: '500',
    fontSize: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    ...Platform.select({
      ios: { shadowColor: '#0f172a', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6 },
      android: { elevation: 3 },
    }),
  },
  iconBtnCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0f172a',
  },
  headerTitleLarge: {
    fontSize: 20,
    fontWeight: '500',
    color: '#0f172a',
  },
  statusBadge: {
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#4338ca',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  mapSimulatedBox: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 20,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: 'rgba(15, 23, 42, 0.06)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 4,
  },
  mapHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  mapHeaderTitle: {
    fontSize: 11,
    fontWeight: '500',
    color: '#0284c7',
    letterSpacing: 1,
  },
  mapPinsContainer: {
    gap: 2,
  },
  mapPinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 4,
  },
  pinDotGreen: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#16a34a',
  },
  pinDotRed: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#ef4444',
  },
  mapPinLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: '#64748b',
    letterSpacing: 0.5,
  },
  mapPinText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0f172a',
    marginTop: 1,
  },
  mapLine: {
    width: 2,
    height: 20,
    backgroundColor: '#cbd5e1',
    marginLeft: 6,
  },
  navBarFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 14,
    marginTop: 14,
  },
  navText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#475569',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: 'rgba(15, 23, 42, 0.06)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 4,
  },
  cardTagHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  cardHeaderTitle: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 1,
  },
  cardMainText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0f172a',
    marginTop: 2,
  },
  cardSubText: {
    fontSize: 13,
    color: '#475569',
    marginTop: 4,
    lineHeight: 18,
  },
  actionBtnPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0284c7',
    borderRadius: 16,
    height: 52,
    marginTop: 18,
    gap: 8,
    shadowColor: '#0284c7',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 14.5,
    fontWeight: '500',
  },
  itemsBox: {
    backgroundColor: '#f8fafc',
    padding: 14,
    borderRadius: 14,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 6,
  },
  itemsBoxTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#0f172a',
    marginBottom: 4,
  },
  itemCheckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  itemText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '500',
  },
  otpContainer: {
    marginTop: 18,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 16,
  },
  otpLabel: {
    fontSize: 13.5,
    fontWeight: '500',
    color: '#0f172a',
    marginBottom: 10,
  },
  otpInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#0284c7',
    borderRadius: 14,
    padding: 12,
    fontSize: 20,
    color: '#0f172a',
    marginBottom: 14,
    textAlign: 'center',
    letterSpacing: 6,
    fontWeight: '500',
  },
  completeBtnPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16a34a',
    borderRadius: 16,
    height: 52,
    gap: 8,
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  completeBtnText: {
    color: '#ffffff',
    fontSize: 14.5,
    fontWeight: '500',
  },
  payBoxGradient: {
    backgroundColor: '#0f172a',
    padding: 24,
    borderRadius: 22,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  payLabel: {
    fontSize: 11,
    color: '#10b981',
    fontWeight: '500',
    letterSpacing: 1,
  },
  payAmount: {
    fontSize: 38,
    fontWeight: '500',
    color: '#ffffff',
    marginTop: 6,
  },
  settleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  paySub: {
    fontSize: 12,
    color: '#cbd5e1',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '500',
    color: '#0f172a',
    marginBottom: 14,
  },
  earnCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  earnHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  earnDate: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0f172a',
  },
  earnStatusBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 8,
  },
  earnStatus: {
    fontSize: 11,
    fontWeight: '500',
    color: '#15803d',
  },
  earnDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    alignItems: 'center',
  },
  earnDetailText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },
  earnTotalText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0f172a',
  },
});

