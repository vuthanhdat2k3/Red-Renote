import {
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import { router } from "expo-router";
import { Pause, Play, Square, Waves } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Text, View } from "react-native";

import { AppHeader } from "@/components/shell/AppHeader";
import { RecordButton } from "@/components/shell/RecordButton";
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
  const [isPreparing, setIsPreparing] = useState(true);
  const [recorderError, setRecorderError] = useState<string | null>(null);
  const audioRecorder = useAudioRecorder({
    ...RecordingPresets.HIGH_QUALITY,
    isMeteringEnabled: true,
  });
  const recorderState = useAudioRecorderState(audioRecorder, 250);
  const hasStartedRecorder = useRef(false);
  const recordingIdRef = useRef<string | null>(null);
  const activeRecordingId = useAppStore((state) => state.activeRecordingId);
  const isRecording = useAppStore((state) => state.isRecording);
  const startRecording = useAppStore((state) => state.startRecording);
  const pauseRecording = useAppStore((state) => state.pauseRecording);
  const resumeRecording = useAppStore((state) => state.resumeRecording);
  const finishRecording = useAppStore((state) => state.finishRecording);

  const waveformBars = useMemo(() => Array.from({ length: 18 }), []);

  const startRealRecording = useCallback(async () => {
    if (hasStartedRecorder.current) {
      return;
    }

    hasStartedRecorder.current = true;
    const recordingId = activeRecordingId ?? `rec-${Date.now()}`;
    recordingIdRef.current = recordingId;
    startRecording(recordingId);
    setIsPreparing(true);
    setRecorderError(null);

    try {
      const permission = await requestMicrophonePermission();

      if (!permission.granted) {
        throw new Error(permission.message ?? "Microphone permission was denied.");
      }

      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      resumeRecording();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to start the microphone recorder.";
      setRecorderError(message);
      pauseRecording();
      Alert.alert("Recording unavailable", message);
    } finally {
      setIsPreparing(false);
    }
  }, [activeRecordingId, audioRecorder, pauseRecording, resumeRecording, startRecording]);

  const togglePause = useCallback(() => {
    if (isPreparing || recorderError) {
      return;
    }

    if (recorderState.isRecording) {
      audioRecorder.pause();
      pauseRecording();
      return;
    }

    audioRecorder.record();
    resumeRecording();
  }, [audioRecorder, isPreparing, pauseRecording, recorderError, recorderState.isRecording, resumeRecording]);

  const stopAndAnalyze = useCallback(async () => {
    const recordingId = recordingIdRef.current ?? activeRecordingId ?? `rec-${Date.now()}`;

    try {
      if (recorderState.isRecording || recorderState.canRecord) {
        await audioRecorder.stop();
      }

      const recordingUri = audioRecorder.uri ?? recorderState.url;
      finishRecording(recordingId, recordingUri, recorderState.durationMillis);
      router.push({ pathname: "/processing/[recordingId]", params: { recordingId } });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to stop and save this recording.";
      setRecorderError(message);
      Alert.alert("Could not save recording", message);
    }
  }, [activeRecordingId, audioRecorder, finishRecording, recorderState.canRecord, recorderState.durationMillis, recorderState.isRecording, recorderState.url]);

  useEffect(() => {
    void startRealRecording();
  }, [startRealRecording]);

  const statusText = isPreparing ? "Preparing microphone" : isRecording ? "Listening now" : "Recording paused";
  const durationText = formatDuration(recorderState.durationMillis);
  const metering = typeof recorderState.metering === "number" ? Math.max(0.15, Math.min(1, (recorderState.metering + 60) / 60)) : 0.65;

  return (
    <AppScreen contentClassName="gap-6">
      <AppHeader title="Live Recording" subtitle="Real microphone recorder" />
      <View className="items-center gap-5 rounded-[28px] bg-brand-primary p-8">
        <RecordButton compact />
        <View className="items-center gap-2">
          <Text className="text-[28px] font-bold text-white">{statusText}</Text>
          <Text className="text-base font-semibold text-white/85">{durationText}</Text>
          <Text className="text-center text-base leading-6 text-white/80">
            Audio is being captured to a local file. Transcript, tasks, and summary are still generated in the processing step.
          </Text>
        </View>
        <View className="h-16 w-full flex-row items-center justify-center gap-1">
          {waveformBars.map((_, index) => (
            <View
              className="w-1.5 rounded-full bg-white/80"
              key={index}
              style={{
                height: 12 + ((index * 11) % 42) * metering,
                opacity: recorderState.isRecording ? 1 : 0.45,
              }}
            />
          ))}
        </View>
      </View>
      <LoadingStep
        description={recorderError ?? recorderState.url ?? activeRecordingId ?? "Preparing recorder"}
        status={recorderError ? "pending" : isPreparing ? "loading" : "done"}
        title="Recording session"
      />
      <View className="gap-3">
        <AppButton
          icon={recorderState.isRecording ? Pause : Play}
          onPress={togglePause}
          variant="secondary"
        >
          {recorderState.isRecording ? "Pause" : "Resume"}
        </AppButton>
        <AppButton
          icon={Square}
          onPress={() => {
            void stopAndAnalyze();
          }}
        >
          Stop and analyze
        </AppButton>
      </View>
      <View className="flex-row items-center gap-3 rounded-2xl border border-app-border bg-app-surface p-4">
        <Waves color={colors.primary} size={22} strokeWidth={2.4} />
        <Text className="flex-1 text-sm leading-5 text-app-muted">
          Recording saves as {RecordingPresets.HIGH_QUALITY.extension} on device. Analysis upload/transcription is the next backend step.
        </Text>
      </View>
    </AppScreen>
  );
}
