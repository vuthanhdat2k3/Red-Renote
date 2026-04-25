import { router } from "expo-router";
import type { Href } from "expo-router";
import { ArrowRight } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { BrandMark } from "@/components/launch/BrandMark";
import { EntryPrimaryButton } from "@/components/launch/EntryPrimaryButton";
import { OnboardingArtwork } from "@/components/launch/OnboardingArtwork";
import { AppScreen } from "@/components/ui/AppScreen";
import { colors, spacing } from "@/constants/tokens";
import { useAppStore } from "@/store/app-store";

export default function OnboardingRoute() {
  const completeOnboarding = useAppStore((state) => state.completeOnboarding);

  return (
    <AppScreen scroll={false} contentClassName="justify-between pb-10 pt-5">
      <View className="items-center gap-8">
        <BrandMark compact />
        <View className="w-full px-3">
          <OnboardingArtwork />
        </View>
        <View className="gap-4 px-2">
          <Text
            className="text-center text-[26px] font-bold leading-[36px] tracking-[-0.6px]"
            style={{ color: colors.text }}
          >
            Turn every meeting into{"\n"}notes, summaries, tasks,{"\n"}and answers.
          </Text>
          <Text
            className="text-center text-[15px] leading-6"
            style={{ color: colors.secondaryText }}
          >
            Capture conversations once, then let Red Renote organize the follow-up for you.
          </Text>
        </View>
      </View>

      <View className="gap-5" style={{ marginBottom: spacing.md }}>
        <EntryPrimaryButton
          icon={ArrowRight}
          onPress={() => {
            completeOnboarding();
            router.replace("/register" as Href);
          }}
        >
          Get Started
        </EntryPrimaryButton>
        <Pressable
          accessibilityLabel="I already have an account"
          accessibilityRole="button"
          className="items-center justify-center py-2"
          onPress={() => {
            completeOnboarding();
            router.replace("/login" as Href);
          }}
        >
          <Text className="text-center text-[13px] font-semibold" style={{ color: colors.primary }}>
            I already have an account
          </Text>
        </Pressable>
      </View>
    </AppScreen>
  );
}
