import { FolderKanban } from "lucide-react-native";
import { Text, View } from "react-native";

import { colors, radius, shadows } from "@/constants/tokens";

type ProjectFolderCardProps = {
  name: string;
  meetings: number;
  accent?: string;
};

export function ProjectFolderCard({ name, meetings, accent = colors.primary }: ProjectFolderCardProps) {
  return (
    <View className="min-h-[110px] flex-1 gap-3 bg-white p-4" style={{ borderRadius: radius.xl, ...shadows.card }}>
      <View
        className="h-9 w-9 items-center justify-center"
        style={{ borderRadius: radius.md, backgroundColor: `${accent}18` }}
      >
        <FolderKanban color={accent} size={18} strokeWidth={2.4} />
      </View>
      <View className="gap-1">
        <Text className="text-[14px] font-bold leading-5" numberOfLines={2} style={{ color: colors.text }}>
          {name}
        </Text>
        <Text className="text-[12px]" style={{ color: colors.secondaryText }}>
          {meetings} {meetings === 1 ? "meeting" : "meetings"}
        </Text>
      </View>
    </View>
  );
}
