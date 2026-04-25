import { router } from "expo-router";
import { Bell, CalendarDays, Mic, Search, Sparkles } from "lucide-react-native";
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

function getTodayLabel() {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(new Date());
}

function matchesMeeting(meeting: Meeting, query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return true;
  }

  return [meeting.title, meeting.project, meeting.summary, meeting.date, ...meeting.tags].some((value) =>
    value.toLowerCase().includes(normalizedQuery),
  );
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

function getTaskSummary() {
  const pending = tasks.filter((task) => task.status !== "done").length;
  const inProgress = tasks.filter((task) => task.status === "in_progress").length;

  return { pending, inProgress };
}

export default function HomeRoute() {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const startRecording = useAppStore((state) => state.startRecording);

  const visibleMeetings = meetings.filter((meeting) => matchesMeeting(meeting, deferredQuery));
  const actionItems = tasks.filter((task) => task.status !== "done").slice(0, 4);
  const suggestedFollowUps = fullMeeting.followUps.slice(0, 4);
  const projectFolders = buildProjectFolders(meetings);
  const taskSummary = getTaskSummary();

  const handleStartRecording = () => {
    startRecording(`rec-${Date.now()}`);
    router.push("/(tabs)/record");
  };

  return (
    <AppScreen contentClassName="gap-6 pb-8 pt-2">
      <View className="flex-row items-start justify-between gap-4">
        <View className="flex-1 gap-2">
          <View className="flex-row items-center gap-2">
            <View
              className="h-10 w-10 items-center justify-center"
              style={{ borderRadius: 20, backgroundColor: colors.text }}
            >
              <Mic color={colors.surface} size={16} strokeWidth={2.6} />
            </View>
            <View
              className="rounded-full px-3 py-1.5"
              style={{ backgroundColor: "#FFF1F0" }}
            >
              <Text className="text-[11px] font-semibold uppercase tracking-[0.8px]" style={{ color: "#8C151B" }}>
                Home Dashboard
              </Text>
            </View>
          </View>

          <View className="gap-1">
            <Text className="text-[28px] font-bold leading-8" style={{ color: colors.text }}>
              {getGreeting()}, {currentUser.name.split(" ")[0]}
            </Text>
            <Text className="text-[14px] leading-6" style={{ color: colors.secondaryText }}>
              Keep today&apos;s meetings, tasks, and AI follow-ups in one place.
            </Text>
          </View>
        </View>

        <View className="items-end gap-3">
          <View
            className="h-10 w-10 items-center justify-center bg-white"
            style={{ borderRadius: 20, borderWidth: 1, borderColor: colors.border }}
          >
            <Bell color={colors.primary} size={17} strokeWidth={2.4} />
          </View>
          <View className="rounded-[18px] bg-white px-3 py-2" style={{ borderWidth: 1, borderColor: colors.border }}>
            <View className="flex-row items-center gap-2">
              <CalendarDays color={colors.secondaryText} size={14} strokeWidth={2.4} />
              <Text className="text-[11px] font-semibold" style={{ color: colors.secondaryText }}>
                {getTodayLabel()}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <SearchBar
        className="h-12 rounded-[20px] border-[#E7E5E4] bg-white"
        onChangeText={setQuery}
        placeholder="Search mock meetings by title, project, tag, or date"
        value={query}
      />

      <View className="flex-row gap-3">
        <AppCard className="flex-1 gap-3 border-[#F4D4D7] bg-[#FFF7F6]" padding="md">
          <View className="flex-row items-center gap-2">
            <View
              className="h-8 w-8 items-center justify-center"
              style={{ borderRadius: radius.md, backgroundColor: "#FFF1F0" }}
            >
              <Search color={colors.primary} size={15} strokeWidth={2.5} />
            </View>
            <Text className="text-[12px] font-semibold uppercase tracking-[0.8px]" style={{ color: "#8C151B" }}>
              Meetings found
            </Text>
          </View>
          <Text className="text-[24px] font-bold" style={{ color: colors.text }}>
            {visibleMeetings.length}
          </Text>
          <Text className="text-[13px] leading-5" style={{ color: colors.secondaryText }}>
            {query.trim().length > 0 ? "Filtered locally from mock meeting data." : "All recent mock meetings are visible."}
          </Text>
        </AppCard>

        <AppCard className="flex-1 gap-3" padding="md">
          <View className="flex-row items-center gap-2">
            <View
              className="h-8 w-8 items-center justify-center"
              style={{ borderRadius: radius.md, backgroundColor: "#F4F4F5" }}
            >
              <Sparkles color={colors.text} size={15} strokeWidth={2.4} />
            </View>
            <Text className="text-[12px] font-semibold uppercase tracking-[0.8px]" style={{ color: colors.secondaryText }}>
              Today&apos;s load
            </Text>
          </View>
          <Text className="text-[24px] font-bold" style={{ color: colors.text }}>
            {taskSummary.pending}
          </Text>
          <Text className="text-[13px] leading-5" style={{ color: colors.secondaryText }}>
            {taskSummary.inProgress} already moving, the rest still need attention.
          </Text>
        </AppCard>
      </View>

      <StartRecordingCard onPress={handleStartRecording} />

      <HomeSection action={`${visibleMeetings.length} shown`} title="Recent Meetings">
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
          <AppCard className="gap-2" padding="lg">
            <Text className="text-[15px] font-bold" style={{ color: colors.text }}>
              No mock meetings match this search
            </Text>
            <Text className="text-[13px] leading-5" style={{ color: colors.secondaryText }}>
              Try another title, date, project name, or tag. The filter only affects the local mock meeting list.
            </Text>
          </AppCard>
        )}
      </HomeSection>

      <HomeSection action={`${actionItems.length} pending`} title="Today&apos;s Action Items">
        <AppCard className="gap-3 bg-[#FCFCFC]" padding="sm">
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
      </HomeSection>

      <HomeSection action="AI assisted" title="Suggested Follow-ups">
        <AppCard className="gap-4" padding="md">
          <Text className="text-[14px] leading-6" style={{ color: colors.secondaryText }}>
            Suggested next steps pulled from the latest meeting summary and ready for task review.
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
      </HomeSection>

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
