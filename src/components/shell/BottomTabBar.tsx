import { Mic } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, shadows } from "@/constants/tokens";
import { tabRoutes } from "@/constants/routes";
import { cn } from "@/lib/cn";
import { PressableScale } from "@/components/ui/PressableScale";

export type BottomTabBarProps = {
  state: {
    index: number;
    routes: { key: string; name: string }[];
  };
  navigation: {
    emit: (options: { type: "tabPress"; target?: string; canPreventDefault: true }) => { defaultPrevented: boolean };
    navigate: (name: string) => void;
  };
};

export function BottomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View 
      className="border-t border-app-border bg-white px-2" 
      style={{ paddingBottom: Math.max(insets.bottom, 8), height: 64 + Math.max(insets.bottom, 8) }}
    >
      <View className="flex-1 flex-row items-center justify-between">
        {tabRoutes.map((route) => {
          const routeIndex = state.routes.findIndex((item) => item.name === route.name);
          if (routeIndex < 0) return null;

          const isFocused = state.index === routeIndex;
          const Icon = route.icon;
          const isRecord = route.name === "record";

          // Placeholder for the center record button to maintain spacing
          if (isRecord) {
            return (
              <View key="record-placeholder" className="flex-1 items-center justify-center">
                <View className="h-9 w-12" />
                <Text className="text-[10px] font-bold text-brand-primary mt-1 opacity-0">{route.title}</Text>
              </View>
            );
          }

          return (
            <Pressable
              key={route.name}
              accessibilityLabel={route.title}
              accessibilityRole="tab"
              accessibilityState={isFocused ? { selected: true } : undefined}
              className="flex-1 items-center justify-center gap-1"
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
              <View className={cn("h-9 w-12 items-center justify-center rounded-2xl", isFocused && "bg-red-50/50")}>
                <Icon
                  color={isFocused ? colors.primary : colors.secondaryText}
                  size={22}
                  strokeWidth={2.5}
                />
              </View>
              <Text className={cn("text-[10px] font-bold tracking-tight", isFocused ? "text-brand-primary" : "text-app-muted")}>
                {route.title}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Actual Floating Record Button */}
      <View 
        pointerEvents="box-none"
        className="absolute left-0 right-0 items-center" 
        style={{ top: -28 }}
      >
        <PressableScale
          onPress={() => {
            navigation.navigate("record");
          }}
          scaleTo={0.9}
        >
          <View className="items-center gap-1">
            <View 
              className="h-16 w-16 items-center justify-center rounded-full bg-brand-primary"
              style={{ ...shadows.redGlow, borderWidth: 4, borderColor: 'white' }}
            >
              <Mic color="white" size={28} strokeWidth={2.5} />
            </View>
            <Text className="text-[10px] font-bold text-brand-primary">Record</Text>
          </View>
        </PressableScale>
      </View>
    </View>
  );
}
