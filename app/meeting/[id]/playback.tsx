import { router, useLocalSearchParams } from "expo-router";

import { MeetingDetailNav } from "@/components/meeting/MeetingDetailNav";
import { MeetingHomeAction } from "@/components/meeting/MeetingHomeAction";
import { MeetingPlaybackCard } from "@/components/meeting/MeetingPlaybackCard";
import { AppHeader } from "@/components/shell/AppHeader";
import { AppScreen } from "@/components/ui/AppScreen";
import { useMeeting } from "@/hooks/useMeetingData";

export default function MeetingPlaybackRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const meetingId = id ?? "meeting-demo";
  const meeting = useMeeting(meetingId);

  return (
    <AppScreen contentClassName="gap-6">
      <AppHeader
        showBackButton
        onBackPress={() => router.back()}
        rightAction={<MeetingHomeAction />}
        title="Playback"
        subtitle={meeting.title || meetingId}
      />
      <MeetingDetailNav activeTab="playback" meetingId={meetingId} />
      <MeetingPlaybackCard audioUrl={meeting.audioUrl} />
    </AppScreen>
  );
}
