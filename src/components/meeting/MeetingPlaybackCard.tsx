import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { Pause, Play, RotateCcw, SkipBack } from "lucide-react-native";
import { useEffect } from "react";
import { Text, View } from "react-native";

import { colors } from "@/constants/tokens";
import { AppButton } from "@/components/ui/Button";
import { AppCard } from "@/components/ui/Card";

type MeetingPlaybackCardProps = {
  audioUrl: string;
};

function formatPlaybackTime(valueInSeconds: number) {
  const totalSeconds = Math.max(0, Math.floor(valueInSeconds));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function MeetingPlaybackCard({ audioUrl }: MeetingPlaybackCardProps) {
  const canPlay = audioUrl.trim().length > 0;
  const player = useAudioPlayer(canPlay ? { uri: audioUrl } : null, { updateInterval: 250 });
  const status = useAudioPlayerStatus(player);
  const duration = status.duration || 0;
  const progress = duration > 0 ? Math.min(1, status.currentTime / duration) : 0;

  useEffect(() => {
    void setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
    });
  }, []);

  useEffect(() => {
    return () => {
      if (status.isLoaded && status.playing) {
        player.pause();
      }
    };
  }, [player, status.isLoaded, status.playing]);

  if (!canPlay) {
    return (
      <AppCard className="gap-3 border-dashed" padding="lg">
        <Text className="text-[18px] font-bold text-app-text">Recording playback</Text>
        <Text className="text-[15px] leading-6 text-app-muted">
          This meeting does not have a saved audio file yet, so playback is not available.
        </Text>
      </AppCard>
    );
  }

  return (
    <AppCard className="gap-4" padding="lg">
      <View className="gap-1">
        <Text className="text-[18px] font-bold text-app-text">Recording playback</Text>
        <Text className="text-[14px] leading-6 text-app-muted">
          Replay the saved audio directly from this meeting while transcript and tasks stay in sync with the same record.
        </Text>
      </View>

      <View className="gap-2">
        <View className="h-2 overflow-hidden rounded-full bg-red-100">
          <View
            className="h-full rounded-full bg-brand-primary"
            style={{ width: `${Math.max(progress * 100, 4)}%` }}
          />
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="text-xs font-semibold text-app-muted">{formatPlaybackTime(status.currentTime)}</Text>
          <Text className="text-xs font-semibold text-app-muted">{formatPlaybackTime(duration)}</Text>
        </View>
      </View>

      <View className="flex-row gap-3">
        <AppButton
          icon={status.playing ? Pause : Play}
          onPress={() => {
            if (!status.isLoaded) {
              return;
            }

            if (status.playing) {
              player.pause();
              return;
            }

            if (status.didJustFinish && duration > 0) {
              void player.seekTo(0);
            }
            player.play();
          }}
        >
          {status.playing ? "Pause audio" : "Play audio"}
        </AppButton>
        <AppButton
          icon={SkipBack}
          onPress={() => {
            if (!status.isLoaded) {
              return;
            }

            void player.seekTo(Math.max(0, status.currentTime - 10));
          }}
          variant="secondary"
        >
          Back 10s
        </AppButton>
      </View>

      <AppButton
        icon={RotateCcw}
        onPress={() => {
          if (!status.isLoaded) {
            return;
          }

          void player.seekTo(0);
          if (status.playing) {
            player.pause();
          }
        }}
        variant="ghost"
      >
        Restart from beginning
      </AppButton>

      <Text className="text-xs font-semibold" style={{ color: colors.secondaryText }}>
        Source: {audioUrl}
      </Text>
    </AppCard>
  );
}
