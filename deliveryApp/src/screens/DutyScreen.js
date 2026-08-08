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
            <Ionicons name="bicycle-outline" size={24} color="#ffffff" />
          </View>
          <View>
            <Text style={styles.driverName}>{profile.name}</Text>
            <Text style={styles.vehicleText}>{profile.vehicle}</Text>
          </View>
        </View>

        {/* Duty Toggle Switch */}
        <View style={styles.dutySwitch}>
          <Text style={[styles.dutyLabel, { color: profile.isOnline ? colors.secondary : colors.textMuted }]}>
            {profile.isOnline ? 'ONLINE' : 'OFFLINE'}
          </Text>
          <Switch
            value={profile.isOnline}
            onValueChange={toggleDuty}
            trackColor={{ false: '#e2e8f0', true: '#10b981' }}
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
              <Ionicons name="moon-outline" size={48} color={colors.textMuted} />
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
                    <Ionicons name="storefront" size={18} color={colors.accent} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.locLabel}>PICKUP FROM</Text>
                    <Text style={styles.locTitle}>{task.pickupLocation}</Text>
                    <Text style={styles.locSub}>{task.pickupAddress}</Text>
                  </View>
                </View>

                {/* Divider Line connecting dots conceptually */}
                <View style={styles.verticalConnectingLine} />

                {/* Delivery Info */}
                <View style={styles.locationRow}>
                  <View style={styles.iconCircleWrapper}>
                    <Ionicons name="home" size={18} color={colors.primary} />
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
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  driverName: { fontSize: 16, fontWeight: '600', color: colors.textPrimary },
  vehicleText: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  dutySwitch: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dutyLabel: { fontSize: 12, fontWeight: '600', letterSpacing: 0.5 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 8 },
      android: { elevation: 3 }
    })
  },
  statItem: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  statLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 4, fontWeight: '500' },
  statDivider: { width: 1, height: 30, backgroundColor: '#f1f5f9' },
  offlineBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
  offlineIconBox: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  offlineTitle: { fontSize: 18, fontWeight: '600', color: colors.textPrimary },
  offlineSub: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginTop: 8, paddingHorizontal: 30, lineHeight: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: colors.textPrimary, marginBottom: 16 },
  taskCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 8 },
      android: { elevation: 3 }
    })
  },
  taskHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  orderIdBadge: { backgroundColor: '#f1f5f9', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  orderIdText: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  earnBadgeBox: { backgroundColor: '#ecfdf5', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  earnBadge: { fontSize: 13, fontWeight: '700', color: '#10b981' },
  locationRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  iconCircleWrapper: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  verticalConnectingLine: { width: 1, height: 16, backgroundColor: '#e2e8f0', marginLeft: 15, marginVertical: 4 },
  locLabel: { fontSize: 10, fontWeight: '600', color: colors.textMuted, letterSpacing: 0.5 },
  locTitle: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginTop: 2 },
  locSub: { fontSize: 12, color: colors.textSecondary, marginTop: 2, lineHeight: 16 },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 16,
    marginTop: 16
  },
  distText: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 30, // Pill shape
    gap: 8
  },
  navBtnText: { color: '#ffffff', fontSize: 13, fontWeight: '600' }
});
