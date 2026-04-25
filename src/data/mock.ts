import type { Insight, Meeting, MeetingTask, TranscriptSegment } from "@/types/meeting";

export const meetings: Meeting[] = [
  {
    id: "m-101",
    title: "Q2 Growth Review",
    startsAt: "Today, 10:30",
    duration: "42 min",
    status: "completed",
    participants: 6,
    summary: "Pricing, onboarding friction, and expansion accounts need follow-up.",
    tags: ["Revenue", "Action items"],
  },
  {
    id: "m-102",
    title: "Product Sync",
    startsAt: "Yesterday",
    duration: "28 min",
    status: "processing",
    participants: 4,
    summary: "AI analysis is extracting decisions, risks, and owners.",
    tags: ["Product", "AI analysis"],
  },
];

export const insights: Insight[] = [
  { id: "i-1", label: "Meetings", value: "12", tone: "neutral" },
  { id: "i-2", label: "Tasks", value: "18", tone: "red" },
  { id: "i-3", label: "Saved", value: "6h", tone: "success" },
];

export const tasks: MeetingTask[] = [
  {
    id: "t-1",
    title: "Send revised onboarding metrics",
    owner: "Mina",
    deadline: "Today",
    status: "in_progress",
    sourceTimestamp: "18:42",
  },
  {
    id: "t-2",
    title: "Confirm enterprise pricing experiment",
    owner: "Alex",
    deadline: "Fri",
    status: "todo",
    sourceTimestamp: "31:08",
  },
];

export const transcriptSegments: TranscriptSegment[] = [
  {
    id: "tr-1",
    speaker: "Linh",
    timestamp: "12:04",
    text: "The renewal risk is concentrated in accounts that did not complete onboarding in the first two weeks.",
    highlighted: true,
  },
  {
    id: "tr-2",
    speaker: "Alex",
    timestamp: "13:19",
    text: "Let us separate enablement follow-up from the pricing experiment so the owners stay clear.",
  },
];
