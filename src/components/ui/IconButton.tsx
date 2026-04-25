import { Pressable } from "react-native";
import type { LucideIcon } from "lucide-react-native";

import { colors } from "@/constants/tokens";
import { cn } from "@/lib/cn";

type IconButtonProps = {
  icon: LucideIcon;
  onPress?: () => void;
  label: string;
  className?: string;
  tone?: "default" | "red";
};

export function IconButton({ icon: Icon, onPress, label, className, tone = "default" }: IconButtonProps) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      className={cn(
        "h-11 w-11 items-center justify-center rounded-full border",
        tone === "red" ? "border-brand-primary bg-brand-primary" : "border-app-border bg-app-surface",
        className,
      )}
      onPress={onPress}
    >
      <Icon color={tone === "red" ? colors.surface : colors.text} size={20} strokeWidth={2.2} />
    </Pressable>
  );
}
