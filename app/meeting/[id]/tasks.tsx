import { router, useLocalSearchParams } from "expo-router";

import { MeetingDetailNav } from "@/components/meeting/MeetingDetailNav";
import { TaskCard } from "@/components/meeting/TaskCard";
import { AppHeader } from "@/components/shell/AppHeader";
import { AppScreen } from "@/components/ui/AppScreen";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { tasks } from "@/data/mock";

export default function MeetingTasksRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const meetingId = id ?? "meeting-demo";

  return (
    <AppScreen contentClassName="gap-5">
      <AppHeader showBackButton onBackPress={() => router.back()} title="Meeting Tasks" subtitle={meetingId} />
      <MeetingDetailNav activeTab="tasks" meetingId={meetingId} />
      <SectionTitle title="AI action items" subtitle="Owners and timestamps are mocked for now." />
      {tasks.map((task) => (
        <TaskCard key={task.id} {...task} />
      ))}
    </AppScreen>
  );
}
