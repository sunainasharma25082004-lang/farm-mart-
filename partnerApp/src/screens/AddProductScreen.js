import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Switch } from 'react-native';
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
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Listing to Customer App</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.formCard}>
          <Text style={styles.label}>Product / Dish / Produce Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Special Sarson Saag, A2 Ghee, Fresh Carrots"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Category</Text>
          <TextInput
            style={styles.input}
            value={category}
            onChangeText={setCategory}
          />

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Selling Price (₹)</Text>
              <TextInput
                style={styles.input}
                placeholder="120"
                keyboardType="numeric"
                value={price}
                onChangeText={setPrice}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Unit (kg, g, thali, loaf)</Text>
              <TextInput
                style={styles.input}
                value={unit}
                onChangeText={setUnit}
              />
            </View>
          </View>

          <Text style={styles.label}>Initial Available Stock</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 50"
            keyboardType="numeric"
            value={stock}
            onChangeText={setStock}
          />

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
            <Ionicons name="cloud-upload-outline" size={18} color="#ffffff" />
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
        <Text style={styles.headerTitle}>Your Active Items ({inventory.length})</Text>
        <TouchableOpacity onPress={() => navigation.navigate('AddProduct')}>
          <Ionicons name="add-circle" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {inventory.map((item) => (
          <View key={item.id} style={styles.itemCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemTitle}>{item.name}</Text>
              <Text style={styles.itemCategory}>{item.category} • ₹{item.price} / {item.unit}</Text>
              <Text style={styles.itemStock}>Available Stock: {item.stock} units</Text>
            </View>

            <View style={styles.toggleSection}>
              <Text style={[styles.toggleText, { color: item.isAvailable ? colors.secondary : colors.textMuted }]}>
                {item.isAvailable ? 'IN STOCK' : 'OUT'}
              </Text>
              <Switch
                value={item.isAvailable}
                onValueChange={() => toggleItemAvailability(item.id)}
                trackColor={{ false: '#cbd5e1', true: '#16a34a' }}
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
  const { vendor } = usePartner();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Wednesday Settlement & Earnings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.wedCard}>
          <Ionicons name="calendar-outline" size={28} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.wedTitle}>Upcoming Wednesday Payout</Text>
            <Text style={styles.wedAmount}>₹{vendor.wednesdaySettlement}</Text>
            <Text style={styles.wedSub}>Direct Transfer to Registered Bank Account</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Previous Payout Settlements</Text>
        <View style={styles.historyCard}>
          <Text style={styles.hisDate}>Wed, Aug 5, 2026</Text>
          <Text style={styles.hisVal}>₹4,120 (PAID)</Text>
        </View>

        <View style={styles.historyCard}>
          <Text style={styles.hisDate}>Wed, Jul 29, 2026</Text>
          <Text style={styles.hisVal}>₹3,890 (PAID)</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerTitle: { fontSize: 15, fontWeight: '800', color: colors.textPrimary },
  scrollContent: { padding: 16 },
  formCard: { backgroundColor: colors.card, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: colors.border },
  label: { fontSize: 12, fontWeight: '700', color: colors.textPrimary, marginTop: 10, marginBottom: 4 },
  input: { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, fontSize: 13 },
  row: { flexDirection: 'row', gap: 10 },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 12, marginTop: 18, gap: 6 },
  submitBtnText: { color: '#ffffff', fontSize: 14, fontWeight: '800' },
  itemCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, padding: 14, borderRadius: 14, marginBottom: 10, borderWidth: 1, borderColor: colors.border },
  itemTitle: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  itemCategory: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  itemStock: { fontSize: 11, color: colors.primaryDark, fontWeight: '600', marginTop: 4 },
  toggleSection: { alignItems: 'flex-end', gap: 4 },
  toggleText: { fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  wedCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primaryLight, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#fde68a', gap: 12, marginBottom: 16 },
  wedTitle: { fontSize: 13, color: colors.primaryDark, fontWeight: '700' },
  wedAmount: { fontSize: 24, fontWeight: '800', color: colors.primaryDark, marginTop: 2 },
  wedSub: { fontSize: 10, color: colors.textSecondary, marginTop: 2 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: colors.textPrimary, marginBottom: 10 },
  historyCard: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: colors.card, padding: 12, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: colors.border },
  hisDate: { fontSize: 12, color: colors.textPrimary, fontWeight: '700' },
  hisVal: { fontSize: 12, color: colors.secondary, fontWeight: '800' }
});
