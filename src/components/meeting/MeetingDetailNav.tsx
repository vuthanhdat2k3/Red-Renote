import { router } from "expo-router";
import { Headphones, MessageCircle, Network, ScrollText, Sparkles, SquareCheckBig } from "lucide-react-native";
import { Pressable, ScrollView, Text, View } from "react-native";

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
    <View className="mx-[-20px]">
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2 px-5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.key === activeTab;

          return (
            <Pressable
              accessibilityLabel={tab.label}
              accessibilityRole="button"
              className={cn(
                "min-w-[92px] flex-row items-center justify-center gap-2 rounded-xl border px-3 py-3",
                isActive ? "border-brand-primary bg-red-50" : "border-app-border bg-white",
              )}
              key={tab.key}
              onPress={() => {
                if (isActive) {
                  return;
                }

                router.replace({ pathname: `/meeting/[id]/${tab.key}`, params: { id: meetingId } });
              }}
            >
              <Icon color={isActive ? colors.primary : colors.secondaryText} size={16} strokeWidth={2.3} />
              <Text className={cn("text-[12px] font-semibold", isActive ? "text-brand-primary" : "text-app-muted")}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
