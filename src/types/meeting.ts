export type MeetingStatus = "recording" | "processing" | "completed";

export type Meeting = {
  id: string;
  title: string;
  startsAt: string;
  duration: string;
  status: MeetingStatus;
  participants: number;
  summary: string;
  tags: string[];
};

export type MeetingTaskStatus = "todo" | "in_progress" | "done" | "blocked";

export type MeetingTask = {
  id: string;
  title: string;
  owner: string;
  deadline: string;
  status: MeetingTaskStatus;
  sourceTimestamp: string;
};

export type TranscriptSegment = {
  id: string;
  speaker: string;
  timestamp: string;
  text: string;
  highlighted?: boolean;
};

export type Insight = {
  id: string;
  label: string;
  value: string;
  tone: "red" | "neutral" | "success";
};
