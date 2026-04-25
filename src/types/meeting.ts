export type UserPlan = "free" | "pro" | "business";

export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  plan: UserPlan;
};

export type MeetingStatus = "recording" | "processing" | "completed";

export type TaskStatus = "pending" | "in_progress" | "done";

export type TranscriptItem = {
  id: string;
  speaker: string;
  speakerColor: string;
  timestamp: string;
  text: string;
  isHighlighted: boolean;
};

export type Task = {
  id: string;
  title: string;
  owner: string;
  deadline: string;
  status: TaskStatus;
  sourceTimestamp: string;
  meetingId: string;
};

export type AIMessageRole = "user" | "assistant";

export type AIMessage = {
  id: string;
  role: AIMessageRole;
  content: string;
  timestampReferences: string[];
};

export type MindmapNodeType = "root" | "topic" | "decision" | "risk" | "task";

export type MindmapNode = {
  id: string;
  label: string;
  type: MindmapNodeType;
  children: MindmapNode[];
};

export type Meeting = {
  id: string;
  title: string;
  date: string;
  duration: string;
  participants: number;
  project: string;
  audioUrl: string;
  summary: string;
  keyTakeaways: string[];
  decisions: string[];
  risks: string[];
  followUps: string[];
  transcript: TranscriptItem[];
  tasks: Task[];
  mindmap: MindmapNode;
  status: MeetingStatus;
  tags: string[];
};

export type Insight = {
  id: string;
  label: string;
  value: string;
  tone: "red" | "neutral" | "success";
};
