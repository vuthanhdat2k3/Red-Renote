import { router, useLocalSearchParams } from "expo-router";
import { MessageCircle } from "lucide-react-native";
import { Text, View } from "react-native";

import { MeetingDetailNav } from "@/components/meeting/MeetingDetailNav";
import { AppHeader } from "@/components/shell/AppHeader";
import { AIChip } from "@/components/ui/AIChip";
import { AppButton } from "@/components/ui/Button";
import { AppCard } from "@/components/ui/Card";
import { AppScreen } from "@/components/ui/AppScreen";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { useMeeting } from "@/hooks/useMeetingData";

export default function MeetingSummaryRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const meetingId = id ?? "meeting-demo";
  const meeting = useMeeting(meetingId);

  return (
    <AppScreen contentClassName="gap-6">
      <AppHeader showBackButton onBackPress={() => router.replace("/(tabs)/home")} title="Meeting Summary" subtitle={meetingId} />
      <MeetingDetailNav activeTab="summary" meetingId={meetingId} />
      <AppCard className="gap-4" padding="lg">
        <View className="flex-row flex-wrap gap-2">
          <AIChip active label="AI summary" />
          <AIChip label={`${meeting.decisions.length} decisions`} />
          <AIChip label={`${meeting.tasks.length} tasks`} />
        </View>
        <Text className="text-[22px] font-bold leading-7 text-app-text">{meeting.title}</Text>
        <Text className="text-sm font-semibold text-brand-primary">{meeting.project}</Text>
        <Text className="text-[15px] leading-6 text-app-muted">{meeting.summary}</Text>
      </AppCard>
      <View className="gap-3">
        <SectionTitle title="Key takeaways" />
        {meeting.keyTakeaways.map((item) => (
          <AppCard key={item}>
            <Text className="text-[15px] font-semibold leading-6 text-app-text">{item}</Text>
          </AppCard>
        ))}
      </View>
      <View className="gap-3">
        <SectionTitle title="Key decisions" />
        {meeting.decisions.map((item) => (
          <AppCard key={item}>
            <Text className="text-[15px] font-semibold leading-6 text-app-text">{item}</Text>
          </AppCard>
        ))}
      </View>
      <AppButton
        icon={MessageCircle}
        variant="secondary"
        onPress={() => router.push({ pathname: "/meeting/[id]/chat", params: { id: meetingId } })}
      >
        Ask AI about this meeting
      </AppButton>
    </AppScreen>
  );
}
