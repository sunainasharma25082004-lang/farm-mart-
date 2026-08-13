import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Platform
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { useApp } from '../../context/AppContext';

export const CheckoutScreen = ({ navigation }) => {
  const { cart, userProfile, clearCart, getCartTotal } = useApp();
  const [loading, setLoading] = useState(false);

  const subtotal = getCartTotal();
  const deliveryFee = subtotal > 300 ? 0 : 30; // free delivery over 300
  const platformFee = 15;
  const total = subtotal + deliveryFee + platformFee;

  const handleProceedToPay = async () => {
    if (total === 0) return;
    
    setLoading(true);
    try {
      const API_URL = 'https://farm-mart-api.onrender.com/api/create-order';
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: total })
      });
      
      const data = await response.json();
      setLoading(false);
      
      if (data.success) {
        navigation.navigate('RazorpayCheckout', {
          order: data.order,
          onSuccess: (paymentId) => {
            clearCart();
            Alert.alert("Success", "Payment successful! Order placed.");
            navigation.navigate('MainTabs', { screen: 'OrderTracking' });
          },
          onFailure: () => {
            Alert.alert("Payment Failed", "Something went wrong with your payment.");
          }
        });
      } else {
        Alert.alert('Error', 'Could not create order. Please check backend connection.');
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
      Alert.alert('Error', 'Failed to connect to server. Ensure backend is running.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Delivery Time Banner */}
        <View style={styles.deliveryBanner}>
          <MaterialCommunityIcons name="lightning-bolt" size={24} color="#16a34a" />
          <View style={{marginLeft: 8}}>
            <Text style={styles.deliveryTitle}>Delivery in 10-15 mins</Text>
            <Text style={styles.deliverySub}>Shipment of {cart.length} item{cart.length > 1 ? 's' : ''}</Text>
          </View>
        </View>

        {/* Address Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Delivery Address</Text>
            <TouchableOpacity>
              <Text style={styles.changeText}>Change</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.addressRow}>
            <Ionicons name="location" size={24} color={colors.primary} style={{marginTop: 2}} />
            <View style={styles.addressDetails}>
              <Text style={styles.addressName}>{userProfile?.fullName || userProfile?.name || "Guest Customer"}</Text>
              <Text style={styles.addressText}>{userProfile?.villageHub || "Main Hub"}{userProfile?.city ? `, ${userProfile.city}` : ""}</Text>
              <Text style={styles.addressPhone}>{userProfile?.phone ? `+91 ${userProfile.phone}` : "No phone provided"}</Text>
            </View>
          </View>
        </View>

        {/* Bill Summary */}
        <View style={styles.card}>
          <Text style={[styles.cardTitle, {marginBottom: 16}]}>Bill Details</Text>
          
          <View style={styles.billRow}>
            <Text style={styles.billText}>Item Total</Text>
            <Text style={styles.billVal}>₹{subtotal}</Text>
          </View>
          
          <View style={styles.billRow}>
            <Text style={styles.billText}>Delivery Fee</Text>
            <Text style={[styles.billVal, deliveryFee === 0 && { color: '#16a34a' }]}>
              {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
            </Text>
          </View>
          
          <View style={styles.billRow}>
            <Text style={styles.billText}>Platform Fee</Text>
            <Text style={styles.billVal}>₹{platformFee}</Text>
          </View>
          
          {/* Dashed line for receipt feel */}
          <View style={styles.dashedLine} />
          
          <View style={[styles.billRow, {marginTop: 12}]}>
            <Text style={styles.totalText}>To Pay</Text>
            <Text style={styles.totalAmount}>₹{total}</Text>
          </View>
          
          {deliveryFee === 0 && (
            <View style={styles.savingsBadge}>
              <Text style={styles.savingsText}>You saved ₹30 on delivery!</Text>
            </View>
          )}
        </View>

        {/* Trust Note */}
        <View style={styles.secureBadge}>
          <Ionicons name="shield-checkmark" size={16} color="#64748b" />
          <Text style={styles.secureText}>Secure payments powered by Razorpay</Text>
        </View>

      </ScrollView>

      {/* Modern Pill Footer */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.payBtn, loading && styles.disabledBtn]} 
          onPress={handleProceedToPay}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <View style={styles.payBtnInner}>
              <View>
                <Text style={styles.payBtnTotal}>₹{total}</Text>
                <Text style={styles.payBtnSub}>TOTAL</Text>
              </View>
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
                <Text style={styles.payBtnAction}>Proceed to Pay</Text>
                <Ionicons name="chevron-forward" size={18} color="#ffffff" />
              </View>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc' // subtle background
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#ffffff'
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0f172a'
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center'
  },
  content: {
    padding: 16,
    paddingBottom: 40
  },
  deliveryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#dcfce7',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16
  },
  deliveryTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#166534'
  },
  deliverySub: {
    fontSize: 13,
    color: '#15803d',
    marginTop: 2
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#0f172a'
  },
  changeText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.primary
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12
  },
  addressDetails: {
    flex: 1
  },
  addressName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#334155',
    marginBottom: 4
  },
  addressText: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 20
  },
  addressPhone: {
    fontSize: 13,
    fontWeight: '500',
    color: '#334155',
    marginTop: 4
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  billText: {
    fontSize: 13,
    color: '#475569'
  },
  billVal: {
    fontSize: 13,
    fontWeight: '500',
    color: '#0f172a'
  },
  dashedLine: {
    height: 1,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    borderRadius: 1,
    marginVertical: 8
  },
  totalText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#0f172a'
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0f172a'
  },
  savingsBadge: {
    backgroundColor: '#f0fdf4',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center'
  },
  savingsText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#16a34a'
  },
  secureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8
  },
  secureText: {
    fontSize: 12,
    color: '#64748b'
  },
  footer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9'
  },
  payBtn: {
    backgroundColor: colors.primary,
    borderRadius: 16, // Pill shape
    paddingVertical: 14,
    paddingHorizontal: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8
  },
  disabledBtn: {
    opacity: 0.7
  },
  payBtnInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  payBtnTotal: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500'
  },
  payBtnSub: {
    color: '#dcfce7',
    fontSize: 10,
    fontWeight: '500'
  },
  payBtnAction: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500'
  }
});
