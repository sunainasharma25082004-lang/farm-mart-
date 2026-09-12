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
import { LinearGradient } from "expo-linear-gradient";
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
        { text: "Logout", style: "destructive", onPress: () => navigation.navigate("Home") } // Dummy navigation for logout
      ]
    );
  };

  const handleDummyAction = (actionName) => {
    Alert.alert("Coming Soon", `${actionName} feature will be available in the next update!`);
  };

  const renderSectionItem = ({ icon, label, subLabel, onPress, isLogout }) => (
    <TouchableOpacity style={styles.sectionItem} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.iconBox, isLogout && { backgroundColor: '#fee2e2' }]}>
        <Ionicons name={icon} size={20} color={isLogout ? '#ef4444' : '#1e293b'} />
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
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Premium Header */}
        <LinearGradient
          colors={['#0f172a', '#1e293b']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerProfile}
        >
          <View style={styles.headerInfo}>
            <Text style={styles.headerName}>{userProfile?.name || "Guest User"}</Text>
            <Text style={styles.headerPhone}>{userProfile?.phone ? `+91 ${userProfile.phone}` : "No phone linked"}</Text>
            <TouchableOpacity style={styles.editProfileBtn} onPress={() => handleDummyAction('Edit Profile')}>
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
              onPress: () => navigation.navigate('OrderTracking')
            })}
            <View style={styles.divider} />
            {renderSectionItem({
              icon: "heart-outline",
              label: "Favorite Orders",
              onPress: () => handleDummyAction('Favorites')
            })}
            <View style={styles.divider} />
            {renderSectionItem({
              icon: "location-outline",
              label: "Address Book",
              subLabel: "Manage your delivery locations",
              onPress: () => navigation.navigate("AddressScreen")
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
              onPress: () => handleDummyAction('Help & Support')
            })}
            <View style={styles.divider} />
            {renderSectionItem({
              icon: "settings-outline",
              label: "Settings",
              onPress: () => handleDummyAction('Settings')
            })}
            <View style={styles.divider} />
            {renderSectionItem({
              icon: "log-out-outline",
              label: "Logout",
              isLogout: true,
              onPress: handleLogout
            })}
          </View>
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
    backgroundColor: "#f8fafc", // Light gray background to make white cards pop
    paddingTop: Platform.OS === 'android' ? 25 : 0
  },
  headerProfile: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 40, // extra padding for overlap
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerPhone: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 12,
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start'
  },
  editProfileText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fcd34d', // Gold text
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#334155',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0f172a',
  },
  scrollContent: {
    minHeight: '100%',
    paddingBottom: 40,
  },
  sectionContainer: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginLeft: 8,
    marginBottom: 10,
  },
  cardBlock: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden'
  },
  sectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  sectionItemText: {
    flex: 1,
  },
  sectionItemLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
  },
  sectionItemSubLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginLeft: 72, // Aligns with the text
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  footerText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#cbd5e1',
  },
  footerSubText: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 4,
  }
});
