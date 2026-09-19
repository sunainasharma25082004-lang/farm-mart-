import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
  useWindowDimensions,
  ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePartner } from '../context/PartnerContext';
import { GlassCard } from '../components/GlassCard';
import { WaterBackground } from '../components/WaterBackground';
import { colors } from '../theme/colors';
import { glassTheme } from '../theme/glass';

const DEMO_PARTNERS = [
  {
    name: 'Shimla Fresh Orchards',
    phone: '9876543214',
    owner: 'Manpreet Singh',
    type: 'Fresh Fruits & Orchards',
    icon: 'leaf-outline'
  },
  {
    name: 'Sunita Home Restro & Sweets',
    phone: '9876543211',
    owner: 'Chef Sunita Sharma',
    type: 'Home Kitchen & Sweets',
    icon: 'restaurant-outline'
  },
  {
    name: 'Sukhwinder Organic Farms',
    phone: '9876543212',
    owner: 'Sukhwinder Singh',
    type: 'Organic Farm Veggies',
    icon: 'flower-outline'
  },
  {
    name: 'Gurpreet Fresh Orchards',
    phone: '9876543213',
    owner: 'Gurpreet Singh',
    type: 'Farm Produce & Juices',
    icon: 'nutrition-outline'
  }
];

export const PartnerAccountScreen = () => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isTablet = width > 600;

  const { vendor, loginVendor, logoutVendor } = usePartner();
  const [isSwitching, setIsSwitching] = useState(false);

  const handleQuickSwitch = async (phone) => {
    setIsSwitching(true);
    try {
      await loginVendor(phone, 'password123');
    } catch (err) {
      console.warn('Switch failed:', err);
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <WaterBackground />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + 16,
            paddingBottom: insets.bottom + 110,
            maxWidth: isTablet ? 720 : '100%',
            alignSelf: 'center',
            width: '100%'
          }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Glass Card */}
        <GlassCard style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarGlow}>
              <Ionicons name="storefront" size={32} color="#ea580c" />
            </View>
            <View style={{ flex: 1, marginLeft: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.storeName} numberOfLines={1}>
                  {vendor?.storeName || 'Merchant Partner'}
                </Text>
                <Ionicons name="checkmark-circle" size={18} color="#16a34a" />
              </View>
              <Text style={styles.ownerName}>
                {vendor?.ownerName || 'Verified Merchant'} • {vendor?.phone || '+91 98765 43210'}
              </Text>
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={14} color="#f59e0b" />
                <Text style={styles.ratingText}>4.9 (184 orders fulfilled)</Text>
              </View>
            </View>
          </View>
        </GlassCard>

        {/* Banking Settlement Info */}
        <GlassCard style={styles.sectionCard}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="wallet-outline" size={20} color="#16a34a" />
            <Text style={styles.sectionTitle}>Banking & Wednesday Payouts</Text>
          </View>
          <View style={styles.bankDetailBox}>
            <View style={styles.bankRow}>
              <Text style={styles.bankLabel}>Disbursement Cycle</Text>
              <Text style={styles.bankVal}>Every Wednesday (6:00 AM)</Text>
            </View>
            <View style={styles.bankRow}>
              <Text style={styles.bankLabel}>Bank Name</Text>
              <Text style={styles.bankVal}>State Bank of India (SBI)</Text>
            </View>
            <View style={styles.bankRow}>
              <Text style={styles.bankLabel}>Direct Account</Text>
              <Text style={styles.bankVal}>•••• •••• 4321 (Verified)</Text>
            </View>
          </View>
        </GlassCard>

        {/* Switch Partner Profiles */}
        <GlassCard style={styles.sectionCard}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="swap-horizontal-outline" size={20} color="#ea580c" />
            <Text style={styles.sectionTitle}>Switch Partner Profile (Test Stores)</Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            1-tap instant switch between verified test merchant accounts:
          </Text>

          {isSwitching && (
            <View style={{ paddingVertical: 12, alignItems: 'center' }}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          )}

          <View style={styles.partnersGrid}>
            {DEMO_PARTNERS.map((p, idx) => {
              const isCurrent = vendor?.phone === p.phone || vendor?.storeName === p.name;
              return (
                <TouchableOpacity
                  key={idx}
                  style={[styles.partnerChip, isCurrent && styles.partnerChipActive]}
                  onPress={() => !isCurrent && handleQuickSwitch(p.phone)}
                  disabled={isSwitching || isCurrent}
                  activeOpacity={0.75}
                >
                  <View style={styles.partnerChipLeft}>
                    <Ionicons
                      name={p.icon}
                      size={20}
                      color={isCurrent ? '#ea580c' : colors.textSecondary}
                    />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text
                        style={[styles.partnerChipName, isCurrent && styles.partnerChipNameActive]}
                        numberOfLines={1}
                      >
                        {p.name}
                      </Text>
                      <Text style={styles.partnerChipSub}>{p.owner} • {p.phone}</Text>
                    </View>
                  </View>
                  {isCurrent ? (
                    <View style={styles.activePill}>
                      <Text style={styles.activePillText}>Active</Text>
                    </View>
                  ) : (
                    <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </GlassCard>

        {/* Logout Action */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={logoutVendor}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Logout of Partner Console</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  scrollContent: {
    paddingHorizontal: 16
  },
  profileCard: {
    marginBottom: 16,
    padding: 20
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  avatarGlow: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(234, 88, 12, 0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(234, 88, 12, 0.35)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  storeName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    flexShrink: 1
  },
  ownerName: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#d97706'
  },
  sectionCard: {
    marginBottom: 16,
    padding: 18
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a'
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 14
  },
  bankDetailBox: {
    marginTop: 8,
    gap: 10
  },
  bankRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(226, 232, 240, 0.6)'
  },
  bankLabel: {
    fontSize: 13,
    color: '#64748b'
  },
  bankVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a'
  },
  partnersGrid: {
    gap: 8
  },
  partnerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)'
  },
  partnerChipActive: {
    backgroundColor: 'rgba(234, 88, 12, 0.08)',
    borderColor: 'rgba(234, 88, 12, 0.35)'
  },
  partnerChipLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  partnerChipName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a'
  },
  partnerChipNameActive: {
    color: '#ea580c'
  },
  partnerChipSub: {
    fontSize: 12,
    color: '#64748b'
  },
  activePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: 'rgba(22, 163, 74, 0.15)'
  },
  activePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16a34a'
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    marginTop: 8,
    marginBottom: 20
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ef4444'
  }
});
