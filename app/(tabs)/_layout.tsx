import { Redirect, Tabs, type Href } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useTranslation } from "react-i18next";

import { BottomTabBar } from "@/components/shell/BottomTabBar";
import { colors } from "@/constants/tokens";
import { tabRoutes } from "@/constants/routes";
import { useAuthStore } from "@/store/auth-store";

export default function TabLayout() {
  const { t } = useTranslation();
  const isAuthReady = useAuthStore((state) => state.isReady);
  const session = useAuthStore((state) => state.session);

  if (!isAuthReady) {
    return (
      <View className="flex-1 items-center justify-center bg-app-background">
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!session) {
    return <Redirect href={"/login" as Href} />;
  }

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
              title: t(route.titleKey),
              tabBarIcon: ({ color, size }) => <Icon color={color} size={size} strokeWidth={2.2} />,
            }}
          />
        );
      })}
    </Tabs>
  );
}
