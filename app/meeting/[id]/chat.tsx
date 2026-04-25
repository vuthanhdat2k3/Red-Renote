import { router, useLocalSearchParams } from "expo-router";
import { SendHorizonal } from "lucide-react-native";
import { Text, View } from "react-native";

import { MeetingDetailNav } from "@/components/meeting/MeetingDetailNav";
import { AppHeader } from "@/components/shell/AppHeader";
import { AIChip } from "@/components/ui/AIChip";
import { AppButton } from "@/components/ui/Button";
import { AppCard } from "@/components/ui/Card";
import { AppScreen } from "@/components/ui/AppScreen";

export default function MeetingChatRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const meetingId = id ?? "meeting-demo";

  return (
    <AppScreen contentClassName="gap-5">
      <AppHeader showBackButton onBackPress={() => router.back()} title="AI Chat" subtitle={meetingId} />
      <MeetingDetailNav activeTab="chat" meetingId={meetingId} />
      <View className="flex-row flex-wrap gap-2">
        <AIChip active label="What changed?" />
        <AIChip label="Open risks" />
        <AIChip label="Next steps" />
      </View>
      <AppCard className="gap-2">
        <Text className="text-xs font-semibold uppercase tracking-[1px] text-brand-primary">AI assistant</Text>
        <Text className="text-[15px] leading-6 text-app-text">
          The highest priority follow-up is onboarding risk for renewal accounts. Start with owners assigned in the tasks tab.
        </Text>
      </AppCard>
      <AppButton icon={SendHorizonal}>Send mock question</AppButton>
    </AppScreen>
  );
}
