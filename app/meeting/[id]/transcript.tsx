import { router, useLocalSearchParams } from "expo-router";

import { MeetingDetailNav } from "@/components/meeting/MeetingDetailNav";
import { TranscriptBlock } from "@/components/meeting/TranscriptBlock";
import { AppHeader } from "@/components/shell/AppHeader";
import { AppScreen } from "@/components/ui/AppScreen";
import { SearchBar } from "@/components/ui/SearchBar";
import { transcriptSegments } from "@/data/mock";

export default function MeetingTranscriptRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const meetingId = id ?? "meeting-demo";

  return (
    <AppScreen contentClassName="gap-5">
      <AppHeader showBackButton onBackPress={() => router.back()} title="Transcript" subtitle={meetingId} />
      <MeetingDetailNav activeTab="transcript" meetingId={meetingId} />
      <SearchBar onChangeText={() => undefined} placeholder="Search transcript" value="" />
      {transcriptSegments.map((segment) => (
        <TranscriptBlock key={segment.id} {...segment} />
      ))}
    </AppScreen>
  );
}
