import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  Platform
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { useApp } from '../../context/AppContext';
import { products } from '../../data/mockData';
import { ProductCard } from '../../components/ProductCard';

const { width } = Dimensions.get('window');

export const ProductDetailsScreen = ({ route, navigation }) => {
  const { product } = route.params;
  const { addToCart, updateQuantity, cart } = useApp();
  
  const cartItem = cart.find(item => item.product.id === product.id);
  const qtyInCart = cartItem ? cartItem.quantity : 0;

  const similarProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 5);

  return (
    <SafeAreaView style={styles.container}>
      {/* Premium Solid Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color={colors.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Cart')}>
          <Ionicons name="cart-outline" size={26} color={colors.textPrimary} />
          {cart.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{cart.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Product Image - Square and Contained */}
        <View style={styles.imageWrap}>
          <Image source={{ uri: product.image }} style={styles.image} resizeMode="contain" />
          {product.discount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{product.discount} OFF</Text>
            </View>
          )}
        </View>

        {/* Core Product Info */}
        <View style={styles.mainInfo}>
          <View style={styles.titleRow}>
            <Text style={styles.productName}>{product.name}</Text>
          </View>
          <Text style={styles.unitText}>{product.unit}</Text>

          <View style={styles.actionRow}>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>₹{product.price}</Text>
              <View style={styles.ratingBox}>
                <Text style={styles.ratingText}>{product.rating}</Text>
                <Ionicons name="star" size={10} color="#ffffff" style={{marginLeft: 2}} />
              </View>
            </View>

            {/* Quick Commerce Add Button */}
            <View style={styles.btnWrapper}>
              {qtyInCart === 0 ? (
                <TouchableOpacity 
                  style={styles.addBtn} 
                  onPress={() => addToCart(product)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.addBtnText}>ADD</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.qtyControl}>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => updateQuantity(product.id, -1)}
                  >
                    <Ionicons name="remove" size={18} color="#ffffff" />
                  </TouchableOpacity>
                  <Text style={styles.qtyText}>{qtyInCart}</Text>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => updateQuantity(product.id, 1)}
                  >
                    <Ionicons name="add" size={18} color="#ffffff" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Delivery Timeline / Trust */}
        <View style={styles.trustSection}>
          <View style={styles.trustItem}>
            <View style={styles.trustIconWrap}>
              <MaterialCommunityIcons name="clock-fast" size={24} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.trustTitle}>Superfast Delivery</Text>
              <Text style={styles.trustSub}>Get it right at your door</Text>
            </View>
          </View>
          
          <View style={styles.trustItem}>
            <View style={styles.trustIconWrap}>
              <MaterialCommunityIcons name="leaf" size={24} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.trustTitle}>100% Genuine</Text>
              <Text style={styles.trustSub}>Sourced directly from partners</Text>
            </View>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Description Section */}
        <View style={styles.descSection}>
          <Text style={styles.sectionHeading}>Product Details</Text>
          <Text style={styles.descriptionText}>{product.description}</Text>
          
          <Text style={[styles.sectionHeading, {marginTop: 20}]}>Sourced By</Text>
          <Text style={styles.farmerText}>{product.farmer}</Text>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Suggestions */}
        {similarProducts.length > 0 && (
          <View style={styles.suggestionsBox}>
            <Text style={styles.sectionHeading}>You might also like</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.suggestionScroll}
            >
              {similarProducts.map((item) => (
                <View key={item.id} style={styles.suggestionCardWrap}>
                  <ProductCard 
                    product={item} 
                    compact 
                    onPress={() => navigation.push('ProductDetails', { product: item })}
                  />
                </View>
              ))}
            </ScrollView>
          </View>
        )}

      </ScrollView>

      {/* Floating Checkout Bar (Appears only if cart has items) */}
      {cart.length > 0 && (
        <View style={styles.floatingCart}>
          <View style={styles.floatingCartInner}>
            <View>
              <Text style={styles.fcItems}>{cart.length} ITEM{cart.length > 1 ? 'S' : ''}</Text>
              <Text style={styles.fcTotal}>View Cart</Text>
            </View>
            <TouchableOpacity 
              style={styles.fcBtn} 
              onPress={() => navigation.navigate('Cart')}
            >
              <Ionicons name="cart" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9'
  },
  iconBtn: {
    padding: 8
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: colors.secondary,
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#ffffff'
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '600'
  },
  scrollContent: {
    paddingBottom: 100
  },
  imageWrap: {
    width: width,
    height: width, // 1:1 Aspect Ratio
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  image: {
    width: '80%',
    height: '80%'
  },
  discountBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8
  },
  discountText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600'
  },
  mainInfo: {
    padding: 16,
    paddingTop: 20
  },
  titleRow: {
    marginBottom: 4
  },
  productName: {
    fontSize: 22,
    fontWeight: '600',
    color: '#0f172a',
    lineHeight: 28
  },
  unitText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500'
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  price: {
    fontSize: 24,
    fontWeight: '600',
    color: '#0f172a'
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6
  },
  ratingText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600'
  },
  btnWrapper: {
    minWidth: 100,
    height: 38
  },
  addBtn: {
    flex: 1,
    backgroundColor: 'rgba(22, 163, 74, 0.1)',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  addBtnText: {
    color: colors.primaryDark,
    fontSize: 14,
    fontWeight: '600'
  },
  qtyControl: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.primary,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  qtyBtn: {
    paddingHorizontal: 12,
    height: '100%',
    justifyContent: 'center'
  },
  qtyText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600'
  },
  divider: {
    height: 8,
    backgroundColor: '#f1f5f9'
  },
  trustSection: {
    padding: 16,
    gap: 16
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  trustIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center'
  },
  trustTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155'
  },
  trustSub: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2
  },
  descSection: {
    padding: 16,
    paddingVertical: 20
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 10
  },
  descriptionText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22
  },
  farmerText: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '500'
  },
  suggestionsBox: {
    paddingVertical: 20
  },
  suggestionScroll: {
    paddingHorizontal: 16,
    gap: 12
  },
  suggestionCardWrap: {
    width: width * 0.42 // Slimmer cards for quick-commerce look
  },
  floatingCart: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 16,
    left: 16,
    right: 16,
    backgroundColor: colors.primary,
    borderRadius: 12,
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8
  },
  floatingCartInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  fcItems: {
    color: '#dcfce7',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2
  },
  fcTotal: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600'
  },
  fcBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center'
  }
});
