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
          <Text style={styles.farmerText} numberOfLines={1}>
            {product.farmer}
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.price}>₹{product.price}</Text>

          {qty > 0 ? (
            <View style={styles.qtyControl}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => updateQuantity(product.id, -1)}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Ionicons name="remove" size={14} color={colors.primary} />
              </TouchableOpacity>
              <Text style={styles.qtyText}>{qty}</Text>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => addToCart(product)}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Ionicons name="add" size={14} color={colors.primary} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => addToCart(product)}
              activeOpacity={0.85}
            >
              <Text style={styles.addButtonText}>ADD</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2
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
    gap: 3,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8
  },
  ratingText: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.textPrimary
  },
  details: {
    padding: 10
  },
  title: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textPrimary,
    lineHeight: 17,
    minHeight: 34
  },
  unit: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
    fontWeight: '500'
  },
  farmerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 4,
    marginBottom: 8
  },
  farmerText: {
    fontSize: 10,
    color: colors.primaryDark,
    fontWeight: '500',
    flex: 1
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  price: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary
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
