import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const DEFAULT_CATEGORIES = [
  { id: 'all', name: 'All Services', icon: 'grid-outline' },
  { id: 'grocery', name: 'S-farmart Mart', icon: 'basket-outline' },
  { id: 'veggies', name: 'Farm Veggies', icon: 'leaf-outline' },
  { id: 'fruits', name: 'Fresh Fruits', icon: 'sunny-outline' },
  { id: 'dairy', name: 'Dairy & Ghee', icon: 'water-outline' },
  { id: 'homerestro', name: 'Home Food & Thali', icon: 'restaurant-outline' },
  { id: 'bakery', name: 'Fresh Bakery', icon: 'disc-outline' },
  { id: 'sweets', name: 'Desi Sweets', icon: 'gift-outline' }
];

export const CategoryChip = ({ categories: propCats, selectedCategory, onSelectCategory }) => {
  const displayCategories = (propCats && propCats.length > 0)
    ? [{ id: 'all', name: 'All Services', icon: 'grid-outline' }, ...propCats.map((c) => ({
        id: c.slug || c._id || c.id,
        name: c.name,
        icon: c.icon || 'basket-outline'
      }))]
    : DEFAULT_CATEGORIES;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {displayCategories.map((cat) => {
        const catKey = cat.id || cat.slug || cat._id;
        const isSelected = selectedCategory === catKey;
        return (
          <TouchableOpacity
            key={catKey}
            style={[styles.chip, isSelected && styles.selectedChip]}
            onPress={() => onSelectCategory(catKey)}
            activeOpacity={0.8}
          >
            <View style={[styles.iconWrap, isSelected && styles.iconWrapSelected]}>
              <Ionicons
                name={cat.icon || 'basket-outline'}
                size={14}
                color={isSelected ? colors.primaryDark : colors.textSecondary}
              />
            </View>
            <Text style={[styles.text, isSelected && styles.selectedText]}>{cat.name}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6
  },
  selectedChip: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary
  },
  iconWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconWrapSelected: {
    backgroundColor: '#ffffff'
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary
  },
  selectedText: {
    color: colors.primaryDark,
    fontWeight: '500'
  }
});
