import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';

export const ProductCard = ({ product, onPress, compact = false }) => {
  const { addToCart, updateQuantity, cart } = useApp();
  const cartItem = cart.find((item) => item.product.id === product.id);
  const qty = cartItem ? cartItem.quantity : 0;

  return (
    <TouchableOpacity
      style={[styles.card, compact && styles.cardCompact]}
      onPress={onPress}
      activeOpacity={0.92}
    >
      <View style={[styles.imageContainer, compact && styles.imageCompact]}>
        <Image source={{ uri: product.image }} style={styles.image} resizeMode="cover" />
        {product.discount ? (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{product.discount}</Text>
          </View>
        ) : null}
        <View style={styles.ratingPill}>
          <Ionicons name="star" size={10} color="#f59e0b" />
          <Text style={styles.ratingText}>{product.rating}</Text>
        </View>
      </View>

      <View style={styles.details}>
        <Text style={styles.title} numberOfLines={2}>
          {product.name}
        </Text>

        <Text style={styles.unit} numberOfLines={1}>
          {product.unit}
        </Text>

        <View style={styles.farmerRow}>
          <Ionicons name="shield-checkmark" size={11} color={colors.primary} />
          <Text style={styles.farmerText} numberOfLines={2} ellipsizeMode="tail">
            {product.farmer}
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.price}>₹{product.price}</Text>
          <Ionicons name="chevron-forward-circle" size={24} color={colors.primary} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    overflow: 'hidden',
    minWidth: 0,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3
  },
  cardCompact: {
    flex: 1,
    marginBottom: 0
  },
  imageContainer: {
    height: 130,
    width: '100%',
    position: 'relative',
    backgroundColor: '#f1f5f9'
  },
  imageCompact: {
    height: 110
  },
  image: {
    width: '100%',
    height: '100%'
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: colors.secondary,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6
  },
  discountText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '500'
  },
  ratingPill: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155'
  },
  details: {
    padding: 12,
    flex: 1,
    minWidth: 0,
    justifyContent: 'space-between'
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    lineHeight: 18
  },
  unit: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
    marginBottom: 6,
    fontWeight: '500',
    lineHeight: 16
  },
  farmerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
    marginBottom: 10
  },
  farmerText: {
    fontSize: 10,
    color: colors.primaryDark,
    fontWeight: '500',
    flex: 1,
    minWidth: 0,
    lineHeight: 14
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4
  },
  price: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    flexShrink: 1
  },
  addButton: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1.5,
    borderColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 58,
    alignItems: 'center'
  },
  addButtonText: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: '500'
  },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    overflow: 'hidden'
  },
  qtyBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: colors.primary
  },
  qtyText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#ffffff',
    minWidth: 20,
    textAlign: 'center'
  }
});
