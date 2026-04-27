import { router, useLocalSearchParams } from "expo-router";
import { Brain, RotateCcw } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Alert, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { AppHeader } from "@/components/shell/AppHeader";
import { AppButton } from "@/components/ui/Button";
import { AppScreen } from "@/components/ui/AppScreen";
import { LoadingStep } from "@/components/ui/LoadingStep";
import { colors } from "@/constants/tokens";
import { saveProcessedMeeting } from "@/lib/meeting-repository";
import { useAppStore } from "@/store/app-store";

function formatDuration(durationMillis: number) {
  const totalSeconds = Math.max(0, Math.floor(durationMillis / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function ProcessingRoute() {
  const { t } = useTranslation();
  const { recordingId } = useLocalSearchParams<{ recordingId: string }>();
  const [statusMessage, setStatusMessage] = useState(t("processing.uploading"));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const completeProcessing = useAppStore((state) => state.completeProcessing);
  const activeRecordingDurationMillis = useAppStore((state) => state.activeRecordingDurationMillis);
  const activeRecordingUri = useAppStore((state) => state.activeRecordingUri);

  useEffect(() => {
    if (!recordingId) return;
    let isMounted = true;
    const processRecording = async () => {
      setStatusMessage(t("processing.uploading_audio"));
      setErrorMessage(null);
      try {
        const meeting = await saveProcessedMeeting({ recordingId, recordingUri: activeRecordingUri, durationMillis: activeRecordingDurationMillis });
        if (!isMounted) return;
        setStatusMessage(t("processing.saved"));
        setTimeout(() => { const meetingId = completeProcessing(recordingId); router.replace({ pathname: "/meeting/[id]/playback", params: { id: meeting.id ?? meetingId } }); }, 300);
      } catch (error) {
        if (!isMounted) return;
        const message = error instanceof Error ? error.message : t("processing.failed");
        setStatusMessage(t("processing.failed"));
        setErrorMessage(message);
        Alert.alert(t("processing.could_not_process"), message);
      }
    };
    void processRecording();
    return () => { isMounted = false; };
  }, [activeRecordingDurationMillis, activeRecordingUri, completeProcessing, recordingId, retryKey, t]);

  return (
    <AppScreen contentClassName="gap-6">
      <AppHeader title={t("processing.title")} subtitle={recordingId ? `Recording ${recordingId}` : t("processing.preparing")} />
      <View className="items-center gap-4 rounded-[28px] bg-brand-primary p-8">
        <View className="h-16 w-16 items-center justify-center rounded-full bg-white/15"><Brain color={colors.surface} size={30} strokeWidth={2.4} /></View>
        <View className="items-center gap-2">
          <Text className="text-center text-[26px] font-bold leading-8 text-white">{t("processing.saving_recording")}</Text>
          <Text className="text-center text-base leading-6 text-white/80">{statusMessage}</Text>
        </View>
      </View>
      <View className="gap-3">
        <LoadingStep description={activeRecordingUri ? `${formatDuration(activeRecordingDurationMillis)} saved at ${activeRecordingUri}` : t("processing.waiting_audio")} status={activeRecordingUri ? "done" : "pending"} title={t("processing.audio_file")} />
        <LoadingStep description={t("processing.sending_stt")} status={errorMessage ? "pending" : activeRecordingUri ? "loading" : "pending"} title={t("processing.transcript_step")} />
        <LoadingStep description={t("processing.summary_will_run")} status="pending" title={t("processing.summary_step")} />
        <LoadingStep description={errorMessage ?? t("processing.after_api_response")} status={errorMessage ? "pending" : "loading"} title={t("processing.persistence")} />
      </View>
      {errorMessage ? (
        <View className="gap-2 rounded-3xl border border-red-200 bg-red-50 p-4">
          <Text className="text-base font-bold text-brand-primary">{t("processing.could_not_process")}</Text>
          <Text className="text-sm leading-5 text-app-text">{errorMessage}</Text>
        </View>
      ) : null}
      <AppButton icon={RotateCcw} variant="secondary" onPress={() => setRetryKey((v) => v + 1)}>{t("processing.retry_upload")}</AppButton>
    </AppScreen>
  );
}
