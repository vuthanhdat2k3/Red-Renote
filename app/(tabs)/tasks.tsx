import { ClipboardList } from "lucide-react-native";
import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { TaskCard } from "@/components/meeting/TaskCard";
import { AppScreen } from "@/components/ui/AppScreen";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { colors } from "@/constants/tokens";
import { useMeetingTasks } from "@/hooks/useMeetingData";

export default function TasksRoute() {
  const { t } = useTranslation();
  const tasks = useMeetingTasks();
  const openTasks = tasks.filter((task) => task.status !== "done");
  const pendingTasks = tasks.filter((task) => task.status === "pending");
  const inProgressTasks = tasks.filter((task) => task.status === "in_progress");
  const completedTasks = tasks.filter((task) => task.status === "done");
  const progress = tasks.length > 0 ? completedTasks.length / tasks.length : 0;
  const progressPercent = Math.round(progress * 100);

  return (
    <AppScreen contentClassName="gap-8 pt-4">
      <View className="absolute top-0 right-0 h-64 w-64 rounded-full bg-emerald-100 opacity-20 -mr-20 -mt-20 blur-3xl" />
      <View className="px-6 gap-6">
        <View className="flex-row items-center justify-between">
          <View className="h-10 w-10 items-center justify-center rounded-full bg-emerald-50 border border-emerald-100">
            <ClipboardList color={colors.success} size={18} strokeWidth={2.5} />
          </View>
          <View className="px-3 py-1.5 rounded-full bg-emerald-500 border border-emerald-400">
            <Text className="text-[11px] font-bold text-white uppercase tracking-wider">{progressPercent}% {t("tasks.percent_done")}</Text>
          </View>
        </View>
        <View className="gap-2">
          <Text className="text-[34px] font-extrabold tracking-tight text-app-text leading-[40px]">
            {t("tasks.action_items")}
          </Text>
          <Text className="text-[15px] leading-6 text-app-muted font-medium max-w-[90%]">
            {t("tasks.track_follow_ups")}
          </Text>
        </View>
        <View className="gap-4">
          <View className="h-3 w-full rounded-full bg-emerald-100/50 overflow-hidden">
            <View className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.max(progressPercent, 5)}%` }} />
          </View>
          <View className="flex-row gap-3">
            <View className="flex-1 bg-blue-50/50 rounded-2xl p-4 border border-blue-100">
              <Text className="text-[20px] font-extrabold text-blue-700">{inProgressTasks.length}</Text>
              <Text className="text-[11px] font-bold text-blue-600/70 uppercase tracking-widest mt-1">{t("common.active")}</Text>
            </View>
            <View className="flex-1 bg-amber-50/50 rounded-2xl p-4 border border-amber-100">
              <Text className="text-[20px] font-extrabold text-amber-700">{pendingTasks.length}</Text>
              <Text className="text-[11px] font-bold text-amber-600/70 uppercase tracking-widest mt-1">{t("common.pending")}</Text>
            </View>
          </View>
        </View>
      </View>
      <View className="gap-6 px-6 pb-10">
        <View className="gap-4">
          <SectionTitle title={t("tasks.active_tasks")} action={`${openTasks.length} ${t("common.open_tasks")}`} />
          <View className="gap-3">
            {openTasks.map((task) => <TaskCard key={task.id} {...task} />)}
          </View>
        </View>
        <View className="gap-4">
          <SectionTitle title={t("tasks.completed")} />
          <View className="gap-3 opacity-60">
            {completedTasks.map((task) => <TaskCard key={task.id} {...task} />)}
          </View>
        </View>
      </View>
    </AppScreen>
  );
}
