import { Text, View } from "react-native";

import { AppCard } from "@/components/ui/Card";
import type { TranscriptSegment } from "@/types/meeting";
import { cn } from "@/lib/cn";

export type TranscriptBlockProps = TranscriptSegment;

export function TranscriptBlock({ speaker, timestamp, text, highlighted }: TranscriptBlockProps) {
  return (
    <AppCard className={cn("gap-3", highlighted && "border-brand-primary bg-red-50")}>
      <View className="flex-row items-center justify-between gap-3">
        <Text className="text-[15px] font-bold text-app-text">{speaker}</Text>
        <Text className="text-xs font-semibold text-app-muted">{timestamp}</Text>
      </View>
      <Text className="text-[15px] leading-6 text-app-text">{text}</Text>
    </AppCard>
  );
}
