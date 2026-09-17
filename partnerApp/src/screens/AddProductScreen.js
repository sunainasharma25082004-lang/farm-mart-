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

// High-resolution presets for merchants
const IMAGE_PRESETS = [
  {
    label: 'Veg Thali',
    icon: '🍛',
    url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80'
  },
  {
    label: 'Green Veggies',
    icon: '🥦',
    url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80'
  },
  {
    label: 'Potatoes',
    icon: '🥔',
    url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop&q=80'
  },
  {
    label: 'Fresh Apples',
    icon: '🍎',
    url: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600&auto=format&fit=crop&q=80'
  },
  {
    label: 'Hot Parathas',
    icon: '🫓',
    url: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=600&auto=format&fit=crop&q=80'
  },
  {
    label: 'Desi Sweets',
    icon: '🍯',
    url: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80'
  },
  {
    label: 'Pure Dairy',
    icon: '🥛',
    url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop&q=80'
  },
  {
    label: 'Fresh Juice',
    icon: '🧃',
    url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80'
  }
];

const UNIT_PRESETS = ['1 kg', '500 g', '250 g', '1 pc', '1 plate', '1 packet', '1 litre', '1 dozen'];
const STOCK_PRESETS = ['10', '25', '50', '100', '200'];

export const AddProductScreen = ({ navigation }) => {
  const { addInventoryItem, categories, vendor } = usePartner();

  const [name, setName] = useState('');
  const [selectedCatId, setSelectedCatId] = useState(
    categories && categories.length > 0 ? categories[0]._id : ''
  );
  const [price, setPrice] = useState('');
  const [mrp, setMrp] = useState('');
  const [unit, setUnit] = useState('1 pc');
  const [stock, setStock] = useState('25');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState(IMAGE_PRESETS[0].url);
  const [isVeg, setIsVeg] = useState(true);
  const [focusedInput, setFocusedInput] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
        image: imageUrl || IMAGE_PRESETS[0].url,
        isVeg: Boolean(isVeg)
      });

      if (res && res.success !== false) {
        showFeedback('Success! 🎉', `${name.trim()} published live to MongoDB and Farmart store!`, true);
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
          <Text style={styles.headerTitle}>Add New Listing</Text>
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

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formCard}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.cardHeaderTitle}>PUBLISH DIRECT TO MONGODB</Text>
                <Text style={styles.cardHeaderSub}>
                  Selling under:{' '}
                  <Text style={{ fontWeight: '700', color: colors.primaryDark }}>
                    {vendor?.storeName}
                  </Text>
                </Text>
              </View>
              <View style={styles.liveTag}>
                <View style={styles.livePulse} />
                <Text style={styles.liveTagText}>STORE ONLINE</Text>
              </View>
            </View>

            {/* Product / Dish Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Product / Dish Name *</Text>
              <View
                style={[
                  styles.inputWrap,
                  focusedInput === 'name' && styles.inputWrapFocused
                ]}
              >
                <Ionicons
                  name="pricetag-outline"
                  size={18}
                  color={focusedInput === 'name' ? colors.primary : '#94a3b8'}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Special Punjabi Thali, Organic Carrots"
                  placeholderTextColor="#94a3b8"
                  value={name}
                  onChangeText={setName}
                  onFocus={() => setFocusedInput('name')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>
            </View>

            {/* Veg / Non-Veg Indicator Toggle */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Food Classification</Text>
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
                    100% Pure Veg / Farm Produce
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

            {/* Select Category */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Select Category</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
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

            {/* Image Selector & Presets */}
            <View style={styles.inputGroup}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={styles.label}>Product Image</Text>
                <TouchableOpacity
                  onPress={() => setShowCustomImage(!showCustomImage)}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                >
                  <Text style={styles.toggleCustomText}>
                    {showCustomImage ? '← Use Quick Presets' : 'Custom Image URL +'}
                  </Text>
                </TouchableOpacity>
              </View>

              {!showCustomImage ? (
                <View>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={styles.imagePresetRow}
                  >
                    {IMAGE_PRESETS.map((preset, idx) => {
                      const isSelected = imageUrl === preset.url;
                      return (
                        <TouchableOpacity
                          key={idx}
                          style={[
                            styles.imagePresetCard,
                            isSelected && styles.imagePresetCardSelected
                          ]}
                          onPress={() => setImageUrl(preset.url)}
                          activeOpacity={0.8}
                        >
                          <Image source={{ uri: preset.url }} style={styles.imagePresetThumb} />
                          <View style={styles.imagePresetMeta}>
                            <Text style={styles.imagePresetLabel}>
                              {preset.icon} {preset.label}
                            </Text>
                          </View>
                          {isSelected && (
                            <View style={styles.presetCheckmark}>
                              <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              ) : (
                <View
                  style={[
                    styles.inputWrap,
                    focusedInput === 'img' && styles.inputWrapFocused
                  ]}
                >
                  <Ionicons
                    name="image-outline"
                    size={18}
                    color={focusedInput === 'img' ? colors.primary : '#94a3b8'}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Paste direct image link (https://...)"
                    placeholderTextColor="#94a3b8"
                    value={imageUrl}
                    onChangeText={setImageUrl}
                    onFocus={() => setFocusedInput('img')}
                    onBlur={() => setFocusedInput(null)}
                    autoCapitalize="none"
                  />
                </View>
              )}

              {/* Live Preview Card */}
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
                  </Text>
                </View>
              </View>
            </View>

            {/* Price & MRP Row */}
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.label}>Selling Price (₹) *</Text>
                <View
                  style={[
                    styles.inputWrap,
                    focusedInput === 'price' && styles.inputWrapFocused
                  ]}
                >
                  <Text style={styles.currencyPrefix}>₹</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="120"
                    placeholderTextColor="#94a3b8"
                    keyboardType="numeric"
                    value={price}
                    onChangeText={setPrice}
                    onFocus={() => setFocusedInput('price')}
                    onBlur={() => setFocusedInput(null)}
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
                <View
                  style={[
                    styles.inputWrap,
                    focusedInput === 'mrp' && styles.inputWrapFocused
                  ]}
                >
                  <Text style={styles.currencyPrefix}>₹</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="150"
                    placeholderTextColor="#94a3b8"
                    keyboardType="numeric"
                    value={mrp}
                    onChangeText={setMrp}
                    onFocus={() => setFocusedInput('mrp')}
                    onBlur={() => setFocusedInput(null)}
                  />
                </View>
              </View>
            </View>

            {/* Unit Row & Quick Chips */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Unit of Measurement</Text>
              <View
                style={[
                  styles.inputWrap,
                  focusedInput === 'unit' && styles.inputWrapFocused,
                  { marginBottom: 8 }
                ]}
              >
                <Ionicons
                  name="cube-outline"
                  size={18}
                  color={focusedInput === 'unit' ? colors.primary : '#94a3b8'}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={unit}
                  onChangeText={setUnit}
                  placeholder="e.g. 1 kg, 500 g, 1 plate"
                  placeholderTextColor="#94a3b8"
                  onFocus={() => setFocusedInput('unit')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
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

            {/* Available Stock & Quick Chips */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Available Stock (Units)</Text>
              <View
                style={[
                  styles.inputWrap,
                  focusedInput === 'stock' && styles.inputWrapFocused,
                  { marginBottom: 8 }
                ]}
              >
                <Ionicons
                  name="layers-outline"
                  size={18}
                  color={focusedInput === 'stock' ? colors.primary : '#94a3b8'}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="25"
                  placeholderTextColor="#94a3b8"
                  keyboardType="numeric"
                  value={stock}
                  onChangeText={setStock}
                  onFocus={() => setFocusedInput('stock')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
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

            {/* Product Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Product Description / Highlights</Text>
              <View
                style={[
                  styles.inputWrap,
                  { height: 80, alignItems: 'flex-start', paddingTop: 10 },
                  focusedInput === 'desc' && styles.inputWrapFocused
                ]}
              >
                <TextInput
                  style={[styles.input, { height: 60 }]}
                  placeholder="Organic freshness, ingredients, cooking style, or serving details..."
                  placeholderTextColor="#94a3b8"
                  multiline
                  value={description}
                  onChangeText={setDescription}
                  onFocus={() => setFocusedInput('desc')}
                  onBlur={() => setFocusedInput(null)}
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
                  <Ionicons name="cloud-upload-outline" size={20} color="#ffffff" />
                  <Text style={styles.submitBtnText}>Publish Listing to Store</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export const InventoryScreen = ({ navigation }) => {
  const { inventory, toggleItemAvailability, deleteInventoryItem, vendor } = usePartner();
  const [activeTab, setActiveTab] = useState('ALL');

  const filteredItems = inventory.filter((item) => {
    if (activeTab === 'IN_STOCK') return item.isAvailable;
    if (activeTab === 'OUT_OF_STOCK') return !item.isAvailable;
    return true;
  });

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
            In Stock ({inventory.filter((i) => i.isAvailable).length})
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
            Out ({inventory.filter((i) => !i.isAvailable).length})
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
          filteredItems.map((item) => (
            <View key={item.id || item.productId || item._id} style={styles.itemCard}>
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
                <Text style={styles.itemStock}>
                  Stock: <Text style={{ fontWeight: '700', color: '#0f172a' }}>{item.stock ?? item.stockQty}</Text>{' '}
                  units
                </Text>
              </View>

              <View style={styles.toggleSection}>
                <Text
                  style={[
                    styles.toggleText,
                    { color: item.isAvailable ? '#15803d' : '#94a3b8' }
                  ]}
                >
                  {item.isAvailable ? 'IN STOCK' : 'OUT'}
                </Text>
                <Switch
                  value={item.isAvailable}
                  onValueChange={() => toggleItemAvailability(item.id || item._id || item.productId)}
                  trackColor={{ false: '#cbd5e1', true: '#bbf7d0' }}
                  thumbColor={item.isAvailable ? '#16a34a' : '#94a3b8'}
                />

                {deleteInventoryItem && (
                  <TouchableOpacity
                    onPress={() => deleteInventoryItem(item.id || item._id || item.productId)}
                    style={styles.deleteBtn}
                    activeOpacity={0.7}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="trash-outline" size={16} color="#ef4444" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>
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
