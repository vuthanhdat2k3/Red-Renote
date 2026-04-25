import { router } from "expo-router";
import { Sparkles } from "lucide-react-native";
import { Text, View } from "react-native";

import { AppHeader } from "@/components/shell/AppHeader";
import { RecordButton } from "@/components/shell/RecordButton";
import { MeetingCardFromMeeting } from "@/components/meeting/MeetingCard";
import { Button } from "@/components/ui/Button";
import { AppScreen } from "@/components/ui/AppScreen";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StatPill } from "@/components/ui/StatPill";
import { insights, meetings } from "@/data/mock";
import { useAppStore } from "@/store/app-store";

export default function HomeRoute() {
  const startRecording = useAppStore((state) => state.startRecording);

  return (
    <AppScreen>
      <AppHeader title="Red Renote" subtitle="AI meeting workspace" />

      <View className="rounded-[28px] bg-brand-primary p-5">
        <View className="gap-3">
          <Text className="text-[24px] font-bold leading-8 text-white">Ready to capture the next decision?</Text>
          <Text className="text-base leading-6 text-white/80">Record a meeting and let AI prepare summary, tasks, and searchable notes.</Text>
        </View>
        <View className="mt-6 flex-row items-center justify-between">
          <Button
            className="bg-white px-6"
            icon={Sparkles}
            variant="secondary"
            onPress={() => {
              startRecording();
              router.push("/(modals)/recording");
            }}
          >
            New meeting
          </Button>
          <RecordButton
            compact
            onPress={() => {
              startRecording();
              router.push("/(modals)/recording");
            }}
          />
        </View>
      </View>

      <View className="flex-row gap-3">
        {insights.map((insight) => (
          <StatPill key={insight.id} insight={insight} />
        ))}
      </View>

      <View className="gap-3">
        <SectionHeader title="Recent meetings" action="View all" />
        {meetings.map((meeting) => (
          <MeetingCardFromMeeting key={meeting.id} meeting={meeting} />
        ))}
      </View>
    </AppScreen>
  );
}
