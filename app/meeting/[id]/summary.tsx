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

export default function MeetingSummaryRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const meetingId = id ?? "meeting-demo";

  return (
    <AppScreen contentClassName="gap-6">
      <AppHeader showBackButton onBackPress={() => router.replace("/(tabs)/home")} title="Meeting Summary" subtitle={meetingId} />
      <MeetingDetailNav activeTab="summary" meetingId={meetingId} />
      <AppCard className="gap-4" padding="lg">
        <View className="flex-row flex-wrap gap-2">
          <AIChip active label="AI summary" />
          <AIChip label="6 decisions" />
          <AIChip label="4 tasks" />
        </View>
        <Text className="text-[22px] font-bold leading-7 text-app-text">Q2 Growth Review</Text>
        <Text className="text-[15px] leading-6 text-app-muted">
          The team aligned on onboarding risk, pricing experiments, and a faster follow-up loop for enterprise accounts.
        </Text>
      </AppCard>
      <View className="gap-3">
        <SectionTitle title="Key decisions" />
        {["Separate pricing experiment from onboarding work", "Prioritize renewal-risk accounts this week", "Review task ownership in Friday standup"].map((item) => (
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
