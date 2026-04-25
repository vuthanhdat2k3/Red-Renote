import type { PropsWithChildren } from "react";
import { Text, View } from "react-native";

import { colors } from "@/constants/tokens";

type HomeSectionProps = PropsWithChildren<{
  title: string;
  action?: string;
}>;

export function HomeSection({ title, action, children }: HomeSectionProps) {
  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between">
        <Text className="text-[17px] font-bold" style={{ color: colors.text }}>
          {title}
        </Text>
        {action ? (
          <Text className="text-[12px] font-semibold" style={{ color: colors.primary }}>
            {action}
          </Text>
        ) : null}
      </View>
      {children}
    </View>
  );
}
