import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { useApp } from "../../context/AppContext";

export const SignupScreen = ({ navigation }) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const selectedRole = "customer";
  const [focusedInput, setFocusedInput] = useState(null);
  const [loading, setLoading] = useState(false);
  const { loginUser } = useApp();

  const skipSignup = () => {
    loginUser({ name: "Guest", phone: "" });
    navigation.replace("MainTabs");
  };

  const handleSignup = async () => {
    if (!name || !phone || !password) {
      Alert.alert("Error", "Name, Phone, and Password are required.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        "https://farm-mart-api.onrender.com/api/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            phone,
            city,
            password,
            role: selectedRole,
          }),
        },
      );
      const data = await response.json();
      setLoading(false);

      if (data.success) {
        Alert.alert(
          "Success 🎉",
          "Account created successfully! Please log in.",
          [{ text: "Log In Now", onPress: () => navigation.navigate("Login") }],
        );
      } else {
        Alert.alert(
          "Registration Failed",
          data.message || "Something went wrong",
        );
      }
    } catch (error) {
      setLoading(false);
      Alert.alert("Error", "Could not connect to server.");
      console.error(error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0fdf4" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        >
          {/* Top Bar Navigation */}
          <View style={styles.headerBar}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={20} color="#0f172a" />
            </TouchableOpacity>

            <View style={styles.badgeWrap}>
              <Ionicons name="leaf" size={13} color={colors.primaryDark} />
              <Text style={styles.badgeText}>Join Farmart</Text>
            </View>

            <TouchableOpacity
              style={styles.skipBtn}
              onPress={skipSignup}
              activeOpacity={0.7}
            >
              <Text style={styles.skipText}>Skip</Text>
              <Ionicons name="chevron-forward" size={14} color="#64748b" />
            </TouchableOpacity>
          </View>

          {/* Hero Heading */}
          <View style={styles.heroSection}>
            <Text style={styles.title}>Create Account ✨</Text>
            <Text style={styles.subtitle}>
              Sign up as a customer and get fresh groceries delivered fast.
            </Text>
          </View>

          {/* Main Form Card */}
          <View style={styles.card}>
            {/* Tab Switcher Header */}
            <View style={styles.tabHeader}>
              <TouchableOpacity
                style={styles.inactiveTab}
                onPress={() => navigation.navigate("Login")}
                activeOpacity={0.7}
              >
                <Text style={styles.inactiveTabText}>Log In</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.activeTab} activeOpacity={0.9}>
                <Text style={styles.activeTabText}>Sign Up</Text>
                <View style={styles.tabIndicator} />
              </TouchableOpacity>
            </View>

            <View style={styles.formSection}>
              {/* Full Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <View
                  style={[
                    styles.inputWrap,
                    focusedInput === "name" && styles.inputWrapFocused,
                  ]}
                >
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color={focusedInput === "name" ? colors.primary : "#94a3b8"}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your name"
                    value={name}
                    onChangeText={setName}
                    onFocus={() => setFocusedInput("name")}
                    onBlur={() => setFocusedInput(null)}
                    placeholderTextColor="#94a3b8"
                  />
                </View>
              </View>

              {/* Phone Number */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <View
                  style={[
                    styles.inputWrap,
                    focusedInput === "phone" && styles.inputWrapFocused,
                  ]}
                >
                  <Ionicons
                    name="call-outline"
                    size={20}
                    color={
                      focusedInput === "phone" ? colors.primary : "#94a3b8"
                    }
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter 10-digit mobile"
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={setPhone}
                    onFocus={() => setFocusedInput("phone")}
                    onBlur={() => setFocusedInput(null)}
                    placeholderTextColor="#94a3b8"
                  />
                </View>
              </View>

              {/* City */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>City / Location</Text>
                <View
                  style={[
                    styles.inputWrap,
                    focusedInput === "city" && styles.inputWrapFocused,
                  ]}
                >
                  <Ionicons
                    name="location-outline"
                    size={20}
                    color={focusedInput === "city" ? colors.primary : "#94a3b8"}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Ludhiana, Punjab"
                    value={city}
                    onChangeText={setCity}
                    onFocus={() => setFocusedInput("city")}
                    onBlur={() => setFocusedInput(null)}
                    placeholderTextColor="#94a3b8"
                  />
                </View>
              </View>

              {/* Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Create Password</Text>
                <View
                  style={[
                    styles.inputWrap,
                    focusedInput === "password" && styles.inputWrapFocused,
                  ]}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={
                      focusedInput === "password" ? colors.primary : "#94a3b8"
                    }
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Choose a strong password"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => setFocusedInput("password")}
                    onBlur={() => setFocusedInput(null)}
                    placeholderTextColor="#94a3b8"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeBtn}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color="#64748b"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Terms Hint */}
              <Text style={styles.termsText}>
                By creating an account, you agree to Farmart's{" "}
                <Text style={styles.termsHighlight}>Terms of Service</Text> &{" "}
                <Text style={styles.termsHighlight}>Privacy Policy</Text>.
              </Text>

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.primaryBtn, loading && styles.disabledBtn]}
                onPress={handleSignup}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <View style={styles.btnInner}>
                    <Text style={styles.primaryBtnText}>
                      Complete Registration
                    </Text>
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={20}
                      color="#ffffff"
                    />
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer Section */}
          <View style={styles.footerSection}>
            <Text style={styles.footerText}>Already registered?</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("Login")}
              activeOpacity={0.7}
            >
              <Text style={styles.linkText}>Log In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0fdf4",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 12 : 20,
    paddingBottom: 30,
  },
  headerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  badgeWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#dcfce7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.primaryDark,
  },
  skipBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  skipText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  heroSection: {
    alignItems: "center",
    marginBottom: 14,
  },
  title: {
    fontSize: 26,
    fontWeight: '500',
    color: "#0f172a",
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13.5,
    color: colors.textSecondary,
    textAlign: "center",
    paddingHorizontal: 12,
    lineHeight: 20,
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 22,
    shadowColor: "rgba(15, 23, 42, 0.12)",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 10,
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.8)",
  },
  tabHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    marginBottom: 20,
  },
  activeTab: {
    paddingBottom: 10,
    position: "relative",
  },
  activeTabText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.primary,
  },
  tabIndicator: {
    position: "absolute",
    bottom: -1,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  inactiveTab: {
    paddingBottom: 10,
    marginRight: 24,
  },
  inactiveTabText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textMuted,
  },
  formSection: {
    gap: 14,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: "#334155",
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
  },
  inputWrapFocused: {
    borderColor: colors.primary,
    backgroundColor: "#ffffff",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#0f172a",
    fontWeight: "500",
  },
  eyeBtn: {
    padding: 6,
  },
  termsText: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 18,
    marginTop: 2,
  },
  termsHighlight: {
    color: colors.primaryDark,
    fontWeight: '500',
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    height: 54,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 6,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 8,
  },
  disabledBtn: {
    opacity: 0.7,
  },
  btnInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  primaryBtnText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: '500',
  },
  footerSection: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: 22,
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  linkText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
});
