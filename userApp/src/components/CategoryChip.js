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
