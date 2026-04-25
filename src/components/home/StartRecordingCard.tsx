import { ArrowRight, Mic, Sparkles, Waves } from "lucide-react-native";
import { Text, View } from "react-native";

import { colors, shadows } from "@/constants/tokens";
import { PressableScale } from "@/components/ui/PressableScale";

type StartRecordingCardProps = {
  onPress: () => void;
};

export function StartRecordingCard({ onPress }: StartRecordingCardProps) {
  return (
    <View
      className="overflow-hidden bg-white p-6 border border-app-border shadow-sm"
      style={{ borderRadius: 28 }}
    >
      <View className="absolute right-0 top-0 h-40 w-40 rounded-full bg-[#FFF1F0] opacity-60 -mr-10 -mt-10" />
      <View className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-[#F0F7FF] opacity-60 -ml-10 -mb-10" />

      <View className="gap-4">
        <View className="flex-row items-center gap-3">
          <View
            className="h-10 w-10 items-center justify-center rounded-full bg-red-50 border border-[#FFE1DA]"
          >
            <Sparkles color={colors.primary} size={18} strokeWidth={2.5} />
          </View>
          <Text className="text-[13px] font-bold uppercase tracking-wider text-brand-primary">
            AI Assistant Ready
          </Text>
        </View>

        <View className="gap-2 mt-1">
          <Text className="text-[24px] font-extrabold leading-8 text-app-text pr-4">
            Capture your next meeting live.
          </Text>

          <Text className="text-[15px] leading-6 text-app-muted pr-2">
            Record audio to instantly generate summaries, exact tasks, and perfectly formatted follow-ups.
          </Text>
        </View>

        <View className="flex-row items-center gap-2 mt-2">
          <View className="rounded-full px-3 py-1.5 bg-[#FFF1F0] border border-[#FFE1DA]">
            <Text className="text-[12px] font-bold text-[#8C151B]">
              Live transcript
            </Text>
          </View>
          <View className="rounded-full px-3 py-1.5 bg-app-background border border-app-border">
            <Text className="text-[12px] font-bold text-app-text">
              Auto-extraction
            </Text>
          </View>
        </View>
      </View>

      <PressableScale
        accessibilityLabel="Start recording"
        accessibilityRole="button"
        className="mt-8 flex-row items-center justify-between px-5 py-4"
        onPress={onPress}
        style={{
          borderRadius: 20,
          backgroundColor: colors.primary,
          ...shadows.redGlow,
        }}
        scaleTo={0.97}
      >
        <View className="flex-row items-center gap-3.5">
          <View className="h-10 w-10 items-center justify-center rounded-full bg-white/20">
            <Mic color={colors.surface} size={20} strokeWidth={2.5} />
          </View>
          <View>
            <Text className="text-[16px] font-bold text-white">Start Recording</Text>
            <Text className="text-[13px] font-medium text-white/80">Tap to begin session</Text>
          </View>
        </View>
        <ArrowRight color={colors.surface} size={20} strokeWidth={2.5} />
      </PressableScale>
    </View>
  );
}
