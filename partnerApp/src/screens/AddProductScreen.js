import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Switch,
  Platform,
  StatusBar,
  KeyboardAvoidingView,
  ActivityIndicator,
  Modal,
  useWindowDimensions
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePartner } from '../context/PartnerContext';
import { colors } from '../theme/colors';
import { glassTheme } from '../theme/glass';
import { GlassCard } from '../components/GlassCard';
import { WaterBackground } from '../components/WaterBackground';
import { showAlert } from '../utils/alert';

// High-resolution presets for merchants with real vector icons and complete instant-add data
const QUICK_PRODUCT_PRESETS = [
  {
    name: 'Special Punjabi Veg Thali',
    label: 'Veg Thali',
    ionIcon: 'fast-food-outline',
    categoryMatch: ['restaurant', 'food', 'meal', 'prepared', 'cook'],
    price: '120',
    mrp: '150',
    unit: '1 plate',
    stock: '25',
    isVeg: true,
    description: 'Fresh royal thali with 2 sabzi, dal makhani, 4 rotis, jeera rice, salad & sweet.',
    url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Fresh Mixed Green Veggies',
    label: 'Green Veggies',
    ionIcon: 'leaf-outline',
    categoryMatch: ['vegetable', 'veg', 'farm', 'fresh', 'produce'],
    price: '60',
    mrp: '80',
    unit: '1 kg',
    stock: '50',
    isVeg: true,
    description: 'Farm fresh broccoli, spinach, and leafy seasonal greens picked this morning.',
    url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Organic Farm Potatoes (Aloo)',
    label: 'Potatoes',
    ionIcon: 'nutrition-outline',
    categoryMatch: ['vegetable', 'veg', 'farm', 'fresh', 'produce'],
    price: '30',
    mrp: '40',
    unit: '1 kg',
    stock: '100',
    isVeg: true,
    description: 'Crisp, nutrient-rich soil grown mountain potatoes suitable for daily cooking.',
    url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Kashmiri Sweet Red Apples',
    label: 'Fresh Apples',
    ionIcon: 'flower-outline',
    categoryMatch: ['fruit', 'fresh', 'produce'],
    price: '140',
    mrp: '170',
    unit: '1 kg',
    stock: '30',
    isVeg: true,
    description: 'Naturally sweet, juicy, and crunchy premium orchard apples.',
    url: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Hot Desi Ghee Paratha (2 Pcs)',
    label: 'Hot Parathas',
    ionIcon: 'restaurant-outline',
    categoryMatch: ['restaurant', 'food', 'meal', 'bread'],
    price: '50',
    mrp: '65',
    unit: '1 plate',
    stock: '40',
    isVeg: true,
    description: 'Hot, flaky tandoori / tawa parathas served with butter and fresh mint curd.',
    url: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Pure Desi Cow Milk',
    label: 'Pure Milk',
    ionIcon: 'water-outline',
    categoryMatch: ['dairy', 'milk', 'egg'],
    price: '65',
    mrp: '70',
    unit: '1 litre',
    stock: '50',
    isVeg: true,
    description: 'Unadulterated A2 raw farm cow milk delivered chilled and fresh.',
    url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Pure Desi Ghee & Gulab Jamun',
    label: 'Desi Sweets',
    ionIcon: 'gift-outline',
    categoryMatch: ['dairy', 'sweet', 'dessert'],
    price: '180',
    mrp: '220',
    unit: '500 g',
    stock: '20',
    isVeg: true,
    description: 'Melt-in-mouth traditional desi sweets prepared in pure churned ghee.',
    url: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Farm Fresh Red Tomatoes',
    label: 'Tomatoes',
    ionIcon: 'nutrition-outline',
    categoryMatch: ['vegetable', 'veg', 'produce'],
    price: '35',
    mrp: '45',
    unit: '1 kg',
    stock: '60',
    isVeg: true,
    description: 'Firm, juicy, ripe field tomatoes packed with natural flavor.',
    url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Fresh Red Onions (Pyaz)',
    label: 'Fresh Onions',
    ionIcon: 'leaf-outline',
    categoryMatch: ['vegetable', 'veg', 'produce'],
    price: '35',
    mrp: '45',
    unit: '1 kg',
    stock: '80',
    isVeg: true,
    description: 'Dry, firm, pungent onions selected for long shelf life and great tadka.',
    url: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop&q=80'
  }
];

