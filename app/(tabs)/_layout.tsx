import { Feather } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";
import { useColors } from "@/hooks/useColors";

export default function TabLayout() {
  const colors = useColors();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarStyle: {
          backgroundColor: colors.secondary,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          elevation: 0,
          ...(Platform.OS === "web" ? { height: 84 } : {}),
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "خشتەی مانگەکان",
          tabBarIcon: ({ color }) => <Feather name="calendar" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="tenants"
        options={{
          title: "بەژداربووان",
          tabBarIcon: ({ color }) => <Feather name="users" size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}
