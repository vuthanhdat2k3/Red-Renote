import { Check, LoaderCircle } from "lucide-react-native";
import { ActivityIndicator, Text, View } from "react-native";

import { colors } from "@/constants/tokens";
import { cn } from "@/lib/cn";

export type LoadingStepStatus = "pending" | "loading" | "done";

export type LoadingStepProps = {
  title: string;
  description?: string;
  status: LoadingStepStatus;
};

export function LoadingStep({ title, description, status }: LoadingStepProps) {
  const isDone = status === "done";
  const isLoading = status === "loading";

  return (
    <View className="flex-row items-center gap-3 rounded-2xl border border-app-border bg-app-surface p-4">
      <View className={cn("h-10 w-10 items-center justify-center rounded-full", isDone ? "bg-brand-primary" : "bg-red-50")}>
        {isLoading ? (
          <ActivityIndicator color={colors.primary} />
        ) : isDone ? (
          <Check color={colors.surface} size={18} strokeWidth={2.6} />
        ) : (
          <LoaderCircle color={colors.secondaryText} size={18} strokeWidth={2.4} />
        )}
      </View>
      <View className="flex-1 gap-0.5">
        <Text className="text-[15px] font-semibold text-app-text">{title}</Text>
        {description ? <Text className="text-sm text-app-muted">{description}</Text> : null}
      </View>
    </View>
  );
}
