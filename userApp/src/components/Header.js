import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { colors } from "../theme/colors";
import { useApp } from "../context/AppContext";

const LOGO = require("../../assets/farmart24_logo.jpg");

export const Header = ({
  navigation,
  title,
  showCart = true,
  showBack = false,
}) => {
  const { cart, userProfile, setUserProfile } = useApp();
  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const canGoBack =
    showBack || (navigation && navigation.canGoBack && navigation.canGoBack());

  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [manualAddress, setManualAddress] = useState("");
  const [displayAddress, setDisplayAddress] = useState(
    "Set your delivery address",
  );
  const [locationSubtitle, setLocationSubtitle] = useState(
    "Detecting location...",
  );
  const [isLocationLoading, setIsLocationLoading] = useState(true);

  useEffect(() => {
    const initializeLocation = async () => {
      const fallbackAddress =
        userProfile?.address ||
        userProfile?.city ||
        "Set your delivery address";
      setManualAddress(fallbackAddress);
      setDisplayAddress(fallbackAddress);
      setLocationSubtitle("Detecting location...");
      setIsLocationLoading(true);

      if (!userProfile) {
        setLocationSubtitle("Login to save your address");
        setIsLocationLoading(false);
        return;
      }

      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setLocationSubtitle(
            userProfile?.city || "Location permission denied",
          );
          setDisplayAddress(fallbackAddress);
          setManualAddress(fallbackAddress);
          setIsLocationLoading(false);
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Low,
        });

        const [place] = await Location.reverseGeocodeAsync({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });

        const resolvedAddress = [
          place?.name,
          place?.street,
          place?.city,
          place?.region,
        ]
          .filter(Boolean)
          .join(", ");

        const nextAddress = resolvedAddress || fallbackAddress;
        setDisplayAddress(nextAddress);
        setManualAddress(nextAddress);
        setLocationSubtitle(
          place?.city
            ? `${place.city}${place.region ? `, ${place.region}` : ""}`
            : "Current location",
        );
      } catch (error) {
        setDisplayAddress(fallbackAddress);
        setManualAddress(fallbackAddress);
        setLocationSubtitle(userProfile?.city || "Could not detect location");
      } finally {
        setIsLocationLoading(false);
      }
    };

    initializeLocation();
  }, [userProfile?.address, userProfile?.city]);

  const openAddressModal = () => {
    setManualAddress(displayAddress);
    setAddressModalVisible(true);
  };

  const saveAddress = () => {
    const nextAddress = manualAddress.trim() || "Set your delivery address";
    setDisplayAddress(nextAddress);
    setLocationSubtitle("Address updated");

    if (userProfile) {
      setUserProfile({
        ...userProfile,
        address: nextAddress,
        city: userProfile.city || nextAddress,
      });
    }

    setAddressModalVisible(false);
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {canGoBack ? (
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
        ) : (
          <Image source={LOGO} style={styles.logoImage} resizeMode="contain" />
        )}

        <View style={styles.centerSection}>
          {title ? (
            <Text style={styles.pageTitle} numberOfLines={1}>
              {title}
            </Text>
          ) : (
            <TouchableOpacity
              style={styles.locationSection}
              activeOpacity={0.8}
              onPress={openAddressModal}
            >
              <View style={styles.deliveryRow}>
                <Ionicons name="location" size={14} color={colors.secondary} />
                <Text style={styles.deliveryLabel}>Deliver to</Text>
                <Ionicons
                  name="chevron-down"
                  size={12}
                  color={colors.textPrimary}
                />
              </View>
              <Text style={styles.addressTitle} numberOfLines={1}>
                {displayAddress}
              </Text>
              <Text style={styles.addressSub} numberOfLines={1}>
                {isLocationLoading
                  ? "Detecting your location..."
                  : `${locationSubtitle} · Express 30–45 min`}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {showCart ? (
          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => navigation && navigation.navigate("Cart")}
            activeOpacity={0.8}
          >
            <Ionicons
              name="cart-outline"
              size={22}
              color={colors.textPrimary}
            />
            {cartItemCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {cartItemCount > 9 ? "9+" : cartItemCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ) : (
          <View style={styles.cartPlaceholder} />
        )}
      </View>

      <Modal
        transparent
        visible={addressModalVisible}
        animationType="fade"
        onRequestClose={() => setAddressModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setAddressModalVisible(false)}
        >
          <Pressable
            style={styles.modalCard}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Ionicons
                name="location-outline"
                size={20}
                color={colors.primary}
              />
              <Text style={styles.modalTitle}>Update delivery address</Text>
            </View>

            <Text style={styles.modalLabel}>Your current delivery address</Text>
            <TextInput
              style={styles.modalInput}
              value={manualAddress}
              onChangeText={setManualAddress}
              placeholder="Enter your address"
              placeholderTextColor={colors.textMuted}
              multiline
            />

            <TouchableOpacity
              style={styles.saveButton}
              onPress={saveAddress}
              activeOpacity={0.85}
            >
              <Text style={styles.saveButtonText}>Save address</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  logoImage: {
    width: 92,
    height: 40,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  centerSection: {
    flex: 1,
    minWidth: 0,
    justifyContent: "center",
    overflow: "hidden",
  },
  pageTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.textPrimary,
  },
  locationSection: {
    justifyContent: "center",
    width: "100%",
  },
  deliveryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  deliveryLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: colors.secondary,
  },
  addressTitle: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.textPrimary,
    marginTop: 1,
  },
  addressSub: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 1,
  },
  cartButton: {
    position: "relative",
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  cartPlaceholder: {
    width: 42,
    height: 42,
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: colors.secondary,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: "#ffffff",
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 9,
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  modalLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 90,
    textAlignVertical: "top",
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: 14,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: '500',
  },
});
