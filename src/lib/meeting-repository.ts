import { supabase } from "@/lib/supabase";
import type { AIMessage, Meeting, MindmapNode, Task, TranscriptItem, User } from "@/types/meeting";
import type { SupabaseClient } from "@supabase/supabase-js";

type DashboardData = {
  currentUser: User;
  meetings: Meeting[];
  tasks: Task[];
  featuredMeeting: Meeting;
};

export const DEFAULT_USER: User = {
  id: "local-user",
  name: "Red Renote User",
  email: "user@redrenote.app",
  avatarUrl: "",
  plan: "business",
};

export const EMPTY_MEETING: Meeting = {
  id: "",
  title: "",
  date: "",
  duration: "",
  participants: 0,
  project: "",
  audioUrl: "",
  summary: "",
  keyTakeaways: [],
  decisions: [],
  risks: [],
  followUps: [],
  transcript: [],
  tasks: [],
  mindmap: { id: "", label: "", type: "root", children: [] },
  status: "completed",
  tags: [],
};

type MeetingRow = {
  id: string;
  owner_user_id: string;
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

function getSupabaseClient(): SupabaseClient {
  if (!supabase) {
    throw new Error("Supabase is not configured. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.");
  }

  return supabase;
}

async function getAuthenticatedUser(client: SupabaseClient): Promise<User> {
  const { data, error } = await client.auth.getUser();

  if (error || !data.user) {
    throw new Error("User is not authenticated.");
  }

  const user = data.user;
  const metadata = user.user_metadata ?? {};
  const fullName = typeof metadata.full_name === "string" ? metadata.full_name : "";
  const avatarUrl = typeof metadata.avatar_url === "string" ? metadata.avatar_url : "";
  const plan = metadata.plan === "free" || metadata.plan === "pro" || metadata.plan === "business" ? metadata.plan : "business";

  return {
    id: user.id,
    name: fullName || user.email?.split("@")[0] || "User",
    email: user.email ?? "",
    avatarUrl,
    plan,
  };
}

export async function getDashboardData(): Promise<DashboardData> {
  const client = getSupabaseClient();
  const currentUser = await getAuthenticatedUser(client);

  const [{ data: meetingRows, error: meetingsError }, { data: taskRows, error: tasksError }] = await Promise.all([
    client.from("meetings").select("*").eq("owner_user_id", currentUser.id).order("created_at", { ascending: false }),
    client.from("tasks").select("*").order("created_at", { ascending: false }),
  ]);

  if (meetingsError || tasksError || !meetingRows || !taskRows) {
    throw new Error(
      `Failed to load dashboard data from Supabase. meetingsError=${meetingsError?.message ?? "none"} tasksError=${tasksError?.message ?? "none"}`,
    );
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
    featuredMeeting: meetings[0] ?? EMPTY_MEETING,
  };
}

export async function getMeeting(meetingId: string): Promise<Meeting> {
  const client = getSupabaseClient();

  const [{ data: meetingRow, error: meetingError }, tasks, transcript] = await Promise.all([
    client.from("meetings").select("*").eq("id", meetingId).maybeSingle(),
    getMeetingTasks(meetingId),
    getTranscript(meetingId),
  ]);

  if (meetingError || !meetingRow) {
    throw new Error(`Meeting ${meetingId} not found or cannot be loaded from Supabase.`);
  }

  return rowToMeeting(meetingRow as MeetingRow, tasks, transcript);
}

export async function getMeetingTasks(meetingId?: string): Promise<Task[]> {
  const client = getSupabaseClient();

  let query = client.from("tasks").select("*").order("deadline", { ascending: true });

  if (meetingId) {
    query = query.eq("meeting_id", meetingId);
  }

  const { data, error } = await query;

  if (error || !data) {
    throw new Error(`Failed to load tasks from Supabase. ${error?.message ?? "No task data returned."}`);
  }

  return (data as TaskRow[]).map(rowToTask);
}

export async function getTranscript(meetingId: string): Promise<TranscriptItem[]> {
  const client = getSupabaseClient();

  const { data, error } = await client
    .from("transcript_items")
    .select("*")
    .eq("meeting_id", meetingId)
    .order("position", { ascending: true });

  if (error || !data) {
    throw new Error(`Failed to load transcript from Supabase. ${error?.message ?? "No transcript returned."}`);
  }

  return (data as TranscriptRow[]).map(rowToTranscriptItem);
}

export async function getAIChatMessages(meetingId: string): Promise<AIMessage[]> {
  const client = getSupabaseClient();

  const { data, error } = await client
    .from("ai_messages")
    .select("*")
    .eq("meeting_id", meetingId)
    .order("position", { ascending: true });

  if (error || !data) {
    throw new Error(`Failed to load AI chat messages from Supabase. ${error?.message ?? "No AI chat rows returned."}`);
  }

  return (data as AIMessageRow[]).map(rowToAIMessage);
}
