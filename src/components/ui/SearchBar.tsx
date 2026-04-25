import { Filter, Search, Sparkles, X } from "lucide-react-native";
import { Pressable, TextInput, View } from "react-native";

import { colors } from "@/constants/tokens";
import { cn } from "@/lib/cn";

export type SearchBarProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  onClear?: () => void;
  onFilterPress?: () => void;
  className?: string;
  variant?: "default" | "ai";
};

export function SearchBar({ value, onChangeText, placeholder = "Search", onClear, onFilterPress, className, variant = "default" }: SearchBarProps) {
  const isAI = variant === "ai";

  return (
    <View className="flex-row items-center gap-3">
      <View className={cn(
        "h-14 flex-1 flex-row items-center gap-3 rounded-[20px] px-4", 
        isAI ? "bg-white border border-[#FFE1DA] shadow-sm" : "bg-white border border-app-border",
        className
      )}>
        {isAI ? (
          <Sparkles color={colors.primary} size={20} strokeWidth={2.5} />
        ) : (
          <Search color={colors.secondaryText} size={18} strokeWidth={2.5} />
        )}
        <TextInput
          accessibilityLabel={placeholder}
          className="flex-1 text-[15px] font-medium text-app-text"
          cursorColor={colors.primary}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={isAI ? "#A09B9B" : colors.secondaryText}
          returnKeyType="search"
          value={value}
        />
        {value.length > 0 ? (
          <Pressable
            accessibilityLabel="Clear search"
            accessibilityRole="button"
            className="h-8 w-8 items-center justify-center rounded-full bg-app-background"
            onPress={onClear ?? (() => onChangeText(""))}
          >
            <X color={colors.secondaryText} size={14} strokeWidth={2.4} />
          </Pressable>
        ) : null}
      </View>
      
      {onFilterPress && (
        <Pressable
          onPress={onFilterPress}
          className={cn(
            "h-14 w-14 items-center justify-center rounded-[20px] bg-white",
            isAI ? "border border-[#FFE1DA] shadow-sm" : "border border-app-border"
          )}
        >
          <Filter color={isAI ? colors.primary : colors.text} size={20} strokeWidth={2.2} />
        </Pressable>
      )}
    </View>
  );
}
