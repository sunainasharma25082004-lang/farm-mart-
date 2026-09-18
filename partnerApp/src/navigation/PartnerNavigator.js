import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Platform, Animated } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { VendorDashboardScreen } from '../screens/VendorDashboardScreen';
import { AddProductScreen, InventoryScreen, SettlementsScreen } from '../screens/AddProductScreen';
import { colors } from '../theme/colors';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const AnimatedPartnerTabIcon = ({ focused, iconName, color, size }) => {
  const scaleAnim = useRef(new Animated.Value(focused ? 1.05 : 1.0)).current;

  useEffect(() => {
    if (focused) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.22,
          duration: 120,
          useNativeDriver: Platform.OS !== 'web'
        }),
        Animated.spring(scaleAnim, {
          toValue: 1.0,
          friction: 3.5,
          tension: 200,
          useNativeDriver: Platform.OS !== 'web'
        })
      ]).start();
    }
  }, [focused]);

  return (
    <Animated.View
      style={[
        { transform: [{ scale: scaleAnim }] },
        focused && styles.activeIconWrap
      ]}
    >
      <Ionicons name={iconName} size={size || 22} color={color} />
    </Animated.View>
  );
};

const PartnerTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6
        },
        tabBarIcon: ({ color, size, focused }) => {
          let iconName = 'storefront-outline';
          if (route.name === 'Dashboard') iconName = focused ? 'storefront' : 'storefront-outline';
          else if (route.name === 'Inventory') iconName = focused ? 'list' : 'list-outline';
          else if (route.name === 'Settlements') iconName = focused ? 'calendar' : 'calendar-outline';
          return <AnimatedPartnerTabIcon focused={focused} iconName={iconName} color={color} size={size} />;
        }
      })}
    >
      <Tab.Screen name="Dashboard" component={VendorDashboardScreen} options={{ tabBarLabel: 'Orders Queue' }} />
      <Tab.Screen name="Inventory" component={InventoryScreen} options={{ tabBarLabel: 'My Products' }} />
      <Tab.Screen name="Settlements" component={SettlementsScreen} options={{ tabBarLabel: 'Wed Payouts' }} />
    </Tab.Navigator>
  );
};

export const PartnerNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 250,
        gestureEnabled: true,
        fullScreenGestureEnabled: true
      }}
    >
      <Stack.Screen name="PartnerTabs" component={PartnerTabs} />
      <Stack.Screen name="AddProduct" component={AddProductScreen} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  activeIconWrap: {
    backgroundColor: 'rgba(234, 88, 12, 0.12)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3
  }
});
