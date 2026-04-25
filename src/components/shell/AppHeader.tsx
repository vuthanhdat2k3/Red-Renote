import { ChevronLeft } from "lucide-react-native";
import type { ReactNode } from "react";
import { Text, View } from "react-native";

import { IconButton } from "@/components/ui/IconButton";

export type AppHeaderProps = {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightAction?: ReactNode;
};

export function AppHeader({ title, subtitle, showBackButton, onBackPress, rightAction }: AppHeaderProps) {
  return (
    <View className="min-h-[58px] flex-row items-center justify-between gap-3 pt-1">
      {showBackButton ? <IconButton icon={ChevronLeft} label="Go back" onPress={onBackPress} /> : null}
      <View className="flex-1">
        {subtitle ? <Text className="text-[13px] font-medium text-app-muted" numberOfLines={1}>{subtitle}</Text> : null}
        <Text className="text-[25px] font-bold leading-8 text-app-text" numberOfLines={1}>{title}</Text>
      </View>
      {rightAction ? <View className="flex-row items-center gap-2">{rightAction}</View> : null}
    </View>
  );
}
