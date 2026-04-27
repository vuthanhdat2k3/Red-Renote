import { router, useLocalSearchParams } from "expo-router";
import { SendHorizonal } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Text, TextInput, View } from "react-native";
import { useTranslation } from "react-i18next";

import { MeetingDetailNav } from "@/components/meeting/MeetingDetailNav";
import { MeetingHomeAction } from "@/components/meeting/MeetingHomeAction";
import { AppHeader } from "@/components/shell/AppHeader";
import { AIChip } from "@/components/ui/AIChip";
import { AppButton } from "@/components/ui/Button";
import { AppCard } from "@/components/ui/Card";
import { AppScreen } from "@/components/ui/AppScreen";
import { getAIChatMessages, sendMeetingQuestion } from "@/lib/meeting-repository";
import type { AIMessage } from "@/types/meeting";

export default function MeetingChatRoute() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const meetingId = id ?? "meeting-demo";
  const [aiMessages, setAiMessages] = useState<AIMessage[]>([]);
  const [question, setQuestion] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    getAIChatMessages(meetingId)
      .then((messages) => { if (isMounted) setAiMessages(messages); })
      .catch((error) => { if (isMounted) setErrorMessage(error instanceof Error ? error.message : t("meeting.unable_load_chat")); });
    return () => { isMounted = false; };
  }, [meetingId, t]);

  const handleSend = async () => {
    if (!question.trim() || isSending) return;
    setIsSending(true);
    setErrorMessage(null);
    try {
      const nextMessages = await sendMeetingQuestion(meetingId, question);
      setAiMessages(nextMessages);
      setQuestion("");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : t("meeting.unable_send_question"));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <AppScreen contentClassName="gap-5">
      <AppHeader showBackButton onBackPress={() => router.back()} rightAction={<MeetingHomeAction />} title={t("meeting.chat")} subtitle={meetingId} />
      <MeetingDetailNav activeTab="chat" meetingId={meetingId} />
      <View className="flex-row flex-wrap gap-2">
        <AIChip active label={t("meeting.what_changed")} />
        <AIChip label={t("meeting.open_risks")} />
        <AIChip label={t("meeting.next_steps")} />
      </View>
      <AppCard className="gap-3">
        <TextInput
          className="min-h-20 rounded-2xl border border-app-border bg-white px-4 py-3 text-[15px] leading-6 text-app-text"
          multiline onChangeText={setQuestion}
          placeholder={t("common.ask_placeholder")}
          placeholderTextColor="#8B8B8B"
          value={question}
        />
        {errorMessage ? <Text className="text-sm font-semibold text-brand-primary">{errorMessage}</Text> : null}
        <AppButton icon={SendHorizonal} onPress={handleSend}>
          {isSending ? t("common.sending") : t("common.send_question")}
        </AppButton>
      </AppCard>
      {aiMessages.map((message) => (
        <AppCard className={message.role === "assistant" ? "gap-2" : "gap-2 bg-red-50"} key={message.id}>
          <Text className="text-xs font-semibold uppercase tracking-[1px] text-brand-primary">
            {message.role === "assistant" ? t("common.ai_assistant") : t("common.you")}
          </Text>
          <Text className="text-[15px] leading-6 text-app-text">{message.content}</Text>
          {message.timestampReferences.length > 0 ? (
            <Text className="text-xs font-semibold text-app-muted">{t("common.refs")} {message.timestampReferences.join(", ")}</Text>
          ) : null}
        </AppCard>
      ))}
    </AppScreen>
  );
}
