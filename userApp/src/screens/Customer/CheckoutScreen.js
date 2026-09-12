import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../../theme/colors";
import { useApp } from "../../context/AppContext";
import { apiService } from "../../services/api";

export const CheckoutScreen = ({ navigation }) => {
  const { cart, userProfile, getCartTotal, placeOrder } = useApp();
  const [loading, setLoading] = useState(false);
  const [selectedTip, setSelectedTip] = useState(0);

  const subtotal = getCartTotal();
  const deliveryFee = subtotal > 300 ? 0 : 30; // free delivery over 300
  const platformFee = 15;
  const total = subtotal + deliveryFee + platformFee + selectedTip;

  const tipOptions = [0, 10, 20, 30, 50];

  const handleProceedToPay = async () => {
    if (total === 0) return;

    setLoading(true);
    try {
      const data = await apiService.createOrder(total);
      if (data.success && data.order?.id && data.keyId) {
        setLoading(false);
        navigation.navigate("RazorpayCheckout", {
          order: data.order,
          keyId: data.keyId,
          onSuccess: async (paymentId) => {
            try {
              const verification = await apiService.verifyPayment({
                razorpay_order_id: paymentId.razorpay_order_id,
                razorpay_payment_id: paymentId.razorpay_payment_id,
                razorpay_signature: paymentId.razorpay_signature,
              });
              if (!verification.success)
                throw new Error("Payment verification failed");
              await placeOrder("RAZORPAY", userProfile?.deliveryAddress);
              Alert.alert("Success", "Payment successful! Order placed.");
              navigation.navigate("MainTabs", { screen: "OrderTracking" });
            } catch (error) {
              Alert.alert(
                "Payment Verification Failed",
                error.message || "Please contact support.",
              );
            }
          },
          onFailure: () => {
            Alert.alert(
              "Payment Failed",
              "Something went wrong with your payment.",
            );
          },
        });
      } else {
        setLoading(false);
        Alert.alert(
          "Error",
          "Could not create order. Please check backend connection.",
        );
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
      Alert.alert(
        "Error",
        "Failed to connect to server. Ensure backend is running.",
      );
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
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Delivery Time Banner (Swiggy Style) */}
        <View style={styles.deliveryBanner}>
          <View style={styles.deliveryBannerLeft}>
            <View style={styles.deliveryIconBox}>
              <MaterialCommunityIcons name="clock-fast" size={20} color="#ffffff" />
            </View>
            <View>
              <Text style={styles.deliveryTitle}>Delivery in 10-15 mins</Text>
              <Text style={styles.deliverySub}>Home - {userProfile?.villageHub || "Main Hub"}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.changeAddressBtn}>
            <Text style={styles.changeAddressText}>Change</Text>
          </TouchableOpacity>
        </View>

        {/* Tip Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Tip your delivery partner</Text>
            <Text style={styles.cardSubTitle}>Thank them for delivering your essentials safely.</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tipScroll}>
            {tipOptions.map((amount, idx) => (
              <TouchableOpacity
                key={idx}
                activeOpacity={0.7}
                onPress={() => setSelectedTip(amount)}
                style={[
                  styles.tipBox,
                  selectedTip === amount && styles.tipBoxActive
                ]}
              >
                {amount === 0 ? (
                  <Text style={[styles.tipBoxText, selectedTip === amount && styles.tipBoxTextActive]}>No Tip</Text>
                ) : (
                  <>
                    {amount === 30 && <Text style={styles.tipPopular}>Popular</Text>}
                    <Text style={[styles.tipBoxText, selectedTip === amount && styles.tipBoxTextActive]}>₹{amount}</Text>
                  </>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Coupon Section */}
        <TouchableOpacity style={styles.couponCard} activeOpacity={0.8}>
          <View style={styles.couponLeft}>
            <MaterialCommunityIcons name="brightness-percent" size={24} color={colors.primary} />
            <Text style={styles.couponText}>Apply Coupon</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#64748b" />
        </TouchableOpacity>

        {/* Bill Summary */}
        <View style={styles.card}>
          <Text style={[styles.cardTitle, { marginBottom: 16 }]}>Bill Details</Text>

          <View style={styles.billRow}>
            <Text style={styles.billText}>Item Total</Text>
            <Text style={styles.billVal}>₹{subtotal}</Text>
          </View>

          <View style={styles.billRow}>
            <Text style={styles.billText}>Delivery Partner Fee</Text>
            <Text style={[styles.billVal, deliveryFee === 0 && { color: "#16a34a" }]}>
              {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
            </Text>
          </View>

          <View style={styles.billRow}>
            <Text style={styles.billText}>Platform Fee</Text>
            <Text style={styles.billVal}>₹{platformFee}</Text>
          </View>

          {selectedTip > 0 && (
            <View style={styles.billRow}>
              <Text style={styles.billText}>Delivery Partner Tip</Text>
              <Text style={styles.billVal}>₹{selectedTip}</Text>
            </View>
          )}

          <View style={styles.dashedLine} />

          <View style={[styles.billRow, { marginTop: 12 }]}>
            <Text style={styles.totalText}>To Pay</Text>
            <Text style={styles.totalAmount}>₹{total}</Text>
          </View>
        </View>

        {/* Cancellation Policy */}
        <View style={styles.cancellationCard}>
          <Text style={styles.cancellationTitle}>Review your order and address details to avoid cancellations</Text>
          <Text style={styles.cancellationSub}>
            <Text style={{ fontWeight: '600', color: '#ef4444' }}>Note: </Text>
            If you choose to cancel, you can do it within 60 seconds after placing order. 100% cancellation fee applies after this period.
          </Text>
        </View>
      </ScrollView>

      {/* Modern Gradient Pill Footer */}
      <View style={styles.footer}>
        <View style={styles.secureBadge}>
          <Feather name="shield" size={12} color="#64748b" />
          <Text style={styles.secureText}>100% Secure Payments powered by Razorpay</Text>
        </View>
        
        <TouchableOpacity
          onPress={handleProceedToPay}
          disabled={loading}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#16a34a', '#15803d']} // Sleek green gradient
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.payBtn, loading && styles.disabledBtn]}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <View style={styles.payBtnInner}>
                <View>
                  <Text style={styles.payBtnTotal}>₹{total}</Text>
                  <Text style={styles.payBtnSub}>TOTAL</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <Text style={styles.payBtnAction}>Proceed to Pay</Text>
                  <Ionicons name="caret-forward" size={14} color="#ffffff" />
                </View>
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f5f9", // subtle gray background
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#0f172a",
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  content: {
    padding: 14,
    paddingBottom: 40,
  },
  deliveryBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  deliveryBannerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  deliveryIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  deliveryTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
  },
  deliverySub: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 2,
  },
  changeAddressBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  changeAddressText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primary,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  cardHeader: {
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
  },
  cardSubTitle: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  tipScroll: {
    paddingVertical: 8,
    gap: 10,
  },
  tipBox: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    position: 'relative',
    minWidth: 70,
  },
  tipBoxActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  tipBoxText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
  },
  tipBoxTextActive: {
    color: colors.primaryDark,
  },
  tipPopular: {
    position: 'absolute',
    top: -8,
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: 'hidden',
  },
  couponCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#cbd5e1',
  },
  couponLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  couponText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },
  billRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  billText: {
    fontSize: 13,
    color: "#475569",
  },
  billVal: {
    fontSize: 13,
    fontWeight: "500",
    color: "#0f172a",
  },
  dashedLine: {
    height: 1,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderStyle: "dashed",
    borderRadius: 1,
    marginVertical: 12,
  },
  totalText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },
  cancellationCard: {
    backgroundColor: "#fef2f2",
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#fee2e2'
  },
  cancellationTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#7f1d1d",
    marginBottom: 4,
  },
  cancellationSub: {
    fontSize: 11,
    color: "#991b1b",
    lineHeight: 16,
  },
  footer: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 30 : 16,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
  },
  secureBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginBottom: 12,
  },
  secureText: {
    fontSize: 11,
    color: "#64748b",
    fontWeight: '500'
  },
  payBtn: {
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  disabledBtn: {
    opacity: 0.7,
  },
  payBtnInner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  payBtnTotal: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "700",
  },
  payBtnSub: {
    color: "#dcfce7",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  payBtnAction: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
});
