import { router, useLocalSearchParams } from "expo-router";
import { CheckCircle2, Lightbulb, MessageCircle } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { Alert, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { MeetingDetailNav } from "@/components/meeting/MeetingDetailNav";
import { MeetingHomeAction } from "@/components/meeting/MeetingHomeAction";
import { AppHeader } from "@/components/shell/AppHeader";
import { AIChip } from "@/components/ui/AIChip";
import { AppButton } from "@/components/ui/Button";
import { AppCard } from "@/components/ui/Card";
import { AppScreen } from "@/components/ui/AppScreen";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { LoadingStep } from "@/components/ui/LoadingStep";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { useMeeting } from "@/hooks/useMeetingData";
import { analyzeMeetingSummary } from "@/lib/meeting-repository";
import { useAppStore } from "@/store/app-store";
import { colors } from "@/constants/tokens";
import type { Meeting } from "@/types/meeting";

export default function MeetingSummaryRoute() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const meetingId = id ?? "meeting-demo";
  const loadedMeeting = useMeeting(meetingId);
  const [meeting, setMeeting] = useState<Meeting>(loadedMeeting);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const requestedAnalysisMeetingIdRef = useRef<string | null>(null);

  const summaryLanguage = useAppStore((s) => s.summaryLanguage);
  const setSummaryLanguage = useAppStore((s) => s.setSummaryLanguage);

  useEffect(() => {
    setMeeting(loadedMeeting);
  }, [loadedMeeting]);

  useEffect(() => {
    if (
      !loadedMeeting.id ||
      loadedMeeting.summary.trim().length > 0 ||
      requestedAnalysisMeetingIdRef.current === loadedMeeting.id
    ) {
      return;
    }

    let isMounted = true;
    requestedAnalysisMeetingIdRef.current = loadedMeeting.id;
    setIsAnalyzing(true);

    analyzeMeetingSummary(loadedMeeting.id, summaryLanguage)
      .then((analyzedMeeting) => {
        if (isMounted) {
          setMeeting(analyzedMeeting);
          setAnalysisError(null);
        }
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : "Could not generate the meeting summary.";
        if (isMounted) {
          setAnalysisError(message);
          Alert.alert("Summary unavailable", message);
        }
      })
      .finally(() => {
        if (isMounted) setIsAnalyzing(false);
      });

    return () => {
      isMounted = false;
    };
  }, [loadedMeeting.id, loadedMeeting.summary]);

  const handleRegenerate = () => {
    requestedAnalysisMeetingIdRef.current = null;
    setIsAnalyzing(true);
    setAnalysisError(null);

    analyzeMeetingSummary(meetingId, summaryLanguage)
      .then((analyzedMeeting) => {
        setMeeting(analyzedMeeting);
        setAnalysisError(null);
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : "Could not generate the meeting summary.";
        setAnalysisError(message);
        Alert.alert("Summary unavailable", message);
      })
      .finally(() => setIsAnalyzing(false));
  };

  return (
    <AppScreen contentClassName="gap-6">
      <AppHeader
        showBackButton
        onBackPress={() => router.replace("/(tabs)/home")}
        rightAction={<MeetingHomeAction />}
        title={t("summary.title")}
        subtitle={meetingId}
      />
      <MeetingDetailNav activeTab="summary" meetingId={meetingId} />

      {isAnalyzing || analysisError ? (
        <LoadingStep
          description={analysisError ?? t("summary.generating")}
          status={isAnalyzing ? "loading" : "pending"}
          title={t("summary.summary_analysis")}
        />
      ) : null}

      <AppCard className="gap-4 border-none bg-white" padding="lg">
        <View className="flex-row flex-wrap gap-2">
          <AIChip active label={t("summary.ai_summary")} />
          <AIChip label={`${meeting.decisions.length} ${t("summary.decisions")}`} />
          <AIChip label={`${meeting.tasks.length} ${t("summary.tasks")}`} />
        </View>
        <View className="gap-2">
          <Text className="text-xs font-bold uppercase tracking-wider text-brand-primary">{meeting.project}</Text>
          <Text className="text-[24px] font-extrabold leading-8 text-app-text">{meeting.title}</Text>
        </View>
        <View className="h-[1px] w-full bg-app-border/50" />
        <Text className="text-[15px] leading-6 text-app-muted">
          {meeting.summary || t("summary.summary_placeholder")}
        </Text>

        <View className="h-[1px] w-full bg-app-border/50" />
        <LanguageSelector
          label={t("summary.summary_language")}
          value={summaryLanguage}
          onChange={setSummaryLanguage}
        />
        <AppButton
          variant="secondary"
          className="border-brand-primary/20 bg-red-50/30"
          textClassName="text-brand-primary"
          onPress={handleRegenerate}
          loading={isAnalyzing}
        >
          {t("summary.regenerate")}
        </AppButton>
      </AppCard>

      <View className="gap-4">
        <SectionTitle title={t("summary.key_takeaways")} />
        <View className="gap-3">
          {meeting.keyTakeaways.map((item) => (
            <View key={item} className="flex-row gap-3 rounded-2xl bg-blue-50/50 p-4 border border-blue-100/50">
              <View className="mt-0.5 h-6 w-6 items-center justify-center rounded-full bg-blue-100">
                <Lightbulb color={colors.blue} size={14} strokeWidth={2.5} />
              </View>
              <Text className="flex-1 text-[15px] font-medium leading-6 text-app-text">{item}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className="gap-4">
        <SectionTitle title={t("summary.key_decisions")} />
        <View className="gap-3">
          {meeting.decisions.map((item) => (
            <View key={item} className="flex-row gap-3 rounded-2xl bg-emerald-50/50 p-4 border border-emerald-100/50">
              <View className="mt-0.5 h-6 w-6 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle2 color={colors.success} size={14} strokeWidth={2.5} />
              </View>
              <Text className="flex-1 text-[15px] font-medium leading-6 text-app-text">{item}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className="pb-8">
        <AppButton
          icon={MessageCircle}
          variant="secondary"
          className="border-brand-primary/20 bg-red-50/30"
          textClassName="text-brand-primary"
          onPress={() => router.push({ pathname: "/meeting/[id]/chat", params: { id: meetingId } })}
        >
          {t("summary.ask_ai")}
        </AppButton>
      </View>
    </AppScreen>
  );
}
