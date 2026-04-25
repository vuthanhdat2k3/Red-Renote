import type { PropsWithChildren } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { cn } from "@/lib/cn";

type AppScreenProps = PropsWithChildren<{
  scroll?: boolean;
  className?: string;
  contentClassName?: string;
}>;

export function AppScreen({ children, scroll = true, className, contentClassName }: AppScreenProps) {
  if (!scroll) {
    return (
      <SafeAreaView className={cn("flex-1 bg-app-background", className)} edges={["top", "left", "right"]}>
        <View className={cn("flex-1 px-5", contentClassName)}>{children}</View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={cn("flex-1 bg-app-background", className)} edges={["top", "left", "right"]}>
      <ScrollView
        className="flex-1"
        contentContainerClassName={cn("gap-6 px-5 pb-10", contentClassName)}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
