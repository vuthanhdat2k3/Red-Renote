import type { LucideIcon } from "lucide-react-native";
import { Text, View } from "react-native";

import { colors } from "@/constants/tokens";
import { AppButton } from "@/components/ui/Button";

export type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onActionPress?: () => void;
};

export function EmptyState({ icon: Icon, title, description, actionLabel, onActionPress }: EmptyStateProps) {
  return (
    <View className="items-center gap-4 rounded-2xl border border-app-border bg-app-surface px-5 py-8">
      <View className="h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
        <Icon color={colors.primary} size={26} strokeWidth={2.4} />
      </View>
      <View className="gap-2">
        <Text className="text-center text-[20px] font-bold text-app-text">{title}</Text>
        <Text className="text-center text-[15px] leading-6 text-app-muted">{description}</Text>
      </View>
      {actionLabel && onActionPress ? (
        <AppButton size="md" onPress={onActionPress}>
          {actionLabel}
        </AppButton>
      ) : null}
    </View>
  );
}
