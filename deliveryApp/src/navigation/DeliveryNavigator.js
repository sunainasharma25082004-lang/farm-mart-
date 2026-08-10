import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { DutyScreen } from '../screens/DutyScreen';
import { ActiveNavigationScreen, EarningsScreen } from '../screens/ActiveNavigationScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const DeliveryTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#0284c7',
        tabBarInactiveTintColor: '#64748b',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e2e8f0',
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 6
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700'
        },
        tabBarIcon: ({ color, size }) => {
          let iconName = 'bicycle-outline';
          if (route.name === 'Duty') iconName = 'speedometer-outline';
          else if (route.name === 'ActiveNavigation') iconName = 'navigate-outline';
          else if (route.name === 'Earnings') iconName = 'wallet-outline';
          return <Ionicons name={iconName} size={size || 22} color={color} />;
        }
      })}
    >
      <Tab.Screen name="Duty" component={DutyScreen} options={{ tabBarLabel: 'Duty Queue' }} />
      <Tab.Screen name="ActiveNavigation" component={ActiveNavigationScreen} options={{ tabBarLabel: 'Live Route' }} />
      <Tab.Screen name="Earnings" component={EarningsScreen} options={{ tabBarLabel: 'Pay Log' }} />
    </Tab.Navigator>
  );
};

export const DeliveryNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DeliveryTabs" component={DeliveryTabs} />
    </Stack.Navigator>
  );
};
