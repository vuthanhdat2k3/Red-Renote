import { router, useLocalSearchParams } from "expo-router";
import { Brain, Sparkles } from "lucide-react-native";
import { useEffect } from "react";
import { Text, View } from "react-native";

import { AppHeader } from "@/components/shell/AppHeader";
import { AppButton } from "@/components/ui/Button";
import { AppScreen } from "@/components/ui/AppScreen";
import { LoadingStep } from "@/components/ui/LoadingStep";
import { colors } from "@/constants/tokens";
import { useAppStore } from "@/store/app-store";

export default function ProcessingRoute() {
  const { recordingId } = useLocalSearchParams<{ recordingId: string }>();
  const completeProcessing = useAppStore((state) => state.completeProcessing);

  useEffect(() => {
    if (!recordingId) {
      return;
    }

    const timer = setTimeout(() => {
      const meetingId = completeProcessing(recordingId);
      router.replace({ pathname: "/meeting/[id]/summary", params: { id: meetingId } });
    }, 1400);

    return () => clearTimeout(timer);
  }, [completeProcessing, recordingId]);

  return (
    <AppScreen contentClassName="gap-6">
      <AppHeader title="Processing" subtitle={recordingId ? `Recording ${recordingId}` : "Preparing analysis"} />
      <View className="items-center gap-4 rounded-[28px] bg-brand-primary p-8">
        <View className="h-16 w-16 items-center justify-center rounded-full bg-white/15">
          <Brain color={colors.surface} size={30} strokeWidth={2.4} />
        </View>
        <View className="items-center gap-2">
          <Text className="text-center text-[26px] font-bold leading-8 text-white">AI is analyzing your meeting</Text>
          <Text className="text-center text-base leading-6 text-white/80">Generating summary, transcript, action items, and mindmap.</Text>
        </View>
      </View>
      <View className="gap-3">
        <LoadingStep description="Detecting speakers and timestamps" status="done" title="Transcript" />
        <LoadingStep description="Finding decisions and risks" status="loading" title="Summary" />
        <LoadingStep description="Assigning owners from context" status="pending" title="Tasks" />
      </View>
      <AppButton
        icon={Sparkles}
        variant="secondary"
        onPress={() => {
          const fallbackRecordingId = recordingId ?? `rec-${Date.now()}`;
          const meetingId = completeProcessing(fallbackRecordingId);
          router.replace({ pathname: "/meeting/[id]/summary", params: { id: meetingId } });
        }}
      >
        Open summary now
      </AppButton>
    </AppScreen>
  );
}
