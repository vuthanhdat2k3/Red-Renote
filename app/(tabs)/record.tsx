import { router } from "expo-router";
import { Pause, Square, Waves } from "lucide-react-native";
import { useEffect } from "react";
import { Text, View } from "react-native";

import { AppHeader } from "@/components/shell/AppHeader";
import { RecordButton } from "@/components/shell/RecordButton";
import { AppButton } from "@/components/ui/Button";
import { AppScreen } from "@/components/ui/AppScreen";
import { LoadingStep } from "@/components/ui/LoadingStep";
import { colors } from "@/constants/tokens";
import { useAppStore } from "@/store/app-store";

export default function RecordRoute() {
  const activeRecordingId = useAppStore((state) => state.activeRecordingId);
  const isRecording = useAppStore((state) => state.isRecording);
  const startRecording = useAppStore((state) => state.startRecording);
  const stopRecording = useAppStore((state) => state.stopRecording);

  useEffect(() => {
    if (!activeRecordingId) {
      startRecording(`rec-${Date.now()}`);
    }
  }, [activeRecordingId, startRecording]);

  return (
    <AppScreen contentClassName="gap-6">
      <AppHeader title="Live Recording" subtitle="Mock recorder" />
      <View className="items-center gap-5 rounded-[28px] bg-brand-primary p-8">
        <RecordButton compact />
        <View className="items-center gap-2">
          <Text className="text-[28px] font-bold text-white">{isRecording ? "Listening now" : "Recording paused"}</Text>
          <Text className="text-center text-base leading-6 text-white/80">
            Capture audio now; transcript, tasks, and summary will be generated in the processing step.
          </Text>
        </View>
        <View className="h-16 w-full flex-row items-center justify-center gap-1">
          {Array.from({ length: 18 }).map((_, index) => (
            <View
              className="w-1.5 rounded-full bg-white/80"
              key={index}
              style={{ height: 12 + ((index * 11) % 42), opacity: isRecording ? 1 : 0.45 }}
            />
          ))}
        </View>
      </View>
      <LoadingStep description={activeRecordingId ?? "Preparing recorder"} status="loading" title="Recording session" />
      <View className="gap-3">
        <AppButton icon={Pause} variant="secondary">
          Pause
        </AppButton>
        <AppButton
          icon={Square}
          onPress={() => {
            const recordingId = stopRecording();
            router.push({ pathname: "/processing/[recordingId]", params: { recordingId } });
          }}
        >
          Stop and analyze
        </AppButton>
      </View>
      <View className="flex-row items-center gap-3 rounded-2xl border border-app-border bg-app-surface p-4">
        <Waves color={colors.primary} size={22} strokeWidth={2.4} />
        <Text className="flex-1 text-sm leading-5 text-app-muted">Live waveform and recording controls are mocked until backend/audio integration.</Text>
      </View>
    </AppScreen>
  );
}
