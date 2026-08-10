import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDelivery } from '../context/DeliveryContext';
import { colors } from '../theme/colors';

export const DutyScreen = ({ navigation }) => {
  const { profile, toggleDuty, tasks, setCurrentTask } = useDelivery();

  const handleStartNavigation = (task) => {
    setCurrentTask(task);
    navigation.navigate('ActiveNavigation');
  };

  return (
    <View style={styles.container}>
      {/* Header Bar */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatar}>
            <Ionicons name="bicycle" size={24} color="#ffffff" />
          </View>
          <View>
            <Text style={styles.driverName}>{profile.name}</Text>
            <Text style={styles.vehicleText}>{profile.vehicle}</Text>
          </View>
        </View>

        {/* Duty Toggle Switch */}
        <View style={styles.dutySwitch}>
          <Text style={[styles.dutyLabel, { color: profile.isOnline ? '#16a34a' : '#64748b' }]}>
            {profile.isOnline ? 'ONLINE' : 'OFFLINE'}
          </Text>
          <Switch
            value={profile.isOnline}
            onValueChange={toggleDuty}
            trackColor={{ false: '#cbd5e1', true: '#10b981' }}
            thumbColor="#ffffff"
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Earnings Quick Bar */}
        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <Text style={styles.statVal}>₹{profile.todayEarnings}</Text>
            <Text style={styles.statLabel}>Today's Pay</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statVal}>{profile.todayTrips}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statVal}>★ {profile.rating}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>

        {!profile.isOnline ? (
          <View style={styles.offlineBox}>
            <View style={styles.offlineIconBox}>
              <Ionicons name="moon-outline" size={48} color="#64748b" />
            </View>
            <Text style={styles.offlineTitle}>You are Offline</Text>
            <Text style={styles.offlineSub}>Toggle the switch at the top to go online and start receiving new delivery orders.</Text>
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Active Orders ({tasks.length})</Text>

            {tasks.map((task) => (
              <View key={task.id} style={styles.taskCard}>
                <View style={styles.taskHeader}>
                  <View style={styles.orderIdBadge}>
                    <Text style={styles.orderIdText}>Order #{task.id}</Text>
                  </View>
                  <View style={styles.earnBadgeBox}>
                    <Text style={styles.earnBadge}>+₹{task.estEarnings}</Text>
                  </View>
                </View>

                {/* Pickup Info */}
                <View style={styles.locationRow}>
                  <View style={styles.iconCircleWrapper}>
                    <Ionicons name="storefront" size={18} color="#f97316" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.locLabel}>PICKUP FROM</Text>
                    <Text style={styles.locTitle}>{task.pickupLocation}</Text>
                    <Text style={styles.locSub}>{task.pickupAddress}</Text>
                  </View>
                </View>

                {/* Connecting Line */}
                <View style={styles.verticalConnectingLine} />

                {/* Delivery Info */}
                <View style={styles.locationRow}>
                  <View style={styles.iconCircleWrapper}>
                    <Ionicons name="home" size={18} color="#0284c7" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.locLabel}>DELIVER TO</Text>
                    <Text style={styles.locTitle}>{task.customerName}</Text>
                    <Text style={styles.locSub}>{task.deliveryAddress}</Text>
                  </View>
                </View>

                <View style={styles.taskFooter}>
                  <Text style={styles.distText}>{task.distanceKm} km • {task.itemsCount} items</Text>
                  <TouchableOpacity
                    style={styles.navBtn}
                    onPress={() => handleStartNavigation(task)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.navBtnText}>Start Trip</Text>
                    <Ionicons name="arrow-forward" size={16} color="#ffffff" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
      android: { elevation: 2 }
    })
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#0284c7', alignItems: 'center', justifyContent: 'center' },
  driverName: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  vehicleText: { fontSize: 12, color: '#64748b', marginTop: 2, fontWeight: '500' },
  dutySwitch: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dutyLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 8 },
      android: { elevation: 3 }
    })
  },
  statItem: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
  statLabel: { fontSize: 11, color: '#64748b', marginTop: 4, fontWeight: '600' },
  statDivider: { width: 1, height: 30, backgroundColor: '#e2e8f0' },
  offlineBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  offlineIconBox: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  offlineTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
  offlineSub: { fontSize: 14, color: '#475569', textAlign: 'center', marginTop: 8, paddingHorizontal: 30, lineHeight: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a', marginBottom: 14 },
  taskCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 8 },
      android: { elevation: 3 }
    })
  },
  taskHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  orderIdBadge: { backgroundColor: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  orderIdText: { fontSize: 13, fontWeight: '700', color: '#0f172a' },
  earnBadgeBox: { backgroundColor: '#dcfce7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  earnBadge: { fontSize: 14, fontWeight: '800', color: '#15803d' },
  locationRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  iconCircleWrapper: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center', marginTop: 2, borderWidth: 1, borderColor: '#e2e8f0' },
  verticalConnectingLine: { width: 2, height: 16, backgroundColor: '#cbd5e1', marginLeft: 16, marginVertical: 2 },
  locLabel: { fontSize: 10, fontWeight: '700', color: '#64748b', letterSpacing: 0.5 },
  locTitle: { fontSize: 15, fontWeight: '700', color: '#0f172a', marginTop: 2 },
  locSub: { fontSize: 13, color: '#475569', marginTop: 2, lineHeight: 18 },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 14,
    marginTop: 14
  },
  distText: { fontSize: 13, color: '#475569', fontWeight: '600' },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0284c7',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    gap: 8
  },
  navBtnText: { color: '#ffffff', fontSize: 13, fontWeight: '700' }
});