const UNIT_PRESETS = ['1 kg', '500 g', '250 g', '1 pc', '1 plate', '1 packet', '1 litre', '1 dozen'];
const STOCK_PRESETS = ['10', '25', '50', '100', '200'];

export const AddProductScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isTablet = width > 600;

  const { addInventoryItem, categories, vendor } = usePartner();

  const [name, setName] = useState(QUICK_PRODUCT_PRESETS[0].name);
  const [selectedCatId, setSelectedCatId] = useState(
    categories && categories.length > 0 ? categories[0]._id : ''
  );
  const [price, setPrice] = useState(QUICK_PRODUCT_PRESETS[0].price);
  const [mrp, setMrp] = useState(QUICK_PRODUCT_PRESETS[0].mrp);
  const [unit, setUnit] = useState(QUICK_PRODUCT_PRESETS[0].unit);
  const [stock, setStock] = useState(QUICK_PRODUCT_PRESETS[0].stock);
  const [description, setDescription] = useState(QUICK_PRODUCT_PRESETS[0].description);
  const [imageUrl, setImageUrl] = useState(QUICK_PRODUCT_PRESETS[0].url);
  const [isVeg, setIsVeg] = useState(true);
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [instantAddingIndex, setInstantAddingIndex] = useState(null);

  const numPrice = parseFloat(price);
  const numMrp = parseFloat(mrp);
  const discountPercent =
    numPrice > 0 && numMrp > numPrice ? Math.round(((numMrp - numPrice) / numMrp) * 100) : 0;

  const showFeedback = (title, message, isSuccess = false) => {
    showAlert(title, message, [
      {
        text: 'OK',
        onPress: () => {
          if (isSuccess) navigation.goBack();
        }
      }
    ]);
  };

  const findMatchingCategoryId = (keywords = []) => {
    if (!categories || categories.length === 0) return '';
    for (const kw of keywords) {
      const match = categories.find((c) =>
        c.name?.toLowerCase().includes(kw.toLowerCase())
      );
      if (match) return match._id;
    }
    return categories[0]._id;
  };

  const handleSelectPreset = (preset, idx) => {
    setSelectedPresetIndex(idx);
    setName(preset.name);
    setPrice(preset.price);
    setMrp(preset.mrp);
    setUnit(preset.unit);
    setStock(preset.stock);
    setImageUrl(preset.url);
    setIsVeg(preset.isVeg);
    setDescription(preset.description);

    const matchedCat = findMatchingCategoryId(preset.categoryMatch);
    if (matchedCat) setSelectedCatId(matchedCat);
  };

  const handleInstantAdd = async (preset, idx) => {
    if (isSubmitting || instantAddingIndex !== null) return;
    setInstantAddingIndex(idx);
    try {
      const catId = findMatchingCategoryId(preset.categoryMatch) || selectedCatId || categories?.[0]?._id;
      const res = await addInventoryItem({
        name: preset.name,
        categoryId: catId,
        category: catId,
        price: Number(preset.price),
        mrp: Number(preset.mrp),
        unit: preset.unit,
        stock: Number(preset.stock),
        description: preset.description,
        image: preset.url,
        isVeg: preset.isVeg
      });

      if (res && res.success !== false) {
        showFeedback('Added to Store! 🎉', `"${preset.name}" is now live in your store catalog!`, true);
      } else {
        showFeedback('Error', res?.message || 'Could not save item. Try again.');
      }
    } catch (e) {
      showFeedback('Error', 'Could not publish item. Please check network.');
    } finally {
      setInstantAddingIndex(null);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      showFeedback('Validation Error', 'Please enter a product title.');
      return;
    }
    if (!price || isNaN(price) || Number(price) <= 0) {
      showFeedback('Validation Error', 'Please enter a valid selling price.');
      return;
    }
    if (!stock || isNaN(stock) || Number(stock) < 0) {
      showFeedback('Validation Error', 'Please enter valid stock available.');
      return;
    }

    setIsSubmitting(true);
    try {
      const catId = selectedCatId || categories?.[0]?._id;
      const res = await addInventoryItem({
        name: name.trim(),
        categoryId: catId,
        category: catId,
        price: Number(price),
        mrp: numMrp && numMrp > 0 ? Number(numMrp) : Number(price),
        unit: unit.trim() || '1 kg',
        stock: Number(stock),
        description: description.trim(),
        image: imageUrl.trim() || QUICK_PRODUCT_PRESETS[0].url,
        isVeg: isVeg
      });

      if (res && res.success !== false) {
        showFeedback('Success! 🌟', 'New product published to customer app!', true);
      } else {
        showFeedback('Error', res?.message || 'Could not save product.');
      }
    } catch (err) {
      showFeedback('Error', 'Failed to publish product. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <WaterBackground />

      {/* Top Header */}
      <View style={[styles.headerBar, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.glassBackBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color="#0f172a" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.headerBarTitle}>Add New Listing</Text>
          <Text style={styles.headerBarSub}>{vendor?.storeName || 'Merchant Store'}</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingBottom: insets.bottom + 110,
              maxWidth: isTablet ? 720 : '100%',
              alignSelf: 'center',
              width: '100%'
            }
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ==================== 1-TAP QUICK ADD CATALOG ==================== */}
          <GlassCard style={styles.sectionCard} showSheen={true}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.boltIconOrb}>
                <Ionicons name="flash" size={16} color="#ea580c" />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.sectionTitle}>1-Tap Quick Add Catalog</Text>
                <Text style={styles.sectionSubtitle}>
                  Tap "+ 1-Tap Add" to instantly publish with real photo & price
                </Text>
              </View>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.presetsRail}
            >
              {QUICK_PRODUCT_PRESETS.map((preset, idx) => {
                const isSelected = selectedPresetIndex === idx;
                const isAdding = instantAddingIndex === idx;

                return (
                  <View
                    key={idx}
                    style={[styles.presetCard, isSelected && styles.presetCardSelected]}
                  >
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => handleSelectPreset(preset, idx)}
                      style={{ alignItems: 'center' }}
                    >
                      <Image source={{ uri: preset.url }} style={styles.presetImage} />
                      <View style={styles.presetIconBadge}>
                        <Ionicons name={preset.ionIcon} size={14} color="#ea580c" />
                      </View>
                      <Text style={styles.presetLabel} numberOfLines={1}>
                        {preset.label}
                      </Text>
                      <Text style={styles.presetPrice}>₹{preset.price} / {preset.unit}</Text>
                    </TouchableOpacity>

                    {/* 1-Tap Add Action */}
                    <TouchableOpacity
                      style={styles.oneTapAddBtn}
                      onPress={() => handleInstantAdd(preset, idx)}
                      disabled={isAdding}
                      activeOpacity={0.8}
                    >
                      {isAdding ? (
                        <ActivityIndicator size="small" color="#ffffff" />
                      ) : (
                        <Text style={styles.oneTapBtnText}>+ 1-Tap Add</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                );
              })}
            </ScrollView>
          </GlassCard>

          {/* ==================== CUSTOM PRODUCT FORM ==================== */}
          <GlassCard style={styles.sectionCard} showSheen={true}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.formIconOrb}>
                <Ionicons name="create-outline" size={16} color="#16a34a" />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.sectionTitle}>Custom Listing Details</Text>
                <Text style={styles.sectionSubtitle}>Customize fields below or edit pre-filled values</Text>
              </View>
            </View>

            {/* Product Title */}
            <View style={styles.inputGroup}>
              <Text style={styles.fieldLabel}>Product Title *</Text>
              <TextInput
                style={styles.glassInput}
                value={name}
                onChangeText={setName}
                placeholder="e.g. Kashmiri Sweet Apples"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            {/* Category Chips */}
            {categories && categories.length > 0 && (
              <View style={styles.inputGroup}>
                <Text style={styles.fieldLabel}>Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catChipsRow}>
                  {categories.map((c) => {
                    const isSelected = selectedCatId === c._id;
                    return (
                      <TouchableOpacity
                        key={c._id}
                        style={[styles.catChip, isSelected && styles.catChipActive]}
                        onPress={() => setSelectedCatId(c._id)}
                      >
                        <Text style={[styles.catChipText, isSelected && styles.catChipTextActive]}>
                          {c.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {/* Price & MRP */}
            <View style={styles.rowTwoCols}>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Selling Price (₹) *</Text>
                <TextInput
                  style={styles.glassInput}
                  value={price}
                  onChangeText={setPrice}
                  placeholder="120"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>MRP (₹)</Text>
                <TextInput
                  style={styles.glassInput}
                  value={mrp}
                  onChangeText={setMrp}
                  placeholder="150"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                />
              </View>
            </View>
            {discountPercent > 0 && (
              <View style={styles.discountBadge}>
                <Ionicons name="pricetag" size={12} color="#16a34a" />
                <Text style={styles.discountText}>{discountPercent}% OFF Customer Discount</Text>
              </View>
            )}

            {/* Unit Selector */}
            <View style={styles.inputGroup}>
              <Text style={styles.fieldLabel}>Unit of Sale</Text>
              <View style={styles.pillsWrap}>
                {UNIT_PRESETS.map((u) => (
                  <TouchableOpacity
                    key={u}
                    style={[styles.presetPill, unit === u && styles.presetPillActive]}
                    onPress={() => setUnit(u)}
                  >
                    <Text style={[styles.presetPillText, unit === u && styles.presetPillTextActive]}>
                      {u}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Initial Stock */}
            <View style={styles.inputGroup}>
              <Text style={styles.fieldLabel}>Initial Stock Available *</Text>
              <View style={styles.pillsWrap}>
                {STOCK_PRESETS.map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.presetPill, stock === s && styles.presetPillActive]}
                    onPress={() => setStock(s)}
                  >
                    <Text style={[styles.presetPillText, stock === s && styles.presetPillTextActive]}>
                      {s} units
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Veg / Non-Veg Toggle */}
            <View style={styles.switchRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={[styles.vegDot, { backgroundColor: isVeg ? '#16a34a' : '#dc2626' }]} />
                <Text style={styles.switchLabel}>
                  {isVeg ? 'Vegetarian Item' : 'Non-Vegetarian Item'}
                </Text>
              </View>
              <Switch
                value={isVeg}
                onValueChange={setIsVeg}
                trackColor={{ false: '#fca5a5', true: '#bbf7d0' }}
                thumbColor={isVeg ? '#16a34a' : '#dc2626'}
              />
            </View>

            {/* Image Preview & URL */}
            <View style={styles.inputGroup}>
              <Text style={styles.fieldLabel}>Product Image URL</Text>
              <TextInput
                style={styles.glassInput}
                value={imageUrl}
                onChangeText={setImageUrl}
                placeholder="https://images.unsplash.com/..."
                placeholderTextColor={colors.textMuted}
              />
              {imageUrl ? (
                <View style={styles.imagePreviewWrap}>
                  <Image source={{ uri: imageUrl }} style={styles.imagePreview} />
                </View>
              ) : null}
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.fieldLabel}>Description</Text>
              <TextInput
                style={[styles.glassInput, { height: 74, textAlignVertical: 'top', paddingTop: 8 }]}
                value={description}
                onChangeText={setDescription}
                placeholder="Brief description of quality, harvest or taste..."
                placeholderTextColor={colors.textMuted}
                multiline
              />
            </View>

            {/* Publish Button */}
            <TouchableOpacity
              style={styles.publishBtn}
              onPress={handleSubmit}
              disabled={isSubmitting}
              activeOpacity={0.8}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Ionicons name="cloud-upload-outline" size={20} color="#ffffff" />
                  <Text style={styles.publishBtnText}>Publish to Customer Feed</Text>
                </>
              )}
            </TouchableOpacity>
          </GlassCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export const InventoryScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isTablet = width > 600;

  const {
    inventory,
    toggleItemAvailability,
    deleteInventoryItem,
    addStockToItem,
    vendor
  } = usePartner();

  const [activeTab, setActiveTab] = useState('ALL');
  const [replenishingId, setReplenishingId] = useState(null);
  const [stockModalItem, setStockModalItem] = useState(null);
  const [stockInputVal, setStockInputVal] = useState('25');

  const filteredItems = inventory.filter((item) => {
    if (activeTab === 'IN_STOCK') return item.isAvailable && (item.stock ?? item.stockQty) > 0;
    if (activeTab === 'OUT_OF_STOCK') return !item.isAvailable || (item.stock ?? item.stockQty) <= 0;
    return true;
  });

  const handleQuickAdd = async (itemId, amt) => {
    setReplenishingId(itemId);
    try {
      await addStockToItem(itemId, amt);
    } finally {
      setReplenishingId(null);
    }
  };

  const handleSaveModalStock = async () => {
    if (!stockModalItem) return;
    const qty = parseInt(stockInputVal, 10);
    if (isNaN(qty) || qty < 0) return;

    const targetId = stockModalItem.id || stockModalItem._id || stockModalItem.productId;
    setReplenishingId(targetId);
    try {
      const current = stockModalItem.stock ?? stockModalItem.stockQty ?? 0;
      const diff = qty - current;
      await addStockToItem(targetId, diff);
      setStockModalItem(null);
    } finally {
      setReplenishingId(null);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <WaterBackground />

      {/* Header */}
      <View style={[styles.headerBar, { paddingTop: insets.top + 10 }]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerBarTitle}>My Store Catalog ({inventory.length})</Text>
          <Text style={styles.headerBarSub}>{vendor?.storeName || 'Merchant Store'}</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('AddProduct')}
          style={styles.addNavBtn}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={18} color="#ffffff" />
          <Text style={styles.addNavBtnText}>Add Listing</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabsContainer}>
        <GlassCard style={styles.filterGlassBar} showSheen={false} borderRadius={16}>
          <View style={styles.filterTabsRow}>
            {['ALL', 'IN_STOCK', 'OUT_OF_STOCK'].map((tab) => {
              const isActive = activeTab === tab;
              const label =
                tab === 'ALL'
                  ? `All (${inventory.length})`
                  : tab === 'IN_STOCK'
                  ? `In Stock (${inventory.filter((i) => i.isAvailable && (i.stock ?? i.stockQty) > 0).length})`
                  : `Out of Stock (${inventory.filter((i) => !i.isAvailable || (i.stock ?? i.stockQty) <= 0).length})`;
              return (
                <TouchableOpacity
                  key={tab}
                  style={[styles.filterTabChip, isActive && styles.filterTabChipActive]}
                  onPress={() => setActiveTab(tab)}
                >
                  <Text style={[styles.filterTabChipText, isActive && styles.filterTabChipTextActive]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </GlassCard>
      </View>

      {/* Catalog Items List */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: insets.bottom + 110,
            maxWidth: isTablet ? 720 : '100%',
            alignSelf: 'center',
            width: '100%'
          }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {filteredItems.length === 0 ? (
          <GlassCard style={styles.emptyInventoryCard}>
            <Ionicons name="cube-outline" size={44} color="#94a3b8" />
            <Text style={styles.emptyInvTitle}>No items in this category</Text>
            <Text style={styles.emptyInvSub}>
              Use "+ Add Listing" to publish farm produce or kitchen meals.
            </Text>
          </GlassCard>
        ) : (
          filteredItems.map((item) => {
            const itemId = item.id || item._id || item.productId;
            const stockQty = item.stock ?? item.stockQty ?? 0;
            const isAvailable = item.isAvailable && stockQty > 0;
            const isBusy = replenishingId === itemId;

            return (
              <GlassCard key={itemId} style={styles.inventoryCard} showSheen={true}>
                <View style={styles.invCardRow}>
                  {item.image ? (
                    <Image source={{ uri: item.image }} style={styles.invThumb} />
                  ) : (
                    <View style={styles.invThumbFallback}>
                      <Ionicons name="basket-outline" size={24} color="#94a3b8" />
                    </View>
                  )}

                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.invName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.invPrice}>
                      ₹{item.price} <Text style={styles.invUnit}>/ {item.unit || '1 kg'}</Text>
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                      <Text
                        style={[
                          styles.stockBadgeText,
                          { color: stockQty > 0 ? '#16a34a' : '#dc2626' }
                        ]}
                      >
                        Stock: {stockQty} {item.unit || 'units'}
                      </Text>
                    </View>
                  </View>

                  {/* One-Tap Availability Toggle */}
                  <View style={{ alignItems: 'flex-end', gap: 4 }}>
                    <Switch
                      value={item.isAvailable}
                      onValueChange={() => toggleItemAvailability(itemId)}
                      trackColor={{ false: '#cbd5e1', true: '#bbf7d0' }}
                      thumbColor={item.isAvailable ? '#16a34a' : '#94a3b8'}
                    />
                    <Text
                      style={[
                        styles.availLabel,
                        { color: item.isAvailable ? '#16a34a' : '#64748b' }
                      ]}
                    >
                      {item.isAvailable ? 'In Stock' : 'Hidden'}
                    </Text>
                  </View>
                </View>

                {/* Stock Controls & Actions Bar */}
                <View style={styles.invActionsRow}>
                  <View style={styles.quickStockRow}>
                    <Text style={styles.quickStockLabel}>+Add:</Text>
                    {[10, 25, 50].map((amt) => (
                      <TouchableOpacity
                        key={amt}
                        style={styles.quickAddChip}
                        onPress={() => handleQuickAdd(itemId, amt)}
                        disabled={isBusy}
                      >
                        <Text style={styles.quickAddText}>+{amt}</Text>
                      </TouchableOpacity>
                    ))}
                    <TouchableOpacity
                      style={styles.editStockChip}
                      onPress={() => {
                        setStockModalItem(item);
                        setStockInputVal(String(stockQty));
                      }}
                    >
                      <Ionicons name="pencil" size={12} color="#0284c7" />
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={styles.deleteListingBtn}
                    onPress={() => {
                      showAlert('Remove Product', `Delete "${item.name}" from store catalog?`, [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Delete', style: 'destructive', onPress: () => deleteInventoryItem(itemId) }
                      ]);
                    }}
                  >
                    <Ionicons name="trash-outline" size={16} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </GlassCard>
            );
          })
        )}
      </ScrollView>

      {/* Custom Stock Modal */}
      <Modal
        visible={!!stockModalItem}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setStockModalItem(null)}
      >
        <View style={styles.modalBackdrop}>
          <GlassCard style={styles.stockModalCard}>
            <Text style={styles.stockModalTitle}>Set Stock Quantity</Text>
            <Text style={styles.stockModalSub}>{stockModalItem?.name}</Text>

            <TextInput
              style={styles.stockModalInput}
              value={stockInputVal}
              onChangeText={setStockInputVal}
              keyboardType="numeric"
              placeholder="e.g. 50"
            />

            <View style={styles.stockModalBtnsRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setStockModalItem(null)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={handleSaveModalStock}
              >
                <Text style={styles.modalSaveText}>Save Stock</Text>
              </TouchableOpacity>
            </View>
          </GlassCard>
        </View>
      </Modal>
    </View>
  );
};

export const SettlementsScreen = () => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isTablet = width > 600;
  const { stats } = usePartner();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <WaterBackground />

      <View style={[styles.headerBar, { paddingTop: insets.top + 10 }]}>
        <Text style={styles.headerBarTitle}>Wednesday Settlements</Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: insets.bottom + 110,
            maxWidth: isTablet ? 720 : '100%',
            alignSelf: 'center',
            width: '100%'
          }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Upcoming Wednesday Payout Hero Card */}
        <GlassCard style={styles.wedHeroCard} showSheen={true} tint="green">
          <View style={styles.wedHeroRow}>
            <View style={styles.wedIconOrb}>
              <Ionicons name="calendar-outline" size={26} color="#16a34a" />
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={styles.wedHeroTitle}>Upcoming Wednesday Payout</Text>
              <Text style={styles.wedHeroAmount}>
                ₹{stats.todaySales ? stats.todaySales + 1250 : 1850}
              </Text>
              <View style={styles.bankDirectTag}>
                <Ionicons name="checkmark-circle" size={13} color="#15803d" />
                <Text style={styles.bankDirectText}>Direct Transfer to SBI A/c (*4321)</Text>
              </View>
            </View>
          </View>
        </GlassCard>

        {/* Previous Weekly Payouts Ledger */}
        <Text style={styles.sectionHeaderTitle}>Previous Weekly Payouts</Text>
        {[
          { date: 'Wednesday, Sep 10, 2026', total: 4280, status: 'PAID TO BANK', ref: 'FARM-PAY-88231' },
          { date: 'Wednesday, Sep 03, 2026', total: 3950, status: 'PAID TO BANK', ref: 'FARM-PAY-87109' },
          { date: 'Wednesday, Aug 27, 2026', total: 5120, status: 'PAID TO BANK', ref: 'FARM-PAY-86043' }
        ].map((item, idx) => (
          <GlassCard key={idx} style={styles.settleCard} showSheen={false}>
            <View style={styles.settleRowTop}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="arrow-down-circle" size={20} color="#16a34a" />
                <Text style={styles.settleDate}>{item.date}</Text>
              </View>
              <Text style={styles.settleAmount}>+₹{item.total}</Text>
            </View>

            <View style={styles.settleRowBottom}>
              <View style={styles.settleStatusBadge}>
                <Text style={styles.settleStatusText}>{item.status}</Text>
              </View>
              <Text style={styles.settleRefText}>Ref: {item.ref}</Text>
            </View>
          </GlassCard>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12
  },
  headerBarTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a'
  },
  headerBarSub: {
    fontSize: 12,
    color: '#64748b'
  },
  glassBackBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  addNavBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: '#ea580c',
    shadowColor: '#ea580c',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 3
  },
  addNavBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff'
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 6
  },
  sectionCard: {
    marginBottom: 16,
    padding: 18
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14
  },
  boltIconOrb: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(234, 88, 12, 0.12)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  formIconOrb: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(22, 163, 74, 0.12)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a'
  },
  sectionSubtitle: {
    fontSize: 11,
    color: '#64748b'
  },
  presetsRail: {
    gap: 12,
    paddingVertical: 4
  },
  presetCard: {
    width: 130,
    borderRadius: 16,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderWidth: 1.5,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    alignItems: 'center'
  },
  presetCardSelected: {
    borderColor: '#ea580c',
    backgroundColor: 'rgba(254, 243, 199, 0.5)'
  },
  presetImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 6
  },
  presetIconBadge: {
    position: 'absolute',
    top: 38,
    right: 32,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(234, 88, 12, 0.3)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  presetLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center'
  },
  presetPrice: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2
  },
  oneTapAddBtn: {
    marginTop: 8,
    width: '100%',
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#ea580c',
    alignItems: 'center'
  },
  oneTapBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff'
  },
  inputGroup: {
    marginBottom: 12
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 4
  },
  glassInput: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.85)',
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#0f172a'
  },
  rowTwoCols: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8
  },
  discountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(22, 163, 74, 0.12)',
    alignSelf: 'flex-start',
    marginBottom: 12
  },
  discountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16a34a'
  },
  catChipsRow: {
    gap: 8,
    paddingVertical: 4
  },
  catChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)'
  },
  catChipActive: {
    backgroundColor: 'rgba(234, 88, 12, 0.12)',
    borderColor: '#ea580c'
  },
  catChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569'
  },
  catChipTextActive: {
    color: '#ea580c',
    fontWeight: '700'
  },
  pillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  presetPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)'
  },
  presetPillActive: {
    backgroundColor: 'rgba(217, 119, 6, 0.15)',
    borderColor: '#d97706'
  },
  presetPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569'
  },
  presetPillTextActive: {
    color: '#b45309',
    fontWeight: '700'
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 10
  },
  vegDot: {
    width: 10,
    height: 10,
    borderRadius: 5
  },
  switchLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155'
  },
  imagePreviewWrap: {
    marginTop: 8,
    alignItems: 'center'
  },
  imagePreview: {
    width: '100%',
    height: 120,
    borderRadius: 12
  },
  publishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#ea580c',
    marginTop: 8,
    shadowColor: '#ea580c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4
  },
  publishBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff'
  },

  // INVENTORY STYLES
  filterTabsContainer: {
    paddingHorizontal: 16,
    marginBottom: 12
  },
  filterGlassBar: {
    padding: 6
  },
  filterTabsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  filterTabChip: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 12
  },
  filterTabChipActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2
  },
  filterTabChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b'
  },
  filterTabChipTextActive: {
    color: '#0f172a',
    fontWeight: '800'
  },
  emptyInventoryCard: {
    alignItems: 'center',
    padding: 32,
    marginTop: 20
  },
  emptyInvTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 10
  },
  emptyInvSub: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
    textAlign: 'center'
  },
  inventoryCard: {
    marginBottom: 12,
    padding: 14
  },
  invCardRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  invThumb: {
    width: 54,
    height: 54,
    borderRadius: 12
  },
  invThumbFallback: {
    width: 54,
    height: 54,
    borderRadius: 12,
    backgroundColor: 'rgba(226, 232, 240, 0.6)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  invName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a'
  },
  invPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 2
  },
  invUnit: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748b'
  },
  stockBadgeText: {
    fontSize: 11,
    fontWeight: '700'
  },
  availLabel: {
    fontSize: 10,
    fontWeight: '700'
  },
  invActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(226, 232, 240, 0.7)'
  },
  quickStockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  quickStockLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b'
  },
  quickAddChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: 'rgba(22, 163, 74, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(22, 163, 74, 0.3)'
  },
  quickAddText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16a34a'
  },
  editStockChip: {
    padding: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(2, 132, 199, 0.12)'
  },
  deleteListingBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)'
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  stockModalCard: {
    width: '100%',
    maxWidth: 380,
    padding: 20
  },
  stockModalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a'
  },
  stockModalSub: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
    marginBottom: 12
  },
  stockModalInput: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.9)',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: 12,
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 16
  },
  stockModalBtnsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10
  },
  modalCancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(100, 116, 139, 0.1)'
  },
  modalCancelText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569'
  },
  modalSaveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#16a34a'
  },
  modalSaveText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff'
  },

  // SETTLEMENTS STYLES
  wedHeroCard: {
    marginBottom: 16,
    padding: 18
  },
  wedHeroRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  wedIconOrb: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(22, 163, 74, 0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(22, 163, 74, 0.35)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  wedHeroTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#15803d'
  },
  wedHeroAmount: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 2
  },
  bankDirectTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4
  },
  bankDirectText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#15803d'
  },
  sectionHeaderTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 10
  },
  settleCard: {
    marginBottom: 10,
    padding: 14
  },
  settleRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  settleDate: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a'
  },
  settleAmount: {
    fontSize: 15,
    fontWeight: '800',
    color: '#16a34a'
  },
  settleRowBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8
  },
  settleStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: 'rgba(22, 163, 74, 0.12)'
  },
  settleStatusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#16a34a'
  },
  settleRefText: {
    fontSize: 11,
    color: '#64748b'
  }
});
