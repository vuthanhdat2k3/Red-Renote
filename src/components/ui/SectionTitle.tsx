import { Text, View } from "react-native";

export type SectionTitleProps = {
  title: string;
  subtitle?: string;
  action?: string;
};

export function SectionTitle({ title, subtitle, action }: SectionTitleProps) {
  return (
    <View className="flex-row items-end justify-between gap-4">
      <View className="flex-1 gap-1">
        <Text className="text-[22px] font-bold leading-7 text-app-text">{title}</Text>
        {subtitle ? <Text className="text-sm leading-5 text-app-muted">{subtitle}</Text> : null}
      </View>
      {action ? <Text className="text-sm font-semibold text-brand-primary">{action}</Text> : null}
    </View>
  );
}
