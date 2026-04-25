import { router } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";

import { BrandMark } from "@/components/launch/BrandMark";
import { AppScreen } from "@/components/ui/AppScreen";
import { useAppStore } from "@/store/app-store";
import { useAuthStore } from "@/store/auth-store";

export default function SplashRoute() {
  const markSplashSeen = useAppStore((state) => state.markSplashSeen);
  const isAuthReady = useAuthStore((state) => state.isReady);
  const session = useAuthStore((state) => state.session);

  useEffect(() => {
    if (!isAuthReady) {
      return;
    }

    const timer = setTimeout(() => {
      markSplashSeen();
      router.replace(session ? "/(tabs)/home" : "/onboarding");
    }, 1200);

    return () => clearTimeout(timer);
  }, [isAuthReady, markSplashSeen, session]);

  return (
    <AppScreen
      className="bg-[#A30009]"
      scroll={false}
      contentClassName="items-center justify-center px-8"
    >
      <View className="absolute inset-x-[-40] top-[-60] h-80 rounded-full bg-[#CC121D]/25" />
      <View className="absolute bottom-24 h-60 w-60 rounded-full bg-black/10" />
      <BrandMark inverted />
      <View className="absolute bottom-10 items-center">
        <View className="h-1 w-8 rounded-full bg-white/90" />
      </View>
    </AppScreen>
  );
}
