import { Mic } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { colors, shadows } from "@/constants/tokens";

type RecordButtonProps = {
  onPress?: () => void;
  compact?: boolean;
};

export function RecordButton({ onPress, compact }: RecordButtonProps) {
  return (
    <Pressable
      accessibilityLabel="Start recording"
      accessibilityRole="button"
      className={compact ? "items-center" : "items-center gap-3"}
      onPress={onPress}
    >
      <View className="h-16 w-16 items-center justify-center rounded-full bg-brand-primary" style={shadows.redGlow}>
        <Mic color={colors.surface} size={28} strokeWidth={2.4} />
      </View>
      {compact ? null : <Text className="text-sm font-semibold text-brand-primary">Start meeting</Text>}
    </Pressable>
  );
}
