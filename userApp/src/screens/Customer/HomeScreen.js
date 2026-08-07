import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../../components/Header';
import { CategoryChip } from '../../components/CategoryChip';
import { ProductCard } from '../../components/ProductCard';
import { products, services } from '../../data/mockData';
import { colors } from '../../theme/colors';

const { width } = Dimensions.get('window');
const CARD_GAP = 10;
const CARD_WIDTH = (width - 32 - CARD_GAP) / 2;

export const HomeScreen = ({ navigation }) => {
  const [selectedCat, setSelectedCat] = useState('all');
  const [selectedService, setSelectedService] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = products.filter((p) => {
    const matchesService = selectedService === 'all' || p.service === selectedService;
    const matchesCat = selectedCat === 'all' || p.category === selectedCat;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesService && matchesCat && matchesSearch;
  });

  const productRows = [];
  for (let i = 0; i < filteredProducts.length; i += 2) {
    productRows.push(filteredProducts.slice(i, i + 2));
  }

  return (
    <View style={styles.container}>
      <Header navigation={navigation} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Search */}
        <View style={styles.searchSection}>
          <Ionicons name="search" size={18} color={colors.primary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search veggies, thalis, sweets, ghee..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          ) : (
            <View style={styles.micWrap}>
              <Ionicons name="mic-outline" size={16} color={colors.textSecondary} />
            </View>
          )}
        </View>

        {/* Quick info strip */}
        <View style={styles.infoStrip}>
          <View style={styles.infoItem}>
            <Ionicons name="flash" size={14} color={colors.accent} />
            <Text style={styles.infoText}>30–45 min delivery</Text>
          </View>
          <View style={styles.infoDot} />
          <View style={styles.infoItem}>
            <Ionicons name="leaf" size={14} color={colors.primary} />
            <Text style={styles.infoText}>Farm fresh daily</Text>
          </View>
          <View style={styles.infoDot} />
          <View style={styles.infoItem}>
            <Ionicons name="shield-checkmark" size={14} color={colors.info} />
            <Text style={styles.infoText}>Quality checked</Text>
          </View>
        </View>

        {/* Services grid */}
        <View style={styles.servicesContainer}>
          <Text style={styles.superAppHeading}>FARMART SERVICES</Text>
          <View style={styles.servicesGrid}>
            {services.map((serv) => {
              const isSelected = selectedService === serv.id;
              return (
                <TouchableOpacity
                  key={serv.id}
                  style={[
                    styles.serviceTile,
                    { backgroundColor: serv.bg },
                    isSelected && styles.selectedServiceTile
                  ]}
                  onPress={() => setSelectedService(isSelected ? 'all' : serv.id)}
                  activeOpacity={0.85}
                >
                  <View style={[styles.serviceIconCircle, { backgroundColor: serv.color }]}>
                    <Ionicons name={serv.icon} size={18} color="#ffffff" />
                  </View>
                  <Text style={styles.serviceTitle} numberOfLines={1}>
                    {serv.title}
                  </Text>
                  <Text style={styles.serviceSub} numberOfLines={1}>
                    {serv.subtitle}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Promo banners */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.bannerSlider}
        >
          <ImageBackground
            source={{
              uri: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80'
            }}
            style={styles.heroBanner}
            imageStyle={{ borderRadius: 16 }}
          >
            <View style={styles.heroOverlay}>
              <View style={styles.pillBadge}>
                <Ionicons name="sparkles" size={11} color="#ffffff" />
                <Text style={styles.pillText}>DIRECT FROM FARMERS</Text>
              </View>
              <Text style={styles.heroTitle}>100% Organic & Fresh</Text>
              <Text style={styles.heroSub}>Harvested daily from local farms</Text>
            </View>
          </ImageBackground>

          <ImageBackground
            source={{
              uri: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80'
            }}
            style={styles.heroBanner}
            imageStyle={{ borderRadius: 16 }}
          >
            <View style={[styles.heroOverlay, { backgroundColor: 'rgba(220, 38, 38, 0.72)' }]}>
              <View style={[styles.pillBadge, { backgroundColor: '#ffffff' }]}>
                <Ionicons name="restaurant" size={11} color={colors.secondary} />
                <Text style={[styles.pillText, { color: colors.secondary }]}>HOME CHEFS</Text>
              </View>
              <Text style={styles.heroTitle}>Homestyle Thalis</Text>
              <Text style={styles.heroSub}>Cooked with pure ghee & care</Text>
            </View>
          </ImageBackground>

          <ImageBackground
            source={{
              uri: 'https://images.unsplash.com/photo-1599785209707-a456fc1337bb?w=800&auto=format&fit=crop&q=80'
            }}
            style={styles.heroBanner}
            imageStyle={{ borderRadius: 16 }}
          >
            <View style={[styles.heroOverlay, { backgroundColor: 'rgba(124, 58, 237, 0.72)' }]}>
              <View style={[styles.pillBadge, { backgroundColor: '#ffffff' }]}>
                <Ionicons name="gift" size={11} color="#7c3aed" />
                <Text style={[styles.pillText, { color: '#7c3aed' }]}>SWEETS & BAKERY</Text>
              </View>
              <Text style={styles.heroTitle}>Festival Specials</Text>
              <Text style={styles.heroSub}>Gur ladoo, kaju katli & more</Text>
            </View>
          </ImageBackground>
        </ScrollView>

        {/* Categories */}
        <CategoryChip selectedCategory={selectedCat} onSelectCategory={setSelectedCat} />

        {/* Products */}
        <View style={styles.sectionHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>
              {selectedService !== 'all'
                ? services.find((s) => s.id === selectedService)?.title
                : 'Popular near you'}
            </Text>
            <Text style={styles.sectionSub}>
              {filteredProducts.length} items · Quality assured by Farmart
            </Text>
          </View>

          {selectedService !== 'all' && (
            <TouchableOpacity style={styles.clearBtn} onPress={() => setSelectedService('all')}>
              <Text style={styles.resetFilterText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>

        {filteredProducts.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="search-outline" size={40} color={colors.textMuted} />
            <Text style={styles.emptyText}>No products match your filters</Text>
            <TouchableOpacity
              onPress={() => {
                setSelectedCat('all');
                setSelectedService('all');
                setSearchQuery('');
              }}
            >
              <Text style={styles.resetFilterText}>Reset filters</Text>
            </TouchableOpacity>
          </View>
        ) : (
          productRows.map((row, rowIndex) => (
            <View key={`row-${rowIndex}`} style={styles.productRow}>
              {row.map((product) => (
                <View key={product.id} style={styles.productCell}>
                  <ProductCard
                    product={product}
                    compact
                    onPress={() => navigation.navigate('Catalog')}
                  />
                </View>
              ))}
              {row.length === 1 && <View style={styles.productCell} />}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  scrollContent: {
    paddingBottom: 28
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    padding: 0
  },
  micWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center'
  },
  infoStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 8,
    flexWrap: 'wrap'
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  infoText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary
  },
  infoDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.textMuted
  },
  servicesContainer: {
    paddingHorizontal: 16,
    marginBottom: 14
  },
  superAppHeading: {
    fontSize: 11,
    fontWeight: '900',
    color: colors.textMuted,
    letterSpacing: 1.1,
    marginBottom: 10
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  serviceTile: {
    width: '48%',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1.5,
    borderColor: 'transparent'
  },
  selectedServiceTile: {
    borderColor: colors.primary
  },
  serviceIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8
  },
  serviceTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textPrimary
  },
  serviceSub: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2
  },
  bannerSlider: {
    paddingLeft: 16,
    paddingRight: 4,
    marginBottom: 8
  },
  heroBanner: {
    width: 280,
    height: 132,
    marginRight: 12
  },
  heroOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.62)',
    borderRadius: 16,
    padding: 14,
    justifyContent: 'flex-end'
  },
  pillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
    marginBottom: 6
  },
  pillText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800'
  },
  heroTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff'
  },
  heroSub: {
    fontSize: 11,
    color: '#e2e8f0',
    marginTop: 2
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 12
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary
  },
  sectionSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2
  },
  clearBtn: {
    backgroundColor: colors.secondaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8
  },
  resetFilterText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.secondary
  },
  productRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: CARD_GAP,
    marginBottom: CARD_GAP
  },
  productCell: {
    width: CARD_WIDTH
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8
  },
  emptyText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600'
  }
});
