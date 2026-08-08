import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Switch, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePartner } from '../context/PartnerContext';
import { colors } from '../theme/colors';

export const AddProductScreen = ({ navigation }) => {
  const { addInventoryItem } = usePartner();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Home Restro');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('thali');
  const [stock, setStock] = useState('');

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
      stock: Number(stock)
    });
    Alert.alert('Product Listed!', `${name} is now live and visible to nearby customers!`, [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Listing</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.formCard}>
          <Text style={styles.label}>Product / Dish / Produce Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Special Sarson Saag, A2 Ghee"
            placeholderTextColor={colors.textMuted}
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Category</Text>
          <TextInput
            style={styles.input}
            value={category}
            onChangeText={setCategory}
            placeholderTextColor={colors.textMuted}
          />

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={styles.label}>Selling Price (₹)</Text>
              <TextInput
                style={styles.input}
                placeholder="120"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                value={price}
                onChangeText={setPrice}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Unit (kg, thali)</Text>
              <TextInput
                style={styles.input}
                value={unit}
                onChangeText={setUnit}
                placeholderTextColor={colors.textMuted}
              />
            </View>
          </View>

          <Text style={styles.label}>Initial Available Stock</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 50"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
            value={stock}
            onChangeText={setStock}
          />

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} activeOpacity={0.85}>
            <Ionicons name="cloud-upload-outline" size={20} color="#ffffff" />
            <Text style={styles.submitBtnText}>Publish to Customer App</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export const InventoryScreen = ({ navigation }) => {
  const { inventory, toggleItemAvailability } = usePartner();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Active Items ({inventory.length})</Text>
        <TouchableOpacity onPress={() => navigation.navigate('AddProduct')} style={styles.iconBtn}>
          <Ionicons name="add-circle" size={28} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {inventory.map((item) => (
          <View key={item.id} style={styles.itemCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>{item.name}</Text>
              <Text style={styles.itemCategory}>{item.category} • ₹{item.price} / {item.unit}</Text>
              <Text style={styles.itemStock}>Available: <Text style={{ fontWeight: '700' }}>{item.stock}</Text> units</Text>
            </View>

            <View style={styles.toggleSection}>
              <Text style={[styles.toggleText, { color: item.isAvailable ? '#10b981' : colors.textMuted }]}>
                {item.isAvailable ? 'IN STOCK' : 'OUT'}
              </Text>
              <Switch
                value={item.isAvailable}
                onValueChange={() => toggleItemAvailability(item.id)}
                trackColor={{ false: '#e2e8f0', true: '#10b981' }}
                thumbColor="#ffffff"
              />
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export const SettlementsScreen = ({ navigation }) => {
  const { vendor, settlementHistory } = usePartner();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitleLarge}>Wednesdays Settlements</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.wedCard}>
          <View style={styles.wedIconBox}>
            <Ionicons name="calendar" size={32} color={colors.primary} />
          </View>
          <View style={{ flex: 1, paddingLeft: 16 }}>
            <Text style={styles.wedTitle}>Upcoming Payout</Text>
            <Text style={styles.wedAmount}>₹{vendor.wednesdaySettlement}</Text>
            <Text style={styles.wedSub}>Direct Transfer to Bank A/c ending 4321</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Previous Settlements</Text>
        {settlementHistory.map((item, idx) => (
          <View key={idx} style={styles.settleCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.settleDate}>{item.date}</Text>
              <Text style={styles.settleTotal}>₹{item.total}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
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
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
      android: { elevation: 2 }
    })
  },
  iconBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: colors.textPrimary },
  headerTitleLarge: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  scrollContent: { padding: 20, paddingBottom: 40 },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 8 },
      android: { elevation: 3 }
    })
  },
  label: { fontSize: 13, fontWeight: '600', color: colors.textPrimary, marginBottom: 8, marginTop: 16 },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '500'
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 30,
    paddingVertical: 16,
    marginTop: 32,
    gap: 8,
    ...Platform.select({
      ios: { shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
      android: { elevation: 4 }
    })
  },
  submitBtnText: { color: '#ffffff', fontSize: 15, fontWeight: '600' },
  
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 8 },
      android: { elevation: 3 }
    })
  },
  itemTitle: { fontSize: 16, fontWeight: '600', color: colors.textPrimary },
  itemCategory: { fontSize: 13, color: colors.textSecondary, marginTop: 4, fontWeight: '500' },
  itemStock: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
  toggleSection: { alignItems: 'center' },
  toggleText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5, marginBottom: 4 },
  
  wedCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 8 },
      android: { elevation: 2 }
    })
  },
  wedIconBox: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#f0fdf4', alignItems: 'center', justifyContent: 'center' },
  wedTitle: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
  wedAmount: { fontSize: 32, fontWeight: '700', color: colors.primaryDark, marginTop: 2 },
  wedSub: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: colors.textPrimary, marginBottom: 16 },
  settleCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9'
  },
  settleDate: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  settleTotal: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  settleStatusBadge: { backgroundColor: '#ecfdf5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  settleStatusText: { fontSize: 11, fontWeight: '600', color: '#10b981' },
  settleRef: { fontSize: 12, color: colors.textSecondary, fontWeight: '500' }
});
