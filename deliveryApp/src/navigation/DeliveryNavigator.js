import React from "react";
import { StyleSheet, View } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import { DutyScreen } from "../screens/DutyScreen";
import {
  ActiveNavigationScreen,
  EarningsScreen,
} from "../screens/ActiveNavigationScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const DeliveryTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#0284c7",
        tabBarInactiveTintColor: "#64748b",
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopWidth: 1,
          borderTopColor: "#e2e8f0",
          height: 70,
          paddingBottom: 10,
          paddingTop: 7,
          elevation: 10,
          shadowColor: "#000",
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
          marginVertical: 4,
        },
        tabBarIcon: ({ color, size, focused }) => {
          let iconName = "bicycle-outline";
          if (route.name === "Duty") iconName = "speedometer-outline";
          else if (route.name === "ActiveNavigation")
            iconName = "navigate-outline";
          else if (route.name === "Earnings") iconName = "wallet-outline";
          return (
            <View style={focused ? styles.activeIcon : styles.icon}>
              <Ionicons name={iconName} size={size || 21} color={color} />
            </View>
          );
        },
      })}
    >
      <Tab.Screen
        name="Duty"
        component={DutyScreen}
        options={{ tabBarLabel: "Duty Queue" }}
      />
      <Tab.Screen
        name="ActiveNavigation"
        component={ActiveNavigationScreen}
        options={{ tabBarLabel: "Live Route" }}
      />
      <Tab.Screen
        name="Earnings"
        component={EarningsScreen}
        options={{ tabBarLabel: "Pay Log" }}
      />
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
    backgroundColor: "#e0f2fe",
  },
});
