import { router } from "expo-router";
import { Mic } from "lucide-react-native";
import { useEffect } from "react";
import { Text, View } from "react-native";

import { AppScreen } from "@/components/ui/AppScreen";
import { colors } from "@/constants/tokens";
import { useAppStore } from "@/store/app-store";

export default function SplashRoute() {
  const markSplashSeen = useAppStore((state) => state.markSplashSeen);

  useEffect(() => {
    const timer = setTimeout(() => {
      markSplashSeen();
      router.replace("/onboarding");
    }, 900);

    return () => clearTimeout(timer);
  }, [markSplashSeen]);

  return (
    <AppScreen scroll={false} contentClassName="items-center justify-center gap-5">
      <View className="h-20 w-20 items-center justify-center rounded-[28px] bg-brand-primary">
        <Mic color={colors.surface} size={38} strokeWidth={2.6} />
      </View>
      <View className="items-center gap-2">
        <Text className="text-[34px] font-bold text-app-text">Red Renote</Text>
        <Text className="text-base font-medium text-app-muted">AI meeting memory</Text>
      </View>
    </AppScreen>
  );
}
