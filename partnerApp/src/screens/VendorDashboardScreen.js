import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
  StatusBar,
  Animated,
  ActivityIndicator,
  Modal,
  TextInput,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePartner } from '../context/PartnerContext';
import { useSocket } from '../context/SocketContext';
import { colors } from '../theme/colors';

const LOGO = require('../../assets/farmart_logo.png');

const DEMO_VENDORS = [
  { name: 'Sunita Sharma (Home Chef)', phone: '9876543211', icon: '🍳', storeType: 'HOME_CHEF' },
  { name: 'Sukhwinder Singh (Farmer)', phone: '9876543212', icon: '🌾', storeType: 'FARMER' },
  { name: 'Gurpreet Kaur (Orchards)', phone: '9876543213', icon: '🍊', storeType: 'FARMER' },
  { name: 'Manpreet Singh (Shimla Orchards)', phone: '9876543214', icon: '🍎', storeType: 'FARMER' }
];

export const VendorDashboardScreen = ({ navigation }) => {
  const {
    vendor,
    toggleStoreStatus,
    orders,
    updateOrderStatus,
    stats,
    loginVendor,
    logoutVendor,
    fetchOrders,
    isTogglingStore
  } = usePartner();

  const { connectionMode } = useSocket();

  // Action Idempotency Lock
  const [processingOrderId, setProcessingOrderId] = useState(null);

  // Partner Login / Switch Modal
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginPhoneInput, setLoginPhoneInput] = useState('');
  const [loginPasswordInput, setLoginPasswordInput] = useState('demo123');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Classic Zomato-Style Breathing Pulse Animation
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.28,
          duration: 900,
          useNativeDriver: Platform.OS !== 'web'
        }),
        Animated.timing(pulseAnim, {
          toValue: 1.0,
          duration: 900,
          useNativeDriver: Platform.OS !== 'web'
        })
      ])
    );
    pulseLoop.start();
    return () => pulseLoop.stop();
  }, [pulseAnim]);

  const isStoreOpen = vendor?.isOpen ?? true;

  // Identify in-flight active orders
  const inFlightOrders = orders.filter((o) =>
    ['NEW_ORDER', 'ACCEPTED', 'PREPARING', 'READY_FOR_RIDER', 'OUT_FOR_DELIVERY'].includes(o.status)
  );

  // Single-Execution Action Handler (prevents duplicate clicks in same cycle)
  const handleUpdateStatus = async (orderId, newStatus, reason = '') => {
    if (processingOrderId === orderId) return;
    setProcessingOrderId(orderId);
    try {
      await updateOrderStatus(orderId, newStatus, reason);
    } catch (err) {
      console.warn('Action failed:', err);
    } finally {
      setProcessingOrderId(null);
    }
  };

  const handleCustomLogin = async (phone) => {
    const p = phone || loginPhoneInput.trim();
    if (!p) {
      setLoginError('Please enter Partner Phone number or ID');
      return;
    }
    setIsLoggingIn(true);
    setLoginError('');
    try {
      const res = await loginVendor(p, loginPasswordInput);
      if (res && res.success) {
        setShowLoginModal(false);
        setLoginPhoneInput('');
      } else {
        setLoginError(res?.message || 'Vendor not found with this phone. Try demo accounts.');
      }
    } catch (err) {
      setLoginError('Login failed. Please check network.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // If merchant is logged out, show mandatory Partner Login screen
  if (!vendor) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.unauthCard}>
          <View style={styles.storeBadgeCircleLarge}>
            <Image source={LOGO} style={{ width: 68, height: 68 }} resizeMode="contain" />
          </View>
          <Text style={styles.unauthTitle}>S-farmart Partner Portal</Text>
          <Text style={styles.unauthSub}>
            Please log in with your Partner ID or Phone number to manage orders and open your store.
          </Text>

          <View style={styles.loginForm}>
            <Text style={styles.inputLabel}>Partner Phone / ID</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. 9876543211"
              value={loginPhoneInput}
              onChangeText={setLoginPhoneInput}
              keyboardType="phone-pad"
            />

            {loginError ? <Text style={styles.errorText}>{loginError}</Text> : null}

            <TouchableOpacity
              style={[styles.loginSubmitBtn, isLoggingIn && { opacity: 0.7 }]}
              onPress={() => handleCustomLogin()}
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Text style={styles.loginSubmitText}>Log In to Store</Text>
                  <Ionicons name="log-in-outline" size={18} color="#ffffff" />
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.quickAccountsSection}>
            <Text style={styles.quickAccountsTitle}>OR ONE-TAP DEMO LOGIN:</Text>
            {DEMO_VENDORS.map((v) => (
              <TouchableOpacity
                key={v.phone}
                style={styles.quickAccountBtn}
                onPress={() => handleCustomLogin(v.phone)}
              >
                <Text style={{ fontSize: 18 }}>{v.icon}</Text>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.quickAccountName}>{v.name}</Text>
                  <Text style={styles.quickAccountPhone}>ID: VEN-{v.phone}</Text>
                </View>
                <Ionicons name="arrow-forward" size={16} color={colors.primary} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Top Header Bar */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.storeBadgeCircle}>
            <Image source={LOGO} style={{ width: 38, height: 38, borderRadius: 8 }} resizeMode="contain" />
          </View>
          <View style={styles.storeTextContainer}>
            <Text style={styles.storeName} numberOfLines={1}>
              {vendor?.storeName || 'Partner Store'}
            </Text>
            <Text style={styles.ownerText}>
              👤 {vendor?.ownerName || 'Merchant'} • ID: VEN-{vendor?.phone || '9876543211'}
            </Text>
          </View>
        </View>

        {/* Zomato-Style Status Box with Breathing Glow */}
        <View style={styles.statusBox}>
          <Animated.View
            style={[
              styles.statusPulseRing,
              {
                transform: [{ scale: isStoreOpen ? pulseAnim : 1 }],
                backgroundColor: isStoreOpen ? 'rgba(16, 185, 129, 0.25)' : 'transparent'
              }
            ]}
          >
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isStoreOpen ? '#10b981' : '#ef4444' }
              ]}
            />
          </Animated.View>

          <Text
            style={[
              styles.statusText,
              { color: isStoreOpen ? '#15803d' : '#b91c1c' }
            ]}
          >
            {isStoreOpen ? 'ONLINE' : 'OFFLINE'}
          </Text>

          <Switch
            value={isStoreOpen}
            onValueChange={toggleStoreStatus}
            disabled={isTogglingStore}
            trackColor={{ false: '#cbd5e1', true: '#bbf7d0' }}
            thumbColor={isStoreOpen ? '#16a34a' : '#94a3b8'}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Store Online / Offline State Announcement Banner */}
        <View
          style={[
            styles.storeStateBanner,
            {
              backgroundColor: isStoreOpen ? '#f0fdf4' : '#fef2f2',
              borderColor: isStoreOpen ? '#bbf7d0' : '#fecaca'
            }
          ]}
        >
          <Ionicons
            name={isStoreOpen ? 'radio-button-on' : 'alert-circle'}
            size={18}
            color={isStoreOpen ? '#16a34a' : '#dc2626'}
          />
          <View style={{ flex: 1 }}>
            <Text
              style={[
                styles.storeStateTitle,
                { color: isStoreOpen ? '#15803d' : '#991b1b' }
              ]}
            >
              {isStoreOpen ? 'STORE IS ONLINE' : 'STORE IS OFFLINE (CLOSED)'}
            </Text>
            <Text
              style={[
                styles.storeStateSub,
                { color: isStoreOpen ? '#166534' : '#7f1d1d' }
              ]}
            >
              {isStoreOpen
                ? 'Your products are live. Customers can order and you will receive orders here.'
                : 'Customers can browse your catalog, but new orders are paused until you switch ONLINE.'}
            </Text>
          </View>
        </View>

        {/* ⚠️ FULFILLING LAST ORDER BANNER (Triggered when store is offline but active orders exist) */}
        {!isStoreOpen && inFlightOrders.length > 0 && (
          <View style={styles.lastOrderBanner}>
            <View style={styles.lastOrderHeaderRow}>
              <View style={styles.flameCircle}>
                <Ionicons name="flame" size={18} color="#ffffff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.lastOrderTitle}>
                  FULFILLING LAST ORDER • STORE OFFLINE
                </Text>
                <Text style={styles.lastOrderSub}>
                  Your store is closed to new customer orders. Please complete your active accepted order below as your last order before resting.
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Connection Status & Vendor Switcher Bar */}
        <View style={styles.connectionBar}>
          <View style={styles.connIndicator}>
            <View
              style={[
                styles.livePulse,
                {
                  backgroundColor:
                    connectionMode === 'REALTIME'
                      ? '#10b981'
                      : connectionMode === 'POLLING'
                      ? '#f59e0b'
                      : '#ef4444'
                }
              ]}
            />
            <Text style={styles.connText}>
              {connectionMode === 'REALTIME'
                ? '⚡ Live Real-Time Socket'
                : connectionMode === 'POLLING'
                ? '🔄 10s Live Polling Sync'
                : '🔴 Offline'}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
            <TouchableOpacity
              style={styles.switchAccountBtn}
              onPress={() => setShowLoginModal(true)}
            >
              <Ionicons name="swap-horizontal" size={14} color="#475569" />
              <Text style={styles.switchAccountText}>Switch ID</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.switchAccountBtn, { borderColor: '#fecaca', backgroundColor: '#fef2f2' }]}
              onPress={() => logoutVendor()}
            >
              <Ionicons name="log-out-outline" size={14} color="#ef4444" />
              <Text style={[styles.switchAccountText, { color: '#ef4444', fontWeight: '700' }]}>Log Out</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.refreshBtn}
              onPress={() => fetchOrders(vendor?._id)}
            >
              <Ionicons name="refresh" size={14} color="#475569" />
              <Text style={styles.refreshText}>Sync</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Metrics Grid */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }]}>
            <View style={styles.statIconBox}>
              <Ionicons name="wallet-outline" size={18} color="#16a34a" />
            </View>
            <Text style={styles.statVal}>₹{stats.todaySales || 0}</Text>
            <Text style={styles.statLabel}>Today's Sales</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }]}>
            <View style={styles.statIconBox}>
              <Ionicons name="receipt-outline" size={18} color="#2563eb" />
            </View>
            <Text style={[styles.statVal, { color: '#1d4ed8' }]}>
              {inFlightOrders.length}
            </Text>
            <Text style={styles.statLabel}>Active Orders</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#fffbeb', borderColor: '#fde68a' }]}>
            <View style={styles.statIconBox}>
              <Ionicons name="star" size={18} color="#d97706" />
            </View>
            <Text style={[styles.statVal, { color: '#b45309' }]}>★ {vendor?.rating || 4.8}</Text>
            <Text style={styles.statLabel}>Store Rating</Text>
          </View>
        </View>

        {/* Add Product Action Button */}
        <TouchableOpacity
          style={styles.addProdBtn}
          onPress={() => navigation.navigate('AddProduct')}
          activeOpacity={0.85}
        >
          <View style={styles.addProdIconCircle}>
            <Ionicons name="add" size={20} color="#0f172a" />
          </View>
          <Text style={styles.addProdText}>Add New Product / Dish</Text>
          <Ionicons name="chevron-forward" size={18} color="#ffffff" style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>

        {/* Incoming Customer Orders Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Live Orders Queue</Text>
          <View style={styles.orderCountBadge}>
            <Text style={styles.orderCountText}>{orders.length} Total</Text>
          </View>
        </View>

        {orders.length === 0 ? (
          <View style={styles.emptyBox}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="receipt-outline" size={38} color="#94a3b8" />
            </View>
            <Text style={styles.emptyTitle}>No Orders in Queue</Text>
            <Text style={styles.emptySub}>
              {isStoreOpen
                ? 'Store is ONLINE. Orders placed in customer app will trigger instant audio chime.'
                : 'Store is OFFLINE. Toggle switch to ONLINE above when ready to receive orders.'}
            </Text>
          </View>
        ) : (
          orders.map((order) => {
            const isNew = order.status === 'NEW_ORDER';
            const isAccepted = order.status === 'ACCEPTED';
            const isPreparing = order.status === 'PREPARING';
            const isReady = order.status === 'READY_FOR_RIDER';
            const isOut = order.status === 'OUT_FOR_DELIVERY';
            const isDelivered = order.status === 'DELIVERED';
            const isCancelled = ['CANCELLED', 'REJECTED'].includes(order.status);
            const isInFlight = ['NEW_ORDER', 'ACCEPTED', 'PREPARING', 'READY_FOR_RIDER', 'OUT_FOR_DELIVERY'].includes(order.status);

            const isSubmittingThis = processingOrderId === order._id;
            const cust = order.customer || order.address || {};

            return (
              <View
                key={order._id || order.orderId}
                style={[
                  styles.orderCard,
                  !isStoreOpen && isInFlight && styles.inFlightCardHighlight
                ]}
              >
                {/* Highlight banner if this is an in-flight order while store is offline */}
                {!isStoreOpen && isInFlight && (
                  <View style={styles.inFlightBadgeRow}>
                    <Ionicons name="flame" size={13} color="#ea580c" />
                    <Text style={styles.inFlightBadgeText}>
                      LAST IN-FLIGHT ORDER • FULFILLMENT REQUIRED
                    </Text>
                  </View>
                )}

                <View style={styles.orderHeader}>
                  <View>
                    <View style={styles.orderIdRow}>
                      <Text style={styles.orderId}>#{order.orderNumber || order.orderId}</Text>
                      <View style={styles.typeBadge}>
                        <Ionicons name="flash-outline" size={11} color="#6366f1" />
                        <Text style={styles.typeBadgeText}>Express</Text>
                      </View>
                    </View>
                    <Text style={styles.orderTime}>
                      👤 {cust.name || 'Customer'} • 📞 {cust.phone || 'N/A'}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.statusPill,
                      {
                        backgroundColor: isNew
                          ? '#fef3c7'
                          : isAccepted
                          ? '#e0e7ff'
                          : isPreparing
                          ? '#ffedd5'
                          : isReady
                          ? '#dcfce7'
                          : isOut
                          ? '#cffafe'
                          : isDelivered
                          ? '#dcfce7'
                          : '#fee2e2'
                      }
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusPillText,
                        {
                          color: isNew
                            ? '#b45309'
                            : isAccepted
                            ? '#4338ca'
                            : isPreparing
                            ? '#c2410c'
                            : isReady
                            ? '#15803d'
                            : isOut
                            ? '#0e7490'
                            : isDelivered
                            ? '#15803d'
                            : '#b91c1c'
                        }
                      ]}
                    >
                      {(order.status || 'NEW_ORDER').replace(/_/g, ' ')}
                    </Text>
                  </View>
                </View>

                {/* Items Box */}
                <View style={styles.itemsContainer}>
                  {order.items?.map((item, idx) => {
                    const qty = item.qty ?? item.quantity ?? 1;
                    const price = item.price || 0;
                    return (
                      <View key={idx} style={styles.itemRow}>
                        <View style={styles.itemQtyBadge}>
                          <Text style={styles.itemQtyText}>{qty}x</Text>
                        </View>
                        <Text style={styles.itemRowText} numberOfLines={1}>
                          {item.name || 'Item'}
                        </Text>
                        <Text style={styles.itemPrice}>
                          ₹{item.lineTotal || price * qty}
                        </Text>
                      </View>
                    );
                  })}
                </View>

                {/* Order Footer */}
                <View style={styles.orderFooter}>
                  <View>
                    <Text style={styles.totalLabel}>Bill Amount</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={styles.totalText}>
                        ₹{order.pricing?.grandTotal || order.totalAmount || 0}
                      </Text>
                      <View
                        style={{
                          backgroundColor:
                            order.payment?.method === 'COD' || order.paymentMethod === 'COD'
                              ? '#fee2e2'
                              : '#dcfce7',
                          paddingHorizontal: 6,
                          paddingVertical: 2,
                          borderRadius: 6
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 10,
                            color:
                              order.payment?.method === 'COD' || order.paymentMethod === 'COD'
                                ? '#991b1b'
                                : '#16a34a',
                            fontWeight: '600'
                          }}
                        >
                          {order.payment?.method || 'COD'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Progressive Action Workflow with Single-Execution Lock */}
                  <View style={styles.btnRow}>
                    {isNew && (
                      <>
                        <TouchableOpacity
                          style={[styles.rejectSmallBtn, isSubmittingThis && { opacity: 0.5 }]}
                          onPress={() => handleUpdateStatus(order._id, 'REJECTED', 'Kitchen is busy')}
                          disabled={isSubmittingThis}
                        >
                          <Text style={styles.rejectSmallText}>Reject</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.acceptBtn, isSubmittingThis && { opacity: 0.7 }]}
                          onPress={() => handleUpdateStatus(order._id, 'ACCEPTED')}
                          activeOpacity={0.85}
                          disabled={isSubmittingThis}
                        >
                          {isSubmittingThis ? (
                            <ActivityIndicator size="small" color="#ffffff" />
                          ) : (
                            <>
                              <Text style={styles.btnText}>Accept</Text>
                              <Ionicons name="checkmark-circle" size={16} color="#ffffff" />
                            </>
                          )}
                        </TouchableOpacity>
                      </>
                    )}

                    {isAccepted && (
                      <TouchableOpacity
                        style={[styles.acceptBtn, { backgroundColor: '#ea580c' }, isSubmittingThis && { opacity: 0.7 }]}
                        onPress={() => handleUpdateStatus(order._id, 'PREPARING')}
                        activeOpacity={0.85}
                        disabled={isSubmittingThis}
                      >
                        {isSubmittingThis ? (
                          <ActivityIndicator size="small" color="#ffffff" />
                        ) : (
                          <>
                            <Text style={styles.btnText}>Start Cooking & Packing</Text>
                            <Ionicons name="flame" size={16} color="#ffffff" />
                          </>
                        )}
                      </TouchableOpacity>
                    )}

                    {isPreparing && (
                      <TouchableOpacity
                        style={[styles.acceptBtn, { backgroundColor: '#16a34a' }, isSubmittingThis && { opacity: 0.7 }]}
                        onPress={() => handleUpdateStatus(order._id, 'READY_FOR_RIDER')}
                        activeOpacity={0.85}
                        disabled={isSubmittingThis}
                      >
                        {isSubmittingThis ? (
                          <ActivityIndicator size="small" color="#ffffff" />
                        ) : (
                          <>
                            <Text style={styles.btnText}>Order is Packed</Text>
                            <Ionicons name="cube" size={16} color="#ffffff" />
                          </>
                        )}
                      </TouchableOpacity>
                    )}

                    {isReady && (
                      <TouchableOpacity
                        style={[styles.acceptBtn, { backgroundColor: '#0284c7' }, isSubmittingThis && { opacity: 0.7 }]}
                        onPress={() => handleUpdateStatus(order._id, 'OUT_FOR_DELIVERY')}
                        activeOpacity={0.85}
                        disabled={isSubmittingThis}
                      >
                        {isSubmittingThis ? (
                          <ActivityIndicator size="small" color="#ffffff" />
                        ) : (
                          <>
                            <Text style={styles.btnText}>Handover to Rider</Text>
                            <Ionicons name="paper-plane" size={16} color="#ffffff" />
                          </>
                        )}
                      </TouchableOpacity>
                    )}

                    {isOut && (
                      <TouchableOpacity
                        style={[styles.acceptBtn, { backgroundColor: '#15803d' }, isSubmittingThis && { opacity: 0.7 }]}
                        onPress={() => handleUpdateStatus(order._id, 'DELIVERED')}
                        activeOpacity={0.85}
                        disabled={isSubmittingThis}
                      >
                        {isSubmittingThis ? (
                          <ActivityIndicator size="small" color="#ffffff" />
                        ) : (
                          <>
                            <Text style={styles.btnText}>Mark Delivered</Text>
                            <Ionicons name="checkmark-done" size={16} color="#ffffff" />
                          </>
                        )}
                      </TouchableOpacity>
                    )}

                    {isDelivered && (
                      <View style={styles.completedBadge}>
                        <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
                        <Text style={styles.completedText}>Delivered</Text>
                      </View>
                    )}

                    {isCancelled && (
                      <View style={styles.cancelledBadge}>
                        <Ionicons name="close-circle" size={16} color="#ef4444" />
                        <Text style={styles.cancelledText}>
                          {order.status === 'REJECTED' ? 'Rejected' : 'Cancelled'}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Switch / Login Partner Modal */}
      <Modal visible={showLoginModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.switchModalCard}>
            <View style={styles.switchModalHeader}>
              <Text style={styles.switchModalTitle}>Switch Partner Account</Text>
              <TouchableOpacity onPress={() => setShowLoginModal(false)}>
                <Ionicons name="close" size={22} color="#64748b" />
              </TouchableOpacity>
            </View>

            <Text style={styles.switchModalSub}>
              Select a partner profile or enter another phone number to switch store.
            </Text>

            <View style={styles.demoAccountsList}>
              {DEMO_VENDORS.map((v) => {
                const isCurrent = vendor?.phone === v.phone;
                return (
                  <TouchableOpacity
                    key={v.phone}
                    style={[
                      styles.demoAccountRow,
                      isCurrent && styles.demoAccountRowActive
                    ]}
                    onPress={() => {
                      handleCustomLogin(v.phone);
                    }}
                  >
                    <Text style={{ fontSize: 24 }}>{v.icon}</Text>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={[styles.demoName, isCurrent && { color: colors.primaryDark }]}>
                        {v.name}
                      </Text>
                      <Text style={styles.demoPhone}>ID: VEN-{v.phone}</Text>
                    </View>
                    {isCurrent ? (
                      <View style={styles.activePill}>
                        <Text style={styles.activePillText}>ACTIVE</Text>
                      </View>
                    ) : (
                      <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Custom Phone / ID Direct Login Section */}
            <View style={styles.modalCustomLoginSection}>
              <Text style={styles.modalCustomLabel}>OR ENTER PARTNER PHONE / ID:</Text>
              <View style={styles.modalInputRow}>
                <TextInput
                  style={styles.modalTextInput}
                  placeholder="e.g. 9876543212"
                  placeholderTextColor="#94a3b8"
                  value={loginPhoneInput}
                  onChangeText={setLoginPhoneInput}
                  keyboardType="phone-pad"
                />
                <TouchableOpacity
                  style={[styles.modalSubmitBtn, isLoggingIn && { opacity: 0.7 }]}
                  onPress={() => handleCustomLogin()}
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text style={styles.modalSubmitBtnText}>Log In</Text>
                  )}
                </TouchableOpacity>
              </View>
              {loginError ? <Text style={styles.errorText}>{loginError}</Text> : null}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.logoutBtn}
                onPress={() => {
                  logoutVendor();
                  setShowLoginModal(false);
                }}
              >
                <Ionicons name="log-out-outline" size={16} color="#ef4444" />
                <Text style={styles.logoutBtnText}>Log Out Completely</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    ...Platform.select({
      ios: { shadowColor: '#0f172a', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6 },
      android: { elevation: 3 }
    })
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1
  },
  storeBadgeCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(0,0,0,0.06)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2
  },
  storeBadgeCircleLarge: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: 'rgba(0,0,0,0.08)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 4
  },
  storeTextContainer: {
    flex: 1
  },
  storeName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a'
  },
  ownerText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
    fontWeight: '500'
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 6
  },
  statusPulseRing: {
    width: 14,
    height: 14,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center'
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40
  },
  storeStateBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 14
  },
  storeStateTitle: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.4
  },
  storeStateSub: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16
  },
  lastOrderBanner: {
    backgroundColor: '#fff7ed',
    borderWidth: 1.5,
    borderColor: '#fed7aa',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    shadowColor: '#ea580c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3
  },
  lastOrderHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12
  },
  flameCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#ea580c',
    justifyContent: 'center',
    alignItems: 'center'
  },
  lastOrderTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#9a3412',
    letterSpacing: 0.5
  },
  lastOrderSub: {
    fontSize: 12,
    color: '#c2410c',
    marginTop: 3,
    lineHeight: 16
  },
  inFlightCardHighlight: {
    borderColor: '#fed7aa',
    borderWidth: 2,
    backgroundColor: '#fffcf9'
  },
  inFlightBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#ffedd5',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 10
  },
  inFlightBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#c2410c',
    letterSpacing: 0.4
  },
  connectionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  connIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  livePulse: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  connText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155'
  },
  switchAccountBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  switchAccountText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569'
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#f1f5f9'
  },
  refreshText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569'
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18
  },
  statCard: {
    flex: 1,
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1.5
  },
  statIconBox: {
    marginBottom: 6
  },
  statVal: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.primaryDark
  },
  statLabel: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
    fontWeight: '500',
    textAlign: 'center'
  },
  addProdBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 14,
    marginBottom: 22,
    gap: 12,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6
  },
  addProdIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center'
  },
  addProdText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600'
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.3
  },
  orderCountBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  orderCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#15803d'
  },
  emptyBox: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 36,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a'
  },
  emptySub: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18
  },
  orderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: 'rgba(15, 23, 42, 0.06)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 4
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14
  },
  orderIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  orderId: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a'
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 3
  },
  typeBadgeText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#4338ca'
  },
  orderTime: {
    fontSize: 12.5,
    color: '#64748b',
    marginTop: 4,
    fontWeight: '500'
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3
  },
  itemsContainer: {
    backgroundColor: '#f8fafc',
    padding: 14,
    borderRadius: 14,
    marginBottom: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9'
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  itemQtyBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8
  },
  itemQtyText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563eb'
  },
  itemRowText: {
    flex: 1,
    fontSize: 13.5,
    color: '#1e293b',
    fontWeight: '500'
  },
  itemPrice: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0f172a'
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 14
  },
  totalLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500'
  },
  totalText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 2
  },
  btnRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center'
  },
  rejectSmallBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fca5a5',
    backgroundColor: '#fff1f2'
  },
  rejectSmallText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ef4444'
  },
  acceptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6
  },
  btnText: {
    color: '#ffffff',
    fontSize: 12.5,
    fontWeight: '700'
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10
  },
  completedText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#16a34a'
  },
  cancelledBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fef2f2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10
  },
  cancelledText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ef4444'
  },
  // Unauth Login Screen Styles
  unauthCard: {
    flex: 1,
    padding: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff'
  },
  unauthTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 6
  },
  unauthSub: {
    fontSize: 13.5,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 19
  },
  loginForm: {
    width: '100%',
    maxWidth: 360,
    marginBottom: 24
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6
  },
  textInput: {
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0f172a',
    backgroundColor: '#f8fafc',
    marginBottom: 12
  },
  loginSubmitBtn: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    paddingVertical: 12
  },
  loginSubmitText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700'
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginBottom: 8,
    fontWeight: '600'
  },
  quickAccountsSection: {
    width: '100%',
    maxWidth: 360,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 16
  },
  quickAccountsTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.5,
    marginBottom: 10
  },
  quickAccountBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  quickAccountName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b'
  },
  quickAccountPhone: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  switchModalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20
  },
  switchModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  switchModalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a'
  },
  switchModalSub: {
    fontSize: 12.5,
    color: '#64748b',
    marginBottom: 16,
    lineHeight: 17
  },
  demoAccountsList: {
    gap: 8,
    marginBottom: 18
  },
  demoAccountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e2e8f0'
  },
  demoAccountRowActive: {
    borderColor: colors.primary,
    backgroundColor: '#f0fdf4'
  },
  demoName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0f172a'
  },
  demoPhone: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2
  },
  activePill: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8
  },
  activePillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803d'
  },
  modalCustomLoginSection: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 14,
    marginBottom: 14
  },
  modalCustomLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.4,
    marginBottom: 8
  },
  modalInputRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center'
  },
  modalTextInput: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13.5,
    color: '#0f172a',
    backgroundColor: '#f8fafc'
  },
  modalSubmitBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalSubmitBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700'
  },
  modalActions: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 12,
    alignItems: 'flex-start'
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 8
  },
  logoutBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ef4444'
  }
});
