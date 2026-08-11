import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Header } from "../../components/Header";
import { useApp } from "../../context/AppContext";
import { colors } from "../../theme/colors";

export const CartScreen = ({ navigation }) => {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    getCartTotal,
    placeOrder,
    userProfile,
  } = useApp();
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [deliveryAddress, setDeliveryAddress] = useState(
    "House #42, Main Bazaar, Near Village Hub, Ludhiana",
  );

  const subtotal = getCartTotal();
  const deliveryFee = subtotal > 300 ? 0 : 30;
  const grandTotal = subtotal + deliveryFee;

  const handleCheckout = () => {
    if (cart.length === 0) return;
    navigation.navigate("Checkout");
  };

  return (
    <View style={styles.container}>
      <Header
        navigation={navigation}
        title="Your Cart"
        showCart={false}
        showBack
      />

      {cart.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconWrap}>
            <Ionicons name="cart-outline" size={48} color={colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptyDesc}>
            Add farm-fresh produce and support local farmers
          </Text>
          <TouchableOpacity
            style={styles.shopBtn}
            onPress={() => navigation.navigate("MainTabs", { screen: "Home" })}
            activeOpacity={0.85}
          >
            <Text style={styles.shopBtnText}>Start Shopping</Text>
            <Ionicons name="arrow-forward" size={16} color="#ffffff" />
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.sectionTitle}>Items ({cart.length})</Text>
            {cart.map((item) => (
              <View key={item.product.id} style={styles.cartCard}>
                <Image
                  source={{ uri: item.product.image }}
                  style={styles.itemImage}
                />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemTitle} numberOfLines={2}>
                    {item.product.name}
                  </Text>
                  <Text style={styles.itemFarmer} numberOfLines={1}>
                    {item.product.farmer}
                  </Text>
                  <Text style={styles.itemPrice}>
                    ₹{item.product.price}
                    <Text style={styles.itemUnit}> / {item.product.unit}</Text>
                  </Text>
                </View>

                <View style={styles.rightCol}>
                  <TouchableOpacity
                    onPress={() => removeFromCart(item.product.id)}
                    style={styles.trashBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={16}
                      color={colors.error}
                    />
                  </TouchableOpacity>

                  <View style={styles.quantityControls}>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => updateQuantity(item.product.id, -1)}
                    >
                      <Ionicons
                        name="remove"
                        size={14}
                        color={colors.primary}
                      />
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{item.quantity}</Text>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => updateQuantity(item.product.id, 1)}
                    >
                      <Ionicons name="add" size={14} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}

            <Text style={styles.sectionTitle}>Delivery address</Text>
            <View style={styles.addressCard}>
              <View style={styles.addressIcon}>
                <Ionicons name="location" size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.addressHub}>{userProfile?.villageHub || userProfile?.city || "Central Hub"}</Text>
                <TextInput
                  style={styles.addressInput}
                  value={deliveryAddress}
                  onChangeText={setDeliveryAddress}
                  multiline
                />
              </View>
            </View>

            <Text style={styles.sectionTitle}>Payment</Text>
            <View style={styles.paymentContainer}>
              {[
                {
                  id: "COD",
                  icon: "cash-outline",
                  label: "Cash on Delivery",
                  color: colors.primary,
                },
                {
                  id: "UPI",
                  icon: "qr-code-outline",
                  label: "UPI / QR Code",
                  color: colors.info,
                },
              ].map((opt) => (
                <TouchableOpacity
                  key={opt.id}
                  style={[
                    styles.paymentCard,
                    paymentMethod === opt.id && styles.paymentSelected,
                  ]}
                  onPress={() => setPaymentMethod(opt.id)}
                  activeOpacity={0.8}
                >
                  <Ionicons name={opt.icon} size={20} color={opt.color} />
                  <Text style={styles.paymentText}>{opt.label}</Text>
                  {paymentMethod === opt.id && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={colors.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Bill details</Text>
            <View style={styles.billCard}>
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Items total</Text>
                <Text style={styles.billVal}>₹{subtotal}</Text>
              </View>
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Delivery</Text>
                <Text
                  style={[
                    styles.billVal,
                    deliveryFee === 0 && { color: colors.success },
                  ]}
                >
                  {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                </Text>
              </View>
              {subtotal < 300 && (
                <Text style={styles.freeHint}>
                  Add ₹{300 - subtotal} more for free delivery
                </Text>
              )}
              <View style={[styles.billRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Grand total</Text>
                <Text style={styles.totalVal}>₹{grandTotal}</Text>
              </View>
            </View>
          </ScrollView>

          <View style={styles.bottomBar}>
            <View>
              <Text style={styles.bottomLabel}>Total</Text>
              <Text style={styles.bottomTotal}>₹{grandTotal}</Text>
            </View>
            <TouchableOpacity
              style={styles.checkoutBtn}
              onPress={handleCheckout}
              activeOpacity={0.85}
            >
              <Text style={styles.checkoutText}>Place Order</Text>
              <Ionicons name="arrow-forward" size={18} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </>
      )}
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
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
  },
  emptyIconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "500",
    color: colors.textPrimary,
  },
  emptyDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 22,
    lineHeight: 18,
  },
  shopBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  shopBtnText: {
    color: "#ffffff",
    fontWeight: "500",
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.textPrimary,
    marginTop: 8,
    marginBottom: 10,
  },
  cartCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  itemImage: {
    width: 64,
    height: 64,
    borderRadius: 10,
    backgroundColor: colors.background,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.textPrimary,
  },
  itemFarmer: {
    fontSize: 10,
    color: colors.primaryDark,
    marginTop: 2,
    fontWeight: "500",
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.textPrimary,
    marginTop: 4,
  },
  itemUnit: {
    fontSize: 11,
    fontWeight: "500",
    color: colors.textSecondary,
  },
  rightCol: {
    alignItems: "flex-end",
    gap: 10,
  },
  trashBtn: {
    padding: 2,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    overflow: "hidden",
  },
  qtyBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  qtyText: {
    fontSize: 13,
    fontWeight: "500",
    minWidth: 22,
    textAlign: "center",
    color: colors.primaryDark,
  },
  addressCard: {
    flexDirection: "row",
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
    alignItems: "flex-start",
  },
  addressIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  addressHub: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.primaryDark,
  },
  addressInput: {
    fontSize: 12,
    color: colors.textPrimary,
    marginTop: 4,
    lineHeight: 18,
    padding: 0,
  },
  paymentContainer: {
    gap: 8,
  },
  paymentCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    padding: 13,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    gap: 10,
  },
  paymentSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  paymentText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "500",
    color: colors.textPrimary,
  },
  billCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  billRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  billLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  billVal: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.textPrimary,
  },
  freeHint: {
    fontSize: 11,
    color: colors.orange,
    fontWeight: "500",
    marginBottom: 8,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
    marginTop: 4,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: colors.textPrimary,
  },
  totalVal: {
    fontSize: 17,
    fontWeight: "500",
    color: colors.primaryDark,
  },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 10,
  },
  bottomLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  bottomTotal: {
    fontSize: 18,
    fontWeight: "500",
    color: colors.textPrimary,
  },
  checkoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 8,
  },
  checkoutText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "500",
  },
});
