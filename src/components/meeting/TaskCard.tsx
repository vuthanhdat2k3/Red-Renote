import { CalendarClock, CheckCircle2, Clock3, Circle, Timer, UserRound } from "lucide-react-native";
import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { AppCard } from "@/components/ui/Card";
import { colors } from "@/constants/tokens";
import type { Task, TaskStatus } from "@/types/meeting";
import { cn } from "@/lib/cn";

export type TaskCardProps = Task;

const statusContainerClass: Record<TaskStatus, string> = {
  pending: "bg-app-background",
  in_progress: "bg-blue-50",
  done: "bg-emerald-50",
};

const statusTextClass: Record<TaskStatus, string> = {
  pending: "text-app-muted",
  in_progress: "text-blue-700",
  done: "text-emerald-700",
};

const statusIconColor: Record<TaskStatus, string> = {
  pending: colors.secondaryText,
  in_progress: colors.blue,
  done: colors.success,
};

export function TaskCard({ title, owner, deadline, status, sourceTimestamp }: TaskCardProps) {
  const { t } = useTranslation();
  const StatusIcon = status === "done" ? CheckCircle2 : status === "in_progress" ? Timer : Circle;

  const statusLabel: Record<TaskStatus, string> = {
    pending: t("tasks.pending"),
    in_progress: t("tasks.in_progress"),
    done: t("tasks.done"),
  };

  return (
    <AppCard className="gap-4">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-row flex-1 items-start gap-3">
          <View className="mt-0.5 h-8 w-8 items-center justify-center rounded-xl" style={{ backgroundColor: status === "done" ? colors.softGreen : status === "in_progress" ? colors.softBlue : "#F4F4F5" }}>
            <StatusIcon color={statusIconColor[status]} size={17} strokeWidth={2.5} />
          </View>
          <Text className="flex-1 text-[16px] font-bold leading-6 text-app-text">{title}</Text>
        </View>
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
          <Text className="text-sm font-semibold text-brand-primary">{t("tasks.from")} {sourceTimestamp}</Text>
        </View>
      </View>
    </AppCard>
  );
}
