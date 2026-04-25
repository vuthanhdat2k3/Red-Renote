import { CheckSquare, Square } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { colors } from "@/constants/tokens";
import type { Task } from "@/types/meeting";

type DashboardTaskRowProps = {
  task: Task;
  onPress: () => void;
};

export function DashboardTaskRow({ task, onPress }: DashboardTaskRowProps) {
  const isDone = task.status === "done";

  return (
    <Pressable accessibilityRole="button" className="flex-row gap-3 py-2" onPress={onPress}>
      {isDone ? (
        <CheckSquare color={colors.success} size={18} strokeWidth={2.2} />
      ) : (
        <Square color={colors.softRed} size={18} strokeWidth={2.2} />
      )}
      <View className="flex-1 gap-1">
        <Text className="text-[14px] font-semibold leading-5" numberOfLines={2} style={{ color: colors.text }}>
          {task.title}
        </Text>
        <Text className="text-[12px]" style={{ color: colors.secondaryText }}>
          {task.owner} - Due {task.deadline}
        </Text>
      </View>
    </Pressable>
  );
}
