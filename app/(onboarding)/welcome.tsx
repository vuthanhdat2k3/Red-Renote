import { router } from "expo-router";
import { Mic } from "lucide-react-native";
import { Text, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { AppScreen } from "@/components/ui/AppScreen";
import { useAppStore } from "@/store/app-store";

export default function WelcomeRoute() {
  const completeOnboarding = useAppStore((state) => state.completeOnboarding);

  return (
    <AppScreen scroll={false} contentClassName="justify-between py-8">
      <View className="gap-5 pt-10">
        <View className="h-14 w-14 items-center justify-center rounded-2xl bg-brand-primary">
          <Mic color="#FFFFFF" size={28} strokeWidth={2.4} />
        </View>
        <View className="gap-3">
          <Text className="text-[34px] font-bold leading-[40px] text-app-text">Red Renote</Text>
          <Text className="text-base leading-6 text-app-muted">
            A clean AI meeting assistant shell for recording, summarizing, and turning conversations into action.
          </Text>
        </View>
      </View>
      <Button
        onPress={() => {
          completeOnboarding();
          router.replace("/(tabs)");
        }}
      >
        Continue
      </Button>
    </AppScreen>
  );
}
