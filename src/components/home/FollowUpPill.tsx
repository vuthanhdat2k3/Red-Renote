import { ArrowUpRight } from "lucide-react-native";
import { Text } from "react-native";

import { PressableScale } from "@/components/ui/PressableScale";
import { colors, radius } from "@/constants/tokens";

type FollowUpPillProps = {
  label: string;
  onPress?: () => void;
};

export function FollowUpPill({ label, onPress }: FollowUpPillProps) {
  return (
    <PressableScale
      accessibilityRole="button"
      className="mr-2 flex-row items-center gap-2 border border-[#F4D4D7] bg-[#FFF7F6] px-3 py-2.5"
      onPress={onPress}
      style={{ borderRadius: radius.pill }}
      scaleTo={0.97}
    >
      <Text className="max-w-[220px] text-[12px] font-semibold" numberOfLines={1} style={{ color: "#8C151B" }}>
        {label}
      </Text>
      <ArrowUpRight color={colors.primary} size={13} strokeWidth={2.4} />
    </PressableScale>
  );
}
