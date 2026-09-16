import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
  Platform,
  StatusBar,
  KeyboardAvoidingView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePartner } from '../context/PartnerContext';
import { colors } from '../theme/colors';

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
  const [focusedInput, setFocusedInput] = useState(null);

  const handleSubmit = async () => {
    if (!name || !price) {
      alert('Please provide product name and price.');
      return;
    }

    const catId = selectedCatId || (categories && categories.length > 0 ? categories[0]._id : null);

    await addInventoryItem({
      name,
      categoryId: catId,
      category: catId,
      price: Number(price),
      mrp: mrp ? Number(mrp) : Number(price) * 1.2,
      unit,
      stock: Number(stock || 25),
      description,
      isVeg: true
    });

    alert(`${name} is now published live on Farmart!`);
    navigation.goBack();
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
        >
          <Ionicons name="arrow-back" size={20} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Listing</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.formCard}>
          <Text style={styles.cardHeaderTitle}>PUBLISH ITEM TO CUSTOMER APP</Text>
          <Text style={styles.cardHeaderSub}>
            Selling under: <Text style={{ fontWeight: '700', color: colors.primaryDark }}>{vendor?.storeName}</Text>
          </Text>

          {/* Product Name */}
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
                placeholder="e.g. Special Punjabi Thali, Farm Fresh Apples"
                placeholderTextColor="#94a3b8"
                value={name}
                onChangeText={setName}
                onFocus={() => setFocusedInput('name')}
                onBlur={() => setFocusedInput(null)}
              />
            </View>
          </View>

          {/* Category Chips Selector */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Select Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catChipRow}>
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
                    <Text style={[styles.catChipText, isSelected && styles.catChipTextSelected]}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
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
              <Text style={styles.label}>MRP (₹)</Text>
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

          {/* Unit & Stock Row */}
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.label}>Unit (kg, 1 pc, 250g)</Text>
              <View
                style={[
                  styles.inputWrap,
                  focusedInput === 'unit' && styles.inputWrapFocused
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
                  placeholderTextColor="#94a3b8"
                  onFocus={() => setFocusedInput('unit')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Available Stock</Text>
              <View
                style={[
                  styles.inputWrap,
                  focusedInput === 'stock' && styles.inputWrapFocused
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
            </View>
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Product Description</Text>
            <View
              style={[
                styles.inputWrap,
                { height: 75, alignItems: 'flex-start', paddingTop: 10 },
                focusedInput === 'desc' && styles.inputWrapFocused
              ]}
            >
              <TextInput
                style={[styles.input, { height: 60 }]}
                placeholder="Key ingredients, organic freshness, or serving details..."
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
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} activeOpacity={0.85}>
            <Ionicons name="cloud-upload-outline" size={20} color="#ffffff" />
            <Text style={styles.submitBtnText}>Publish Listing to Store</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export const InventoryScreen = ({ navigation }) => {
  const { inventory, toggleItemAvailability, deleteInventoryItem, vendor } = usePartner();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Store Catalog ({inventory.length})</Text>
          <Text style={{ fontSize: 12, color: '#64748b' }}>{vendor?.storeName}</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('AddProduct')}
          style={styles.addNavBtn}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={18} color="#ffffff" />
          <Text style={styles.addNavBtnText}>Add Item</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {inventory.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="bag-remove-outline" size={44} color="#94a3b8" />
            <Text style={styles.emptyTitle}>No Products Found</Text>
            <Text style={styles.emptySub}>Tap "Add Item" at top right to start selling produce.</Text>
          </View>
        ) : (
          inventory.map((item) => (
            <View key={item.id || item.productId} style={styles.itemCard}>
              <View style={styles.itemBadgeIcon}>
                <Ionicons name="leaf-outline" size={20} color={colors.primary} />
              </View>

              <View style={{ flex: 1, paddingHorizontal: 12 }}>
                <Text style={styles.itemTitle}>{item.name}</Text>
                <Text style={styles.itemCategory}>
                  {item.category} • <Text style={{ color: '#16a34a', fontWeight: '700' }}>₹{item.price}</Text> / {item.unit}
                </Text>
                <Text style={styles.itemStock}>
                  Stock: <Text style={{ fontWeight: '700', color: '#0f172a' }}>{item.stock ?? item.stockQty}</Text> units
                </Text>
              </View>

              <View style={styles.toggleSection}>
                <Text style={[styles.toggleText, { color: item.isAvailable ? '#15803d' : '#94a3b8' }]}>
                  {item.isAvailable ? 'IN STOCK' : 'OUT'}
                </Text>
                <Switch
                  value={item.isAvailable}
                  onValueChange={() => toggleItemAvailability(item.id)}
                  trackColor={{ false: '#cbd5e1', true: '#bbf7d0' }}
                  thumbColor={item.isAvailable ? '#16a34a' : '#94a3b8'}
                />

                {deleteInventoryItem && (
                  <TouchableOpacity
                    onPress={() => deleteInventoryItem(item.id)}
                    style={styles.deleteBtn}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="trash-outline" size={15} color="#ef4444" />
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
  const { vendor, stats } = usePartner();

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
            <Text style={styles.wedAmount}>₹{stats.todaySales ? stats.todaySales + 1250 : 1850}</Text>
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

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, alignItems: 'center' }}>
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
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    ...Platform.select({
      ios: { shadowColor: '#0f172a', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6 },
      android: { elevation: 3 }
    })
  },
  iconBtnCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a'
  },
  headerTitleLarge: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a'
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: 'rgba(15, 23, 42, 0.08)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 6
  },
  cardHeaderTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 1
  },
  cardHeaderSub: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
    marginBottom: 16,
    lineHeight: 18
  },
  inputGroup: {
    marginBottom: 14
  },
  label: {
    fontSize: 13,
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
    paddingHorizontal: 14,
    height: 52
  },
  inputWrapFocused: {
    borderColor: colors.primary,
    backgroundColor: '#ffffff',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2
  },
  inputIcon: {
    marginRight: 10
  },
  currencyPrefix: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    marginRight: 8
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#0f172a',
    fontWeight: '500'
  },
  catChipRow: {
    gap: 8,
    paddingVertical: 4
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  catChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  catChipText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#475569'
  },
  catChipTextSelected: {
    color: '#ffffff',
    fontWeight: '700'
  },
  row: {
    flexDirection: 'row',
    marginBottom: 14
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 16,
    height: 54,
    marginTop: 10,
    gap: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700'
  },
  addNavBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    gap: 4
  },
  addNavBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600'
  },
  emptyBox: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 36,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 12
  },
  emptySub: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 4
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: 'rgba(15, 23, 42, 0.04)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 3
  },
  itemBadgeIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bbf7d0'
  },
  itemTitle: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#0f172a'
  },
  itemCategory: {
    fontSize: 12.5,
    color: '#64748b',
    marginTop: 3,
    fontWeight: '500'
  },
  itemStock: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2
  },
  toggleSection: {
    alignItems: 'center',
    gap: 4
  },
  toggleText: {
    fontSize: 10,
    fontWeight: '700',
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
    padding: 20,
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
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#bbf7d0'
  },
  wedTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748b'
  },
  wedAmount: {
    fontSize: 30,
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
    fontSize: 11.5,
    color: '#15803d',
    fontWeight: '600'
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 14
  },
  settleCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  settleDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a'
  },
  settleTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#15803d'
  },
  settleStatusBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 8
  },
  settleStatusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803d'
  },
  settleRef: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500'
  }
});
