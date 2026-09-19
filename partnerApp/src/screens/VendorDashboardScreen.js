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
  Image,
  useWindowDimensions
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePartner } from '../context/PartnerContext';
import { useSocket } from '../context/SocketContext';
import { colors } from '../theme/colors';
import { glassTheme } from '../theme/glass';
import { GlassCard } from '../components/GlassCard';
import { WaterBackground } from '../components/WaterBackground';
import { AnimatedNumber } from '../components/common/AnimatedNumber';
import { showAlert } from '../utils/alert';

const LOGO = require('../../assets/farmart_logo.png');

export const VendorDashboardScreen = ({ navigation, initialSection }) => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isTablet = width > 600;

  const {
    vendor,
    toggleStoreStatus,
    orders,
    updateOrderStatus,
    stats,
    logoutVendor,
    fetchOrders,
    isTogglingStore
  } = usePartner();

  const { connectionMode } = useSocket();

  const [processingOrderId, setProcessingOrderId] = useState(null);
  const scrollRef = useRef(null);
  const ordersSectionRef = useRef(null);

  // Breathing Pulse Animation (Zomato-Style Status Glow)
  const pulseAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.28,
          duration: 900,
          useNativeDriver: false
        }),
        Animated.timing(pulseAnim, {
          toValue: 1.0,
          duration: 900,
          useNativeDriver: false
        })
      ])
    );
    pulseLoop.start();
    return () => pulseLoop.stop();
  }, [pulseAnim]);

  const isStoreOpen = vendor?.isOpen ?? true;

  // Active in-flight orders
  const inFlightOrders = orders.filter((o) =>
    ['NEW_ORDER', 'ACCEPTED', 'PREPARING', 'READY_FOR_RIDER', 'OUT_FOR_DELIVERY'].includes(o.status)
  );

  const handleUpdateStatus = async (orderId, newStatus, reason = '') => {
    if (processingOrderId === orderId) return;
    setProcessingOrderId(orderId);
    try {
      await updateOrderStatus(orderId, newStatus, reason);
    } catch (err) {
      console.warn('Action failed:', err);
      showAlert('Notice', 'Could not update order status. Please verify connection.');
    } finally {
      setProcessingOrderId(null);
    }
  };

  if (!vendor) {
    return null;
  }

  // Render Dashboard
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <WaterBackground />

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + 12,
            paddingBottom: insets.bottom + 110
          }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ==================== 1. TOP HEADER ==================== */}
        <View style={styles.topHeader}>
          {/* Store Name: Serif-style bold title on the left */}
          <View style={styles.headerLeftWrap}>
            <Text style={styles.headerStoreTitle} numberOfLines={1} ellipsizeMode="tail">
              {vendor?.storeName || 'Merchant Store'}
            </Text>
            <Text style={styles.headerStoreSub} numberOfLines={1}>
              {vendor?.ownerName || 'Verified Merchant'} • {vendor?.phone || '+91 98765 43210'}
            </Text>
          </View>

          {/* Right: Glass Status Pill + Store Switcher */}
          <View style={styles.headerRightWrap}>
            {/* Online / Offline Glass Pill */}
            <View
              style={[
                styles.statusGlassPill,
                isStoreOpen ? styles.statusPillOnline : styles.statusPillOffline
              ]}
            >
              <Animated.View
                style={[
                  styles.statusPillDot,
                  isStoreOpen ? styles.dotOnline : styles.dotOffline,
                  {
                    transform: [{ scale: isStoreOpen ? pulseAnim : 1 }]
                  }
                ]}
              />
              <Text
                style={[
                  styles.statusPillText,
                  isStoreOpen ? styles.textOnline : styles.textOffline
                ]}
              >
                {isStoreOpen ? 'ONLINE' : 'OFFLINE'}
              </Text>
            </View>

            {/* Store Profile & Settings Button */}
            <TouchableOpacity
              style={styles.profileHeaderBtn}
              onPress={() => navigation.navigate('Account')}
              activeOpacity={0.75}
              accessibilityLabel="Store Profile"
            >
              <Ionicons name="person-circle" size={24} color="#ea580c" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ==================== RESPONSIVE LAYOUT CONTAINER ==================== */}
        {/* On tablet/web (>600px): 2 columns. On mobile portrait: single column */}
        <View style={isTablet ? styles.tabletColumnsRow : styles.singleColumn}>

          {/* LEFT COLUMN (or Top Section on mobile) */}
          <View style={isTablet ? styles.tabletLeftCol : styles.fullWidthBlock}>

            {/* ==================== 2. STORE STATUS GLASS CARD ==================== */}
            <GlassCard style={styles.storeStatusCard} showSheen={true}>
              <View style={styles.storeStatusContent}>
                <View style={styles.statusLeftSection}>
                  <View
                    style={[
                      styles.checkCircleGlow,
                      isStoreOpen ? styles.checkGlowOnline : styles.checkGlowOffline
                    ]}
                  >
                    <Ionicons
                      name={isStoreOpen ? 'checkmark-circle' : 'pause-circle'}
                      size={28}
                      color={isStoreOpen ? '#16a34a' : '#94a3b8'}
                    />
                  </View>
                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text style={styles.storeStatusTitle}>
                      {isStoreOpen ? 'Store: Online' : 'Store: Offline'}
                    </Text>
                    <Text style={styles.storeStatusSub}>
                      {isStoreOpen
                        ? 'Customers can place orders.'
                        : 'Store is paused. New orders are paused.'}
                    </Text>
                  </View>
                </View>

                {/* Duty Switch with breathing glow wrapper */}
                <View style={styles.switchWrapper}>
                  <Switch
                    value={isStoreOpen}
                    onValueChange={toggleStoreStatus}
                    disabled={isTogglingStore}
                    trackColor={{ false: '#cbd5e1', true: '#bbf7d0' }}
                    thumbColor={isStoreOpen ? '#16a34a' : '#94a3b8'}
                  />
                </View>
              </View>
            </GlassCard>

            {/* ==================== 3. THREE STAT GLASS TILES IN A ROW ==================== */}
            <View style={styles.statsTilesRow}>
              {/* Tile 1: Today's Sales */}
              <GlassCard style={styles.statTile}>
                <View style={styles.statIconWrapAmber}>
                  <Ionicons name="wallet-outline" size={18} color="#d97706" />
                </View>
                <Text style={styles.statLabel} numberOfLines={1}>Today's Sales</Text>
                <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>
                  ₹<AnimatedNumber value={stats.todaySales || 0} />
                </Text>
              </GlassCard>

              {/* Tile 2: Active Orders */}
              <GlassCard style={styles.statTile}>
                <View style={styles.statIconWrapOrange}>
                  <Ionicons name="receipt-outline" size={18} color="#ea580c" />
                </View>
                <Text style={styles.statLabel} numberOfLines={1}>Active Orders</Text>
                <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>
                  <AnimatedNumber value={inFlightOrders.length} />
                </Text>
              </GlassCard>

              {/* Tile 3: Store Rating */}
              <GlassCard style={styles.statTile}>
                <View style={styles.statIconWrapGold}>
                  <Ionicons name="star" size={18} color="#f59e0b" />
                </View>
                <Text style={styles.statLabel} numberOfLines={1}>Store Rating</Text>
                <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>
                  {vendor?.rating || '4.9'} ★
                </Text>
              </GlassCard>
            </View>

            {/* ==================== 4. TWO GLASS BUTTONS ==================== */}
            <View style={styles.actionButtonsRow}>
              {/* Button 1: Add New Item */}
              <GlassCard
                style={styles.actionGlassBtn}
                onPress={() => navigation.navigate('AddProduct')}
                showSheen={true}
              >
                <View style={styles.actionBtnInner}>
                  <View style={styles.btnIconOrbAmber}>
                    <Ionicons name="add-circle-outline" size={20} color="#ea580c" />
                  </View>
                  <View style={{ marginLeft: 10, flex: 1 }}>
                    <Text style={styles.actionBtnTitle}>Add New Item</Text>
                    <Text style={styles.actionBtnSub}>1-Tap catalog listing</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
                </View>
              </GlassCard>

              {/* Button 2: Detailed Analytics */}
              <GlassCard
                style={styles.actionGlassBtn}
                onPress={() => navigation.navigate('Reports')}
                showSheen={true}
              >
                <View style={styles.actionBtnInner}>
                  <View style={styles.btnIconOrbGreen}>
                    <Ionicons name="bar-chart-outline" size={20} color="#16a34a" />
                  </View>
                  <View style={{ marginLeft: 10, flex: 1 }}>
                    <Text style={styles.actionBtnTitle}>Detailed Analytics</Text>
                    <Text style={styles.actionBtnSub}>Wednesday payouts ledger</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
                </View>
              </GlassCard>
            </View>
          </View>

          {/* RIGHT COLUMN (or Bottom Section on mobile) */}
          <View style={isTablet ? styles.tabletRightCol : styles.fullWidthBlock}>

            {/* ==================== 5. PENDING ORDERS GLASS CARD ==================== */}
            <GlassCard style={styles.pendingOrdersCard} showSheen={true}>
              <View style={styles.ordersCardHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="time-outline" size={20} color="#0284c7" />
                  <Text style={styles.ordersCardTitle}>Pending Orders</Text>
                </View>
                <View style={styles.orderCountBadge}>
                  <Text style={styles.orderCountText}>{inFlightOrders.length}</Text>
                </View>
              </View>

              {/* Order Rows */}
              {inFlightOrders.length === 0 ? (
                <View style={styles.emptyOrdersBox}>
                  <Ionicons name="checkmark-done-circle-outline" size={44} color="#94a3b8" />
                  <Text style={styles.emptyOrdersTitle}>No pending orders right now</Text>
                  <Text style={styles.emptyOrdersSub}>
                    Incoming orders will appear here in real-time with instant audio & vibration alerts.
                  </Text>
                </View>
              ) : (
                <View style={styles.ordersListContainer}>
                  {inFlightOrders.map((o) => {
                    const orderIdDisplay = `#${o.orderNumber || o._id?.slice(-6) || 'ORD-101'}`;
                    const itemCount = o.items?.length || 1;
                    const primaryItemName =
                      o.items?.[0]?.product?.name || o.items?.[0]?.name || 'Special Menu Item';
                    const grandTotal = o.pricing?.grandTotal || o.totalAmount || 180;
                    const isProcessing = processingOrderId === o._id;

                    return (
                      <View key={o._id} style={styles.orderRowCard}>
                        <View style={styles.orderRowTop}>
                          <View style={{ flex: 1, paddingRight: 8 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                              <Text style={styles.orderRowId}>{orderIdDisplay}</Text>
                              <View style={styles.itemCountPill}>
                                <Text style={styles.itemCountText}>{itemCount} item(s)</Text>
                              </View>
                            </View>
                            <Text style={styles.orderRowSummary} numberOfLines={1}>
                              {primaryItemName}
                            </Text>
                            <Text style={styles.orderRowCustomer}>
                              👤 {o.customer?.name || o.address?.name || 'Rajesh Kumar'}
                            </Text>
                          </View>

                          {/* Order Price & Action */}
                          <View style={styles.orderRowRight}>
                            <Text style={styles.orderRowTotal}>₹{grandTotal}</Text>

                            {/* Blue ACCEPT Button for NEW_ORDER, or state step action */}
                            {o.status === 'NEW_ORDER' ? (
                              <TouchableOpacity
                                style={styles.acceptBlueBtn}
                                onPress={() => handleUpdateStatus(o._id, 'ACCEPTED')}
                                disabled={isProcessing}
                                activeOpacity={0.8}
                              >
                                {isProcessing ? (
                                  <ActivityIndicator size="small" color="#ffffff" />
                                ) : (
                                  <Text style={styles.acceptBlueBtnText}>ACCEPT</Text>
                                )}
                              </TouchableOpacity>
                            ) : o.status === 'ACCEPTED' ? (
                              <TouchableOpacity
                                style={styles.prepOrangeBtn}
                                onPress={() => handleUpdateStatus(o._id, 'PREPARING')}
                                disabled={isProcessing}
                                activeOpacity={0.8}
                              >
                                <Text style={styles.prepBtnText}>START PREP</Text>
                              </TouchableOpacity>
                            ) : o.status === 'PREPARING' ? (
                              <TouchableOpacity
                                style={styles.readyGreenBtn}
                                onPress={() => handleUpdateStatus(o._id, 'READY_FOR_RIDER')}
                                disabled={isProcessing}
                                activeOpacity={0.8}
                              >
                                <Text style={styles.readyBtnText}>READY</Text>
                              </TouchableOpacity>
                            ) : (
                              <TouchableOpacity
                                style={styles.deliverSlateBtn}
                                onPress={() => handleUpdateStatus(o._id, 'OUT_FOR_DELIVERY')}
                                disabled={isProcessing}
                                activeOpacity={0.8}
                              >
                                <Text style={styles.deliverBtnText}>DISPATCH</Text>
                              </TouchableOpacity>
                            )}
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </GlassCard>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  scrollContent: {
    paddingHorizontal: 16
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  headerLeftWrap: {
    flex: 1,
    paddingRight: 10
  },
  headerStoreTitle: {
    // Serif-style bold title on the left as specified in reference image
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.3
  },
  headerStoreSub: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2
  },
  headerRightWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  statusGlassPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9999,
    borderWidth: 1
  },
  statusPillOnline: {
    backgroundColor: 'rgba(220, 252, 231, 0.75)',
    borderColor: 'rgba(22, 163, 74, 0.45)'
  },
  statusPillOffline: {
    backgroundColor: 'rgba(254, 226, 226, 0.75)',
    borderColor: 'rgba(220, 38, 38, 0.45)'
  },
  statusPillDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6
  },
  dotOnline: {
    backgroundColor: '#16a34a'
  },
  dotOffline: {
    backgroundColor: '#dc2626'
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  textOnline: {
    color: '#15803d'
  },
  textOffline: {
    color: '#b91c1c'
  },
  profileHeaderBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(254, 243, 199, 0.75)',
    borderWidth: 1.5,
    borderColor: 'rgba(234, 88, 12, 0.4)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  singleColumn: {
    width: '100%'
  },
  tabletColumnsRow: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'flex-start'
  },
  tabletLeftCol: {
    flex: 1
  },
  tabletRightCol: {
    flex: 1
  },
  fullWidthBlock: {
    width: '100%'
  },

  // STORE STATUS CARD
  storeStatusCard: {
    marginBottom: 14,
    padding: 16
  },
  storeStatusContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  statusLeftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 12
  },
  checkCircleGlow: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5
  },
  checkGlowOnline: {
    backgroundColor: 'rgba(22, 163, 74, 0.12)',
    borderColor: 'rgba(22, 163, 74, 0.35)'
  },
  checkGlowOffline: {
    backgroundColor: 'rgba(148, 163, 184, 0.12)',
    borderColor: 'rgba(148, 163, 184, 0.35)'
  },
  storeStatusTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a'
  },
  storeStatusSub: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2
  },
  switchWrapper: {
    transform: [{ scale: Platform.OS === 'ios' ? 0.9 : 1.0 }]
  },

  // THREE STAT TILES
  statsTilesRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14
  },
  statTile: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center'
  },
  statIconWrapAmber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(217, 119, 6, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6
  },
  statIconWrapOrange: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(234, 88, 12, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6
  },
  statIconWrapGold: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    textAlign: 'center'
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 2,
    textAlign: 'center'
  },

  // TWO ACTION BUTTONS
  actionButtonsRow: {
    gap: 10,
    marginBottom: 16
  },
  actionGlassBtn: {
    padding: 14
  },
  actionBtnInner: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  btnIconOrbAmber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(234, 88, 12, 0.12)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  btnIconOrbGreen: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(22, 163, 74, 0.12)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  actionBtnTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a'
  },
  actionBtnSub: {
    fontSize: 11,
    color: '#64748b'
  },

  // PENDING ORDERS CARD
  pendingOrdersCard: {
    padding: 16,
    marginBottom: 16
  },
  ordersCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(226, 232, 240, 0.7)'
  },
  ordersCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a'
  },
  orderCountBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: 'rgba(2, 132, 199, 0.14)'
  },
  orderCountText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0284c7'
  },
  emptyOrdersBox: {
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 16
  },
  emptyOrdersTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 10
  },
  emptyOrdersSub: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18
  },
  ordersListContainer: {
    gap: 10
  },
  orderRowCard: {
    padding: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)'
  },
  orderRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  orderRowId: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a'
  },
  itemCountPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: 'rgba(100, 116, 139, 0.12)'
  },
  itemCountText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569'
  },
  orderRowSummary: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    marginTop: 3
  },
  orderRowCustomer: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2
  },
  orderRowRight: {
    alignItems: 'flex-end',
    gap: 6
  },
  orderRowTotal: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a'
  },
  acceptBlueBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#2563eb',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 3
  },
  acceptBlueBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5
  },
  prepOrangeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#ea580c'
  },
  prepBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#ffffff'
  },
  readyGreenBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#16a34a'
  },
  readyBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#ffffff'
  },
  deliverSlateBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#475569'
  },
  deliverBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#ffffff'
  }
});
