import type { ComponentProps } from "react";
import { Text, TextInput, View } from "react-native";

import { colors, radius } from "@/constants/tokens";

type AuthTextFieldProps = ComponentProps<typeof TextInput> & {
  label: string;
};

export function AuthTextField({ label, ...props }: AuthTextFieldProps) {
  return (
    <View className="gap-2">
      <Text className="text-[13px] font-semibold text-app-text">{label}</Text>
      <TextInput
        accessibilityLabel={label}
        autoCapitalize="none"
        className="h-14 border border-app-border bg-white px-4 text-[15px] text-app-text"
        placeholderTextColor={colors.secondaryText}
        style={{ borderRadius: radius.lg }}
        {...props}
      />
    </View>
  );
}
