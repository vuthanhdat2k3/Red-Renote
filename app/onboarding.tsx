import { router } from "expo-router";
import { ArrowRight, Sparkles } from "lucide-react-native";
import { Text, View } from "react-native";

import { AppButton } from "@/components/ui/Button";
import { AppScreen } from "@/components/ui/AppScreen";
import { AIChip } from "@/components/ui/AIChip";
import { colors } from "@/constants/tokens";
import { useAppStore } from "@/store/app-store";

export default function OnboardingRoute() {
  const completeOnboarding = useAppStore((state) => state.completeOnboarding);

  return (
    <AppScreen scroll={false} contentClassName="justify-between py-8">
      <View className="gap-8 pt-8">
        <View className="h-16 w-16 items-center justify-center rounded-3xl bg-red-50">
          <Sparkles color={colors.primary} size={30} strokeWidth={2.5} />
        </View>
        <View className="gap-4">
          <Text className="text-[34px] font-bold leading-[40px] text-app-text">Turn meetings into decisions.</Text>
          <Text className="text-base leading-6 text-app-muted">
            Record conversations, generate summaries, extract tasks, and keep every decision searchable.
          </Text>
        </View>
        <View className="flex-row flex-wrap gap-2">
          <AIChip active label="Summaries" />
          <AIChip label="Tasks" />
          <AIChip label="Transcript search" />
        </View>
      </View>
      <AppButton
        icon={ArrowRight}
        rightIcon={ArrowRight}
        onPress={() => {
          completeOnboarding();
          router.replace("/microphone-permission");
        }}
      >
        Continue
      </AppButton>
    </AppScreen>
  );
}
