import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Alert
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useApp } from "../../context/AppContext";
import { colors } from "../../theme/colors";

export const ProfileWalletScreen = ({ navigation }) => {
  const { userProfile } = useApp();

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Logout", style: "destructive", onPress: () => navigation.navigate("Home") }
      ]
    );
  };

  const renderSectionItem = ({ icon, label, subLabel, onPress, isLogout }) => (
    <TouchableOpacity style={styles.sectionItem} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.iconBox, isLogout && { backgroundColor: '#fee2e2' }]}>
        <Ionicons name={icon} size={20} color={isLogout ? '#ef4444' : colors.primary} />
      </View>
      <View style={styles.sectionItemText}>
        <Text style={[styles.sectionItemLabel, isLogout && { color: '#ef4444' }]}>{label}</Text>
        {subLabel && <Text style={styles.sectionItemSubLabel}>{subLabel}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Profile Section */}
      <View style={styles.headerProfile}>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{userProfile?.name || "Guest User"}</Text>
          <Text style={styles.headerPhone}>{userProfile?.phone ? `+91 ${userProfile.phone}` : "No phone linked"}</Text>
          <TouchableOpacity style={styles.editProfileBtn}>
            <Text style={styles.editProfileText}>Edit Profile</Text>
            <Ionicons name="chevron-forward" size={12} color={colors.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(userProfile?.name || "G").charAt(0).toUpperCase()}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Money / Wallet Card (Zomato Style) */}
        <View style={styles.moneyCard}>
          <View style={styles.moneyCardLeft}>
            <MaterialCommunityIcons name="wallet-outline" size={26} color="#0f172a" />
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.moneyCardTitle}>sFARMART Money</Text>
              <Text style={styles.moneyCardSub}>Fast & Secure Payments</Text>
            </View>
          </View>
          <View style={styles.moneyCardRight}>
            <Text style={styles.moneyCardBal}>₹0.00</Text>
          </View>
        </View>

        {/* Section: Food Orders */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionDivider} />
          {renderSectionItem({
            icon: "receipt-outline",
            label: "Your Orders",
            onPress: () => navigation.navigate("OrderTracking")
          })}
          {renderSectionItem({
            icon: "heart-outline",
            label: "Favorite Orders",
            onPress: () => {}
          })}
          {renderSectionItem({
            icon: "book-outline",
            label: "Address Book",
            onPress: () => {}
          })}
        </View>

        {/* Section: More */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionDivider} />
          <Text style={styles.sectionTitle}>More</Text>
          {renderSectionItem({
            icon: "help-buoy-outline",
            label: "Help & Support",
            onPress: () => {}
          })}
          {renderSectionItem({
            icon: "information-circle-outline",
            label: "About",
            onPress: () => {}
          })}
          {renderSectionItem({
            icon: "log-out-outline",
            label: "Logout",
            isLogout: true,
            onPress: handleLogout
          })}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>sFARMART v1.0.0</Text>
          <Text style={styles.footerSubText}>Made with ♥ for Bharat</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingTop: Platform.OS === 'android' ? 25 : 0
  },
  headerProfile: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: "#ffffff",
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  headerPhone: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 10,
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  editProfileText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  avatarText: {
    fontSize: 26,
    fontWeight: '700',
    color: '#ffffff',
  },
  scrollContent: {
    backgroundColor: '#f8fafc',
    minHeight: '100%',
    paddingBottom: 40,
  },
  moneyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: -10, // overlap with header area
    marginBottom: 20,
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  moneyCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moneyCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  moneyCardSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  moneyCardRight: {
    alignItems: 'flex-end',
  },
  moneyCardBal: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  sectionContainer: {
    backgroundColor: '#ffffff',
    marginBottom: 16,
    paddingVertical: 8,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: 20,
    marginTop: 12,
    marginBottom: 4,
  },
  sectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  sectionItemText: {
    flex: 1,
  },
  sectionItemLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#334155',
  },
  sectionItemSubLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  footer: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 40,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#cbd5e1',
  },
  footerSubText: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 4,
  }
});
