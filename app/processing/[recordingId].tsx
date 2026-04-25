import { router, useLocalSearchParams } from "expo-router";
import { Brain, Sparkles } from "lucide-react-native";
import { useEffect } from "react";
import { Text, View } from "react-native";

import { AppHeader } from "@/components/shell/AppHeader";
import { AppButton } from "@/components/ui/Button";
import { AppScreen } from "@/components/ui/AppScreen";
import { LoadingStep } from "@/components/ui/LoadingStep";
import { colors } from "@/constants/tokens";
import { saveMockProcessedMeeting } from "@/lib/meeting-repository";
import { useAppStore } from "@/store/app-store";

function formatDuration(durationMillis: number) {
  const totalSeconds = Math.max(0, Math.floor(durationMillis / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function ProcessingRoute() {
  const { recordingId } = useLocalSearchParams<{ recordingId: string }>();
  const completeProcessing = useAppStore((state) => state.completeProcessing);
  const activeRecordingDurationMillis = useAppStore((state) => state.activeRecordingDurationMillis);
  const activeRecordingUri = useAppStore((state) => state.activeRecordingUri);

  useEffect(() => {
    if (!recordingId) {
      return;
    }

    const timer = setTimeout(() => {
      void saveMockProcessedMeeting({
        recordingId,
        recordingUri: activeRecordingUri,
        durationMillis: activeRecordingDurationMillis,
      }).then((meeting) => {
        const meetingId = completeProcessing(recordingId);
        router.replace({ pathname: "/meeting/[id]/summary", params: { id: meeting.id ?? meetingId } });
      });
    }, 1400);

    return () => clearTimeout(timer);
  }, [activeRecordingDurationMillis, activeRecordingUri, completeProcessing, recordingId]);

  return (
    <AppScreen contentClassName="gap-6">
      <AppHeader title="Processing" subtitle={recordingId ? `Recording ${recordingId}` : "Preparing analysis"} />
      <View className="items-center gap-4 rounded-[28px] bg-brand-primary p-8">
        <View className="h-16 w-16 items-center justify-center rounded-full bg-white/15">
          <Brain color={colors.surface} size={30} strokeWidth={2.4} />
        </View>
        <View className="items-center gap-2">
          <Text className="text-center text-[26px] font-bold leading-8 text-white">Saving your meeting</Text>
          <Text className="text-center text-base leading-6 text-white/80">Temporary mock analysis is being generated so the saved meeting can open immediately.</Text>
        </View>
      </View>
      <View className="gap-3">
        <LoadingStep
          description={activeRecordingUri ? `${formatDuration(activeRecordingDurationMillis)} saved at ${activeRecordingUri}` : "Waiting for saved audio file"}
          status={activeRecordingUri ? "done" : "pending"}
          title="Audio file"
        />
        <LoadingStep description="Creating placeholder transcript entries" status="done" title="Transcript" />
        <LoadingStep description="Writing mock summary and decisions" status="loading" title="Summary" />
        <LoadingStep description="Saving placeholder action items" status="done" title="Tasks" />
      </View>
      <AppButton
        icon={Sparkles}
        variant="secondary"
        onPress={() => {
          const fallbackRecordingId = recordingId ?? `rec-${Date.now()}`;
          void saveMockProcessedMeeting({
            recordingId: fallbackRecordingId,
            recordingUri: activeRecordingUri,
            durationMillis: activeRecordingDurationMillis,
          }).then((meeting) => {
            const meetingId = completeProcessing(fallbackRecordingId);
            router.replace({ pathname: "/meeting/[id]/summary", params: { id: meeting.id ?? meetingId } });
          });
        }}
      >
        Open summary now
      </AppButton>
    </AppScreen>
  );
}
