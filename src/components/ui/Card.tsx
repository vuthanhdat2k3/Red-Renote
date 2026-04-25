import type { PropsWithChildren } from "react";
import { View } from "react-native";

import { shadows } from "@/constants/tokens";
import { cn } from "@/lib/cn";

export type AppCardPadding = "none" | "sm" | "md" | "lg";

export type AppCardProps = PropsWithChildren<{
  padding?: AppCardPadding;
  className?: string;
}>;

const paddingClasses: Record<AppCardPadding, string> = {
  none: "p-0",
  sm: "p-3",
  md: "p-4",
  lg: "p-5",
};

export function AppCard({ children, padding = "md", className }: AppCardProps) {
  return (
    <View className={cn("rounded-xl border border-app-border bg-app-surface", paddingClasses[padding], className)} style={shadows.card}>
      {children}
    </View>
  );
}

export const Card = AppCard;
