import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useDelivery } from "../context/DeliveryContext";

export const LoginScreen = () => {
  const { loginUser } = useDelivery();
  const [riderId, setRiderId] = useState("");
  const [password, setPassword] = useState("");
  const [focusedInput, setFocusedInput] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const riderInputRef = useRef(null);
  const passwordInputRef = useRef(null);

  const handleLogin = async () => {
    if (!riderId.trim() || !password.trim()) {
      Alert.alert("Incomplete login", "Enter your Rider ID and password.");
      return;
    }

    setIsSubmitting(true);
    await loginUser({ riderId: riderId.trim(), password });
    setIsSubmitting(false);
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
                <Ionicons name="bicycle" size={40} color="#0284c7" />
              </View>
              <Text style={styles.title}>Rider Duty</Text>
              <Text style={styles.subtitle}>
                Enter the ID and password assigned to you by the Hub Manager.
              </Text>
            </View>

            <View style={styles.form}>
              <Text style={styles.label}>Rider ID</Text>
              <View
                style={[
                  styles.inputWrap,
                  focusedInput === "id" && styles.inputWrapFocused,
                ]}
                onTouchStart={() => riderInputRef.current?.focus()}
              >
                <Ionicons
                  name="id-card-outline"
                  size={20}
                  color={focusedInput === "id" ? "#0284c7" : "#94a3b8"}
                  style={styles.inputIcon}
                />
                <TextInput
                  ref={riderInputRef}
                  style={styles.input}
                  placeholder="e.g. RDR-4091"
                  placeholderTextColor="#94a3b8"
                  value={riderId}
                  editable
                  keyboardType="default"
                  autoCorrect={false}
                  autoComplete="username"
                  textContentType="username"
                  caretHidden={false}
                  showSoftInputOnFocus
                  selectionColor="#0284c7"
                  onChangeText={setRiderId}
                  onFocus={() => setFocusedInput("id")}
                  onBlur={() => setFocusedInput(null)}
                  autoCapitalize="characters"
                />
              </View>

              <Text style={styles.label}>Password</Text>
              <View
                style={[
                  styles.inputWrap,
                  focusedInput === "password" && styles.inputWrapFocused,
                ]}
                onTouchStart={() => passwordInputRef.current?.focus()}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={focusedInput === "password" ? "#0284c7" : "#94a3b8"}
                  style={styles.inputIcon}
                />
                <TextInput
                  ref={passwordInputRef}
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#94a3b8"
                  secureTextEntry
                  value={password}
                  editable
                  keyboardType="default"
                  autoCorrect={false}
                  autoComplete="password"
                  textContentType="password"
                  caretHidden={false}
                  showSoftInputOnFocus
                  selectionColor="#0284c7"
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
                    colors={["#0284c7", "#0369a1"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.loginBtn}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color="#ffffff" />
                    ) : (
                      <>
                        <Text style={styles.loginBtnText}>Start Duty</Text>
                        <Ionicons
                          name="log-in-outline"
                          size={20}
                          color="#ffffff"
                        />
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.footer}>
              <Ionicons name="location-outline" size={14} color="#64748b" />
              <Text style={styles.footerText}>
                GPS Tracking Enabled during Duty
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
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
    backgroundColor: "#e0f2fe",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#bae6fd",
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
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 20,
  },
  inputWrapFocused: {
    borderColor: "#0284c7",
    shadowColor: "#0284c7",
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
    minWidth: 0,
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
    shadowColor: "#0284c7",
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
});
