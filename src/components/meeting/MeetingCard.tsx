import { Clock, Users } from "lucide-react-native";
import { Text, View } from "react-native";

import { AppCard } from "@/components/ui/Card";
import { colors } from "@/constants/tokens";
import type { Meeting, MeetingStatus } from "@/types/meeting";

export type MeetingCardProps = {
  title: string;
  date: string;
  duration: string;
  participants: number;
  summaryPreview: string;
  status?: MeetingStatus;
  tags?: string[];
};

export function MeetingCard({ title, date, duration, participants, summaryPreview, status = "completed", tags = [] }: MeetingCardProps) {
  return (
    <AppCard className="gap-4">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1 gap-1">
          <Text className="text-[17px] font-bold text-app-text">{title}</Text>
          <Text className="text-sm font-medium text-brand-primary">{date}</Text>
          <Text className="text-sm leading-5 text-app-muted">{summaryPreview}</Text>
        </View>
        <View className="rounded-full bg-red-50 px-3 py-1">
          <Text className="text-xs font-semibold capitalize text-brand-primary">{status.replace("_", " ")}</Text>
        </View>
      </View>
      <View className="flex-row items-center gap-4">
        <View className="flex-row items-center gap-1.5">
          <Clock color={colors.secondaryText} size={15} />
          <Text className="text-xs font-medium text-app-muted">{duration}</Text>
        </View>
        <View className="flex-row items-center gap-1.5">
          <Users color={colors.secondaryText} size={15} />
          <Text className="text-xs font-medium text-app-muted">{participants} people</Text>
        </View>
      </View>
      {tags.length > 0 ? (
        <View className="flex-row flex-wrap gap-2">
          {tags.map((tag) => (
            <View className="rounded-full bg-app-background px-3 py-1" key={tag}>
              <Text className="text-xs font-semibold text-app-muted">{tag}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </AppCard>
  );
}

export function MeetingCardFromMeeting({ meeting }: { meeting: Meeting }) {
  return (
    <MeetingCard
      date={meeting.startsAt}
      duration={meeting.duration}
      participants={meeting.participants}
      status={meeting.status}
      summaryPreview={meeting.summary}
      tags={meeting.tags}
      title={meeting.title}
    />
  );
}
