import { ArrowRight, Mic, Sparkles, Waves } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { colors, radius, shadows } from "@/constants/tokens";

type StartRecordingCardProps = {
  onPress: () => void;
};

export function StartRecordingCard({ onPress }: StartRecordingCardProps) {
  return (
    <View
      className="overflow-hidden border border-[#F4D4D7] bg-white px-5 py-5"
      style={{ borderRadius: radius.xl + 4, ...shadows.card }}
    >
      <View
        className="absolute -right-10 -top-12 h-36 w-36 rounded-full"
        style={{ backgroundColor: "#FFF1F0" }}
      />
      <View
        className="absolute -bottom-10 -left-8 h-28 w-28 rounded-full"
        style={{ backgroundColor: "#FFF7ED" }}
      />

      <View className="gap-5">
        <View className="flex-row items-start justify-between gap-4">
          <View className="flex-1 gap-2">
            <View className="flex-row items-center gap-2">
              <View
                className="h-8 w-8 items-center justify-center"
                style={{ borderRadius: radius.md, backgroundColor: "#FFF1F0" }}
              >
                <Sparkles color={colors.primary} size={16} strokeWidth={2.5} />
              </View>
              <Text className="text-[13px] font-semibold uppercase tracking-[0.8px]" style={{ color: colors.primary }}>
                Start Recording
              </Text>
            </View>

            <Text className="text-[24px] font-bold leading-8" style={{ color: colors.text }}>
              Capture the next meeting before the action items disappear.
            </Text>

            <Text className="text-[14px] leading-6" style={{ color: colors.secondaryText }}>
              Record live audio, generate the summary, and surface tasks and follow-ups in one flow.
            </Text>
          </View>

          <View
            className="h-14 w-14 items-center justify-center"
            style={{ borderRadius: 20, backgroundColor: colors.text }}
          >
            <Waves color={colors.surface} size={22} strokeWidth={2.1} />
          </View>
        </View>

        <View className="flex-row items-center gap-2">
          <View
            className="rounded-full px-3 py-2"
            style={{ backgroundColor: "#FFF1F0" }}
          >
            <Text className="text-[12px] font-semibold" style={{ color: "#8C151B" }}>
              Live transcript
            </Text>
          </View>
          <View
            className="rounded-full px-3 py-2"
            style={{ backgroundColor: "#F4F4F5" }}
          >
            <Text className="text-[12px] font-semibold" style={{ color: colors.text }}>
              AI task extraction
            </Text>
          </View>
        </View>
      </View>

      <Pressable
        accessibilityLabel="Start recording"
        accessibilityRole="button"
        className="mt-5 flex-row items-center justify-between px-5 py-4"
        onPress={onPress}
        style={{
          borderRadius: radius.xl,
          backgroundColor: colors.primary,
          ...shadows.redGlow,
        }}
      >
        <View className="flex-row items-center gap-3">
          <View className="h-10 w-10 items-center justify-center rounded-full bg-white/15">
            <Mic color={colors.surface} size={18} strokeWidth={2.5} />
          </View>
          <View>
            <Text className="text-[16px] font-bold text-white">Start Recording</Text>
            <Text className="text-[12px] text-white/80">Open live recording</Text>
          </View>
        </View>
        <ArrowRight color={colors.surface} size={18} strokeWidth={2.5} />
      </Pressable>
    </View>
  );
}
