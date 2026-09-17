import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StatusBar,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiService } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { colors } from '../../theme/colors';

export const CategoryVendorsScreen = ({ route, navigation }) => {
  const category = route.params?.category || { name: 'Stores', slug: 'fruits-vegetables' };
  const [vendors, setVendors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { billSummary } = useCart();

  useEffect(() => {
    fetchVendors();
  }, [category?.slug]);

  const fetchVendors = async () => {
    try {
      setIsLoading(true);
      const res = await apiService.getCategoryVendors(category.slug);
      if (res.success && Array.isArray(res.vendors)) {
        setVendors(res.vendors);
      } else {
        // Fallback to all vendors
        const allRes = await apiService.getVendors();
        if (allRes.success) setVendors(allRes.vendors);
      }
    } catch (err) {
      console.warn('Failed to load vendors:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color="#0f172a" />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>{category.name}</Text>
          <Text style={styles.headerSub}>Available stores nearby</Text>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Finding local stores & farmers...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            billSummary.totalCount > 0 && { paddingBottom: 100 }
          ]}
          showsVerticalScrollIndicator={false}
        >
          {vendors.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons name="storefront-outline" size={48} color="#94a3b8" />
              <Text style={styles.emptyTitle}>No Stores Found</Text>
              <Text style={styles.emptySub}>No vendors available in this category right now.</Text>
            </View>
          ) : (
            vendors.map((vendor) => {
              const isOpen = vendor.isOpen !== false;
              return (
                <TouchableOpacity
                  key={vendor._id}
                  style={[styles.vendorCard, !isOpen && styles.vendorCardClosed]}
                  onPress={() => navigation.navigate('VendorStore', { vendor })}
                  activeOpacity={0.9}
                >
                  <View style={styles.bannerContainer}>
                    <Image
                      source={{
                        uri:
                          vendor.banner ||
                          'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80'
                      }}
                      style={styles.bannerImg}
                    />
                    {!isOpen && (
                      <View style={styles.closedOverlay}>
                        <Text style={styles.closedText}>CURRENTLY CLOSED</Text>
                        <Text style={styles.closedSub}>Opens in morning</Text>
                      </View>
                    )}
                    <View style={styles.timeBadge}>
                      <Ionicons name="time-outline" size={12} color="#ffffff" />
                      <Text style={styles.timeText}>{vendor.avgPrepTimeMins || 25} mins</Text>
                    </View>
                  </View>

                  <View style={styles.vendorInfo}>
                    <View style={styles.titleRow}>
                      <Text style={styles.storeName}>{vendor.storeName}</Text>
                      <View style={styles.ratingBox}>
                        <Ionicons name="star" size={13} color="#ffffff" />
                        <Text style={styles.ratingText}>{vendor.rating || 4.8}</Text>
                      </View>
                    </View>

                    <Text style={styles.storeType}>
                      {vendor.storeType === 'HOME_CHEF'
                        ? '👩‍🍳 Home Cooked Fresh Food & Mithai'
                        : vendor.storeType === 'FARMER'
                        ? '🌾 Direct Farm Harvest'
                        : '🏪 Local Mart'}
                    </Text>

                    <Text style={styles.descText} numberOfLines={2}>
                      {vendor.description || 'Farm-fresh products delivered right to your doorstep.'}
                    </Text>

                    <View style={styles.metaRow}>
                      <Text style={styles.metaItem}>
                        📍 {vendor.address?.city || 'Ludhiana'} ({vendor.deliveryRadiusKm || 7} km radius)
                      </Text>
                      <Text style={styles.dotSeparator}>•</Text>
                      <Text style={styles.metaItem}>Min ₹{vendor.minOrderValue || 99}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      )}

      {/* Sticky Bottom Cart Bar */}
      {billSummary.totalCount > 0 && (
        <View style={styles.stickyCartBar}>
          <View>
            <Text style={styles.cartCountText}>{billSummary.totalCount} ITEM(S)</Text>
            <Text style={styles.cartTotalText}>₹{billSummary.grandTotal ?? billSummary.total ?? 0}</Text>
          </View>
          <TouchableOpacity
            style={styles.viewCartBtn}
            onPress={() => navigation.navigate('Cart')}
            activeOpacity={0.85}
          >
            <Text style={styles.viewCartText}>View Cart</Text>
            <Ionicons name="arrow-forward" size={18} color="#ffffff" />
          </TouchableOpacity>
        </View>
      )}
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
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
      android: { elevation: 2 }
    })
  },
  backBtn: {
    padding: 6,
    marginRight: 8
  },
  headerTitleWrap: {
    flex: 1
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a'
  },
  headerSub: {
    fontSize: 12,
    color: '#64748b'
  },
  loadingBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748b'
  },
  scrollContent: {
    padding: 16,
    gap: 16
  },
  emptyBox: {
    alignItems: 'center',
    padding: 40
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 12
  },
  emptySub: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4
  },
  vendorCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: 'rgba(15, 23, 42, 0.06)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 3
  },
  vendorCardClosed: {
    opacity: 0.75
  },
  bannerContainer: {
    height: 140,
    position: 'relative'
  },
  bannerImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover'
  },
  closedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  closedText: {
    color: '#f87171',
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: 1
  },
  closedSub: {
    color: '#cbd5e1',
    fontSize: 12,
    marginTop: 4
  },
  timeBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8
  },
  timeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700'
  },
  vendorInfo: {
    padding: 16
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  storeName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
    flex: 1
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#15803d',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4
  },
  ratingText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 12
  },
  storeType: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#16a34a',
    marginBottom: 6
  },
  descText: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
    marginBottom: 10
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  metaItem: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500'
  },
  dotSeparator: {
    fontSize: 12,
    color: '#cbd5e1'
  },
  stickyCartBar: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: '#15803d',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#15803d',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8
  },
  cartCountText: {
    color: '#bbf7d0',
    fontSize: 11,
    fontWeight: '700'
  },
  cartTotalText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800'
  },
  viewCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  viewCartText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 15
  }
});
