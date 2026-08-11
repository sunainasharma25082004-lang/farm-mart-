import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Header } from "../../components/Header";
import { useApp } from "../../context/AppContext";
import { colors } from "../../theme/colors";

const LOGO = require("../../../assets/farmart24_logo.jpg");

export const ProfileWalletScreen = ({ navigation }) => {
  const { userProfile } = useApp();

  return (
    <View style={styles.container}>
      <Header navigation={navigation} title="Profile" showCart={false} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.brandRow}>
          <Image source={LOGO} style={styles.brandLogo} resizeMode="contain" />
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(userProfile?.name || "Guest").charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>{userProfile?.name || "Guest User"}</Text>
            <Text style={styles.userPhone}>{userProfile?.phone || "No phone linked"}</Text>
            <View style={styles.hubRow}>
              <Ionicons name="location" size={12} color={colors.primary} />
              <Text style={styles.userHub}>{userProfile?.villageHub || userProfile?.city || "Central Hub"}</Text>
            </View>
          </View>
          <View style={styles.customerBadge}>
            <Text style={styles.customerBadgeText}>CUSTOMER</Text>
          </View>
        </View>

        <View style={styles.quickActions}>
          {[
            {
              icon: "receipt-outline",
              label: "Orders",
              screen: "OrderTracking",
            },
            { icon: "cart-outline", label: "Cart", screen: "Cart" },
            { icon: "heart-outline", label: "Wishlist", screen: null },
            { icon: "help-circle-outline", label: "Help", screen: null },
          ].map((action) => (
            <TouchableOpacity
              key={action.label}
              style={styles.actionTile}
              activeOpacity={0.8}
              onPress={() =>
                action.screen && navigation.navigate(action.screen)
              }
            >
              <View style={styles.actionIcon}>
                <Ionicons name={action.icon} size={20} color={colors.primary} />
              </View>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  brandRow: {
    alignItems: "center",
    marginBottom: 12,
  },
  brandLogo: {
    width: 140,
    height: 52,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "500",
  },
  userName: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.textPrimary,
  },
  userPhone: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  hubRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 4,
  },
  userHub: {
    fontSize: 11,
    color: colors.primaryDark,
    fontWeight: "500",
    flex: 1,
  },
  customerBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  customerBadgeText: {
    fontSize: 10,
    fontWeight: "500",
    color: colors.primaryDark,
  },
  quickActions: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  actionTile: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  actionLabel: {
    fontSize: 10,
    fontWeight: "500",
    color: colors.textPrimary,
  },
});
