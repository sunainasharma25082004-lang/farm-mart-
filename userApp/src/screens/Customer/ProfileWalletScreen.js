import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { useApp } from '../../context/AppContext';
import { colors } from '../../theme/colors';

const LOGO = require('../../../assets/farmart24_logo.jpg');

export const ProfileWalletScreen = ({ navigation }) => {
  const { userProfile, walletBalance, weeklyPayouts } = useApp();

  const handleShareReferral = async () => {
    try {
      await Share.share({
        message: `Join Farmart24 - Farm-to-Home commerce! Use code ${userProfile.referralCode} for ₹50 bonus on first order.`
      });
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <View style={styles.container}>
      <Header navigation={navigation} title="Profile & Wallet" showCart={false} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.brandRow}>
          <Image source={LOGO} style={styles.brandLogo} resizeMode="contain" />
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{userProfile.name.charAt(0)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>{userProfile.name}</Text>
            <Text style={styles.userPhone}>{userProfile.phone}</Text>
            <View style={styles.hubRow}>
              <Ionicons name="location" size={12} color={colors.primary} />
              <Text style={styles.userHub}>{userProfile.villageHub}</Text>
            </View>
          </View>
          <View style={styles.customerBadge}>
            <Text style={styles.customerBadgeText}>CUSTOMER</Text>
          </View>
        </View>

        <View style={styles.walletBox}>
          <View style={styles.walletTop}>
            <View>
              <Text style={styles.walletLabel}>Farmart Rewards Wallet</Text>
              <Text style={styles.walletVal}>₹{walletBalance}</Text>
            </View>
            <View style={styles.walletIcon}>
              <Ionicons name="wallet" size={28} color="#ffffff" />
            </View>
          </View>
          <Text style={styles.walletFoot}>
            Earn 5% cashback on fresh produce · Wednesday payout eligible
          </Text>
        </View>

        <View style={styles.quickActions}>
          {[
            { icon: 'receipt-outline', label: 'Orders', screen: 'OrderTracking' },
            { icon: 'cart-outline', label: 'Cart', screen: 'Cart' },
            { icon: 'heart-outline', label: 'Wishlist', screen: null },
            { icon: 'help-circle-outline', label: 'Help', screen: null }
          ].map((action) => (
            <TouchableOpacity
              key={action.label}
              style={styles.actionTile}
              activeOpacity={0.8}
              onPress={() => action.screen && navigation.navigate(action.screen)}
            >
              <View style={styles.actionIcon}>
                <Ionicons name={action.icon} size={20} color={colors.primary} />
              </View>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="gift-outline" size={20} color={colors.accent} />
            <Text style={styles.cardTitle}>Referral program</Text>
          </View>
          <Text style={styles.cardDesc}>
            Share your code with friends, farmers & home chefs to earn rewards.
          </Text>
          <View style={styles.referralBox}>
            <Text style={styles.codeText}>{userProfile.referralCode}</Text>
            <TouchableOpacity style={styles.shareBtn} onPress={handleShareReferral} activeOpacity={0.85}>
              <Ionicons name="share-social-outline" size={15} color="#ffffff" />
              <Text style={styles.shareText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
            <Text style={styles.cardTitle}>Weekly settlements</Text>
          </View>
          {weeklyPayouts.map((payout, idx) => (
            <View key={idx} style={styles.payoutRow}>
              <View>
                <Text style={styles.payoutDate}>{payout.date}</Text>
                <Text style={styles.payoutType}>{payout.type}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.payoutAmount}>+₹{payout.amount}</Text>
                <View style={styles.paidBadge}>
                  <Text style={styles.payoutStatus}>{payout.status}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30
  },
  brandRow: {
    alignItems: 'center',
    marginBottom: 12
  },
  brandLogo: {
    width: 140,
    height: 52
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '500'
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary
  },
  userPhone: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2
  },
  hubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 4
  },
  userHub: {
    fontSize: 11,
    color: colors.primaryDark,
    fontWeight: '500',
    flex: 1
  },
  customerBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12
  },
  customerBadgeText: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.primaryDark
  },
  walletBox: {
    backgroundColor: colors.darkBg,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14
  },
  walletTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  walletLabel: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500'
  },
  walletVal: {
    fontSize: 28,
    fontWeight: '500',
    color: '#ffffff',
    marginTop: 4
  },
  walletIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  walletFoot: {
    fontSize: 11,
    color: '#cbd5e1',
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 10,
    lineHeight: 16
  },
  quickActions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14
  },
  actionTile: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6
  },
  actionLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.textPrimary
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary
  },
  cardDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 12,
    lineHeight: 17
  },
  referralBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.accentLight,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fde68a'
  },
  codeText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.accent,
    letterSpacing: 0.5
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    gap: 4
  },
  shareText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500'
  },
  payoutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
    marginTop: 8
  },
  payoutDate: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textPrimary
  },
  payoutType: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2
  },
  payoutAmount: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.success
  },
  paidBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 3
  },
  payoutStatus: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.primaryDark
  }
});
