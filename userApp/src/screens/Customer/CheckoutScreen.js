import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  TextInput,
  Image,
  Modal,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { useCart } from '../../context/CartContext';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/api';

export const CheckoutScreen = ({ navigation }) => {
  const { items, vendorId, vendorName, billSummary, placeOrder } = useCart();
  const { userProfile } = useApp();

  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('UPI'); // Default to modern instant UPI
  const [deliveryAddress, setDeliveryAddress] = useState({
    name: userProfile?.fullName || userProfile?.name || 'Rajesh Kumar',
    phone: userProfile?.phone || '9876543210',
    line1: userProfile?.address || 'Flat 302, Green Avenue, Model Town',
    city: 'Ludhiana',
    pincode: '141001'
  });

  // Payment Gateway Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [selectedUpiApp, setSelectedUpiApp] = useState('gpay');
  const [upiIdInput, setUpiIdInput] = useState('rajesh@okhdfcbank');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8921');
  const [paymentTab, setPaymentTab] = useState('upi'); // 'upi' | 'card' | 'qr'

  // Post-Order Confirmation Receipt Modal
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  const grandTotal = billSummary?.grandTotal ?? billSummary?.total ?? 0;

  // Trigger Payment / Order Flow with Single-Execution & Closed-Store Guards
  const handleInitiatePayment = async () => {
    if (loading || paymentSubmitting) return;

    if (items.length === 0) {
      alert('Your cart is empty');
      return;
    }

    if (billSummary.isMinOrderMet === false && (billSummary.minOrder || 0) > 0) {
      alert(
        `Minimum order value for ${vendorName || 'this store'} is ₹${billSummary.minOrder}. Current items total is ₹${billSummary.itemsTotal ?? billSummary.subtotal ?? 0}. Please add ₹${billSummary.minOrderShortfall} more to place order.`
      );
      return;
    }

    // Check store open status live before processing payment
    if (vendorId) {
      try {
        const vRes = await apiService.getVendorById(vendorId);
        if (vRes.success && vRes.vendor && !vRes.vendor.isOpen) {
          alert(`${vRes.vendor.storeName || 'This store'} is currently closed and not accepting new orders right now. Please wait until the partner comes online.`);
          return;
        }
      } catch (e) {
        // continue
      }
    }

    if (paymentMethod === 'UPI' || paymentMethod === 'CARD') {
      setShowPaymentModal(true);
      setPaymentSuccess(false);
      setPaymentSubmitting(false);
    } else {
      // COD or Wallet - process directly
      executeOrderPlacement(paymentMethod);
    }
  };

  // Simulate authentic Payment Gateway verification then place order
  const handleConfirmGatewayPayment = async () => {
    if (paymentSubmitting || loading) return;
    setPaymentSubmitting(true);

    // 1. Simulate 1.2s bank gateway communication
    setTimeout(async () => {
      setPaymentSubmitting(false);
      setPaymentSuccess(true);

      // 2. Wait 0.8s to show green checkmark, then create order on server
      setTimeout(async () => {
        setShowPaymentModal(false);
        await executeOrderPlacement(paymentMethod === 'UPI' ? 'ONLINE_UPI' : 'CARD');
      }, 900);
    }, 1200);
  };

  const executeOrderPlacement = async (actualPaymentMethod) => {
    if (loading) return;
    setLoading(true);
    try {
      const order = await placeOrder(deliveryAddress, actualPaymentMethod);
      setLoading(false);
      if (order) {
        setConfirmedOrder(order);
      }
    } catch (err) {
      setLoading(false);
      const msg = err.message || 'Failed to place order. Please try again.';
      alert(msg);
    }
  };

  const navigateToLiveTracking = () => {
    const orderToTrack = confirmedOrder;
    setConfirmedOrder(null);
    navigation.navigate('OrderTracking', { order: orderToTrack });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order & Payment Verification</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.scrollFlex}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Fast Delivery Banner */}
        <View style={styles.deliveryBanner}>
          <View style={styles.flashCircle}>
            <Ionicons name="flash" size={18} color="#ffffff" />
          </View>
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={styles.deliveryTitle}>Lightning 20–35 Mins Delivery</Text>
            <Text style={styles.deliverySub}>
              Direct delivery from <Text style={{ fontWeight: '700', color: '#0f172a' }}>{vendorName || 'Partner Store'}</Text>
            </Text>
          </View>
        </View>

        {!billSummary.isMinOrderMet && (billSummary.minOrder || 0) > 0 && (
          <View style={styles.minOrderWarningCard}>
            <Ionicons name="warning" size={20} color="#b45309" />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.minOrderWarningTitle}>
                Minimum Order Value is ₹{billSummary.minOrder}
              </Text>
              <Text style={styles.minOrderWarningSub}>
                Your items total is ₹{billSummary.itemsTotal ?? billSummary.subtotal ?? 0}. Please add ₹{billSummary.minOrderShortfall} more items to proceed.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.addMoreBtn}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
            >
              <Text style={styles.addMoreBtnText}>+ Add More</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 1. KYA KYA AAYENGE: Items Verification Card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="basket-outline" size={18} color={colors.primary} />
              <Text style={styles.cardTitle}>VERIFY ITEMS TO BE DELIVERED</Text>
            </View>
            <View style={styles.verifiedCountBadge}>
              <Text style={styles.verifiedCountText}>{items.length} Items</Text>
            </View>
          </View>

          <View style={styles.itemsList}>
            {items.map((it, idx) => {
              const p = it.product;
              const lineTotal = (p.price || 0) * it.quantity;
              return (
                <View key={p._id || p.id || idx} style={styles.itemVerifyRow}>
                  {p.image ? (
                    <Image source={{ uri: p.image }} style={styles.itemVerifyImg} />
                  ) : (
                    <View style={styles.itemVerifyImgPlaceholder}>
                      <Ionicons name="leaf-outline" size={20} color="#16a34a" />
                    </View>
                  )}

                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.itemVerifyName} numberOfLines={1}>
                      {p.name}
                    </Text>
                    <View style={styles.itemVerifyMeta}>
                      <View style={styles.qtyPill}>
                        <Text style={styles.qtyPillText}>{it.quantity}x</Text>
                      </View>
                      <Text style={styles.itemVerifyUnit}>
                        • {p.unit || '1 unit'} @ ₹{p.price}/{p.unit || 'unit'}
                      </Text>
                    </View>
                  </View>

                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.itemVerifyPrice}>₹{lineTotal}</Text>
                    <View style={styles.inStockBadge}>
                      <Ionicons name="checkmark-circle" size={12} color="#16a34a" />
                      <Text style={styles.inStockText}>In Stock</Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* 2. DELIVERY ADDRESS VERIFICATION */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="location-outline" size={18} color={colors.primary} />
              <Text style={styles.cardTitle}>DELIVERY ADDRESS</Text>
            </View>
            <Text style={styles.homeTag}>HOME</Text>
          </View>

          <View style={styles.addressBox}>
            <Text style={styles.addressRecipient}>
              {deliveryAddress.name} • <Text style={{ color: '#64748b' }}>+91 {deliveryAddress.phone}</Text>
            </Text>
            <TextInput
              style={styles.addressInput}
              value={deliveryAddress.line1}
              onChangeText={(txt) => setDeliveryAddress((prev) => ({ ...prev, line1: txt }))}
              placeholder="House/Flat No, Apartment, Street name"
            />
            <Text style={styles.addressCity}>
              {deliveryAddress.city}, Punjab - {deliveryAddress.pincode}
            </Text>
          </View>
        </View>

        {/* 3. PAYMENT OPTIONS: PAY KAREGA TAB PLACE HOGA */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="wallet-outline" size={18} color={colors.primary} />
              <Text style={styles.cardTitle}>CHOOSE PAYMENT METHOD</Text>
            </View>
            <View style={styles.secureBadge}>
              <Ionicons name="shield-checkmark" size={12} color="#15803d" />
              <Text style={styles.secureBadgeText}>100% Secure</Text>
            </View>
          </View>

          <View style={styles.paymentOptions}>
            {[
              {
                id: 'UPI',
                icon: 'phone-portrait-outline',
                title: 'Pay Online via UPI (Instant)',
                sub: 'Google Pay, PhonePe, Paytm, BHIM, QR Code',
                tag: 'FASTEST & RECOMMENDED',
                tagColor: '#16a34a'
              },
              {
                id: 'CARD',
                icon: 'card-outline',
                title: 'Credit / Debit Cards',
                sub: 'Visa, MasterCard, RuPay, NetBanking',
                tag: null
              },
              {
                id: 'WALLET',
                icon: 'wallet-outline',
                title: 'S-farmart Wallet',
                sub: 'Available Balance: ₹250',
                tag: 'BALANCE AVAILABLE',
                tagColor: '#0284c7'
              },
              {
                id: 'COD',
                icon: 'cash-outline',
                title: 'Cash on Delivery (COD)',
                sub: 'Pay cash or scan QR on arrival',
                tag: null
              }
            ].map((opt) => {
              const isSelected = paymentMethod === opt.id;
              return (
                <TouchableOpacity
                  key={opt.id}
                  style={[styles.payOption, isSelected && styles.payOptionSelected]}
                  onPress={() => setPaymentMethod(opt.id)}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.payIconCircle,
                      isSelected ? { backgroundColor: '#dcfce7' } : { backgroundColor: '#f1f5f9' }
                    ]}
                  >
                    <Ionicons
                      name={opt.icon}
                      size={20}
                      color={isSelected ? colors.primary : '#64748b'}
                    />
                  </View>

                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={[styles.payTitle, isSelected && styles.payTitleSelected]}>
                        {opt.title}
                      </Text>
                      {opt.tag && (
                        <View style={[styles.payTag, { backgroundColor: opt.tagColor || '#16a34a' }]}>
                          <Text style={styles.payTagText}>{opt.tag}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.paySub}>{opt.sub}</Text>
                  </View>

                  <View
                    style={[
                      styles.radioCircle,
                      isSelected && { borderColor: colors.primary, backgroundColor: colors.primary }
                    ]}
                  >
                    {isSelected && <View style={styles.radioDot} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 4. KITNA RUPYA LAG RAHA H: Itemized Bill Verification */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="receipt-outline" size={18} color={colors.primary} />
              <Text style={styles.cardTitle}>EXACT BILL BREAKDOWN</Text>
            </View>
          </View>

          <View style={styles.billRow}>
            <Text style={styles.billText}>Item Total ({billSummary.totalCount} items)</Text>
            <Text style={styles.billVal}>₹{billSummary.itemsTotal ?? billSummary.subtotal ?? 0}</Text>
          </View>

          <View style={styles.billRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.billText}>Delivery Partner Fee</Text>
              {billSummary.deliveryFee === 0 && (
                <View style={styles.freeBadge}>
                  <Text style={styles.freeBadgeText}>FREE</Text>
                </View>
              )}
            </View>
            <Text
              style={[
                styles.billVal,
                billSummary.deliveryFee === 0 && { color: '#16a34a', fontWeight: '800' }
              ]}
            >
              {billSummary.deliveryFee === 0 ? '₹0' : `₹${billSummary.deliveryFee}`}
            </Text>
          </View>

          {billSummary.taxes > 0 && (
            <View style={styles.billRow}>
              <Text style={styles.billText}>Govt. Restaurant GST (5%)</Text>
              <Text style={styles.billVal}>₹{billSummary.taxes}</Text>
            </View>
          )}

          <View style={styles.dashedLine} />

          <View style={styles.totalRow}>
            <View>
              <Text style={styles.totalText}>Total Payable</Text>
              <Text style={styles.totalSub}>All inclusive of taxes & fees</Text>
            </View>
            <Text style={styles.totalAmount}>₹{grandTotal}</Text>
          </View>
        </View>

        <View style={styles.safetyCard}>
          <Ionicons name="shield-checkmark-outline" size={18} color="#15803d" />
          <Text style={styles.safetyText}>
            S-farmart Guarantee: 100% genuine farm produce & fresh kitchen food, or instant replacement.
          </Text>
        </View>
      </ScrollView>

      {/* Pinned Bottom Payment Bar */}
      <View style={styles.footer}>
        <View style={styles.footerInner}>
          <View>
            <Text style={styles.footerLabel}>TOTAL TO PAY</Text>
            <Text style={styles.footerTotal}>₹{grandTotal}</Text>
            <Text style={styles.footerMethod}>Via {paymentMethod}</Text>
          </View>

          <TouchableOpacity
            style={[styles.payBtn, loading && styles.disabledBtn]}
            onPress={handleInitiatePayment}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <>
                <Text style={styles.payBtnText}>
                  {paymentMethod === 'COD' ? 'Confirm COD Order' : `Pay ₹${grandTotal} & Place Order`}
                </Text>
                <Ionicons name="arrow-forward" size={18} color="#ffffff" />
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* 5. INTERACTIVE PAYMENT GATEWAY MODAL (UPI / CARDS) */}
      <Modal visible={showPaymentModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.paymentModalCard}>
            {/* Modal Header */}
            <View style={styles.paymentModalHeader}>
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="shield-checkmark" size={18} color="#16a34a" />
                  <Text style={styles.paymentModalTitle}>S-farmart Secure Checkout</Text>
                </View>
                <Text style={styles.paymentModalSub}>256-Bit Bank Grade SSL Encryption</Text>
              </View>
              <TouchableOpacity
                onPress={() => !paymentSubmitting && setShowPaymentModal(false)}
                style={styles.modalCloseBtn}
                disabled={paymentSubmitting}
              >
                <Ionicons name="close" size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            {/* Total Amount Badge */}
            <View style={styles.paymentAmountBanner}>
              <Text style={styles.payBannerLabel}>Paying to {vendorName || 'S-farmart'}</Text>
              <Text style={styles.payBannerAmount}>₹{grandTotal}</Text>
            </View>

            {paymentSubmitting ? (
              <View style={styles.processingBox}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.processingTitle}>Securing Connection with Bank / UPI...</Text>
                <Text style={styles.processingSub}>Please do not press back or close the app</Text>
              </View>
            ) : paymentSuccess ? (
              <View style={styles.successBox}>
                <View style={styles.successTickCircle}>
                  <Ionicons name="checkmark" size={42} color="#ffffff" />
                </View>
                <Text style={styles.successTitle}>Payment of ₹{grandTotal} Received!</Text>
                <Text style={styles.successSub}>
                  Ref #UPI-{Math.floor(100000 + Math.random() * 900000)} • Verified by NPCI
                </Text>
              </View>
            ) : (
              <>
                {/* Gateway Tabs */}
                <View style={styles.gatewayTabs}>
                  <TouchableOpacity
                    style={[styles.gatewayTab, paymentTab === 'upi' && styles.gatewayTabActive]}
                    onPress={() => setPaymentTab('upi')}
                  >
                    <Text
                      style={[
                        styles.gatewayTabText,
                        paymentTab === 'upi' && styles.gatewayTabTextActive
                      ]}
                    >
                      UPI Apps & ID
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.gatewayTab, paymentTab === 'qr' && styles.gatewayTabActive]}
                    onPress={() => setPaymentTab('qr')}
                  >
                    <Text
                      style={[
                        styles.gatewayTabText,
                        paymentTab === 'qr' && styles.gatewayTabTextActive
                      ]}
                    >
                      Scan QR Code
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.gatewayTab, paymentTab === 'card' && styles.gatewayTabActive]}
                    onPress={() => setPaymentTab('card')}
                  >
                    <Text
                      style={[
                        styles.gatewayTabText,
                        paymentTab === 'card' && styles.gatewayTabTextActive
                      ]}
                    >
                      Debit/Credit Card
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Tab: UPI Apps */}
                {paymentTab === 'upi' && (
                  <View style={styles.tabContent}>
                    <Text style={styles.tabLabel}>Choose Instant UPI App:</Text>
                    <View style={styles.upiAppsRow}>
                      {[
                        { id: 'gpay', name: 'Google Pay', icon: 'logo-google' },
                        { id: 'phonepe', name: 'PhonePe', icon: 'flash' },
                        { id: 'paytm', name: 'Paytm', icon: 'wallet' },
                        { id: 'bhim', name: 'BHIM UPI', icon: 'finger-print' }
                      ].map((app) => (
                        <TouchableOpacity
                          key={app.id}
                          style={[
                            styles.upiAppBtn,
                            selectedUpiApp === app.id && styles.upiAppBtnSelected
                          ]}
                          onPress={() => setSelectedUpiApp(app.id)}
                        >
                          <Ionicons
                            name={app.icon}
                            size={20}
                            color={selectedUpiApp === app.id ? colors.primary : '#475569'}
                          />
                          <Text
                            style={[
                              styles.upiAppBtnText,
                              selectedUpiApp === app.id && styles.upiAppBtnTextSelected
                            ]}
                          >
                            {app.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    <Text style={[styles.tabLabel, { marginTop: 14 }]}>Or Enter Any UPI ID:</Text>
                    <View style={styles.upiInputRow}>
                      <TextInput
                        style={styles.upiInput}
                        value={upiIdInput}
                        onChangeText={setUpiIdInput}
                        placeholder="yourname@okhdfcbank"
                      />
                      <View style={styles.verifiedUpiBadge}>
                        <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
                        <Text style={styles.verifiedUpiText}>Verified</Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* Tab: QR Code */}
                {paymentTab === 'qr' && (
                  <View style={styles.qrTabContent}>
                    <View style={styles.qrBox}>
                      <Ionicons name="qr-code-outline" size={130} color="#0f172a" />
                    </View>
                    <Text style={styles.qrScanText}>Scan with any UPI App to Pay ₹{grandTotal}</Text>
                    <Text style={styles.qrSub}>Compatible with Google Pay, PhonePe, Paytm, CRED</Text>
                  </View>
                )}

                {/* Tab: Cards */}
                {paymentTab === 'card' && (
                  <View style={styles.tabContent}>
                    <Text style={styles.tabLabel}>Card Number:</Text>
                    <TextInput
                      style={styles.cardInput}
                      value={cardNumber}
                      onChangeText={setCardNumber}
                    />
                    <View style={{ flexDirection: 'row', gap: 12, marginTop: 10 }}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.tabLabel}>Valid Thru:</Text>
                        <TextInput style={styles.cardInput} value="08/29" editable={false} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.tabLabel}>CVV:</Text>
                        <TextInput
                          style={styles.cardInput}
                          value="•••"
                          secureTextEntry
                          editable={false}
                        />
                      </View>
                    </View>
                  </View>
                )}

                {/* Pay Action Button */}
                <TouchableOpacity
                  style={styles.gatewaySubmitBtn}
                  onPress={handleConfirmGatewayPayment}
                  activeOpacity={0.85}
                >
                  <Ionicons name="lock-closed" size={18} color="#ffffff" />
                  <Text style={styles.gatewaySubmitText}>Pay ₹{grandTotal} Securely</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* 6. POST-PAYMENT ORDER RECEIPT & CONFIRMATION MODAL */}
      <Modal visible={!!confirmedOrder} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.receiptCard}>
            <View style={styles.receiptHeader}>
              <View style={styles.receiptTickCircle}>
                <Ionicons name="checkmark" size={32} color="#ffffff" />
              </View>
              <Text style={styles.receiptTitle}>Order Confirmed & Paid!</Text>
              <Text style={styles.receiptOrderNum}>
                Order #{confirmedOrder?.orderNumber || confirmedOrder?._id?.slice(-6)}
              </Text>
            </View>

            <View style={styles.receiptBody}>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Store</Text>
                <Text style={styles.receiptValue}>{vendorName || 'Partner Store'}</Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Total Amount Paid</Text>
                <Text style={[styles.receiptValue, { color: '#16a34a', fontWeight: '800' }]}>
                  ₹{confirmedOrder?.pricing?.grandTotal || grandTotal} ({confirmedOrder?.payment?.method || paymentMethod})
                </Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Delivery OTP</Text>
                <Text style={[styles.receiptValue, { letterSpacing: 2, fontWeight: '800' }]}>
                  {confirmedOrder?.deliveryOtp || '9018'}
                </Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Delivering To</Text>
                <Text style={styles.receiptValue} numberOfLines={1}>
                  {deliveryAddress.name}, {deliveryAddress.line1}
                </Text>
              </View>

              <View style={styles.receiptItemsBox}>
                <Text style={styles.receiptItemsTitle}>VERIFIED ITEMS COMING:</Text>
                {confirmedOrder?.items?.map((it, i) => (
                  <Text key={i} style={styles.receiptItemLine}>
                    • {it.qty}x {it.name} ({it.unit || '1 unit'}) — ₹{it.lineTotal}
                  </Text>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={styles.trackOrderBtn}
              onPress={navigateToLiveTracking}
              activeOpacity={0.85}
            >
              <Text style={styles.trackOrderBtnText}>Track Live Order In Real-Time</Text>
              <Ionicons name="arrow-forward" size={18} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    ...(Platform.OS === 'web' ? { height: '100vh', maxHeight: '100vh', overflow: 'hidden' } : {})
  },
  scrollFlex: {
    flex: 1
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0'
  },
  headerTitle: {
    fontSize: 16.5,
    fontWeight: '800',
    color: '#0f172a'
  },
  backBtn: {
    padding: 4
  },
  content: {
    padding: 16,
    paddingBottom: 32
  },
  deliveryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    marginBottom: 14
  },
  minOrderWarningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#fde68a',
    marginBottom: 14
  },
  minOrderWarningTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#92400e'
  },
  minOrderWarningSub: {
    fontSize: 11.5,
    color: '#78350f',
    marginTop: 2
  },
  addMoreBtn: {
    backgroundColor: '#d97706',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginLeft: 8
  },
  addMoreBtnText: {
    color: '#ffffff',
    fontSize: 11.5,
    fontWeight: '800'
  },
  flashCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#16a34a',
    alignItems: 'center',
    justifyContent: 'center'
  },
  deliveryTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#166534'
  },
  deliverySub: {
    fontSize: 12.5,
    color: '#475569',
    marginTop: 2
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9'
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#334155',
    letterSpacing: 0.5
  },
  verifiedCountBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8
  },
  verifiedCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803d'
  },
  homeTag: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0284c7',
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  secureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  secureBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803d'
  },
  itemsList: {
    gap: 12
  },
  itemVerifyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4
  },
  itemVerifyImg: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#f1f5f9'
  },
  itemVerifyImgPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center'
  },
  itemVerifyName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0f172a'
  },
  itemVerifyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3
  },
  qtyPill: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4
  },
  qtyPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0f172a'
  },
  itemVerifyUnit: {
    fontSize: 11.5,
    color: '#64748b'
  },
  itemVerifyPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a'
  },
  inStockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2
  },
  inStockText: {
    fontSize: 10,
    color: '#16a34a',
    fontWeight: '600'
  },
  addressBox: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 12
  },
  addressRecipient: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 6
  },
  addressInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0f172a',
    marginBottom: 6
  },
  addressCity: {
    fontSize: 12,
    color: '#64748b'
  },
  paymentOptions: {
    gap: 10
  },
  payOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff'
  },
  payOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: '#f0fdf4'
  },
  payIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center'
  },
  payTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1e293b'
  },
  payTitleSelected: {
    color: '#15803d'
  },
  payTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  payTagText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800'
  },
  paySub: {
    fontSize: 11.5,
    color: '#64748b',
    marginTop: 2
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center'
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffffff'
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5
  },
  billText: {
    fontSize: 13,
    color: '#475569'
  },
  billVal: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#0f172a'
  },
  freeBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4
  },
  freeBadgeText: {
    color: '#15803d',
    fontSize: 10,
    fontWeight: '800'
  },
  dashedLine: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 10
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4
  },
  totalText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a'
  },
  totalSub: {
    fontSize: 11,
    color: '#64748b'
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '900',
    color: '#15803d'
  },
  safetyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#f0fdf4',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    marginBottom: 10
  },
  safetyText: {
    fontSize: 11.5,
    color: '#166534',
    flex: 1,
    lineHeight: 16
  },
  footer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8
  },
  footerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  footerLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.5
  },
  footerTotal: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0f172a'
  },
  footerMethod: {
    fontSize: 11,
    color: '#15803d',
    fontWeight: '700'
  },
  payBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 22,
    gap: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4
  },
  disabledBtn: {
    opacity: 0.6
  },
  payBtnText: {
    color: '#ffffff',
    fontSize: 14.5,
    fontWeight: '800'
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: Platform.OS === 'web' ? 16 : 0
  },
  paymentModalCard: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderRadius: Platform.OS === 'web' ? 24 : 0,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 16
  },
  paymentModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14
  },
  paymentModalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a'
  },
  paymentModalSub: {
    fontSize: 11.5,
    color: '#64748b',
    marginTop: 2
  },
  modalCloseBtn: {
    padding: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 16
  },
  paymentAmountBanner: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  payBannerLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600'
  },
  payBannerAmount: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0f172a',
    marginTop: 2
  },
  gatewayTabs: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 3,
    marginBottom: 14
  },
  gatewayTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10
  },
  gatewayTabActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1
  },
  gatewayTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b'
  },
  gatewayTabTextActive: {
    color: '#0f172a',
    fontWeight: '800'
  },
  tabContent: {
    marginBottom: 16
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8
  },
  upiAppsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  upiAppBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff'
  },
  upiAppBtnSelected: {
    borderColor: colors.primary,
    backgroundColor: '#f0fdf4'
  },
  upiAppBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#334155'
  },
  upiAppBtnTextSelected: {
    color: '#15803d'
  },
  upiInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff'
  },
  upiInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0f172a'
  },
  verifiedUpiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  verifiedUpiText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16a34a'
  },
  qrTabContent: {
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 16
  },
  qrBox: {
    padding: 12,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#e2e8f0'
  },
  qrScanText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 10
  },
  qrSub: {
    fontSize: 11.5,
    color: '#64748b',
    marginTop: 2
  },
  cardInput: {
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0f172a',
    backgroundColor: '#ffffff'
  },
  gatewaySubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4
  },
  gatewaySubmitText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800'
  },
  processingBox: {
    alignItems: 'center',
    paddingVertical: 36
  },
  processingTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 16
  },
  processingSub: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4
  },
  successBox: {
    alignItems: 'center',
    paddingVertical: 32
  },
  successTickCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#16a34a',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14
  },
  successTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#15803d'
  },
  successSub: {
    fontSize: 12,
    color: '#475569',
    marginTop: 4
  },
  // Receipt Modal
  receiptCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 20
  },
  receiptHeader: {
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 16
  },
  receiptTickCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#16a34a',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10
  },
  receiptTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a'
  },
  receiptOrderNum: {
    fontSize: 13,
    color: '#15803d',
    fontWeight: '700',
    marginTop: 2
  },
  receiptBody: {
    paddingVertical: 14,
    gap: 8
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  receiptLabel: {
    fontSize: 12.5,
    color: '#64748b'
  },
  receiptValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a'
  },
  receiptItemsBox: {
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 10,
    marginTop: 6
  },
  receiptItemsTitle: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#475569',
    marginBottom: 4
  },
  receiptItemLine: {
    fontSize: 12,
    color: '#1e293b',
    fontWeight: '500',
    marginVertical: 2
  },
  trackOrderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    marginTop: 12
  },
  trackOrderBtnText: {
    color: '#ffffff',
    fontSize: 14.5,
    fontWeight: '800'
  }
});
