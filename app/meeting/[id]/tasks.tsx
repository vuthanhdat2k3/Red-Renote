import { router, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";

import { MeetingDetailNav } from "@/components/meeting/MeetingDetailNav";
import { MeetingHomeAction } from "@/components/meeting/MeetingHomeAction";
import { TaskCard } from "@/components/meeting/TaskCard";
import { AppHeader } from "@/components/shell/AppHeader";
import { AppScreen } from "@/components/ui/AppScreen";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { useMeetingTasks } from "@/hooks/useMeetingData";

export default function MeetingTasksRoute() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const meetingId = id ?? "meeting-demo";
  const tasks = useMeetingTasks(meetingId);

  return (
    <AppScreen contentClassName="gap-5">
      <AppHeader showBackButton onBackPress={() => router.back()} rightAction={<MeetingHomeAction />} title={t("meeting.tasks")} subtitle={meetingId} />
      <MeetingDetailNav activeTab="tasks" meetingId={meetingId} />
      <SectionTitle title={t("common.ai_action_items")} subtitle={t("common.action_item_desc")} />
      {tasks.map((task) => <TaskCard key={task.id} {...task} />)}
    </AppScreen>
  );
}
