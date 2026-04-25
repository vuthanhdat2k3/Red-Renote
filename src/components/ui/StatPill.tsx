import { Text, View } from "react-native";

import type { Insight } from "@/types/meeting";
import { cn } from "@/lib/cn";

type StatPillProps = {
  insight: Insight;
};

const toneClass = {
  red: "bg-red-50",
  neutral: "bg-app-surface",
  success: "bg-emerald-50",
} as const;

const valueClass = {
  red: "text-brand-primary",
  neutral: "text-app-text",
  success: "text-emerald-700",
} as const;

export function StatPill({ insight }: StatPillProps) {
  return (
    <View className={cn("flex-1 rounded-control border border-app-border px-4 py-3", toneClass[insight.tone])}>
      <Text className={cn("text-xl font-bold", valueClass[insight.tone])}>{insight.value}</Text>
      <Text className="mt-1 text-xs font-medium text-app-muted">{insight.label}</Text>
    </View>
  );
}
