import { ArrowUpRight, Clock3, FolderKanban, UsersRound } from "lucide-react-native";
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
      className="w-[260px] gap-4 border border-app-border bg-white p-4"
      onPress={onPress}
      style={{ borderRadius: radius.xl, ...shadows.card }}
    >
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1 gap-2">
          <View className="flex-row items-center gap-2">
            <View
              className="rounded-full px-2.5 py-1"
              style={{ backgroundColor: "#FFF1F0" }}
            >
              <Text className="text-[11px] font-semibold" style={{ color: "#8C151B" }}>
                {meeting.date}
              </Text>
            </View>
            <View className="flex-row items-center gap-1">
              <FolderKanban color={colors.secondaryText} size={12} strokeWidth={2.3} />
              <Text className="text-[11px] font-semibold" numberOfLines={1} style={{ color: colors.secondaryText }}>
                {meeting.project}
              </Text>
            </View>
          </View>

          <Text className="text-[16px] font-bold leading-6" numberOfLines={2} style={{ color: colors.text }}>
            {meeting.title}
          </Text>
        </View>

        <View
          className="h-8 w-8 items-center justify-center rounded-full"
          style={{ backgroundColor: "#F4F4F5" }}
        >
          <ArrowUpRight color={colors.text} size={15} strokeWidth={2.4} />
        </View>
      </View>

      <Text className="text-[13px] leading-5" numberOfLines={3} style={{ color: colors.secondaryText }}>
        {meeting.summary}
      </Text>

      <View className="flex-row items-center justify-between border-t border-app-border pt-3">
        <View className="flex-row items-center gap-1.5 rounded-full bg-[#FAFAFA] px-3 py-2">
          <Clock3 color={colors.primary} size={13} strokeWidth={2.3} />
          <Text className="text-[11px] font-semibold" style={{ color: colors.primary }}>
            {meeting.duration}
          </Text>
        </View>
        <View className="flex-row items-center gap-1.5 rounded-full bg-[#FAFAFA] px-3 py-2">
          <UsersRound color={colors.secondaryText} size={13} strokeWidth={2.3} />
          <Text className="text-[11px] font-semibold" style={{ color: colors.secondaryText }}>
            {meeting.participants} people
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
