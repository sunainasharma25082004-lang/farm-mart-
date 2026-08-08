import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { HomeScreen } from '../screens/Customer/HomeScreen';
import { CatalogScreen } from '../screens/Customer/CatalogScreen';
import { HomeRestroScreen } from '../screens/Customer/HomeRestroScreen';
import { CartScreen } from '../screens/Customer/CartScreen';
import { OrderTrackingScreen } from '../screens/Customer/OrderTrackingScreen';
import { ProfileWalletScreen } from '../screens/Customer/ProfileWalletScreen';
import { ProductDetailsScreen } from '../screens/Customer/ProductDetailsScreen';
import { CheckoutScreen } from '../screens/Customer/CheckoutScreen';
import { RazorpayCheckoutWebView } from '../screens/Customer/RazorpayCheckoutWebView';
import { LoginScreen } from '../screens/Auth/LoginScreen';
import { SignupScreen } from '../screens/Auth/SignupScreen';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const tabIcons = {
  Home: { active: 'home', inactive: 'home-outline' },
  Catalog: { active: 'grid', inactive: 'grid-outline' },
  HomeRestro: { active: 'restaurant', inactive: 'restaurant-outline' },
  OrderTracking: { active: 'cube', inactive: 'cube-outline' },
  ProfileWallet: { active: 'person', inactive: 'person-outline' }
};

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          marginTop: 2
        },
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: Platform.OS === 'ios' ? 84 : 64,
          paddingBottom: Platform.OS === 'ios' ? 24 : 10,
          paddingTop: 8,
          elevation: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 8
        },
        tabBarIcon: ({ color, focused }) => {
          const icons = tabIcons[route.name] || tabIcons.Home;
          return (
            <View style={focused ? styles.activeIconWrap : null}>
              <Ionicons name={focused ? icons.active : icons.inactive} size={22} color={color} />
            </View>
          );
        }
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="Catalog" component={CatalogScreen} options={{ tabBarLabel: 'Market' }} />
      <Tab.Screen
        name="HomeRestro"
        component={HomeRestroScreen}
        options={{ tabBarLabel: 'Home Chef' }}
      />
      <Tab.Screen
        name="OrderTracking"
        component={OrderTrackingScreen}
        options={{ tabBarLabel: 'Orders' }}
      />
      <Tab.Screen
        name="ProfileWallet"
        component={ProfileWalletScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

export const RootNavigator = () => {
  const { isAuthenticated } = useApp();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      {!isAuthenticated ? (
        // Auth Stack
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
        </>
      ) : (
        // App Stack
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="Cart" component={CartScreen} />
          <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
          <Stack.Screen name="Checkout" component={CheckoutScreen} />
          <Stack.Screen name="RazorpayCheckout" component={RazorpayCheckoutWebView} options={{ presentation: 'modal' }} />
        </>
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  activeIconWrap: {
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4
  }
});
