import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "@/constants/tokens";
import { tabRoutes } from "@/constants/routes";
import { cn } from "@/lib/cn";

export type BottomTabBarProps = {
  state: {
    index: number;
    routes: { key: string; name: string }[];
  };
  navigation: {
    emit: (options: { type: "tabPress"; target?: string; canPreventDefault: boolean }) => { defaultPrevented: boolean };
    navigate: (name: string) => void;
  };
};

export function BottomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View className="border-t border-app-border bg-app-surface px-3 pt-2" style={{ paddingBottom: Math.max(insets.bottom, 12) }}>
      <View className="flex-row items-center justify-between">
        {tabRoutes.map((route) => {
          const routeIndex = state.routes.findIndex((item) => item.name === route.name);
          if (routeIndex < 0) {
            return null;
          }

          const isFocused = state.index === routeIndex;
          const Icon = route.icon;

          return (
            <Pressable
              accessibilityLabel={route.title}
              accessibilityRole="tab"
              accessibilityState={isFocused ? { selected: true } : undefined}
              className="min-h-[54px] flex-1 items-center justify-center gap-1"
              key={route.name}
              onPress={() => {
                const event = navigation.emit({
                  type: "tabPress",
                  target: state.routes[routeIndex]?.key,
                  canPreventDefault: true,
                });

                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              }}
            >
              <View
                className={cn(
                  "h-8 min-w-8 items-center justify-center rounded-full px-3",
                  isFocused && route.name === "record" ? "bg-brand-primary" : isFocused ? "bg-red-50" : "bg-transparent",
                )}
              >
                <Icon
                  color={isFocused && route.name === "record" ? colors.surface : isFocused ? colors.primary : colors.secondaryText}
                  size={route.name === "record" ? 22 : 20}
                  strokeWidth={2.3}
                />
              </View>
              <Text className={cn("text-[11px] font-semibold", isFocused ? "text-brand-primary" : "text-app-muted")}>{route.title}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
