import { ArrowUpRight, CheckSquare, Square } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { colors } from "@/constants/tokens";
import type { Task } from "@/types/meeting";

type DashboardTaskRowProps = {
  task: Task;
  onPress: () => void;
};

export function DashboardTaskRow({ task, onPress }: DashboardTaskRowProps) {
  const isDone = task.status === "done";
  const isInProgress = task.status === "in_progress";

  return (
    <Pressable
      accessibilityRole="button"
      className="flex-row items-start gap-3 rounded-[20px] border border-app-border bg-white px-4 py-3"
      onPress={onPress}
    >
      <View className="pt-0.5">
        {isDone ? (
          <CheckSquare color={colors.success} size={18} strokeWidth={2.2} />
        ) : (
          <Square color={isInProgress ? colors.warning : colors.softRed} size={18} strokeWidth={2.2} />
        )}
      </View>

      <View className="flex-1 gap-2">
        <Text className="text-[14px] font-semibold leading-5" numberOfLines={2} style={{ color: colors.text }}>
          {task.title}
        </Text>
        <View className="flex-row flex-wrap items-center gap-2">
          <View className="rounded-full bg-[#F4F4F5] px-2.5 py-1">
            <Text className="text-[11px] font-semibold" style={{ color: colors.text }}>
              {task.owner}
            </Text>
          </View>
          <Text className="text-[12px]" style={{ color: colors.secondaryText }}>
            Due {task.deadline}
          </Text>
        </View>
      </View>

      <View className="pt-1">
        <ArrowUpRight color={colors.secondaryText} size={15} strokeWidth={2.3} />
      </View>
    </Pressable>
  );
}
