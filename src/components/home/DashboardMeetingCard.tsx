import { Clock3, UsersRound } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { colors, radius, shadows } from "@/constants/tokens";
import type { Meeting } from "@/types/meeting";

type DashboardMeetingCardProps = {
  meeting: Meeting;
  onPress: () => void;
};

export function DashboardMeetingCard({ meeting, onPress }: DashboardMeetingCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      className="w-[230px] gap-3 bg-white p-4"
      onPress={onPress}
      style={{ borderRadius: radius.xl, ...shadows.card }}
    >
      <View className="gap-1">
        <Text className="text-[15px] font-bold leading-5" numberOfLines={2} style={{ color: colors.text }}>
          {meeting.title}
        </Text>
        <Text className="text-[12px] font-semibold" style={{ color: colors.primary }}>
          {meeting.date}
        </Text>
      </View>

      <Text className="text-[13px] leading-5" numberOfLines={3} style={{ color: colors.secondaryText }}>
        {meeting.summary}
      </Text>

      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-1.5">
          <Clock3 color={colors.primary} size={13} strokeWidth={2.3} />
          <Text className="text-[11px] font-semibold" style={{ color: colors.primary }}>
            {meeting.duration}
          </Text>
        </View>
        <View className="flex-row items-center gap-1.5">
          <UsersRound color={colors.secondaryText} size={13} strokeWidth={2.3} />
          <Text className="text-[11px] font-semibold" style={{ color: colors.secondaryText }}>
            {meeting.participants}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
