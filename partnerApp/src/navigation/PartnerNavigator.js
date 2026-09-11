import React from "react";
import { StyleSheet, View } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import { VendorDashboardScreen } from "../screens/VendorDashboardScreen";
import {
  AddProductScreen,
  InventoryScreen,
  SettlementsScreen,
} from "../screens/AddProductScreen";
import { colors } from "../theme/colors";

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
          height: 68,
          paddingBottom: 9,
          paddingTop: 6,
          elevation: 10,
          shadowColor: "#0f172a",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 10,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
          marginTop: 2,
        },
        tabBarItemStyle: {
          borderRadius: 14,
          marginHorizontal: 3,
          marginVertical: 3,
        },
        tabBarIcon: ({ color, size, focused }) => {
          let iconName = "storefront-outline";
          if (route.name === "Dashboard") iconName = "storefront-outline";
          else if (route.name === "Inventory") iconName = "list-outline";
          else if (route.name === "Settlements") iconName = "calendar-outline";
          return (
            <View style={focused ? styles.activeIcon : styles.icon}>
              <Ionicons name={iconName} size={size || 21} color={color} />
            </View>
          );
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={VendorDashboardScreen}
        options={{ tabBarLabel: "Orders Queue" }}
      />
      <Tab.Screen
        name="Inventory"
        component={InventoryScreen}
        options={{ tabBarLabel: "My Products" }}
      />
      <Tab.Screen
        name="Settlements"
        component={SettlementsScreen}
        options={{ tabBarLabel: "Payouts" }}
      />
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

const styles = StyleSheet.create({
  icon: {
    alignItems: "center",
    justifyContent: "center",
    height: 28,
    width: 44,
  },
  activeIcon: {
    alignItems: "center",
    justifyContent: "center",
    height: 30,
    width: 48,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
  },
});
