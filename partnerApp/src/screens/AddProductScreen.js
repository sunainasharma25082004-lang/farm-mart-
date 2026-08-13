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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePartner } from '../context/PartnerContext';
import { colors } from '../theme/colors';

const CATEGORIES = ['Home Restro', 'Organic Farm', 'Bakery & Sweets', 'Dairy', 'Village Hub Goods'];

export const AddProductScreen = ({ navigation }) => {
  const { addInventoryItem } = usePartner();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Home Restro');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('thali');
  const [stock, setStock] = useState('20');
  const [focusedInput, setFocusedInput] = useState(null);

  const handleSubmit = () => {
    if (!name || !price || !stock) {
      Alert.alert('Incomplete Form', 'Please provide product name, price, and stock quantity.');
      return;
    }
    addInventoryItem({
      name,
      category,
      price: Number(price),
      unit,
      stock: Number(stock),
    });
    Alert.alert('Product Listed! 🎉', `${name} is now live and visible to nearby customers!`, [
      { text: 'View Products', onPress: () => navigation.goBack() },
    ]);
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

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.formCard}>
          <Text style={styles.cardHeaderTitle}>PUBLISH ITEM TO CUSTOMER APP</Text>
          <Text style={styles.cardHeaderSub}>Add produce, thalis, or homemade bakery items to receive live orders.</Text>

          {/* Product Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Product / Dish Name</Text>
            <View
              style={[
                styles.inputWrap,
                focusedInput === 'name' && styles.inputWrapFocused,
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
                placeholder="e.g. Special Sarson Saag, A2 Ghee"
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
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.catChip, isSelected && styles.catChipSelected]}
                    onPress={() => setCategory(cat)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.catChipText, isSelected && styles.catChipTextSelected]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Price & Unit Row */}
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.label}>Selling Price (₹)</Text>
              <View
                style={[
                  styles.inputWrap,
                  focusedInput === 'price' && styles.inputWrapFocused,
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
              <Text style={styles.label}>Unit (kg, thali)</Text>
              <View
                style={[
                  styles.inputWrap,
                  focusedInput === 'unit' && styles.inputWrapFocused,
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
          </View>

          {/* Stock Quantity */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Available Inventory Stock</Text>
            <View
              style={[
                styles.inputWrap,
                focusedInput === 'stock' && styles.inputWrapFocused,
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
                placeholder="e.g. 50"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
                value={stock}
                onChangeText={setStock}
                onFocus={() => setFocusedInput('stock')}
                onBlur={() => setFocusedInput(null)}
              />
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} activeOpacity={0.85}>
            <Ionicons name="cloud-upload-outline" size={20} color="#ffffff" />
            <Text style={styles.submitBtnText}>Publish Listing Now</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export const InventoryScreen = ({ navigation }) => {
  const { inventory, toggleItemAvailability, deleteInventoryItem } = usePartner();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Products ({inventory.length})</Text>
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
            <Text style={styles.emptyTitle}>No Products Added Yet</Text>
            <Text style={styles.emptySub}>Tap "Add Item" at top right to start selling produce.</Text>
          </View>
        ) : (
          inventory.map((item) => (
            <View key={item.id} style={styles.itemCard}>
              <View style={styles.itemBadgeIcon}>
                <Ionicons name="leaf-outline" size={20} color={colors.primary} />
              </View>
              
              <View style={{ flex: 1, paddingHorizontal: 12 }}>
                <Text style={styles.itemTitle}>{item.name}</Text>
                <Text style={styles.itemCategory}>
                  {item.category} • <Text style={{ color: '#16a34a', fontWeight: '500' }}>₹{item.price}</Text> / {item.unit}
                </Text>
                <Text style={styles.itemStock}>
                  Stock: <Text style={{ fontWeight: '500', color: '#0f172a' }}>{item.stock}</Text> units
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

export const SettlementsScreen = ({ navigation }) => {
  const { vendor, settlementHistory = [] } = usePartner();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.header}>
        <Text style={styles.headerTitleLarge}>Wednesdays Settlements</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Wednesday Hero Payout Box */}
        <View style={styles.wedCard}>
          <View style={styles.wedIconBox}>
            <Ionicons name="calendar-outline" size={30} color="#16a34a" />
          </View>
          <View style={{ flex: 1, paddingLeft: 14 }}>
            <Text style={styles.wedTitle}>Upcoming Wednesday Payout</Text>
            <Text style={styles.wedAmount}>₹{vendor?.wednesdaySettlement || 0}</Text>
            <View style={styles.bankTag}>
              <Ionicons name="checkmark-circle" size={13} color="#15803d" />
              <Text style={styles.bankTagText}>Direct Transfer to Bank A/c (*4321)</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Previous Weekly Settlements</Text>
        {settlementHistory.map((item, idx) => (
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
    backgroundColor: '#f8fafc',
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
      android: { elevation: 3 },
    }),
  },
  iconBtnCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '500',
    color: '#0f172a',
  },
  headerTitleLarge: {
    fontSize: 20,
    fontWeight: '500',
    color: '#0f172a',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
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
    elevation: 6,
  },
  cardHeaderTitle: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.primary,
    letterSpacing: 1,
  },
  cardHeaderSub: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
    marginBottom: 16,
    lineHeight: 18,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: '#334155',
    marginBottom: 6,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
  },
  inputWrapFocused: {
    borderColor: colors.primary,
    backgroundColor: '#ffffff',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 10,
  },
  currencyPrefix: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.primary,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#0f172a',
    fontWeight: '500',
  },
  catChipRow: {
    gap: 8,
    paddingVertical: 4,
  },
  catChip: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  catChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  catChipText: {
    fontSize: 12.5,
    fontWeight: '500',
    color: '#475569',
  },
  catChipTextSelected: {
    color: '#ffffff',
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 14,
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
    elevation: 6,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  addNavBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    gap: 4,
  },
  addNavBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '500',
  },
  emptyBox: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 36,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0f172a',
    marginTop: 12,
  },
  emptySub: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 4,
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
    elevation: 3,
  },
  itemBadgeIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  itemTitle: {
    fontSize: 15.5,
    fontWeight: '500',
    color: '#0f172a',
  },
  itemCategory: {
    fontSize: 12.5,
    color: '#64748b',
    marginTop: 3,
    fontWeight: '500',
  },
  itemStock: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  toggleSection: {
    alignItems: 'center',
    gap: 4,
  },
  toggleText: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  deleteBtn: {
    padding: 4,
    marginTop: 2,
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
    elevation: 4,
  },
  wedIconBox: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  wedTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748b',
  },
  wedAmount: {
    fontSize: 30,
    fontWeight: '500',
    color: '#15803d',
    marginTop: 2,
  },
  bankTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  bankTagText: {
    fontSize: 11.5,
    color: '#15803d',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '500',
    color: '#0f172a',
    marginBottom: 14,
  },
  settleCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  settleDate: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0f172a',
  },
  settleTotal: {
    fontSize: 16,
    fontWeight: '500',
    color: '#15803d',
  },
  settleStatusBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 8,
  },
  settleStatusText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#15803d',
  },
  settleRef: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
});

