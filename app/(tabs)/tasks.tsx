import { ClipboardList } from "lucide-react-native";
import { Text, View } from "react-native";

import { TaskCard } from "@/components/meeting/TaskCard";
import { AppHeader } from "@/components/shell/AppHeader";
import { AppScreen } from "@/components/ui/AppScreen";
import { Card } from "@/components/ui/Card";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { useMeetingTasks } from "@/hooks/useMeetingData";

export default function TasksRoute() {
  const tasks = useMeetingTasks();
  const openTasks = tasks.filter((task) => task.status !== "done");
  const completedTasks = tasks.filter((task) => task.status === "done");

  return (
    <AppScreen contentClassName="gap-5">
      <AppHeader title="Tasks" subtitle="Meeting follow-ups" />
      <Card className="gap-4">
        <View className="h-12 w-12 items-center justify-center rounded-2xl bg-red-50">
          <ClipboardList color="#E50914" size={24} strokeWidth={2.4} />
        </View>
        <View className="gap-2">
          <Text className="text-[20px] font-bold text-app-text">{openTasks.length} open action items</Text>
          <Text className="text-base leading-6 text-app-muted">
            Track owners, deadlines, source timestamps, and AI-generated follow-ups across meetings.
          </Text>
        </View>
      </Card>
      <View className="gap-3">
        <SectionTitle title="Open" />
        {openTasks.map((task) => (
          <TaskCard key={task.id} {...task} />
        ))}
      </View>
      <View className="gap-3">
        <SectionTitle title="Completed" />
        {completedTasks.map((task) => (
          <TaskCard key={task.id} {...task} />
        ))}
      </View>
    </AppScreen>
  );
}
