import { router, useLocalSearchParams } from "expo-router";
import { useDeferredValue, useState } from "react";

import { MeetingDetailNav } from "@/components/meeting/MeetingDetailNav";
import { MeetingHomeAction } from "@/components/meeting/MeetingHomeAction";
import { TranscriptBlock } from "@/components/meeting/TranscriptBlock";
import { AppHeader } from "@/components/shell/AppHeader";
import { AppScreen } from "@/components/ui/AppScreen";
import { SearchBar } from "@/components/ui/SearchBar";
import { useTranscript } from "@/hooks/useMeetingData";

export default function MeetingTranscriptRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const meetingId = id ?? "meeting-demo";
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const transcriptSegments = useTranscript(meetingId);
  const visibleSegments = transcriptSegments.filter((segment) => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return true;
    }

    return [segment.speaker, segment.timestamp, segment.text].some((value) => value.toLowerCase().includes(normalizedQuery));
  });

  return (
    <AppScreen contentClassName="gap-5">
      <AppHeader
        showBackButton
        onBackPress={() => router.back()}
        rightAction={<MeetingHomeAction />}
        title="Transcript"
        subtitle={meetingId}
      />
      <MeetingDetailNav activeTab="transcript" meetingId={meetingId} />
      <SearchBar onChangeText={setQuery} placeholder="Search transcript" value={query} />
      {visibleSegments.map((segment) => (
        <TranscriptBlock key={segment.id} {...segment} />
      ))}
    </AppScreen>
  );
}
