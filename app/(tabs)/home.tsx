import { router } from "expo-router";
import { Bell, Mic, Search } from "lucide-react-native";
import { useDeferredValue, useState } from "react";
import { ScrollView, Text, View } from "react-native";

import { DashboardMeetingCard } from "@/components/home/DashboardMeetingCard";
import { DashboardTaskRow } from "@/components/home/DashboardTaskRow";
import { FollowUpPill } from "@/components/home/FollowUpPill";
import { HomeSection } from "@/components/home/HomeSection";
import { ProjectFolderCard } from "@/components/home/ProjectFolderCard";
import { StartRecordingCard } from "@/components/home/StartRecordingCard";
import { AppCard } from "@/components/ui/Card";
import { AppScreen } from "@/components/ui/AppScreen";
import { SearchBar } from "@/components/ui/SearchBar";
import { colors, radius } from "@/constants/tokens";
import { currentUser, fullMeeting, meetings, tasks } from "@/data/mock";
import { useAppStore } from "@/store/app-store";
import type { Meeting } from "@/types/meeting";

const folderAccents = ["#E50914", "#005AAB", "#147A4D", "#B45309"];

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 18) {
    return "Good afternoon";
  }

  return "Good evening";
}

function matchesMeeting(meeting: Meeting, query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return true;
  }

  return [
    meeting.title,
    meeting.project,
    meeting.summary,
    meeting.date,
    ...meeting.tags,
  ].some((value) => value.toLowerCase().includes(normalizedQuery));
}

function buildProjectFolders(sourceMeetings: Meeting[]) {
  const counts = new Map<string, number>();

  sourceMeetings.forEach((meeting) => {
    counts.set(meeting.project, (counts.get(meeting.project) ?? 0) + 1);
  });

  return Array.from(counts, ([name, count], index) => ({
    name,
    count,
    accent: folderAccents[index % folderAccents.length],
  }));
}

export default function HomeRoute() {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const startRecording = useAppStore((state) => state.startRecording);

  const visibleMeetings = meetings.filter((meeting) => matchesMeeting(meeting, deferredQuery));
  const actionItems = tasks.filter((task) => task.status !== "done").slice(0, 3);
  const suggestedFollowUps = fullMeeting.followUps.slice(0, 4);
  const projectFolders = buildProjectFolders(meetings);

  const handleStartRecording = () => {
    startRecording(`rec-${Date.now()}`);
    router.push("/(tabs)/record");
  };

  return (
    <AppScreen contentClassName="gap-6 pb-8 pt-2">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <View
            className="h-9 w-9 items-center justify-center"
            style={{ borderRadius: 18, backgroundColor: colors.text }}
          >
            <Mic color={colors.surface} size={16} strokeWidth={2.6} />
          </View>
          <View className="gap-0.5">
            <Text className="text-[13px] font-semibold" style={{ color: colors.text }}>
              {getGreeting()}
            </Text>
            <Text className="text-[12px]" style={{ color: colors.secondaryText }}>
              {currentUser.name}
            </Text>
          </View>
        </View>

        <View
          className="h-9 w-9 items-center justify-center bg-white"
          style={{ borderRadius: 18 }}
        >
          <Bell color={colors.primary} size={17} strokeWidth={2.4} />
        </View>
      </View>

      <SearchBar
        className="h-11 rounded-2xl bg-white"
        onChangeText={setQuery}
        placeholder="Search meetings, tasks, or ask AI..."
        value={query}
      />

      <StartRecordingCard onPress={handleStartRecording} />

      <AppCard className="gap-2" padding="md">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <View
              className="h-7 w-7 items-center justify-center bg-[#FFF1F0]"
              style={{ borderRadius: radius.sm }}
            >
              <Search color={colors.primary} size={14} strokeWidth={2.5} />
            </View>
            <Text className="text-[16px] font-bold" style={{ color: colors.text }}>
              {"Today's Actions"}
            </Text>
          </View>
          <View className="rounded-full bg-[#FFF1F0] px-3 py-1">
            <Text className="text-[11px] font-semibold" style={{ color: colors.primary }}>
              {actionItems.length} Pending
            </Text>
          </View>
        </View>

        {actionItems.map((task) => (
          <DashboardTaskRow
            key={task.id}
            task={task}
            onPress={() => {
              router.push({ pathname: "/meeting/[id]/tasks", params: { id: task.meetingId } });
            }}
          />
        ))}
      </AppCard>

      <HomeSection action="View All" title="Recent Meetings">
        {visibleMeetings.length > 0 ? (
          <ScrollView
            horizontal
            contentContainerClassName="gap-3 pb-1"
            showsHorizontalScrollIndicator={false}
          >
            {visibleMeetings.map((meeting) => (
              <DashboardMeetingCard
                key={meeting.id}
                meeting={meeting}
                onPress={() => {
                  router.push({ pathname: "/meeting/[id]/summary", params: { id: meeting.id } });
                }}
              />
            ))}
          </ScrollView>
        ) : (
          <View className="rounded-2xl bg-white p-5">
            <Text className="text-[14px] font-semibold" style={{ color: colors.text }}>
              No meetings found
            </Text>
            <Text className="mt-1 text-[13px] leading-5" style={{ color: colors.secondaryText }}>
              Try another title, project, tag, or date.
            </Text>
          </View>
        )}
      </HomeSection>

      <AppCard className="gap-4" padding="md">
        <Text className="text-[16px] font-bold" style={{ color: colors.text }}>
          AI Suggested Follow-ups
        </Text>
        <View className="flex-row flex-wrap gap-y-2">
          {suggestedFollowUps.map((followUp) => (
            <FollowUpPill
              key={followUp}
              label={followUp}
              onPress={() => {
                router.push({ pathname: "/meeting/[id]/tasks", params: { id: fullMeeting.id } });
              }}
            />
          ))}
        </View>
      </AppCard>

      <HomeSection title="Project Folders">
        <View className="flex-row gap-3">
          {projectFolders.slice(0, 2).map((folder) => (
            <ProjectFolderCard
              accent={folder.accent}
              key={folder.name}
              meetings={folder.count}
              name={folder.name}
            />
          ))}
        </View>
        <View className="flex-row gap-3">
          {projectFolders.slice(2, 4).map((folder) => (
            <ProjectFolderCard
              accent={folder.accent}
              key={folder.name}
              meetings={folder.count}
              name={folder.name}
            />
          ))}
        </View>
      </HomeSection>
    </AppScreen>
  );
}
