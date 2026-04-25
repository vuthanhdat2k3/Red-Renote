import { CalendarClock, Clock3, UserRound } from "lucide-react-native";
import { Text, View } from "react-native";

import { AppCard } from "@/components/ui/Card";
import { colors } from "@/constants/tokens";
import type { MeetingTask, MeetingTaskStatus } from "@/types/meeting";
import { cn } from "@/lib/cn";

export type TaskCardProps = MeetingTask;

const statusLabel: Record<MeetingTaskStatus, string> = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
  blocked: "Blocked",
};

const statusContainerClass: Record<MeetingTaskStatus, string> = {
  todo: "bg-app-background",
  in_progress: "bg-red-50",
  done: "bg-emerald-50",
  blocked: "bg-amber-50",
};

const statusTextClass: Record<MeetingTaskStatus, string> = {
  todo: "text-app-muted",
  in_progress: "text-brand-primary",
  done: "text-emerald-700",
  blocked: "text-amber-700",
};

export function TaskCard({ title, owner, deadline, status, sourceTimestamp }: TaskCardProps) {
  return (
    <AppCard className="gap-4">
      <View className="flex-row items-start justify-between gap-3">
        <Text className="flex-1 text-[16px] font-bold leading-6 text-app-text">{title}</Text>
        <View className={cn("rounded-full px-3 py-1", statusContainerClass[status])}>
          <Text className={cn("text-xs font-semibold", statusTextClass[status])}>{statusLabel[status]}</Text>
        </View>
      </View>
      <View className="gap-2">
        <View className="flex-row items-center gap-2">
          <UserRound color={colors.secondaryText} size={15} />
          <Text className="text-sm text-app-muted">{owner}</Text>
        </View>
        <View className="flex-row items-center gap-2">
          <CalendarClock color={colors.secondaryText} size={15} />
          <Text className="text-sm text-app-muted">{deadline}</Text>
        </View>
        <View className="flex-row items-center gap-2">
          <Clock3 color={colors.primary} size={15} />
          <Text className="text-sm font-semibold text-brand-primary">From {sourceTimestamp}</Text>
        </View>
      </View>
    </AppCard>
  );
}
