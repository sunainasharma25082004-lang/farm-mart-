import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Switch,
  Platform,
  StatusBar,
  KeyboardAvoidingView,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePartner } from '../context/PartnerContext';
import { colors } from '../theme/colors';

// High-resolution presets for merchants with complete instant-add data
const QUICK_PRODUCT_PRESETS = [
  {
    name: 'Special Punjabi Veg Thali',
    label: 'Veg Thali',
    icon: '🍛',
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
    icon: '🥦',
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
    icon: '🥔',
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
    icon: '🍎',
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
    icon: '🫓',
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
    icon: '🥛',
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
    icon: '🍯',
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
    icon: '🍅',
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
    icon: '🧅',
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
  const [showCustomImage, setShowCustomImage] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // Auto calculate discount percentage
  const numPrice = parseFloat(price);
  const numMrp = parseFloat(mrp);
  const discountPercent =
    numPrice > 0 && numMrp > numPrice ? Math.round(((numMrp - numPrice) / numMrp) * 100) : 0;

  const showFeedback = (title, message, isSuccess = false) => {
    if (Platform.OS === 'web') {
      setStatusMessage({ title, message, isSuccess });
      if (isSuccess) {
        setTimeout(() => {
          navigation.goBack();
        }, 1200);
      }
    } else {
      Alert.alert(title, message, [
        {
          text: 'OK',
          onPress: () => {
            if (isSuccess) navigation.goBack();
          }
        }
      ]);
    }
  };

  // Helper to match category by keywords
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

  // Preset Selection: Pre-populates all fields cleanly without typing
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

  // Instant 1-Tap Publish: Directly adds preset to MongoDB with 1 tap
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
    if (isSubmitting) return;

    if (!name.trim()) {
      showFeedback('Missing Name', 'Please enter a product or dish name.');
      return;
    }

    if (!price || isNaN(numPrice) || numPrice <= 0) {
      showFeedback('Invalid Price', 'Please enter a valid selling price greater than ₹0.');
      return;
    }

    setIsSubmitting(true);
    try {
      const catId = selectedCatId || (categories && categories.length > 0 ? categories[0]._id : null);
      const finalMrp = numMrp && numMrp >= numPrice ? numMrp : Math.round(numPrice * 1.15);

      const res = await addInventoryItem({
        name: name.trim(),
        categoryId: catId,
        category: catId,
        price: numPrice,
        mrp: finalMrp,
        unit: unit.trim() || '1 pc',
        stock: Number(stock || 25),
        description: description.trim(),
        image: imageUrl || QUICK_PRODUCT_PRESETS[0].url,
        isVeg: Boolean(isVeg)
      });

      if (res && res.success !== false) {
        showFeedback('Success! 🎉', `${name.trim()} published live to MongoDB and S-farmart store!`, true);
      } else {
        showFeedback('Error', res?.message || 'Could not save listing. Please try again.');
      }
    } catch (err) {
      console.warn('Listing error:', err);
      showFeedback('Error', 'An unexpected error occurred. Check connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.iconBtnCircle}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={20} color="#0f172a" />
        </TouchableOpacity>
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.headerTitle}>Add Product to Store</Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            {vendor?.storeName || 'Merchant Portal'}
          </Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      {/* Floating Status Message for Web / Mobile */}
      {statusMessage && (
        <View
          style={[
            styles.statusBanner,
            statusMessage.isSuccess ? styles.statusBannerSuccess : styles.statusBannerError
          ]}
        >
          <Ionicons
            name={statusMessage.isSuccess ? 'checkmark-circle' : 'alert-circle'}
            size={20}
            color={statusMessage.isSuccess ? '#15803d' : '#b91c1c'}
          />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text
              style={[
                styles.statusBannerTitle,
                { color: statusMessage.isSuccess ? '#15803d' : '#b91c1c' }
              ]}
            >
              {statusMessage.title}
            </Text>
            <Text
              style={[
                styles.statusBannerSub,
                { color: statusMessage.isSuccess ? '#166534' : '#991b1b' }
              ]}
            >
              {statusMessage.message}
            </Text>
          </View>
          <TouchableOpacity onPress={() => setStatusMessage(null)}>
            <Ionicons name="close" size={18} color="#64748b" />
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="none"
        removeClippedSubviews={false}
        nestedScrollEnabled={true}
        showsVerticalScrollIndicator={false}
      >
        {/* 🌟 1-TAP QUICK ADD CATALOG PRESETS */}
        <View style={styles.quickAddSection}>
          <View style={styles.quickAddHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: 16 }}>⚡</Text>
              <Text style={styles.quickAddTitle}>1-Tap Quick Add with Icon</Text>
            </View>
            <Text style={styles.quickAddSub}>Tap to add immediately or customize below</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            keyboardShouldPersistTaps="always"
            contentContainerStyle={styles.presetScrollContent}
          >
            {QUICK_PRODUCT_PRESETS.map((preset, idx) => {
              const isSelected = selectedPresetIndex === idx;
              const isAddingThis = instantAddingIndex === idx;

              return (
                <View
                  key={idx}
                  style={[
                    styles.presetCard,
                    isSelected && styles.presetCardActive
                  ]}
                >
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => handleSelectPreset(preset, idx)}
                    style={{ flex: 1 }}
                  >
                    <View style={styles.presetImgWrap}>
                      <Image source={{ uri: preset.url }} style={styles.presetImage} />
                      <View style={styles.presetIconBadge}>
                        <Text style={{ fontSize: 16 }}>{preset.icon}</Text>
                      </View>
                      <View style={[styles.vegTinyBadge, { borderColor: preset.isVeg ? '#16a34a' : '#ef4444' }]}>
                        <View style={[styles.vegTinyDot, { backgroundColor: preset.isVeg ? '#16a34a' : '#ef4444' }]} />
                      </View>
                    </View>

                    <View style={styles.presetBody}>
                      <Text style={styles.presetLabel} numberOfLines={1}>
                        {preset.label}
                      </Text>
                      <Text style={styles.presetPrice}>
                        ₹{preset.price}{' '}
                        <Text style={styles.presetUnit}>/{preset.unit}</Text>
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {/* Direct 1-Tap Publish Button */}
                  <TouchableOpacity
                    style={[
                      styles.instantAddBtn,
                      isAddingThis && { opacity: 0.6 }
                    ]}
                    onPress={() => handleInstantAdd(preset, idx)}
                    disabled={isAddingThis}
                    activeOpacity={0.8}
                  >
                    {isAddingThis ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <>
                        <Ionicons name="flash" size={13} color="#ffffff" />
                        <Text style={styles.instantAddBtnText}>1-Tap Add</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>
        </View>

        {/* 📝 DETAILED LISTING FORM */}
        <View style={styles.formCard}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardHeaderTitle}>CUSTOM LISTING DETAILS</Text>
              <Text style={styles.cardHeaderSub}>
                Publishing to store:{' '}
                <Text style={{ fontWeight: '700', color: colors.primaryDark }}>
                  {vendor?.storeName || 'Merchant Store'}
                </Text>
              </Text>
            </View>
            <View style={styles.liveTag}>
              <View style={styles.livePulse} />
              <Text style={styles.liveTagText}>DIRECT SAVE</Text>
            </View>
          </View>

          {/* 1. Product / Dish Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Product / Dish Name *</Text>
            <View style={styles.inputWrap}>
              <Ionicons
                name="pricetag-outline"
                size={18}
                color={colors.primary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="e.g. Special Punjabi Thali, Organic Carrots"
                placeholderTextColor="#94a3b8"
                value={name}
                onChangeText={setName}
                autoCorrect={false}
              />
            </View>
          </View>

          {/* 2. Live Preview Card */}
          <View style={styles.previewBox}>
            <Image source={{ uri: imageUrl }} style={styles.previewImage} />
            <View style={styles.previewInfo}>
              <Text style={styles.previewBadge}>PREVIEW IN USER APP</Text>
              <Text style={styles.previewName} numberOfLines={1}>
                {name || 'Sample Product Name'}
              </Text>
              <Text style={styles.previewPrice}>
                ₹{price || '0'}{' '}
                <Text style={styles.previewUnit}>/ {unit || '1 pc'}</Text>
                {discountPercent > 0 ? ` (${discountPercent}% OFF)` : ''}
              </Text>
            </View>
          </View>

          {/* 3. Veg / Non-Veg Toggle */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Classification</Text>
            <View style={styles.vegToggleRow}>
              <TouchableOpacity
                style={[styles.vegBtn, isVeg && styles.vegBtnActive]}
                onPress={() => setIsVeg(true)}
                activeOpacity={0.8}
              >
                <View style={styles.vegBadgeGreen}>
                  <View style={styles.vegDotGreen} />
                </View>
                <Text style={[styles.vegBtnText, isVeg && styles.vegBtnTextActive]}>
                  100% Pure Veg / Farm Fresh
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.vegBtn, !isVeg && styles.nonVegBtnActive]}
                onPress={() => setIsVeg(false)}
                activeOpacity={0.8}
              >
                <View style={styles.vegBadgeRed}>
                  <View style={styles.vegDotRed} />
                </View>
                <Text style={[styles.vegBtnText, !isVeg && styles.nonVegBtnTextActive]}>
                  Non-Veg
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 4. Select Category */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Select Category</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              keyboardShouldPersistTaps="always"
              contentContainerStyle={styles.catChipRow}
            >
              {categories?.map((cat) => {
                const isSelected = (selectedCatId || categories[0]?._id) === cat._id;
                return (
                  <TouchableOpacity
                    key={cat._id}
                    style={[styles.catChip, isSelected && styles.catChipSelected]}
                    onPress={() => setSelectedCatId(cat._id)}
                    activeOpacity={0.8}
                  >
                    <Text style={{ marginRight: 4 }}>{cat.icon || '🥦'}</Text>
                    <Text
                      style={[
                        styles.catChipText,
                        isSelected && styles.catChipTextSelected
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* 5. Price & MRP Row */}
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.label}>Selling Price (₹) *</Text>
              <View style={styles.inputWrap}>
                <Text style={styles.currencyPrefix}>₹</Text>
                <TextInput
                  style={styles.input}
                  placeholder="120"
                  placeholderTextColor="#94a3b8"
                  keyboardType="numeric"
                  value={price}
                  onChangeText={setPrice}
                />
              </View>
            </View>

            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={styles.label}>MRP (₹)</Text>
                {discountPercent > 0 && (
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountBadgeText}>{discountPercent}% OFF</Text>
                  </View>
                )}
              </View>
              <View style={styles.inputWrap}>
                <Text style={styles.currencyPrefix}>₹</Text>
                <TextInput
                  style={styles.input}
                  placeholder="150"
                  placeholderTextColor="#94a3b8"
                  keyboardType="numeric"
                  value={mrp}
                  onChangeText={setMrp}
                />
              </View>
            </View>
          </View>

          {/* 6. Unit of Measurement */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Unit of Measurement</Text>
            <View style={[styles.inputWrap, { marginBottom: 8 }]}>
              <Ionicons
                name="cube-outline"
                size={18}
                color={colors.primary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                value={unit}
                onChangeText={setUnit}
                placeholder="e.g. 1 kg, 500 g, 1 plate"
                placeholderTextColor="#94a3b8"
              />
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              keyboardShouldPersistTaps="always"
              contentContainerStyle={styles.quickChipRow}
            >
              {UNIT_PRESETS.map((u, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.quickChip, unit === u && styles.quickChipActive]}
                  onPress={() => setUnit(u)}
                >
                  <Text style={[styles.quickChipText, unit === u && styles.quickChipTextActive]}>
                    {u}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* 7. Available Stock */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Available Stock (Units)</Text>
            <View style={[styles.inputWrap, { marginBottom: 8 }]}>
              <Ionicons
                name="layers-outline"
                size={18}
                color={colors.primary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="25"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
                value={stock}
                onChangeText={setStock}
              />
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              keyboardShouldPersistTaps="always"
              contentContainerStyle={styles.quickChipRow}
            >
              {STOCK_PRESETS.map((s, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.quickChip, stock === s && styles.quickChipActive]}
                  onPress={() => setStock(s)}
                >
                  <Text style={[styles.quickChipText, stock === s && styles.quickChipTextActive]}>
                    {s} units
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* 8. Custom Image Toggle */}
          <View style={styles.inputGroup}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.label}>Product Image URL</Text>
              <TouchableOpacity
                onPress={() => setShowCustomImage(!showCustomImage)}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Text style={styles.toggleCustomText}>
                  {showCustomImage ? 'Hide Custom URL' : 'Custom Image Link +'}
                </Text>
              </TouchableOpacity>
            </View>

            {showCustomImage && (
              <View style={[styles.inputWrap, { marginTop: 6 }]}>
                <Ionicons
                  name="image-outline"
                  size={18}
                  color={colors.primary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Paste image link (https://...)"
                  placeholderTextColor="#94a3b8"
                  value={imageUrl}
                  onChangeText={setImageUrl}
                  autoCapitalize="none"
                />
              </View>
            )}
          </View>

          {/* 9. Product Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Product Description / Highlights</Text>
            <View style={[styles.inputWrap, { height: 75, alignItems: 'flex-start', paddingTop: 10 }]}>
              <TextInput
                style={[styles.input, { height: 55 }]}
                placeholder="Freshness details, organic origin, or serving style..."
                placeholderTextColor="#94a3b8"
                multiline
                value={description}
                onChangeText={setDescription}
              />
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={0.85}
          >
            {isSubmitting ? (
              <>
                <ActivityIndicator size="small" color="#ffffff" />
                <Text style={styles.submitBtnText}>Publishing to MongoDB...</Text>
              </>
            ) : (
              <>
                <Ionicons name="cloud-upload" size={20} color="#ffffff" />
                <Text style={styles.submitBtnText}>Publish Listing to Store</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export const InventoryScreen = ({ navigation }) => {
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

    setReplenishingId(stockModalItem.id || stockModalItem._id || stockModalItem.productId);
    try {
      // Calculate diff or set stock directly
      const current = stockModalItem.stock ?? stockModalItem.stockQty ?? 0;
      const diff = qty - current;
      await addStockToItem(
        stockModalItem.id || stockModalItem._id || stockModalItem.productId,
        diff
      );
      setStockModalItem(null);
    } finally {
      setReplenishingId(null);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Store Catalog ({inventory.length})</Text>
          <Text style={styles.headerSubtitle}>{vendor?.storeName || 'Merchant Store'}</Text>
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
      <View style={styles.filterTabBar}>
        <TouchableOpacity
          style={[styles.filterTab, activeTab === 'ALL' && styles.filterTabActive]}
          onPress={() => setActiveTab('ALL')}
        >
          <Text style={[styles.filterTabText, activeTab === 'ALL' && styles.filterTabTextActive]}>
            All ({inventory.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, activeTab === 'IN_STOCK' && styles.filterTabActive]}
          onPress={() => setActiveTab('IN_STOCK')}
        >
          <Text
            style={[
              styles.filterTabText,
              activeTab === 'IN_STOCK' && styles.filterTabTextActive
            ]}
          >
            In Stock ({inventory.filter((i) => i.isAvailable && (i.stock ?? i.stockQty) > 0).length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, activeTab === 'OUT_OF_STOCK' && styles.filterTabActive]}
          onPress={() => setActiveTab('OUT_OF_STOCK')}
        >
          <Text
            style={[
              styles.filterTabText,
              activeTab === 'OUT_OF_STOCK' && styles.filterTabTextActive
            ]}
          >
            Out / Low ({inventory.filter((i) => !i.isAvailable || (i.stock ?? i.stockQty) <= 0).length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {filteredItems.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="bag-remove-outline" size={44} color="#94a3b8" />
            <Text style={styles.emptyTitle}>No Products Found</Text>
            <Text style={styles.emptySub}>
              Tap "Add Listing" to publish produce or dishes to your catalog.
            </Text>
            <TouchableOpacity
              style={styles.emptyAddBtn}
              onPress={() => navigation.navigate('AddProduct')}
            >
              <Ionicons name="add-circle-outline" size={18} color="#ffffff" />
              <Text style={styles.emptyAddBtnText}>Add First Product</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredItems.map((item) => {
            const currentStock = item.stock ?? item.stockQty ?? 0;
            const isZeroStock = currentStock <= 0;
            const itemId = item.id || item.productId || item._id;
            const isBusy = replenishingId === itemId;

            return (
              <View key={itemId} style={styles.itemCard}>
                <Image
                  source={{
                    uri:
                      item.image ||
                      'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=200&auto=format&fit=crop&q=60'
                  }}
                  style={styles.itemImage}
                />

                <View style={{ flex: 1, paddingHorizontal: 12 }}>
                  <Text style={styles.itemTitle} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.itemCategory}>
                    {item.category} •{' '}
                    <Text style={{ color: '#16a34a', fontWeight: '700' }}>₹{item.price}</Text> /{' '}
                    {item.unit}
                  </Text>

                  {/* Stock Display & Quick Add Chips */}
                  <View style={{ marginTop: 4 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={styles.itemStock}>
                        Stock:{' '}
                        <Text
                          style={{
                            fontWeight: '800',
                            color: isZeroStock ? '#ef4444' : '#0f172a'
                          }}
                        >
                          {currentStock} units
                        </Text>
                      </Text>
                      {isZeroStock && (
                        <View style={styles.soldOutPill}>
                          <Text style={styles.soldOutPillText}>SOLD OUT</Text>
                        </View>
                      )}
                    </View>

                    {/* ➕ Quick Add Stock Chips */}
                    <View style={styles.stockActionRow}>
                      <TouchableOpacity
                        style={[styles.addStockMiniBtn, isBusy && { opacity: 0.5 }]}
                        onPress={() => handleQuickAdd(itemId, 10)}
                        disabled={isBusy}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.addStockMiniText}>+10</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.addStockMiniBtn, isBusy && { opacity: 0.5 }]}
                        onPress={() => handleQuickAdd(itemId, 25)}
                        disabled={isBusy}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.addStockMiniText}>+25</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.editStockMiniBtn, isBusy && { opacity: 0.5 }]}
                        onPress={() => {
                          setStockModalItem(item);
                          setStockInputVal(String(currentStock));
                        }}
                        disabled={isBusy}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="create-outline" size={12} color="#15803d" />
                        <Text style={styles.editStockMiniText}>Set Stock</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* Right side Toggle Switch & Delete */}
                <View style={styles.toggleSection}>
                  <Text
                    style={[
                      styles.toggleText,
                      { color: item.isAvailable && !isZeroStock ? '#15803d' : '#94a3b8' }
                    ]}
                  >
                    {item.isAvailable && !isZeroStock ? 'IN STOCK' : 'OUT'}
                  </Text>
                  <Switch
                    value={item.isAvailable && !isZeroStock}
                    onValueChange={() => toggleItemAvailability(itemId)}
                    trackColor={{ false: '#cbd5e1', true: '#bbf7d0' }}
                    thumbColor={item.isAvailable && !isZeroStock ? '#16a34a' : '#94a3b8'}
                  />

                  {deleteInventoryItem && (
                    <TouchableOpacity
                      onPress={() => deleteInventoryItem(itemId)}
                      style={styles.deleteBtn}
                      activeOpacity={0.7}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons name="trash-outline" size={16} color="#ef4444" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Stock Replenish Modal */}
      {stockModalItem && (
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>Update Product Stock</Text>
                <Text style={styles.modalSub} numberOfLines={1}>
                  {stockModalItem.name}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setStockModalItem(null)}>
                <Ionicons name="close" size={22} color="#64748b" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>Current Stock in MongoDB:</Text>
            <View style={styles.modalInputWrap}>
              <Ionicons name="layers-outline" size={20} color={colors.primary} style={{ marginRight: 8 }} />
              <TextInput
                style={styles.modalInput}
                keyboardType="numeric"
                value={stockInputVal}
                onChangeText={setStockInputVal}
                autoFocus
              />
              <Text style={styles.modalInputUnit}>units</Text>
            </View>

            {/* Quick Increment Buttons */}
            <Text style={[styles.modalLabel, { marginTop: 12 }]}>Or Add More Quantity:</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 6, marginBottom: 16 }}>
              {[10, 25, 50, 100].map((amt) => (
                <TouchableOpacity
                  key={amt}
                  style={styles.modalQuickChip}
                  onPress={() => {
                    const cur = parseInt(stockInputVal, 10) || 0;
                    setStockInputVal(String(cur + amt));
                  }}
                >
                  <Text style={styles.modalQuickChipText}>+{amt}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.modalSaveBtn}
              onPress={handleSaveModalStock}
              disabled={replenishingId !== null}
            >
              <Ionicons name="checkmark-circle-outline" size={18} color="#ffffff" />
              <Text style={styles.modalSaveBtnText}>
                {replenishingId ? 'Saving in MongoDB...' : 'Save Stock Quantity'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

export const SettlementsScreen = () => {
  const { stats } = usePartner();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.header}>
        <Text style={styles.headerTitleLarge}>Wednesdays Settlements</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.wedCard}>
          <View style={styles.wedIconBox}>
            <Ionicons name="calendar-outline" size={30} color="#16a34a" />
          </View>
          <View style={{ flex: 1, paddingLeft: 14 }}>
            <Text style={styles.wedTitle}>Upcoming Wednesday Payout</Text>
            <Text style={styles.wedAmount}>
              ₹{stats.todaySales ? stats.todaySales + 1250 : 1850}
            </Text>
            <View style={styles.bankTag}>
              <Ionicons name="checkmark-circle" size={13} color="#15803d" />
              <Text style={styles.bankTagText}>Direct Transfer to SBI A/c (*4321)</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Previous Weekly Payouts</Text>
        {[
          { date: 'Wednesday, Sep 10, 2026', total: 4280, status: 'PAID TO BANK', ref: 'FARM-PAY-88231' },
          { date: 'Wednesday, Sep 03, 2026', total: 3950, status: 'PAID TO BANK', ref: 'FARM-PAY-87109' },
          { date: 'Wednesday, Aug 27, 2026', total: 5120, status: 'PAID TO BANK', ref: 'FARM-PAY-86043' }
        ].map((item, idx) => (
          <View key={idx} style={styles.settleCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="arrow-down-circle" size={20} color="#16a34a" />
                <Text style={styles.settleDate}>{item.date}</Text>
              </View>
              <Text style={styles.settleTotal}>+₹{item.total}</Text>
            </View>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: 10,
                alignItems: 'center'
              }}
            >
              <View style={styles.settleStatusBadge}>
                <Text style={styles.settleStatusText}>{item.status}</Text>
              </View>
              <Text style={styles.settleRef}>Ref: {item.ref}</Text>
            </View>
          </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    ...Platform.select({
      ios: {
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6
      },
      android: { elevation: 3 }
    })
  },
  iconBtnCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerTitle: {
    fontSize: 16.5,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center'
  },
  headerSubtitle: {
    fontSize: 11.5,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 1
  },
  headerTitleLarge: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a'
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1
  },
  statusBannerSuccess: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0'
  },
  statusBannerError: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca'
  },
  statusBannerTitle: {
    fontSize: 13,
    fontWeight: '700'
  },
  statusBannerSub: {
    fontSize: 12,
    marginTop: 1
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    maxWidth: 580,
    width: '100%',
    alignSelf: 'center'
  },
  quickAddSection: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: 'rgba(15, 23, 42, 0.05)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 3
  },
  quickAddHeader: {
    marginBottom: 12
  },
  quickAddTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a'
  },
  quickAddSub: {
    fontSize: 11.5,
    color: '#64748b',
    marginTop: 2
  },
  presetScrollContent: {
    gap: 12,
    paddingVertical: 4,
    paddingRight: 10
  },
  presetCard: {
    width: 140,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    overflow: 'hidden',
    justifyContent: 'space-between',
    paddingBottom: 8
  },
  presetCardActive: {
    borderColor: '#16a34a',
    backgroundColor: '#f0fdf4',
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3
  },
  presetImgWrap: {
    width: '100%',
    height: 85,
    position: 'relative'
  },
  presetImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover'
  },
  presetIconBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2
  },
  vegTinyBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 16,
    height: 16,
    backgroundColor: '#ffffff',
    borderRadius: 3,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center'
  },
  vegTinyDot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  presetBody: {
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 6
  },
  presetLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1e293b'
  },
  presetPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: '#16a34a',
    marginTop: 2
  },
  presetUnit: {
    fontSize: 10,
    fontWeight: '500',
    color: '#64748b'
  },
  instantAddBtn: {
    marginHorizontal: 8,
    marginTop: 4,
    backgroundColor: '#16a34a',
    borderRadius: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4
  },
  instantAddBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800'
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: 'rgba(15, 23, 42, 0.06)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 18,
    elevation: 4
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9'
  },
  cardHeaderTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.8
  },
  cardHeaderSub: {
    fontSize: 12.5,
    color: '#64748b',
    marginTop: 3,
    lineHeight: 16
  },
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    gap: 5
  },
  livePulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16a34a'
  },
  liveTagText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#15803d'
  },
  inputGroup: {
    marginBottom: 14
  },
  label: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 48
  },
  inputWrapFocused: {
    borderColor: colors.primary,
    backgroundColor: '#ffffff',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2
  },
  inputIcon: {
    marginRight: 8
  },
  currencyPrefix: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    marginRight: 6
  },
  input: {
    flex: 1,
    fontSize: 14.5,
    color: '#0f172a',
    fontWeight: '500'
  },
  vegToggleRow: {
    flexDirection: 'row',
    gap: 10
  },
  vegBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    gap: 8
  },
  vegBtnActive: {
    borderColor: '#16a34a',
    backgroundColor: '#f0fdf4'
  },
  nonVegBtnActive: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2'
  },
  vegBadgeGreen: {
    width: 16,
    height: 16,
    borderWidth: 1.5,
    borderColor: '#16a34a',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 3
  },
  vegDotGreen: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16a34a'
  },
  vegBadgeRed: {
    width: 16,
    height: 16,
    borderWidth: 1.5,
    borderColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 3
  },
  vegDotRed: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444'
  },
  vegBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b'
  },
  vegBtnTextActive: {
    color: '#15803d',
    fontWeight: '700'
  },
  nonVegBtnTextActive: {
    color: '#b91c1c',
    fontWeight: '700'
  },
  catChipRow: {
    gap: 8,
    paddingVertical: 2
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  catChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  catChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569'
  },
  catChipTextSelected: {
    color: '#ffffff',
    fontWeight: '700'
  },
  toggleCustomText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.primary
  },
  imagePresetRow: {
    gap: 8,
    paddingVertical: 4
  },
  imagePresetCard: {
    width: 90,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    overflow: 'hidden',
    position: 'relative'
  },
  imagePresetCardSelected: {
    borderColor: colors.primary,
    backgroundColor: '#f0fdf4'
  },
  imagePresetThumb: {
    width: '100%',
    height: 55,
    resizeMode: 'cover'
  },
  imagePresetMeta: {
    paddingVertical: 4,
    paddingHorizontal: 4,
    alignItems: 'center'
  },
  imagePresetLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#334155'
  },
  presetCheckmark: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#ffffff',
    borderRadius: 8
  },
  previewBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  previewImage: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: '#e2e8f0'
  },
  previewInfo: {
    flex: 1,
    marginLeft: 12
  },
  previewBadge: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.primaryDark,
    letterSpacing: 0.5
  },
  previewName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 2
  },
  previewPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: '#16a34a',
    marginTop: 2
  },
  previewUnit: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748b'
  },
  row: {
    flexDirection: 'row',
    marginBottom: 12
  },
  discountBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6
  },
  discountBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803d'
  },
  quickChipRow: {
    gap: 6,
    paddingVertical: 2
  },
  quickChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  quickChipActive: {
    backgroundColor: '#dcfce7',
    borderColor: '#16a34a'
  },
  quickChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569'
  },
  quickChipTextActive: {
    color: '#15803d',
    fontWeight: '700'
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 16,
    height: 52,
    marginTop: 8,
    gap: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5
  },
  submitBtnDisabled: {
    opacity: 0.7
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 15.5,
    fontWeight: '700'
  },
  addNavBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    gap: 4
  },
  addNavBtnText: {
    color: '#ffffff',
    fontSize: 12.5,
    fontWeight: '700'
  },
  filterTabBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    gap: 8
  },
  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#f1f5f9'
  },
  filterTabActive: {
    backgroundColor: '#dcfce7'
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b'
  },
  filterTabTextActive: {
    color: '#15803d',
    fontWeight: '700'
  },
  emptyBox: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginTop: 20
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 12
  },
  emptySub: {
    fontSize: 12.5,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 280
  },
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 14,
    marginTop: 16,
    gap: 6
  },
  emptyAddBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700'
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: 'rgba(15, 23, 42, 0.03)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2
  },
  itemImage: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#f1f5f9'
  },
  itemTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0f172a'
  },
  itemCategory: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
    fontWeight: '500'
  },
  itemStock: {
    fontSize: 11.5,
    color: '#94a3b8',
    marginTop: 1
  },
  soldOutPill: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6
  },
  soldOutPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#b91c1c'
  },
  stockActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6
  },
  addStockMiniBtn: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8
  },
  addStockMiniText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803d'
  },
  editStockMiniBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 3
  },
  editStockMiniText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155'
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 999
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 380,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a'
  },
  modalSub: {
    fontSize: 12.5,
    color: '#64748b',
    marginTop: 2
  },
  modalLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6
  },
  modalInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48
  },
  modalInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a'
  },
  modalInputUnit: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600'
  },
  modalQuickChip: {
    flex: 1,
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center'
  },
  modalQuickChipText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#15803d'
  },
  modalSaveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 14,
    height: 48,
    gap: 6
  },
  modalSaveBtnText: {
    color: '#ffffff',
    fontSize: 14.5,
    fontWeight: '700'
  },
  toggleSection: {
    alignItems: 'center',
    gap: 3
  },
  toggleText: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  deleteBtn: {
    padding: 4,
    marginTop: 2
  },
  wedCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 18,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4
  },
  wedIconBox: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#bbf7d0'
  },
  wedTitle: {
    fontSize: 12.5,
    fontWeight: '500',
    color: '#64748b'
  },
  wedAmount: {
    fontSize: 28,
    fontWeight: '800',
    color: '#15803d',
    marginTop: 2
  },
  bankTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4
  },
  bankTagText: {
    fontSize: 11,
    color: '#15803d',
    fontWeight: '600'
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12
  },
  settleCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  settleDate: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#0f172a'
  },
  settleTotal: {
    fontSize: 15,
    fontWeight: '700',
    color: '#15803d'
  },
  settleStatusBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6
  },
  settleStatusText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#15803d'
  },
  settleRef: {
    fontSize: 11.5,
    color: '#64748b',
    fontWeight: '500'
  }
});
