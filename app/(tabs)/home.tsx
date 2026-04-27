import { router } from "expo-router";
import { Bell, BrainCircuit, CalendarDays, CheckCircle2, Mic, Sparkles } from "lucide-react-native";
import { useDeferredValue, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { DashboardMeetingCard } from "@/components/home/DashboardMeetingCard";
import { DashboardTaskRow } from "@/components/home/DashboardTaskRow";
import { FollowUpPill } from "@/components/home/FollowUpPill";
import { HomeSection } from "@/components/home/HomeSection";
import { ProjectFolderCard } from "@/components/home/ProjectFolderCard";
import { StartRecordingCard } from "@/components/home/StartRecordingCard";
import { StatusPill, TopExperience, TopMetric } from "@/components/shell/TopExperience";
import { AppCard } from "@/components/ui/Card";
import { AppScreen } from "@/components/ui/AppScreen";
import { PressableScale } from "@/components/ui/PressableScale";
import { SearchBar } from "@/components/ui/SearchBar";
import { colors } from "@/constants/tokens";
import { useDashboardData } from "@/hooks/useMeetingData";
import { useAppStore } from "@/store/app-store";
import type { Meeting } from "@/types/meeting";

const folderAccents = ["#E50914", "#005AAB", "#147A4D", "#B45309"];

function getGreeting(t: (key: string) => string) {
  const hour = new Date().getHours();
  if (hour < 12) return t("home.greeting_morning");
  if (hour < 18) return t("home.greeting_afternoon");
  return t("home.greeting_evening");
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

function getTaskSummary(tasks: ReturnType<typeof useDashboardData>["tasks"]) {
  const pending = tasks.filter((task) => task.status !== "done").length;
  const inProgress = tasks.filter((task) => task.status === "in_progress").length;

  return { pending, inProgress };
}

export default function HomeRoute() {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const { currentUser, meetings, tasks, featuredMeeting } = useDashboardData();
  const startRecording = useAppStore((state) => state.startRecording);

  const visibleMeetings = meetings.filter((meeting) => matchesMeeting(meeting, deferredQuery));
  const actionItems = tasks.filter((task) => task.status !== "done").slice(0, 4);
  const suggestedFollowUps = featuredMeeting.followUps.slice(0, 4);
  const projectFolders = buildProjectFolders(meetings);
  const taskSummary = getTaskSummary(tasks);

  const handleStartRecording = () => {
    startRecording(`rec-${Date.now()}`);
    router.push("/(tabs)/record");
  };

  return (
    <AppScreen contentClassName="gap-8 pt-4">
      <View className="absolute top-0 right-0 h-64 w-64 rounded-full bg-[#FFE1DA] opacity-30 -mr-20 -mt-20 blur-3xl" />
      
      <View className="px-6 gap-6">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-brand-primary/10 border border-brand-primary/20">
              <Text className="text-[14px] font-bold text-brand-primary">{currentUser.name.charAt(0)}</Text>
            </View>
            <View>
              <Text className="text-[12px] font-bold text-app-muted uppercase tracking-wider">{getTodayLabel()}</Text>
            </View>
          </View>
          
          <PressableScale accessibilityLabel="Open notifications" accessibilityRole="button" scaleTo={0.92}>
            <View className="h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm border border-app-border">
              <Bell color={colors.text} size={18} strokeWidth={2.5} />
              <View className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full bg-brand-primary border-2 border-white" />
            </View>
          </PressableScale>
        </View>

        <View className="gap-2">
          <Text className="text-[34px] font-extrabold tracking-tight text-app-text leading-[40px]">
            {getGreeting(t)}, <Text className="text-brand-primary">{currentUser.name.split(" ")[0]}</Text>
          </Text>
          <Text className="text-[15px] leading-6 text-app-muted font-medium max-w-[85%]">
            You have <Text className="text-brand-primary font-bold">{taskSummary.pending}</Text> {t("home.follow_ups")}
          </Text>
        </View>

        <View className="flex-row gap-3 mt-2">
          <PressableScale 
            className="flex-1 bg-white rounded-[24px] p-4 border border-[#FFE1DA] shadow-sm" 
            onPress={() => router.push("/(tabs)/knowledge")}
            scaleTo={0.96}
          >
            <View className="flex-row items-center justify-between mb-3">
              <View className="h-9 w-9 items-center justify-center rounded-full bg-[#FFF1F0]">
                <BrainCircuit color={colors.primary} size={18} strokeWidth={2.5} />
              </View>
              <Text className="text-[24px] font-extrabold tracking-tight text-app-text">{visibleMeetings.length}</Text>
            </View>
            <Text className="text-[13px] font-bold text-app-muted uppercase tracking-wider">{t("home.insights")}</Text>
          </PressableScale>

          <PressableScale 
            className="flex-1 bg-white rounded-[24px] p-4 border border-app-border shadow-sm" 
            onPress={() => router.push("/(tabs)/tasks")}
            scaleTo={0.96}
          >
            <View className="flex-row items-center justify-between mb-3">
              <View className="h-9 w-9 items-center justify-center rounded-full bg-blue-50">
                <CheckCircle2 color={colors.blue} size={18} strokeWidth={2.5} />
              </View>
              <Text className="text-[24px] font-extrabold tracking-tight text-app-text">{taskSummary.pending}</Text>
            </View>
            <Text className="text-[13px] font-bold text-app-muted uppercase tracking-wider">{t("home.tasks")}</Text>
          </PressableScale>
          
          <PressableScale 
            className="flex-1 bg-white rounded-[24px] p-4 border border-app-border shadow-sm"
            scaleTo={0.96}
          >
            <View className="flex-row items-center justify-between mb-3">
              <View className="h-9 w-9 items-center justify-center rounded-full bg-green-50">
                <Sparkles color={colors.success} size={18} strokeWidth={2.5} />
              </View>
              <Text className="text-[24px] font-extrabold tracking-tight text-app-text">{taskSummary.inProgress}</Text>
            </View>
            <Text className="text-[13px] font-bold text-app-muted uppercase tracking-wider">{t("home.active")}</Text>
          </PressableScale>
        </View>

        <SearchBar
          onChangeText={setQuery}
          placeholder={t("home.search_placeholder")}
          value={query}
          onFilterPress={() => {}}
          variant="ai"
        />
      </View>

      <View className="px-6">
        <StartRecordingCard onPress={handleStartRecording} />
      </View>

      <HomeSection action={`${visibleMeetings.length} ${t("home.shown")}`} title={t("home.recent_meetings")}>
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
              {t("home.no_meetings_title")}
            </Text>
            <Text className="text-[13px] leading-5" style={{ color: colors.secondaryText }}>
              {t("home.no_meetings_desc")}
            </Text>
          </AppCard>
        )}
      </HomeSection>

      <HomeSection action={`${actionItems.length} ${t("home.pending")}`} title={t("home.action_items")}>
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

      <HomeSection action={t("home.ai_assisted")} title={t("home.follow_ups_section")}>
        <AppCard className="gap-4" padding="md">
          <Text className="text-[14px] leading-6" style={{ color: colors.secondaryText }}>
            {t("home.follow_ups_desc")}
          </Text>
          <View className="flex-row flex-wrap gap-y-2">
            {suggestedFollowUps.map((followUp) => (
              <FollowUpPill
                key={followUp}
                label={followUp}
                onPress={() => {
                  router.push({ pathname: "/meeting/[id]/tasks", params: { id: featuredMeeting.id } });
                }}
              />
            ))}
          </View>
        </AppCard>
      </HomeSection>

      <HomeSection title={t("home.project_folders")}>
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
