import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useApp } from "../../context/AppContext";
import { colors } from "../../theme/colors";

export const AddressScreen = ({ navigation }) => {
  const {
    savedAddresses,
    selectedAddress,
    setSelectedAddress,
    addAddress,
    removeAddress,
    userProfile,
  } = useApp();
  const [modalVisible, setModalVisible] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: "Home",
    fullName: "",
    phone: "",
    addressString: "",
  });

  const handleSaveNewAddress = () => {
    if (
      !newAddress.fullName ||
      !newAddress.phone ||
      !newAddress.addressString
    ) {
      alert("Please fill in all details");
      return;
    }
    addAddress(newAddress);
    setModalVisible(false);
    setNewAddress({
      label: "Home",
      fullName: "",
      phone: "",
      addressString: "",
    });
  };

  const handleSelectAddress = (address) => {
    setSelectedAddress(address);
    navigation.goBack(); // Go back to checkout automatically
  };

  const handleCurrentLocation = async () => {
    setIsLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("Please allow location permission to use your current location.");
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Low,
      });
      const [place] = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
      const addressString = [
        place?.name,
        place?.street,
        place?.city,
        place?.region,
      ]
        .filter(Boolean)
        .join(", ");

      if (!addressString) {
        alert("Could not find a readable address for your location.");
        return;
      }

      setNewAddress({
        label: "Home",
        fullName: userProfile?.name || "",
        phone: userProfile?.phone || "",
        addressString,
      });
      setModalVisible(true);
    } catch (error) {
      alert("Could not detect your location. Please try again.");
    } finally {
      setIsLocating(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Delivery Address</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity
          style={styles.currentLocationBtn}
          activeOpacity={0.8}
          onPress={handleCurrentLocation}
          disabled={isLocating}
        >
          <Ionicons
            name={isLocating ? "locate-outline" : "navigate"}
            size={20}
            color={colors.primary}
          />
          <Text style={styles.currentLocationText}>
            {isLocating
              ? "Detecting current location..."
              : "Use current location"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.addNewBtn}
          activeOpacity={0.8}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons
            name="add-circle-outline"
            size={20}
            color={colors.primary}
          />
          <Text style={styles.addNewText}>Add a new address</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Saved Addresses</Text>

        {savedAddresses.map((addr) => {
          const isSelected = selectedAddress?.id === addr.id;
          return (
            <TouchableOpacity
              key={addr.id}
              style={[
                styles.addressCard,
                isSelected && styles.addressCardSelected,
              ]}
              onPress={() => handleSelectAddress(addr)}
              activeOpacity={0.8}
            >
              <View style={styles.addressLeft}>
                <Ionicons
                  name={
                    addr.label === "Home"
                      ? "home"
                      : addr.label === "Work"
                        ? "briefcase"
                        : "location"
                  }
                  size={20}
                  color={isSelected ? colors.primary : "#64748b"}
                />
                <View style={styles.addressDetails}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Text style={styles.addressLabel}>{addr.label}</Text>
                    {isSelected && (
                      <View style={styles.selectedBadge}>
                        <Text style={styles.selectedBadgeText}>SELECTED</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.addressName}>
                    {addr.fullName} · {addr.phone}
                  </Text>
                  <Text style={styles.addressString}>{addr.addressString}</Text>
                </View>
              </View>
              {/* Optional: Add a delete button */}
              <TouchableOpacity
                onPress={() => removeAddress(addr.id)}
                style={styles.deleteBtn}
              >
                <Ionicons name="trash-outline" size={18} color="#ef4444" />
              </TouchableOpacity>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Add New Address Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Address</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#0f172a" />
              </TouchableOpacity>
            </View>

            <View style={styles.labelRow}>
              {["Home", "Work", "Other"].map((lbl) => (
                <TouchableOpacity
                  key={lbl}
                  style={[
                    styles.labelChip,
                    newAddress.label === lbl && styles.labelChipActive,
                  ]}
                  onPress={() => setNewAddress({ ...newAddress, label: lbl })}
                >
                  <Text
                    style={[
                      styles.labelChipText,
                      newAddress.label === lbl && styles.labelChipTextActive,
                    ]}
                  >
                    {lbl}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={newAddress.fullName}
              onChangeText={(t) =>
                setNewAddress({ ...newAddress, fullName: t })
              }
            />
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              keyboardType="phone-pad"
              value={newAddress.phone}
              onChangeText={(t) => setNewAddress({ ...newAddress, phone: t })}
            />
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: "top" }]}
              placeholder="Complete Address (House No, Building, Street, Area)"
              multiline
              value={newAddress.addressString}
              onChangeText={(t) =>
                setNewAddress({ ...newAddress, addressString: t })
              }
            />

            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSaveNewAddress}
            >
              <Text style={styles.saveBtnText}>Save Address</Text>
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
    backgroundColor: "#f8fafc",
    paddingTop: Platform.OS === "android" ? 25 : 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  content: {
    padding: 16,
  },
  addNewBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#eff6ff",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#bfdbfe",
    marginBottom: 24,
  },
  addNewText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.primary,
  },
  currentLocationBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#f0fdf4",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#bbf7d0",
    marginBottom: 10,
  },
  currentLocationText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.primaryDark,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#64748b",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  addressCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
  },
  addressCardSelected: {
    borderColor: colors.primary,
    backgroundColor: "#f0fdf4",
  },
  addressLeft: {
    flexDirection: "row",
    flex: 1,
    gap: 12,
  },
  addressDetails: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
  },
  selectedBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  selectedBadgeText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#ffffff",
  },
  addressName: {
    fontSize: 13,
    fontWeight: "500",
    color: "#334155",
    marginTop: 4,
  },
  addressString: {
    fontSize: 13,
    color: "#64748b",
    lineHeight: 18,
    marginTop: 4,
  },
  deleteBtn: {
    padding: 8,
    alignSelf: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
  },
  labelRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  labelChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  labelChipActive: {
    backgroundColor: "#0f172a",
    borderColor: "#0f172a",
  },
  labelChipText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#64748b",
  },
  labelChipTextActive: {
    color: "#ffffff",
  },
  input: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: "#0f172a",
    marginBottom: 12,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
});
