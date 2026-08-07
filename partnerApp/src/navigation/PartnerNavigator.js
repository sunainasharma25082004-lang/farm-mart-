import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { VendorDashboardScreen } from '../screens/VendorDashboardScreen';
import { AddProductScreen, InventoryScreen, SettlementsScreen } from '../screens/AddProductScreen';
import { colors } from '../theme/colors';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

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
        tabBarIcon: ({ color, size }) => {
          let iconName = 'storefront-outline';
          if (route.name === 'Dashboard') iconName = 'storefront-outline';
          else if (route.name === 'Inventory') iconName = 'list-outline';
          else if (route.name === 'Settlements') iconName = 'calendar-outline';
          return <Ionicons name={iconName} size={size || 22} color={color} />;
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
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PartnerTabs" component={PartnerTabs} />
      <Stack.Screen name="AddProduct" component={AddProductScreen} />
    </Stack.Navigator>
  );
};
