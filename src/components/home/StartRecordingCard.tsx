import { Mic, Sparkles } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { colors, radius, shadows } from "@/constants/tokens";

type StartRecordingCardProps = {
  onPress: () => void;
};

export function StartRecordingCard({ onPress }: StartRecordingCardProps) {
  return (
    <View
      className="items-center gap-5 bg-white px-5 py-7"
      style={{ borderRadius: radius.xl + 4, ...shadows.card }}
    >
      <View className="flex-row items-center gap-2">
        <Sparkles color={colors.primary} size={16} strokeWidth={2.5} />
        <Text className="text-[16px] font-semibold" style={{ color: colors.text }}>
          Capture Insights
        </Text>
      </View>

      <Pressable
        accessibilityLabel="Start recording"
        accessibilityRole="button"
        className="h-[104px] w-[104px] items-center justify-center"
        onPress={onPress}
        style={{
          borderRadius: 52,
          backgroundColor: colors.primary,
          ...shadows.redGlow,
        }}
      >
        <View className="mb-2 h-5 w-5 items-center justify-center rounded-full bg-white">
          <Mic color={colors.primary} size={12} strokeWidth={3} />
        </View>
        <Text className="text-[12px] font-bold text-white">Record</Text>
      </Pressable>
    </View>
  );
}
