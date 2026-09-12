import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Image,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useApp } from "../../context/AppContext";
import { colors } from "../../theme/colors";

const LOGO = require("../../../assets/logo/WhatsApp Image 2026-09-10 at 12.22.02 PM (1).jpeg");

export const ProfileWalletScreen = ({ navigation }) => {
  const { userProfile, setUserProfile, isAuthenticated, logoutUser } = useApp();
  const [editModalVisible, setEditModalVisible] = React.useState(false);
  const [editName, setEditName] = React.useState(userProfile?.name || "");
  const [editPhone, setEditPhone] = React.useState(userProfile?.phone || "");

  const handleLogout = () => {
    if (!isAuthenticated) {
      navigation.navigate("Login");
      return;
    }

    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: logoutUser },
    ]);
  };

  const openEditProfile = () => {
    setEditName(userProfile?.name || "");
    setEditPhone(userProfile?.phone || "");
    setEditModalVisible(true);
  };

  const saveProfile = () => {
    const name = editName.trim();
    const phone = editPhone.trim();

    if (!name) {
      Alert.alert("Name required", "Please enter your name.");
      return;
    }

    setUserProfile({ ...userProfile, name, phone });
    setEditModalVisible(false);
  };

  const handleProfileAction = (actionName) => {
    if (actionName === "Favorites") {
      navigation.navigate("OrderTracking");
      return;
    }

    if (actionName === "Help & Support") {
      Alert.alert("Help & Support", "How can we help you today?", [
        { text: "Close", style: "cancel" },
        {
          text: "Call support",
          onPress: () => Alert.alert("Support", "Call us at 1800-123-4567."),
        },
      ]);
      return;
    }

    Alert.alert("Settings", "Your account settings are up to date.", [
      { text: "Done", style: "cancel" },
      { text: "Update profile", onPress: openEditProfile },
    ]);
  };

  const renderSectionItem = ({ icon, label, subLabel, onPress, isLogout }) => (
    <TouchableOpacity
      style={styles.sectionItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        style={[styles.iconBox, isLogout && { backgroundColor: "#fee2e2" }]}
      >
        <Ionicons
          name={icon}
          size={20}
          color={isLogout ? "#ef4444" : "#1e293b"}
        />
      </View>
      <View style={styles.sectionItemText}>
        <Text
          style={[styles.sectionItemLabel, isLogout && { color: "#ef4444" }]}
        >
          {label}
        </Text>
        {subLabel && <Text style={styles.sectionItemSubLabel}>{subLabel}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Premium Header */}
        <LinearGradient
          colors={["#0f172a", "#1e293b"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerProfile}
        >
          <View style={styles.headerInfo}>
            <Text style={styles.headerName}>
              {userProfile?.name || "Guest User"}
            </Text>
            <Text style={styles.headerPhone}>
              {userProfile?.phone
                ? `+91 ${userProfile.phone}`
                : "No phone linked"}
            </Text>
            <TouchableOpacity
              style={styles.editProfileBtn}
              onPress={openEditProfile}
            >
              <Text style={styles.editProfileText}>Edit Profile</Text>
              <Ionicons name="chevron-forward" size={12} color="#fcd34d" />
            </TouchableOpacity>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(userProfile?.name || "G").charAt(0).toUpperCase()}
            </Text>
          </View>
        </LinearGradient>

        {/* Section: Activity */}
        <View style={[styles.sectionContainer, { marginTop: -20 }]}>
          <Text style={styles.sectionTitle}>My Activity</Text>
          <View style={styles.cardBlock}>
            {renderSectionItem({
              icon: "receipt-outline",
              label: "Your Orders",
              subLabel: "Track, reorder or view past orders",
              onPress: () => navigation.navigate("OrderTracking"),
            })}
            <View style={styles.divider} />
            {renderSectionItem({
              icon: "heart-outline",
              label: "Favorite Orders",
              onPress: () => handleProfileAction("Favorites"),
            })}
            <View style={styles.divider} />
            {renderSectionItem({
              icon: "location-outline",
              label: "Address Book",
              subLabel: "Manage your delivery locations",
              onPress: () => navigation.navigate("AddressScreen"),
            })}
          </View>
        </View>

        {/* Section: Support & More */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>More</Text>
          <View style={styles.cardBlock}>
            {renderSectionItem({
              icon: "help-buoy-outline",
              label: "Help & Support",
              onPress: () => handleProfileAction("Help & Support"),
            })}
            <View style={styles.divider} />
            {renderSectionItem({
              icon: "settings-outline",
              label: "Settings",
              onPress: () => handleProfileAction("Settings"),
            })}
            <View style={styles.divider} />
            {renderSectionItem({
              icon: "log-out-outline",
              label: isAuthenticated ? "Logout" : "Login",
              isLogout: isAuthenticated,
              onPress: handleLogout,
            })}
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.footerBrand}>
            <Image
              source={LOGO}
              style={styles.footerLogo}
              resizeMode="contain"
            />
            <View style={styles.footerBrandText}>
              <Text style={styles.footerText}>sfarmart24</Text>
              <Text style={styles.footerSubText}>
                Fresh from local farms to your door
              </Text>
            </View>
          </View>
          <Text style={styles.footerVersion}>
            Version 1.0.0 · Made for Bharat
          </Text>
        </View>
      </ScrollView>

      <Modal
        visible={editModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.editModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity
                onPress={() => setEditModalVisible(false)}
                style={styles.modalCloseBtn}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.profileInput}
              value={editName}
              onChangeText={setEditName}
              placeholder="Enter your name"
              placeholderTextColor="#94a3b8"
            />

            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              style={styles.profileInput}
              value={editPhone}
              onChangeText={setEditPhone}
              placeholder="Enter your phone number"
              placeholderTextColor="#94a3b8"
              keyboardType="phone-pad"
            />

            <TouchableOpacity
              style={styles.saveProfileBtn}
              onPress={saveProfile}
              activeOpacity={0.85}
            >
              <Text style={styles.saveProfileText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc", // Light gray background to make white cards pop
    paddingTop: Platform.OS === "android" ? 25 : 0,
  },
  headerProfile: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 40, // extra padding for overlap
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: 24,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 4,
  },
  headerPhone: {
    fontSize: 14,
    color: "#94a3b8",
    marginBottom: 12,
  },
  editProfileBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  editProfileText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#fcd34d", // Gold text
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#cbd5e1",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#334155",
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0f172a",
  },
  scrollContent: {
    minHeight: "100%",
    paddingBottom: 40,
  },
  sectionContainer: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginLeft: 8,
    marginBottom: 10,
  },
  cardBlock: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    overflow: "hidden",
  },
  sectionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  sectionItemText: {
    flex: 1,
  },
  sectionItemLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0f172a",
  },
  sectionItemSubLabel: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "#f1f5f9",
    marginLeft: 72, // Aligns with the text
  },
  footer: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 40,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  footerBrand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  footerLogo: {
    width: 76,
    height: 48,
  },
  footerBrandText: {
    flex: 1,
  },
  footerText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#15803d",
  },
  footerSubText: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 3,
  },
  footerVersion: {
    fontSize: 10,
    color: "#94a3b8",
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(15, 23, 42, 0.45)",
  },
  editModal: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0f172a",
  },
  modalCloseBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 6,
    marginTop: 10,
  },
  profileInput: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    backgroundColor: "#f8fafc",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#0f172a",
  },
  saveProfileBtn: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 12,
    marginTop: 22,
    paddingVertical: 13,
  },
  saveProfileText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
});
