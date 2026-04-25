import { router } from "expo-router";
import { BookOpen, ChevronRight, Sparkles } from "lucide-react-native";
import { useDeferredValue, useState } from "react";
import { Text, View } from "react-native";

import { AppScreen } from "@/components/ui/AppScreen";
import { PressableScale } from "@/components/ui/PressableScale";
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
    <AppScreen contentClassName="gap-8 pt-4">
      <View className="absolute top-0 right-0 h-64 w-64 rounded-full bg-blue-100 opacity-30 -mr-20 -mt-20 blur-3xl" />
      
      <View className="px-6 gap-6">
        <View className="flex-row items-center justify-between">
          <View className="h-10 w-10 items-center justify-center rounded-full bg-blue-50 border border-blue-100">
            <BookOpen color={colors.blue} size={18} strokeWidth={2.5} />
          </View>
          <View className="h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm border border-app-border">
            <Sparkles color={colors.primary} size={18} strokeWidth={2.5} />
          </View>
        </View>

        <View className="gap-2">
          <Text className="text-[34px] font-extrabold tracking-tight text-app-text leading-[40px]">
            Ask your <Text className="text-blue-600">meetings.</Text>
          </Text>
          <Text className="text-[15px] leading-6 text-app-muted font-medium max-w-[90%]">
            Search decisions, people, and context with source-backed AI memory.
          </Text>
        </View>

        <SearchBar
          onChangeText={setQuery}
          placeholder="Ask about meetings, decisions..."
          value={query}
          variant="ai"
        />

        <View className="flex-row gap-3">
          <View className="flex-1 bg-blue-50/50 rounded-2xl p-4 border border-blue-100">
            <Text className="text-[20px] font-extrabold text-blue-700">{visibleMeetings.length}</Text>
            <Text className="text-[11px] font-bold text-blue-600/70 uppercase tracking-widest mt-1">Results</Text>
          </View>
          <View className="flex-1 bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100">
            <Text className="text-[20px] font-extrabold text-emerald-700">{meetings.reduce((total, m) => total + m.decisions.length, 0)}</Text>
            <Text className="text-[11px] font-bold text-emerald-600/70 uppercase tracking-widest mt-1">Decisions</Text>
          </View>
        </View>
      </View>

      <View className="gap-4 px-6 pb-10">
        <SectionTitle title="Meeting Memory" />
        <View className="gap-4">
          {visibleMeetings.map((meeting) => (
            <PressableScale
              key={meeting.id}
              className="gap-4 rounded-3xl border border-app-border bg-white p-5 shadow-sm"
              onPress={() => {
                router.push({ pathname: "/meeting/[id]/summary", params: { id: meeting.id } });
              }}
              scaleTo={0.98}
            >
              <View className="flex-row items-start justify-between">
                <View className="flex-1 gap-1">
                  <Text className="text-xs font-bold uppercase tracking-wider text-brand-primary">{meeting.project}</Text>
                  <Text className="text-[18px] font-bold leading-6 text-app-text">{meeting.title}</Text>
                </View>
                <View className="h-8 w-8 items-center justify-center rounded-full bg-app-background">
                  <ChevronRight color={colors.secondaryText} size={16} strokeWidth={2.5} />
                </View>
              </View>
              
              <Text className="text-sm leading-6 text-app-muted" numberOfLines={2}>
                {meeting.summary}
              </Text>

              <View className="flex-row flex-wrap gap-2">
                {meeting.tags.slice(0, 3).map((tag) => (
                  <View key={tag} className="rounded-full bg-app-background border border-app-border px-3 py-1">
                    <Text className="text-[11px] font-bold text-app-muted">{tag}</Text>
                  </View>
                ))}
              </View>
            </PressableScale>
          ))}
        </View>
      </View>
    </AppScreen>
  );
}
