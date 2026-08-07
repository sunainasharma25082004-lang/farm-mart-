import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { CategoryChip } from '../../components/CategoryChip';
import { ProductCard } from '../../components/ProductCard';
import { products } from '../../data/mockData';
import { colors } from '../../theme/colors';

const { width } = Dimensions.get('window');
const GAP = 10;
const CARD_WIDTH = (width - 32 - GAP) / 2;

export const CatalogScreen = ({ navigation }) => {
  const [selectedCat, setSelectedCat] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCat === 'all' || p.category === selectedCat;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <View style={styles.container}>
      <Header navigation={navigation} title="Marketplace" />

      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={colors.primary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search produce, dairy, bakery..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <Ionicons
            name="close-circle"
            size={18}
            color={colors.textMuted}
            onPress={() => setSearchQuery('')}
          />
        )}
      </View>

      <CategoryChip selectedCategory={selectedCat} onSelectCategory={setSelectedCat} />

      <View style={styles.countRow}>
        <Text style={styles.countText}>{filteredProducts.length} products</Text>
      </View>

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.cardWrap}>
            <ProductCard product={item} compact />
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="basket-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyText}>No items found</Text>
            <Text style={styles.emptySub}>Try another category or search term</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    padding: 0
  },
  countRow: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    paddingTop: 4
  },
  countText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24
  },
  row: {
    gap: GAP,
    marginBottom: GAP
  },
  cardWrap: {
    width: CARD_WIDTH
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 10
  },
  emptySub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4
  }
});
