import { aiMessages, currentUser, fullMeeting, meetings as mockMeetings, tasks as mockTasks, transcriptSegments } from "@/data/mock";
import { supabase } from "@/lib/supabase";
import type { AIMessage, Meeting, MindmapNode, Task, TranscriptItem } from "@/types/meeting";

type DashboardData = {
  currentUser: typeof currentUser;
  meetings: Meeting[];
  tasks: Task[];
  featuredMeeting: Meeting;
};

type MeetingRow = {
  id: string;
  title: string;
  date: string;
  duration: string;
  participants: number;
  project: string;
  audio_url: string;
  summary: string;
  key_takeaways: string[];
  decisions: string[];
  risks: string[];
  follow_ups: string[];
  status: Meeting["status"];
  tags: string[];
  mindmap: MindmapNode;
};

type TaskRow = {
  id: string;
  title: string;
  owner: string;
  deadline: string;
  status: Task["status"];
  source_timestamp: string;
  meeting_id: string;
};

type TranscriptRow = {
  id: string;
  speaker: string;
  speaker_color: string;
  timestamp: string;
  text: string;
  is_highlighted: boolean;
};

type AIMessageRow = {
  id: string;
  role: AIMessage["role"];
  content: string;
  timestamp_references: string[];
};

function rowToTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    owner: row.owner,
    deadline: row.deadline,
    status: row.status,
    sourceTimestamp: row.source_timestamp,
    meetingId: row.meeting_id,
  };
}

function rowToTranscriptItem(row: TranscriptRow): TranscriptItem {
  return {
    id: row.id,
    speaker: row.speaker,
    speakerColor: row.speaker_color,
    timestamp: row.timestamp,
    text: row.text,
    isHighlighted: row.is_highlighted,
  };
}

function rowToAIMessage(row: AIMessageRow): AIMessage {
  return {
    id: row.id,
    role: row.role,
    content: row.content,
    timestampReferences: row.timestamp_references,
  };
}

function rowToMeeting(row: MeetingRow, tasks: Task[] = [], transcript: TranscriptItem[] = []): Meeting {
  return {
    id: row.id,
    title: row.title,
    date: row.date,
    duration: row.duration,
    participants: row.participants,
    project: row.project,
    audioUrl: row.audio_url,
    summary: row.summary,
    keyTakeaways: row.key_takeaways,
    decisions: row.decisions,
    risks: row.risks,
    followUps: row.follow_ups,
    transcript,
    tasks,
    mindmap: row.mindmap,
    status: row.status,
    tags: row.tags,
  };
}

function getMockMeeting(meetingId: string) {
  const meeting = mockMeetings.find((item) => item.id === meetingId) ?? fullMeeting;

  return meeting.id === meetingId ? meeting : { ...meeting, id: meetingId };
}

export async function getDashboardData(): Promise<DashboardData> {
  if (!supabase) {
    return { currentUser, meetings: mockMeetings, tasks: mockTasks, featuredMeeting: fullMeeting };
  }

  const [{ data: meetingRows, error: meetingsError }, { data: taskRows, error: tasksError }] = await Promise.all([
    supabase.from("meetings").select("*").order("created_at", { ascending: false }),
    supabase.from("tasks").select("*").order("created_at", { ascending: false }),
  ]);

  if (meetingsError || tasksError || !meetingRows || !taskRows) {
    return { currentUser, meetings: mockMeetings, tasks: mockTasks, featuredMeeting: fullMeeting };
  }

  const tasks = (taskRows as TaskRow[]).map(rowToTask);
  const meetings = (meetingRows as MeetingRow[]).map((meeting) =>
    rowToMeeting(
      meeting,
      tasks.filter((task) => task.meetingId === meeting.id),
      [],
    ),
  );

  return {
    currentUser,
    meetings,
    tasks,
    featuredMeeting: meetings[0] ?? fullMeeting,
  };
}

export async function getMeeting(meetingId: string): Promise<Meeting> {
  if (!supabase) {
    return getMockMeeting(meetingId);
  }

  const [{ data: meetingRow, error: meetingError }, tasks, transcript] = await Promise.all([
    supabase.from("meetings").select("*").eq("id", meetingId).maybeSingle(),
    getMeetingTasks(meetingId),
    getTranscript(meetingId),
  ]);

  if (meetingError || !meetingRow) {
    return getMockMeeting(meetingId);
  }

  return rowToMeeting(meetingRow as MeetingRow, tasks, transcript);
}

export async function getMeetingTasks(meetingId?: string): Promise<Task[]> {
  if (!supabase) {
    return meetingId ? mockTasks.filter((task) => task.meetingId === meetingId || meetingId.startsWith("meeting-")) : mockTasks;
  }

  let query = supabase.from("tasks").select("*").order("deadline", { ascending: true });

  if (meetingId) {
    query = query.eq("meeting_id", meetingId);
  }

  const { data, error } = await query;

  if (error || !data) {
    return meetingId ? mockTasks.filter((task) => task.meetingId === meetingId || meetingId.startsWith("meeting-")) : mockTasks;
  }

  return (data as TaskRow[]).map(rowToTask);
}

export async function getTranscript(meetingId: string): Promise<TranscriptItem[]> {
  if (!supabase) {
    return transcriptSegments;
  }

  const { data, error } = await supabase
    .from("transcript_items")
    .select("*")
    .eq("meeting_id", meetingId)
    .order("position", { ascending: true });

  if (error || !data) {
    return transcriptSegments;
  }

  return (data as TranscriptRow[]).map(rowToTranscriptItem);
}

export async function getAIChatMessages(meetingId: string): Promise<AIMessage[]> {
  if (!supabase) {
    return aiMessages;
  }

  const { data, error } = await supabase
    .from("ai_messages")
    .select("*")
    .eq("meeting_id", meetingId)
    .order("position", { ascending: true });

  if (error || !data) {
    return aiMessages;
  }

  return (data as AIMessageRow[]).map(rowToAIMessage);
}
