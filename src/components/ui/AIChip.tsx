import { Sparkles } from "lucide-react-native";
import { Text, View } from "react-native";

import { colors } from "@/constants/tokens";
import { cn } from "@/lib/cn";

export type AIChipProps = {
  label: string;
  active?: boolean;
  className?: string;
};

export function AIChip({ label, active, className }: AIChipProps) {
  return (
    <View
      className={cn(
        "flex-row items-center gap-1.5 rounded-full border px-3 py-1.5",
        active ? "border-brand-primary bg-red-50" : "border-app-border bg-app-surface",
        className,
      )}
    >
      <Sparkles color={active ? colors.primary : colors.secondaryText} size={13} strokeWidth={2.4} />
      <Text className={cn("text-xs font-semibold", active ? "text-brand-primary" : "text-app-muted")}>{label}</Text>
    </View>
  );
}
