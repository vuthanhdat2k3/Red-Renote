import { router, useLocalSearchParams } from "expo-router";
import { CheckCircle2, Lightbulb, MessageCircle } from "lucide-react-native";
import { Text, View } from "react-native";

import { MeetingDetailNav } from "@/components/meeting/MeetingDetailNav";
import { MeetingHomeAction } from "@/components/meeting/MeetingHomeAction";
import { AppHeader } from "@/components/shell/AppHeader";
import { AIChip } from "@/components/ui/AIChip";
import { AppButton } from "@/components/ui/Button";
import { AppCard } from "@/components/ui/Card";
import { AppScreen } from "@/components/ui/AppScreen";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { useMeeting } from "@/hooks/useMeetingData";
import { colors } from "@/constants/tokens";

export default function MeetingSummaryRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const meetingId = id ?? "meeting-demo";
  const meeting = useMeeting(meetingId);

  return (
    <AppScreen contentClassName="gap-6">
      <AppHeader
        showBackButton
        onBackPress={() => router.replace("/(tabs)/home")}
        rightAction={<MeetingHomeAction />}
        title="Meeting Summary"
        subtitle={meetingId}
      />
      <MeetingDetailNav activeTab="summary" meetingId={meetingId} />
      
      <AppCard className="gap-4 border-none bg-white" padding="lg">
        <View className="flex-row flex-wrap gap-2">
          <AIChip active label="AI summary" />
          <AIChip label={`${meeting.decisions.length} decisions`} />
          <AIChip label={`${meeting.tasks.length} tasks`} />
        </View>
        <View className="gap-2">
          <Text className="text-xs font-bold uppercase tracking-wider text-brand-primary">{meeting.project}</Text>
          <Text className="text-[24px] font-extrabold leading-8 text-app-text">{meeting.title}</Text>
        </View>
        <View className="h-[1px] w-full bg-app-border/50" />
        <Text className="text-[15px] leading-6 text-app-muted">{meeting.summary}</Text>
      </AppCard>

      <View className="gap-4">
        <SectionTitle title="Key takeaways" />
        <View className="gap-3">
          {meeting.keyTakeaways.map((item) => (
            <View key={item} className="flex-row gap-3 rounded-2xl bg-blue-50/50 p-4 border border-blue-100/50">
              <View className="mt-0.5 h-6 w-6 items-center justify-center rounded-full bg-blue-100">
                <Lightbulb color={colors.blue} size={14} strokeWidth={2.5} />
              </View>
              <Text className="flex-1 text-[15px] font-medium leading-6 text-app-text">{item}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className="gap-4">
        <SectionTitle title="Key decisions" />
        <View className="gap-3">
          {meeting.decisions.map((item) => (
            <View key={item} className="flex-row gap-3 rounded-2xl bg-emerald-50/50 p-4 border border-emerald-100/50">
              <View className="mt-0.5 h-6 w-6 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle2 color={colors.success} size={14} strokeWidth={2.5} />
              </View>
              <Text className="flex-1 text-[15px] font-medium leading-6 text-app-text">{item}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className="pb-8">
        <AppButton
          icon={MessageCircle}
          variant="secondary"
          className="border-brand-primary/20 bg-red-50/30"
          textClassName="text-brand-primary"
          onPress={() => router.push({ pathname: "/meeting/[id]/chat", params: { id: meetingId } })}
        >
          Ask AI about this meeting
        </AppButton>
      </View>
    </AppScreen>
  );
}
