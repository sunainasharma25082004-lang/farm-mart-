import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { categories } from '../data/mockData';
import { colors } from '../theme/colors';

export const CategoryChip = ({ selectedCategory, onSelectCategory }) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {categories.map((cat) => {
        const isSelected = selectedCategory === cat.id;
        return (
          <TouchableOpacity
            key={cat.id}
            style={[styles.chip, isSelected && styles.selectedChip]}
            onPress={() => onSelectCategory(cat.id)}
            activeOpacity={0.8}
          >
            <View style={[styles.iconWrap, isSelected && styles.iconWrapSelected]}>
              <Ionicons
                name={cat.icon}
                size={14}
                color={isSelected ? colors.primaryDark : colors.textSecondary}
              />
            </View>
            <Text
              style={[styles.text, isSelected && styles.selectedText]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {cat.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    alignItems: 'center'
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    minHeight: 46,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
    alignSelf: 'center',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2
  },
  selectedChip: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
    shadowOpacity: 0.1
  },
  iconWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  iconWrapSelected: {
    backgroundColor: '#ffffff'
  },
  text: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
    includeFontPadding: false,
    textAlignVertical: 'center',
    paddingVertical: 2,
    flexShrink: 1
  },
  selectedText: {
    color: colors.primaryDark,
    fontWeight: '500'
  }
});
