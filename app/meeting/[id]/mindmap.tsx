import { router, useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

import { MeetingDetailNav } from "@/components/meeting/MeetingDetailNav";
import { AppHeader } from "@/components/shell/AppHeader";
import { AppCard } from "@/components/ui/Card";
import { AppScreen } from "@/components/ui/AppScreen";

const nodes = ["Growth", "Onboarding", "Pricing", "Renewals", "Tasks"];

export default function MeetingMindmapRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const meetingId = id ?? "meeting-demo";

  return (
    <AppScreen contentClassName="gap-5">
      <AppHeader showBackButton onBackPress={() => router.back()} title="Mindmap" subtitle={meetingId} />
      <MeetingDetailNav activeTab="mindmap" meetingId={meetingId} />
      <AppCard className="items-center gap-5 py-8">
        <View className="h-24 w-24 items-center justify-center rounded-full bg-brand-primary">
          <Text className="text-center text-base font-bold text-white">Q2 Review</Text>
        </View>
        <View className="flex-row flex-wrap justify-center gap-3">
          {nodes.map((node) => (
            <View className="rounded-full border border-app-border bg-red-50 px-4 py-2" key={node}>
              <Text className="text-sm font-semibold text-brand-primary">{node}</Text>
            </View>
          ))}
        </View>
      </AppCard>
    </AppScreen>
  );
}
