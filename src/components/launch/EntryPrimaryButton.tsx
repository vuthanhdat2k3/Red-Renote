import type { PropsWithChildren } from "react";
import { Pressable, Text } from "react-native";
import type { LucideIcon } from "lucide-react-native";

import { colors, radius, shadows } from "@/constants/tokens";

type EntryPrimaryButtonProps = PropsWithChildren<{
  onPress: () => void;
  icon?: LucideIcon;
  disabled?: boolean;
}>;

export function EntryPrimaryButton({
  children,
  onPress,
  icon: Icon,
  disabled = false,
}: EntryPrimaryButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      className="h-14 flex-row items-center justify-center gap-2 self-stretch"
      disabled={disabled}
      onPress={onPress}
      style={{
        borderRadius: radius.pill,
        backgroundColor: colors.primary,
        opacity: disabled ? 0.6 : 1,
        ...shadows.redGlow,
      }}
    >
      <Text className="text-[15px] font-semibold text-white">{children}</Text>
      {Icon ? <Icon color={colors.surface} size={16} strokeWidth={2.6} /> : null}
    </Pressable>
  );
}
