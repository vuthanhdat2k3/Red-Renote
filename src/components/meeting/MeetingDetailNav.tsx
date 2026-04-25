import { router } from "expo-router";
import { Headphones, MessageCircle, Network, ScrollText, Sparkles, SquareCheckBig } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { colors } from "@/constants/tokens";
import { cn } from "@/lib/cn";

export type MeetingDetailTab = "summary" | "playback" | "transcript" | "chat" | "mindmap" | "tasks";

type MeetingDetailNavProps = {
  meetingId: string;
  activeTab: MeetingDetailTab;
};

const tabs = [
  { key: "summary", label: "Summary", icon: Sparkles },
  { key: "playback", label: "Playback", icon: Headphones },
  { key: "transcript", label: "Transcript", icon: ScrollText },
  { key: "chat", label: "Chat", icon: MessageCircle },
  { key: "mindmap", label: "Mindmap", icon: Network },
  { key: "tasks", label: "Tasks", icon: SquareCheckBig },
] as const;

export function MeetingDetailNav({ meetingId, activeTab }: MeetingDetailNavProps) {
  return (
    <View className="flex-row items-center justify-between gap-1 rounded-[28px] border border-app-border bg-white px-2 py-2">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = tab.key === activeTab;

        return (
          <Pressable
            accessibilityLabel={tab.label}
            accessibilityRole="button"
            className={cn("flex-1 items-center gap-1 rounded-[20px] px-1 py-2.5", isActive ? "bg-red-50" : "bg-transparent")}
            key={tab.key}
            onPress={() => {
              if (isActive) {
                return;
              }

              router.replace({ pathname: `/meeting/[id]/${tab.key}`, params: { id: meetingId } });
            }}
          >
            <Icon color={isActive ? colors.primary : colors.secondaryText} size={18} strokeWidth={2.3} />
            <Text className={cn("text-[10px] font-semibold", isActive ? "text-brand-primary" : "text-app-muted")}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
