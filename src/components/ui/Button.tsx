import type { PropsWithChildren } from "react";
import { ActivityIndicator, Pressable, Text } from "react-native";
import type { LucideIcon } from "lucide-react-native";

import { colors } from "@/constants/tokens";
import { cn } from "@/lib/cn";

export type AppButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type AppButtonSize = "sm" | "md" | "lg";
export type AppButtonRadius = "full" | "xl";

export type AppButtonProps = PropsWithChildren<{
  onPress?: () => void;
  variant?: AppButtonVariant;
  size?: AppButtonSize;
  rounded?: AppButtonRadius;
  disabled?: boolean;
  loading?: boolean;
  icon?: LucideIcon;
  rightIcon?: LucideIcon;
  className?: string;
  textClassName?: string;
  accessibilityLabel?: string;
}>;

const variantClasses: Record<AppButtonVariant, string> = {
  primary: "bg-brand-primary",
  secondary: "border border-app-border bg-app-surface",
  ghost: "bg-transparent",
  danger: "bg-brand-dark",
};

const textClasses: Record<AppButtonVariant, string> = {
  primary: "text-white",
  secondary: "text-app-text",
  ghost: "text-brand-primary",
  danger: "text-white",
};

const sizeClasses: Record<AppButtonSize, string> = {
  sm: "h-10 px-4",
  md: "h-12 px-5",
  lg: "h-14 px-6",
};

const textSizeClasses: Record<AppButtonSize, string> = {
  sm: "text-sm",
  md: "text-[15px]",
  lg: "text-base",
};

const radiusClasses: Record<AppButtonRadius, string> = {
  full: "rounded-full",
  xl: "rounded-xl",
};

export function AppButton({
  children,
  onPress,
  variant = "primary",
  size = "lg",
  rounded = "full",
  disabled,
  loading,
  icon: Icon,
  rightIcon: RightIcon,
  className,
  textClassName,
  accessibilityLabel,
}: AppButtonProps) {
  const iconColor = variant === "primary" || variant === "danger" ? colors.surface : colors.primary;

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      className={cn(
        "flex-row items-center justify-center gap-2",
        variantClasses[variant],
        sizeClasses[size],
        radiusClasses[rounded],
        disabled && "opacity-50",
        className,
      )}
      disabled={disabled || loading}
      onPress={onPress}
    >
      {loading ? <ActivityIndicator color={iconColor} /> : Icon ? <Icon color={iconColor} size={18} strokeWidth={2.4} /> : null}
      <Text className={cn("font-semibold", textSizeClasses[size], textClasses[variant], textClassName)}>{children}</Text>
      {!loading && RightIcon ? <RightIcon color={iconColor} size={18} strokeWidth={2.4} /> : null}
    </Pressable>
  );
}

export const Button = AppButton;
