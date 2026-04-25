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
    <View className="flex-row items-center justify-between gap-4 pt-2">
      {showBackButton ? <IconButton icon={ChevronLeft} label="Go back" onPress={onBackPress} /> : null}
      <View className="flex-1">
        {subtitle ? <Text className="text-sm font-medium text-app-muted">{subtitle}</Text> : null}
        <Text className="text-[28px] font-bold leading-9 text-app-text">{title}</Text>
      </View>
      {rightAction ? <View className="flex-row items-center gap-2">{rightAction}</View> : null}
    </View>
  );
}
