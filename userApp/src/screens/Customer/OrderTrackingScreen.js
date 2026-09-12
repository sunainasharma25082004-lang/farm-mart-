import React, { Fragment } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Alert,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Header } from "../../components/Header";
import { useApp } from "../../context/AppContext";
import { colors } from "../../theme/colors";

const statusMeta = {
  PLACED: {
    label: "Order Placed",
    color: "#3b82f6",
    bg: "#eff6ff",
    icon: "clipboard",
  },
  PACKED: {
    label: "Order Packed",
    color: "#8b5cf6",
    bg: "#f5f3ff",
    icon: "box",
  },
  IN_TRANSIT: {
    label: "On the way",
    color: "#f59e0b",
    bg: "#fffbeb",
    icon: "truck",
  },
  DELIVERED: {
    label: "Delivered",
    color: "#16a34a",
    bg: "#f0fdf4",
    icon: "check-circle",
  },
};

export const OrderTrackingScreen = ({ navigation }) => {
  const { orders, products, addToCart } = useApp();

  const showHelp = () => {
    Alert.alert(
      "Need help?",
      "Our support team will get back to you shortly.",
      [
        { text: "Close", style: "cancel" },
        {
          text: "Call support",
          onPress: () => Alert.alert("Support", "Call us at 1800-123-4567."),
        },
      ],
    );
  };

  const reorder = (order) => {
    let addedItems = 0;
    order.items.forEach((item) => {
      const product = products.find(
        (candidate) => candidate.name === item.name,
      );
      if (product) {
        addToCart(product);
        addedItems += 1;
      }
    });
    Alert.alert(
      addedItems ? "Added to cart" : "Items unavailable",
      addedItems
        ? `${addedItems} item${addedItems > 1 ? "s" : ""} from this order added to your cart.`
        : "These products are currently unavailable.",
    );
  };

  const trackDelivery = () => {
    Alert.alert(
      "Live tracking",
      "Your delivery partner is on the way. Estimated arrival: 20-30 mins.",
    );
  };

  const getStepState = (orderStatus, step) => {
    const order = ["PLACED", "PACKED", "IN_TRANSIT", "DELIVERED"];
    let idx = order.indexOf(orderStatus);
    if (idx < 0) idx = 0;

    if (orderStatus === "PLACED" && step === 0) return "current";
    if (orderStatus === "PLACED" && step === 1) return "todo";
    if (orderStatus === "IN_TRANSIT" && step <= 2)
      return step < 2 ? "done" : "current";
    if (orderStatus === "DELIVERED") return "done";

    if (step < idx) return "done";
    if (step === idx) return "current";
    return "todo";
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header navigation={navigation} title="Your Orders" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {orders.length === 0 ? (
          <View style={styles.emptyView}>
            <View style={styles.emptyIcon}>
              <Ionicons name="receipt-outline" size={48} color="#94a3b8" />
            </View>
            <Text style={styles.emptyTitle}>No orders yet</Text>
            <Text style={styles.emptyText}>
              You haven't placed any orders. Discover amazing local products
              today!
            </Text>
            <TouchableOpacity
              style={styles.shopNowBtn}
              onPress={() => navigation.navigate("Home")}
            >
              <Text style={styles.shopNowText}>Start Shopping</Text>
            </TouchableOpacity>
          </View>
        ) : (
          orders.map((order) => {
            const meta = statusMeta[order.status] || statusMeta.PLACED;
            const isDelivered = order.status === "DELIVERED";

            const steps = [
              { key: 0, title: "Placed", icon: "document-text" },
              { key: 1, title: "Packed", icon: "cube" },
              { key: 2, title: "On way", icon: "bicycle" },
              { key: 3, title: "Done", icon: "home" },
            ];

            return (
              <View key={order.id} style={styles.orderCard}>
                {/* Order Header (Restaurant / Hub details) */}
                <View style={styles.orderHeader}>
                  <View style={styles.orderHeaderLeft}>
                    <View style={styles.hubIconBox}>
                      <Ionicons
                        name="storefront"
                        size={20}
                        color={colors.primary}
                      />
                    </View>
                    <View>
                      <Text style={styles.hubName}>
                        {order.hubName ||
                          order.deliveryAddress ||
                          "sFARMART Local Hub"}
                      </Text>
                      <Text style={styles.orderDate}>
                        {order.date || "Today, 12:30 PM"}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={[styles.statusBadge, { backgroundColor: meta.bg }]}
                  >
                    <Feather name={meta.icon} size={12} color={meta.color} />
                    <Text style={[styles.statusText, { color: meta.color }]}>
                      {meta.label}
                    </Text>
                  </View>
                </View>

                {/* Dotted Separator */}
                <View style={styles.dottedSeparator} />

                {/* Items List */}
                <View style={styles.itemsBox}>
                  {order.items.map((item, idx) => (
                    <View key={idx} style={styles.itemRow}>
                      <View style={styles.itemRowLeft}>
                        <View style={styles.vegIndicator}>
                          <View style={styles.vegDot} />
                        </View>
                        <Text style={styles.itemQty}>{item.qty} x</Text>
                        <Text style={styles.itemText} numberOfLines={1}>
                          {item.name}
                        </Text>
                      </View>
                      <Text style={styles.itemPrice}>
                        ₹{item.price * item.qty}
                      </Text>
                    </View>
                  ))}

                  {order.total != null && (
                    <View style={styles.totalRow}>
                      <Text style={styles.totalLabel}>Bill Total</Text>
                      <Text style={styles.totalPrice}>₹{order.total}</Text>
                    </View>
                  )}
                </View>

                {/* Dotted Separator */}
                <View style={styles.dottedSeparator} />

                {/* Dynamic Timeline or Reorder Info */}
                {!isDelivered ? (
                  <View style={styles.timeline}>
                    {steps.map((step, i) => {
                      const state = getStepState(order.status, step.key);
                      const active = state === "done" || state === "current";
                      return (
                        <Fragment key={step.key}>
                          <View style={styles.timelineStep}>
                            <View
                              style={[
                                styles.stepDot,
                                active && styles.stepActive,
                                state === "current" && styles.stepCurrent,
                              ]}
                            >
                              <Ionicons
                                name={step.icon}
                                size={12}
                                color={active ? "#ffffff" : "#94a3b8"}
                              />
                            </View>
                            <Text
                              style={[
                                styles.stepTitle,
                                active && styles.stepTitleActive,
                              ]}
                            >
                              {step.title}
                            </Text>
                          </View>
                          {i < steps.length - 1 && (
                            <View
                              style={[
                                styles.stepLine,
                                active && i < 2 && styles.stepLineActive,
                              ]}
                            />
                          )}
                        </Fragment>
                      );
                    })}
                  </View>
                ) : (
                  <View style={styles.deliveredMsgBox}>
                    <Feather name="check-circle" size={16} color="#16a34a" />
                    <Text style={styles.deliveredMsgText}>
                      Order delivered successfully. Hope you liked it!
                    </Text>
                  </View>
                )}

                {/* Action Buttons Footer */}
                <View style={styles.actionFooter}>
                  {isDelivered ? (
                    <>
                      <TouchableOpacity
                        style={styles.secondaryBtn}
                        onPress={() =>
                          Alert.alert(
                            "Thanks!",
                            "Your rating helps us improve.",
                          )
                        }
                      >
                        <Text style={styles.secondaryBtnText}>Rate Order</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.primaryBtnOutline}
                        onPress={() => reorder(order)}
                      >
                        <Text style={styles.primaryBtnOutlineText}>
                          Reorder
                        </Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <TouchableOpacity
                        style={styles.secondaryBtn}
                        onPress={showHelp}
                      >
                        <Text style={styles.secondaryBtnText}>Help</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        activeOpacity={0.8}
                        style={{ flex: 1 }}
                        onPress={trackDelivery}
                      >
                        <LinearGradient
                          colors={["#16a34a", "#15803d"]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={styles.gradientBtn}
                        >
                          <Text style={styles.gradientBtnText}>
                            Track Delivery
                          </Text>
                          <Feather name="map-pin" size={14} color="#ffffff" />
                        </LinearGradient>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f5f9", // subtle premium bg
    paddingTop: Platform.OS === "android" ? 25 : 0,
  },
  scrollContent: {
    padding: 14,
    paddingBottom: 40,
  },
  emptyView: {
    alignItems: "center",
    paddingVertical: 100,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  shopNowBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopNowText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  orderCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    paddingTop: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  orderHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  hubIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#f0fdf4",
    alignItems: "center",
    justifyContent: "center",
  },
  hubName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
  },
  orderDate: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  dottedSeparator: {
    height: 1,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderStyle: "dashed",
    borderRadius: 1,
    marginHorizontal: 16,
  },
  itemsBox: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  itemRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 10,
  },
  vegIndicator: {
    width: 12,
    height: 12,
    borderWidth: 1,
    borderColor: "#16a34a",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    borderRadius: 2,
  },
  vegDot: {
    width: 6,
    height: 6,
    backgroundColor: "#16a34a",
    borderRadius: 3,
  },
  itemQty: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0f172a",
    marginRight: 6,
  },
  itemText: {
    fontSize: 13,
    color: "#334155",
    flex: 1,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 12,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0f172a",
  },
  totalPrice: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
  },
  timeline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: "#f8fafc",
  },
  timelineStep: {
    alignItems: "center",
    width: 50,
  },
  stepDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
  },
  stepActive: {
    backgroundColor: colors.primary,
  },
  stepCurrent: {
    borderWidth: 2,
    borderColor: "#bbf7d0",
  },
  stepTitle: {
    fontSize: 10,
    fontWeight: "600",
    color: "#94a3b8",
    marginTop: 6,
    textAlign: "center",
  },
  stepTitleActive: {
    color: "#0f172a",
  },
  stepLine: {
    flex: 1,
    height: 3,
    backgroundColor: "#e2e8f0",
    marginBottom: 16,
    marginHorizontal: 4,
    borderRadius: 2,
  },
  stepLineActive: {
    backgroundColor: colors.primary,
  },
  deliveredMsgBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    padding: 16,
    gap: 8,
  },
  deliveredMsgText: {
    fontSize: 12,
    color: "#475569",
    fontWeight: "500",
  },
  actionFooter: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  secondaryBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
  },
  primaryBtnOutline: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnOutlineText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primaryDark,
  },
  gradientBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  gradientBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
});
