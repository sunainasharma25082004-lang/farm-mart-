import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useApp } from '../context/AppContext';

const LOGO = require('../../assets/farmart24_logo.jpg');

export const Header = ({ navigation, title, showCart = true, showBack = false }) => {
  const { cart, userProfile } = useApp();
  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const canGoBack = showBack || (navigation && navigation.canGoBack && navigation.canGoBack());

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {canGoBack ? (
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
        ) : (
          <Image source={LOGO} style={styles.logoImage} resizeMode="contain" />
        )}

        <View style={styles.centerSection}>
          {title ? (
            <Text style={styles.pageTitle} numberOfLines={1}>
              {title}
            </Text>
          ) : (
            <TouchableOpacity style={styles.locationSection} activeOpacity={0.8}>
              <View style={styles.deliveryRow}>
                <Ionicons name="location" size={14} color={colors.secondary} />
                <Text style={styles.deliveryLabel}>Deliver to</Text>
                <Ionicons name="chevron-down" size={12} color={colors.textPrimary} />
              </View>
              <Text style={styles.addressTitle} numberOfLines={1}>
                {userProfile.villageHub}
              </Text>
              <Text style={styles.addressSub} numberOfLines={1}>
                {userProfile.city} · Express 30–45 min
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {showCart ? (
          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => navigation && navigation.navigate('Cart')}
            activeOpacity={0.8}
          >
            <Ionicons name="cart-outline" size={22} color={colors.textPrimary} />
            {cartItemCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{cartItemCount > 9 ? '9+' : cartItemCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        ) : (
          <View style={styles.cartPlaceholder} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10
  },
  logoImage: {
    width: 92,
    height: 40
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border
  },
  centerSection: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
    overflow: 'hidden'
  },
  pageTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary
  },
  locationSection: {
    justifyContent: 'center',
    width: '100%'
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3
  },
  deliveryLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.secondary
  },
  addressTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textPrimary,
    marginTop: 1
  },
  addressSub: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 1
  },
  cartButton: {
    position: 'relative',
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center'
  },
  cartPlaceholder: {
    width: 42,
    height: 42
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.secondary,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#ffffff'
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '500'
  }
});
