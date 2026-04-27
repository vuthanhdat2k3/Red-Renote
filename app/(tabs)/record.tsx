import { RecordingPresets, setAudioModeAsync, useAudioRecorder, useAudioRecorderState } from "expo-audio";
import { router } from "expo-router";
import { Bot, Pause, Play, Square, Waves } from "lucide-react-native";
import { useCallback, useRef, useState } from "react";
import { Alert, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { RecordButton } from "@/components/shell/RecordButton";
import { PulseDot, StatusPill, TopExperience, Waveform } from "@/components/shell/TopExperience";
import { AppButton } from "@/components/ui/Button";
import { AppScreen } from "@/components/ui/AppScreen";
import { LoadingStep } from "@/components/ui/LoadingStep";
import { colors } from "@/constants/tokens";
import { requestMicrophonePermission } from "@/lib/microphone-permission";
import { useAppStore } from "@/store/app-store";

function formatDuration(durationMillis: number) {
  const totalSeconds = Math.max(0, Math.floor(durationMillis / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function RecordRoute() {
  const { t } = useTranslation();
  const [isPreparing, setIsPreparing] = useState(false);
  const [hasStartedSession, setHasStartedSession] = useState(false);
  const [recorderError, setRecorderError] = useState<string | null>(null);
  const audioRecorder = useAudioRecorder({ ...RecordingPresets.HIGH_QUALITY, isMeteringEnabled: true });
  const recorderState = useAudioRecorderState(audioRecorder, 250);
  const hasStartedRecorder = useRef(false);
  const recordingIdRef = useRef<string | null>(null);
  const activeRecordingId = useAppStore((state) => state.activeRecordingId);
  const isRecording = useAppStore((state) => state.isRecording);
  const startRecording = useAppStore((state) => state.startRecording);
  const pauseRecording = useAppStore((state) => state.pauseRecording);
  const resumeRecording = useAppStore((state) => state.resumeRecording);
  const finishRecording = useAppStore((state) => state.finishRecording);

  const startRealRecording = useCallback(async () => {
    if (hasStartedRecorder.current) return;
    hasStartedRecorder.current = true;
    const recordingId = activeRecordingId ?? `rec-${Date.now()}`;
    recordingIdRef.current = recordingId;
    startRecording(recordingId);
    setHasStartedSession(true);
    setIsPreparing(true);
    setRecorderError(null);
    try {
      const permission = await requestMicrophonePermission();
      if (!permission.granted) throw new Error(permission.message ?? t("record.mic_permission_denied"));
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      resumeRecording();
    } catch (error) {
      const message = error instanceof Error ? error.message : t("record.unable_start_recorder");
      setRecorderError(message);
      hasStartedRecorder.current = false;
      setHasStartedSession(false);
      pauseRecording();
      Alert.alert(t("record.recording_unavailable"), message);
    } finally {
      setIsPreparing(false);
    }
  }, [activeRecordingId, audioRecorder, pauseRecording, resumeRecording, startRecording, t]);

  const togglePause = useCallback(() => {
    if (!hasStartedSession || isPreparing || recorderError) return;
    if (recorderState.isRecording) { audioRecorder.pause(); pauseRecording(); return; }
    audioRecorder.record();
    resumeRecording();
  }, [audioRecorder, hasStartedSession, isPreparing, pauseRecording, recorderError, recorderState.isRecording, resumeRecording]);

  const stopAndAnalyze = useCallback(async () => {
    if (!hasStartedSession) return;
    const recordingId = recordingIdRef.current ?? activeRecordingId ?? `rec-${Date.now()}`;
    try {
      if (recorderState.isRecording || recorderState.canRecord) await audioRecorder.stop();
      const recordingUri = audioRecorder.uri ?? recorderState.url;
      finishRecording(recordingId, recordingUri, recorderState.durationMillis);
      router.push({ pathname: "/processing/[recordingId]", params: { recordingId } });
    } catch (error) {
      const message = error instanceof Error ? error.message : t("record.unable_stop_save");
      setRecorderError(message);
      Alert.alert(t("record.could_not_save"), message);
    }
  }, [activeRecordingId, audioRecorder, finishRecording, hasStartedSession, recorderState.canRecord, recorderState.durationMillis, recorderState.isRecording, recorderState.url, t]);

  const statusText = !hasStartedSession ? t("record.ready") : isPreparing ? t("record.preparing") : isRecording ? t("record.listening") : t("record.paused");
  const durationText = formatDuration(recorderState.durationMillis);
  const metering = typeof recorderState.metering === "number" ? Math.max(0.15, Math.min(1, (recorderState.metering + 60) / 60)) : 0.65;

  return (
    <AppScreen contentClassName="gap-5">
      <TopExperience
        className="overflow-hidden rounded-[26px] border border-white/15 bg-[#161111] p-6"
        style={{ shadowColor: colors.primary, shadowOffset: { width: 0, height: 14 }, shadowOpacity: 0.18, shadowRadius: 28, elevation: 7 }}
      >
        <View className="absolute -right-12 -top-10 h-36 w-36 rounded-full bg-[#FF3B30]/40" />
        <View className="absolute -bottom-16 left-4 h-40 w-40 rounded-full bg-[#2563EB]/20" />
        <View className="gap-6">
          <View className="flex-row items-center justify-between gap-3">
            <View className="flex-row items-center gap-2 rounded-full bg-white/10 px-3 py-2">
              <PulseDot active={recorderState.isRecording} color={recorderState.isRecording ? "#FF5A52" : "#F59E0B"} />
              <Text className="text-[13px] font-bold text-white">{statusText}</Text>
            </View>
            <StatusPill icon={Bot} tone="neutral">{t("record.summary_on_demand")}</StatusPill>
          </View>
          <View className="items-center gap-3">
            <View className="rounded-full bg-white/12 p-3"><RecordButton compact /></View>
            <View className="items-center gap-2">
              <Text className="text-[44px] font-extrabold leading-[50px] text-white">{durationText}</Text>
              <Text className="text-center text-[15px] leading-6 text-white/76">{t("record.save_first")}</Text>
            </View>
          </View>
          <Waveform active={recorderState.isRecording} metering={metering} />
        </View>
      </TopExperience>
      <LoadingStep
        description={recorderError ?? recorderState.url ?? activeRecordingId ?? t("common.press_start")}
        status={recorderError ? "pending" : isPreparing ? "loading" : hasStartedSession ? "done" : "pending"}
        title={t("common.recording_session")}
      />
      <View className="gap-3">
        {!hasStartedSession ? (
          <AppButton icon={Play} loading={isPreparing} onPress={() => void startRealRecording()}>{t("record.start")}</AppButton>
        ) : (
          <AppButton icon={recorderState.isRecording ? Pause : Play} onPress={togglePause} variant="secondary">
            {recorderState.isRecording ? t("record.pause") : t("record.resume")}
          </AppButton>
        )}
        <AppButton disabled={!hasStartedSession || isPreparing} icon={Square} onPress={() => void stopAndAnalyze()}>{t("record.stop")}</AppButton>
      </View>
      <View className="flex-row items-center gap-3 rounded-2xl border border-app-border bg-app-surface p-4">
        <Waves color={colors.primary} size={22} strokeWidth={2.4} />
        <Text className="flex-1 text-sm leading-5 text-app-muted">{t("record.recording_info")}</Text>
      </View>
    </AppScreen>
  );
}
