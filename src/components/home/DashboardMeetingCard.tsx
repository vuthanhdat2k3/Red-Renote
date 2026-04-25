import { ArrowUpRight, Clock3, FolderKanban, UsersRound } from "lucide-react-native";
import { Text, View } from "react-native";

import { colors, radius, shadows } from "@/constants/tokens";
import { PressableScale } from "@/components/ui/PressableScale";
import type { Meeting } from "@/types/meeting";

type DashboardMeetingCardProps = {
  meeting: Meeting;
  onPress: () => void;
};

export function DashboardMeetingCard({ meeting, onPress }: DashboardMeetingCardProps) {
  return (
    <PressableScale
      accessibilityRole="button"
      className="w-[280px] gap-4 border border-app-border bg-white p-5"
      onPress={onPress}
      style={{ borderRadius: radius.xl * 1.2, ...shadows.card }}
      scaleTo={0.97}
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1 gap-2.5">
          <View className="flex-row items-center gap-2">
            <View
              className="rounded-lg px-2 py-1"
              style={{ backgroundColor: "rgba(255, 59, 48, 0.08)" }}
            >
              <Text className="text-[10px] font-bold uppercase tracking-tight" style={{ color: colors.primary }}>
                {meeting.date}
              </Text>
            </View>
            <View className="flex-row items-center gap-1 opacity-60">
              <FolderKanban color={colors.text} size={11} strokeWidth={2.5} />
              <Text className="text-[11px] font-bold" numberOfLines={1} style={{ color: colors.text }}>
                {meeting.project}
              </Text>
            </View>
          </View>

          <Text className="text-[17px] font-bold leading-6 tracking-tight" numberOfLines={2} style={{ color: colors.text }}>
            {meeting.title}
          </Text>
        </View>

        <View
          className="h-9 w-9 items-center justify-center rounded-full border border-app-border/50 bg-app-background"
        >
          <ArrowUpRight color={colors.text} size={16} strokeWidth={2.5} />
        </View>
      </View>

      <Text className="text-[13px] leading-5 opacity-70" numberOfLines={2} style={{ color: colors.secondaryText }}>
        {meeting.summary}
      </Text>

      <View className="flex-row items-center gap-3 pt-1">
        <View className="flex-row items-center gap-1.5 rounded-full bg-app-background px-3 py-1.5 border border-app-border/30">
          <Clock3 color={colors.primary} size={12} strokeWidth={2.5} />
          <Text className="text-[11px] font-bold text-app-text">
            {meeting.duration}
          </Text>
        </View>
        <View className="flex-row items-center gap-1.5 rounded-full bg-app-background px-3 py-1.5 border border-app-border/30">
          <UsersRound color={colors.secondaryText} size={12} strokeWidth={2.5} />
          <Text className="text-[11px] font-bold text-app-muted">
            {meeting.participants}
          </Text>
        </View>
      </View>
    </PressableScale>
  );
}
