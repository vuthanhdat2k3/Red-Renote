import { Tabs } from "expo-router";

import { BottomTabBar } from "@/components/shell/BottomTabBar";
import { colors } from "@/constants/tokens";
import { tabRoutes } from "@/constants/routes";

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <BottomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.secondaryText,
      }}
    >
      <Tabs.Screen name="index" options={{ href: null }} />
      {tabRoutes.map((route) => {
        const Icon = route.icon;

        return (
          <Tabs.Screen
            key={route.name}
            name={route.name}
            options={{
              title: route.title,
              tabBarIcon: ({ color, size }) => <Icon color={color} size={size} strokeWidth={2.2} />,
            }}
          />
        );
      })}
    </Tabs>
  );
}
