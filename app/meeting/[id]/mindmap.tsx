import { router, useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { MeetingDetailNav } from "@/components/meeting/MeetingDetailNav";
import { MeetingHomeAction } from "@/components/meeting/MeetingHomeAction";
import { AppHeader } from "@/components/shell/AppHeader";
import { AppCard } from "@/components/ui/Card";
import { AppScreen } from "@/components/ui/AppScreen";
import { useMeeting } from "@/hooks/useMeetingData";
import type { MindmapNode } from "@/types/meeting";

function getNodeChildren(node: MindmapNode) {
  return Array.isArray(node.children) ? node.children : [];
}

function renderNode(node: MindmapNode, level = 0) {
  const children = getNodeChildren(node);

  return (
    <View className="gap-2" key={node.id} style={{ marginLeft: level * 14 }}>
      <View className={level === 0 ? "rounded-full bg-brand-primary px-5 py-3" : "rounded-2xl border border-app-border bg-red-50 px-4 py-3"}>
        <Text className={level === 0 ? "text-center text-base font-bold text-white" : "text-sm font-semibold text-brand-primary"}>{node.label}</Text>
      </View>
      {children.map((child) => renderNode(child, level + 1))}
    </View>
  );
}

export default function MeetingMindmapRoute() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const meetingId = id ?? "meeting-demo";
  const meeting = useMeeting(meetingId);

  return (
    <AppScreen contentClassName="gap-5">
      <AppHeader showBackButton onBackPress={() => router.back()} rightAction={<MeetingHomeAction />} title={t("meeting.mindmap")} subtitle={meetingId} />
      <MeetingDetailNav activeTab="mindmap" meetingId={meetingId} />
      <AppCard className="gap-3 py-5">{renderNode(meeting.mindmap)}</AppCard>
    </AppScreen>
  );
}
