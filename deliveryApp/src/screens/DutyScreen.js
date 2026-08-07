import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
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
            <Ionicons name="bicycle-outline" size={22} color="#ffffff" />
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
            trackColor={{ false: '#334155', true: '#16a34a' }}
            thumbColor="#ffffff"
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Earnings Quick Bar */}
        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <Text style={styles.statVal}>₹{profile.todayEarnings}</Text>
            <Text style={styles.statLabel}>Today's Pay</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statVal}>{profile.todayTrips}</Text>
            <Text style={styles.statLabel}>Completed Trips</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statVal}>★ {profile.rating}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>

        {!profile.isOnline ? (
          <View style={styles.offlineBox}>
            <Ionicons name="power-outline" size={48} color={colors.textMuted} />
            <Text style={styles.offlineTitle}>You are currently Offline</Text>
            <Text style={styles.offlineSub}>Toggle duty switch to receive nearby farm produce & food orders.</Text>
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Assigned Active Delivery Orders ({tasks.length})</Text>

            {tasks.map((task) => (
              <View key={task.id} style={styles.taskCard}>
                <View style={styles.taskHeader}>
                  <View style={styles.orderIdBadge}>
                    <Text style={styles.orderIdText}>{task.id}</Text>
                  </View>
                  <Text style={styles.earnBadge}>₹{task.estEarnings} EARNING</Text>
                </View>

                {/* Pickup Info */}
                <View style={styles.locationRow}>
                  <Ionicons name="storefront-outline" size={18} color={colors.accent} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.locLabel}>PICKUP FROM VENDOR</Text>
                    <Text style={styles.locTitle}>{task.pickupLocation}</Text>
                    <Text style={styles.locSub}>{task.pickupAddress}</Text>
                  </View>
                </View>

                {/* Delivery Info */}
                <View style={styles.locationRow}>
                  <Ionicons name="location-outline" size={18} color={colors.primary} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.locLabel}>DELIVER TO CUSTOMER</Text>
                    <Text style={styles.locTitle}>{task.customerName} ({task.customerPhone})</Text>
                    <Text style={styles.locSub}>{task.deliveryAddress}</Text>
                  </View>
                </View>

                <View style={styles.taskFooter}>
                  <Text style={styles.distText}>{task.distanceKm} km • {task.itemsCount} Items</Text>
                  <TouchableOpacity
                    style={styles.navBtn}
                    onPress={() => handleStartNavigation(task)}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="navigate-outline" size={16} color="#ffffff" />
                    <Text style={styles.navBtnText}>Start Trip Route</Text>
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
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  driverName: { fontSize: 15, fontWeight: '800', color: colors.textPrimary },
  vehicleText: { fontSize: 11, color: colors.textSecondary },
  dutySwitch: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dutyLabel: { fontSize: 11, fontWeight: '900', letterSpacing: 0.5 },
  scrollContent: { padding: 16, paddingBottom: 24 },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border
  },
  statItem: { alignItems: 'center' },
  statVal: { fontSize: 16, fontWeight: '800', color: colors.textPrimary },
  statLabel: { fontSize: 10, color: colors.textSecondary, marginTop: 2 },
  statDivider: { width: 1, height: 24, backgroundColor: colors.border },
  offlineBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  offlineTitle: { fontSize: 16, fontWeight: '800', color: colors.textPrimary, marginTop: 12 },
  offlineSub: { fontSize: 12, color: colors.textSecondary, textAlign: 'center', marginTop: 4, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: colors.textPrimary, marginBottom: 12 },
  taskCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border
  },
  taskHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  orderIdBadge: { backgroundColor: colors.cardLight, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  orderIdText: { fontSize: 12, fontWeight: '800', color: colors.textPrimary },
  earnBadge: { fontSize: 12, fontWeight: '800', color: colors.secondary },
  locationRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  locLabel: { fontSize: 9, fontWeight: '800', color: colors.textMuted, letterSpacing: 0.5 },
  locTitle: { fontSize: 13, fontWeight: '700', color: colors.textPrimary, marginTop: 1 },
  locSub: { fontSize: 11, color: colors.textSecondary, marginTop: 1 },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
    marginTop: 4
  },
  distText: { fontSize: 11, color: colors.textSecondary, fontWeight: '600' },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6
  },
  navBtnText: { color: '#ffffff', fontSize: 12, fontWeight: '800' }
});
