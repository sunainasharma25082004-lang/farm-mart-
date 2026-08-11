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
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header Bar */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarCircle}>
            <Ionicons name="bicycle" size={22} color="#ffffff" />
          </View>
          <View>
            <Text style={styles.driverName}>{profile.name}</Text>
            <Text style={styles.vehicleText}>🛵 {profile.vehicle}</Text>
          </View>
        </View>

        {/* Duty Toggle Switch */}
        <View style={[styles.dutySwitchBox, { backgroundColor: profile.isOnline ? '#f0fdf4' : '#f8fafc' }]}>
          <View style={[styles.dutyDot, { backgroundColor: profile.isOnline ? '#16a34a' : '#94a3b8' }]} />
          <Text style={[styles.dutyLabel, { color: profile.isOnline ? '#15803d' : '#64748b' }]}>
            {profile.isOnline ? 'ONLINE' : 'OFFLINE'}
          </Text>
          <Switch
            value={profile.isOnline}
            onValueChange={toggleDuty}
            trackColor={{ false: '#cbd5e1', true: '#bbf7d0' }}
            thumbColor={profile.isOnline ? '#16a34a' : '#94a3b8'}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Driver Pay Bar */}
        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <Text style={styles.statVal}>₹{profile.todayEarnings}</Text>
            <Text style={styles.statLabel}>Today's Pay</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statVal, { color: '#0284c7' }]}>{profile.todayTrips}</Text>
            <Text style={styles.statLabel}>Trips Done</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statVal, { color: '#d97706' }]}>★ {profile.rating}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>

        {!profile.isOnline ? (
          <View style={styles.offlineBox}>
            <View style={styles.offlineIconBox}>
              <Ionicons name="moon" size={40} color="#64748b" />
            </View>
            <Text style={styles.offlineTitle}>You are currently Offline</Text>
            <Text style={styles.offlineSub}>
              Toggle the status switch at the top to GO ONLINE and receive live delivery requests nearby.
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Active Orders Queue</Text>
              <View style={styles.taskBadge}>
                <Text style={styles.taskBadgeText}>{tasks.length} Available</Text>
              </View>
            </View>

            {tasks.length === 0 ? (
              <View style={styles.emptyTasksBox}>
                <Ionicons name="checkmark-done-circle-outline" size={48} color="#16a34a" />
                <Text style={styles.emptyTaskTitle}>No Orders Pending</Text>
                <Text style={styles.emptyTaskSub}>You're all caught up! New orders will pop up automatically.</Text>
              </View>
            ) : (
              tasks.map((task) => (
                <View key={task.id} style={styles.taskCard}>
                  <View style={styles.taskHeader}>
                    <View style={styles.orderIdBadge}>
                      <Text style={styles.orderIdText}>Order #{task.id}</Text>
                    </View>
                    <View style={styles.earnBadgeBox}>
                      <Text style={styles.earnBadge}>+₹{task.estEarnings}</Text>
                    </View>
                  </View>

                  {/* Pickup Location */}
                  <View style={styles.locationRow}>
                    <View style={[styles.iconCircleWrapper, { backgroundColor: '#fff7ed', borderColor: '#ffedd5' }]}>
                      <Ionicons name="storefront" size={17} color="#ea580c" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.locLabel}>PICKUP POINT</Text>
                      <Text style={styles.locTitle}>{task.pickupLocation}</Text>
                      <Text style={styles.locSub} numberOfLines={2}>{task.pickupAddress}</Text>
                    </View>
                  </View>

                  {/* Visual Timeline Connector */}
                  <View style={styles.timelineConnector} />

                  {/* Delivery Location */}
                  <View style={styles.locationRow}>
                    <View style={[styles.iconCircleWrapper, { backgroundColor: '#f0f9ff', borderColor: '#bae6fd' }]}>
                      <Ionicons name="location" size={17} color="#0284c7" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.locLabel}>DELIVER TO</Text>
                      <Text style={styles.locTitle}>{task.customerName}</Text>
                      <Text style={styles.locSub} numberOfLines={2}>{task.deliveryAddress}</Text>
                    </View>
                  </View>

                  {/* Task Footer */}
                  <View style={styles.taskFooter}>
                    <View style={styles.infoPillsRow}>
                      <Text style={styles.distText}>📍 {task.distanceKm} km</Text>
                      <Text style={styles.itemCountText}>📦 {task.itemsCount} items</Text>
                    </View>

                    <TouchableOpacity
                      style={styles.navBtn}
                      onPress={() => handleStartNavigation(task)}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.navBtnText}>Start Trip</Text>
                      <Ionicons name="navigate-circle" size={18} color="#ffffff" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
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
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#0284c7',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0284c7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.2,
  },
  vehicleText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
    fontWeight: '600',
  },
  dutySwitchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 6,
  },
  dutyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dutyLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: 'rgba(15, 23, 42, 0.05)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statVal: {
    fontSize: 20,
    fontWeight: '800',
    color: '#15803d',
  },
  statLabel: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 4,
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#e2e8f0',
  },
  offlineBox: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 36,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginTop: 10,
  },
  offlineIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  offlineTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  offlineSub: {
    fontSize: 13.5,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.3,
  },
  taskBadge: {
    backgroundColor: '#bae6fd',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  taskBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0369a1',
  },
  emptyTasksBox: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  emptyTaskTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 8,
  },
  emptyTaskSub: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
    textAlign: 'center',
  },
  taskCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
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
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  orderIdBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  orderIdText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
  },
  earnBadgeBox: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  earnBadge: {
    fontSize: 14,
    fontWeight: '800',
    color: '#15803d',
  },
  locationRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  iconCircleWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    borderWidth: 1,
  },
  timelineConnector: {
    width: 2,
    height: 18,
    backgroundColor: '#cbd5e1',
    marginLeft: 17,
    marginVertical: 2,
  },
  locLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.8,
  },
  locTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 2,
  },
  locSub: {
    fontSize: 12.5,
    color: '#475569',
    marginTop: 2,
    lineHeight: 18,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 14,
    marginTop: 14,
  },
  infoPillsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  distText: {
    fontSize: 12.5,
    color: '#334155',
    fontWeight: '700',
  },
  itemCountText: {
    fontSize: 12.5,
    color: '#64748b',
    fontWeight: '600',
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0284c7',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 16,
    gap: 6,
    shadowColor: '#0284c7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  navBtnText: {
    color: '#ffffff',
    fontSize: 13.5,
    fontWeight: '700',
  },
});

