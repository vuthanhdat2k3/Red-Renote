import { router } from "expo-router";
import { BookOpen, ChevronRight, Search } from "lucide-react-native";
import { useDeferredValue, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { AppHeader } from "@/components/shell/AppHeader";
import { AppScreen } from "@/components/ui/AppScreen";
import { Card } from "@/components/ui/Card";
import { SearchBar } from "@/components/ui/SearchBar";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { colors } from "@/constants/tokens";
import { useDashboardData } from "@/hooks/useMeetingData";

export default function KnowledgeRoute() {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const { meetings } = useDashboardData();
  const visibleMeetings = meetings.filter((meeting) => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return true;
    }

    return [
      meeting.title,
      meeting.project,
      meeting.summary,
      ...meeting.keyTakeaways,
      ...meeting.decisions,
      ...meeting.tags,
    ].some((value) => value.toLowerCase().includes(normalizedQuery));
  });

  return (
    <AppScreen contentClassName="gap-5">
      <AppHeader title="Knowledge" subtitle="Searchable meeting memory" />
      <SearchBar onChangeText={setQuery} placeholder="Search summaries, decisions, projects, or tags" value={query} />
      <Card className="gap-4">
        <View className="flex-row items-start gap-3">
          <View className="h-12 w-12 items-center justify-center rounded-2xl bg-red-50">
            <BookOpen color={colors.primary} size={24} strokeWidth={2.3} />
          </View>
          <View className="flex-1 gap-1">
            <Text className="text-[20px] font-bold text-app-text">{visibleMeetings.length} saved meetings</Text>
            <Text className="text-base leading-6 text-app-muted">
              Search across summaries, key decisions, tags, and project folders.
            </Text>
          </View>
        </View>
      </Card>
      <View className="gap-3">
        <SectionTitle title="Meeting Memory" />
        {visibleMeetings.map((meeting) => (
          <Pressable
            accessibilityRole="button"
            className="gap-3 rounded-2xl border border-app-border bg-app-surface p-4"
            key={meeting.id}
            onPress={() => {
              router.push({ pathname: "/meeting/[id]/summary", params: { id: meeting.id } });
            }}
          >
            <View className="flex-row items-start justify-between gap-3">
              <View className="flex-1 gap-1">
                <Text className="text-[16px] font-bold leading-6 text-app-text">{meeting.title}</Text>
                <Text className="text-sm font-semibold text-brand-primary">{meeting.project}</Text>
              </View>
              <ChevronRight color={colors.secondaryText} size={18} strokeWidth={2.4} />
            </View>
            <Text className="text-sm leading-6 text-app-muted" numberOfLines={3}>
              {meeting.summary}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2">
              {meeting.tags.map((tag) => (
                <View className="rounded-full bg-red-50 px-3 py-1.5" key={tag}>
                  <Text className="text-xs font-semibold text-brand-primary">{tag}</Text>
                </View>
              ))}
            </ScrollView>
          </Pressable>
        ))}
        {visibleMeetings.length === 0 ? (
          <Card className="flex-row items-center gap-3">
            <Search color={colors.secondaryText} size={20} strokeWidth={2.3} />
            <Text className="flex-1 text-sm leading-6 text-app-muted">No saved meeting memory matches this search.</Text>
          </Card>
        ) : null}
      </View>
    </AppScreen>
  );
}
