import { Search, X } from "lucide-react-native";
import { Pressable, TextInput, View } from "react-native";

import { colors } from "@/constants/tokens";
import { cn } from "@/lib/cn";

export type SearchBarProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  onClear?: () => void;
  className?: string;
};

export function SearchBar({ value, onChangeText, placeholder = "Search", onClear, className }: SearchBarProps) {
  return (
    <View className={cn("h-12 flex-row items-center gap-3 rounded-full border border-app-border bg-app-surface px-4", className)}>
      <Search color={colors.secondaryText} size={18} strokeWidth={2.2} />
      <TextInput
        accessibilityLabel={placeholder}
        className="flex-1 text-[15px] text-app-text"
        cursorColor={colors.primary}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.secondaryText}
        returnKeyType="search"
        value={value}
      />
      {value.length > 0 ? (
        <Pressable
          accessibilityLabel="Clear search"
          accessibilityRole="button"
          className="h-8 w-8 items-center justify-center rounded-full bg-red-50"
          onPress={onClear ?? (() => onChangeText(""))}
        >
          <X color={colors.primary} size={16} strokeWidth={2.4} />
        </Pressable>
      ) : null}
    </View>
  );
}
