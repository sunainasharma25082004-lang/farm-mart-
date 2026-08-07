import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { DutyScreen } from '../screens/DutyScreen';
import { ActiveNavigationScreen, EarningsScreen } from '../screens/ActiveNavigationScreen';
import { colors } from '../theme/colors';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const DeliveryTabs = () => {
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
