import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import {
  DEMO_PARTNER_ID,
  DEMO_PASSWORD,
  usePartner,
} from "../context/PartnerContext";
import { colors } from "../theme/colors";

export const LoginScreen = () => {
  const { loginUser } = usePartner();
  const [partnerId, setPartnerId] = useState("");
  const [password, setPassword] = useState("");
  const [focusedInput, setFocusedInput] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!partnerId.trim() || !password.trim()) {
      Alert.alert("Incomplete login", "Enter your Partner ID and password.");
      return;
    }

    setIsSubmitting(true);
    await loginUser({ partnerId: partnerId.trim(), password });
    setIsSubmitting(false);
  };

  const useDemoCredentials = () => {
    setPartnerId(DEMO_PARTNER_ID);
    setPassword(DEMO_PASSWORD);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.innerContainer}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.header}>
              <View style={styles.logoBox}>
                <Ionicons name="storefront" size={40} color={colors.primary} />
              </View>
              <Text style={styles.title}>Partner Hub</Text>
              <Text style={styles.subtitle}>
                Enter the credentials provided by the Admin to access your
                store.
              </Text>
            </View>

            <View style={styles.form}>
              <Text style={styles.label}>Partner ID / Email</Text>
              <View
                style={[
                  styles.inputWrap,
                  focusedInput === "id" && styles.inputWrapFocused,
                ]}
              >
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={focusedInput === "id" ? colors.primary : "#94a3b8"}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. PRT-9821"
                  placeholderTextColor="#94a3b8"
                  value={partnerId}
                  onChangeText={setPartnerId}
                  onFocus={() => setFocusedInput("id")}
                  onBlur={() => setFocusedInput(null)}
                  autoCapitalize="none"
                />
              </View>

              <Text style={styles.label}>Password</Text>
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
                  placeholder="••••••••"
                  placeholderTextColor="#94a3b8"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setFocusedInput("password")}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>

              <View style={{ marginTop: 10 }}>
                <TouchableOpacity
                  onPress={handleLogin}
                  disabled={isSubmitting}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={["#16a34a", "#047857"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.loginBtn}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color="#ffffff" />
                    ) : (
                      <>
                        <Text style={styles.loginBtnText}>Secure Login</Text>
                        <Ionicons
                          name="arrow-forward"
                          size={18}
                          color="#ffffff"
                        />
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.footer}>
              <Ionicons name="shield-checkmark" size={14} color="#64748b" />
              <Text style={styles.footerText}>Secured by Farmart Admin</Text>
            </View>
            {__DEV__ && (
              <>
                <TouchableOpacity
                  style={styles.demoBtn}
                  onPress={useDemoCredentials}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="flask-outline"
                    size={16}
                    color={colors.primaryDark}
                  />
                  <Text style={styles.demoBtnText}>Use demo credentials</Text>
                </TouchableOpacity>
                <Text style={styles.demoHint}>
                  Demo ID: {DEMO_PARTNER_ID} · Password: {DEMO_PASSWORD}
                </Text>
              </>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  innerContainer: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: "#f0fdf4",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  form: {
    width: "100%",
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#334155",
    marginBottom: 8,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 20,
  },
  inputWrapFocused: {
    borderColor: colors.primary,
    backgroundColor: "#ffffff",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#0f172a",
    fontWeight: "500",
  },
  loginBtn: {
    flexDirection: "row",
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    shadowColor: "#16a34a",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  loginBtnText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
    gap: 6,
  },
  footerText: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "500",
  },
  demoBtn: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 18,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  demoBtnText: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: "600",
  },
  demoHint: {
    color: "#94a3b8",
    fontSize: 10,
    textAlign: "center",
    marginTop: 8,
  },
});
