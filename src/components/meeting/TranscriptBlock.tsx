import { Text, View } from "react-native";

import { AppCard } from "@/components/ui/Card";
import type { TranscriptItem } from "@/types/meeting";
import { cn } from "@/lib/cn";

export type TranscriptBlockProps = TranscriptItem;

export function TranscriptBlock({ speaker, speakerColor, timestamp, text, isHighlighted }: TranscriptBlockProps) {
  return (
    <AppCard className={cn("gap-3", isHighlighted && "border-brand-primary bg-red-50")}>
      <View className="flex-row items-center justify-between gap-3">
        <View className="flex-row items-center gap-2">
          <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: speakerColor }} />
          <Text className="text-[15px] font-bold text-app-text">{speaker}</Text>
        </View>
        <Text className="text-xs font-semibold text-app-muted">{timestamp}</Text>
      </View>
      <Text className="text-[15px] leading-6 text-app-text">{text}</Text>
    </AppCard>
  );
}
