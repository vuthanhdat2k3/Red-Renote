import AsyncStorage from "@react-native-async-storage/async-storage";
import { aiMessages as seedAiMessages, meetings as seedMeetings } from "@/data/mock";
import {
  askMeetingQuestion,
  createMeetingFromAudio,
  getMeetingDetailFromApi,
  isMeetingApiConfigured,
  regenerateMeeting,
  waitForMeetingAnalysis,
} from "@/lib/meeting-api";
import { supabase } from "@/lib/supabase";
import type { AIMessage, Meeting, MindmapNode, Task, TranscriptItem, User } from "@/types/meeting";
import type { SupabaseClient } from "@supabase/supabase-js";

type DashboardData = {
  currentUser: User;
  meetings: Meeting[];
  tasks: Task[];
  featuredMeeting: Meeting;
};

type SavedMeetingBundle = {
  meeting: Meeting;
  aiMessages: AIMessage[];
};

const SAVED_MEETINGS_STORAGE_KEY = "red-renote:saved-meetings";
const LOCAL_BACKEND_OWNER_USER_ID = "00000000-0000-0000-0000-000000000000";

let savedMeetingBundlesCache: SavedMeetingBundle[] | null = null;

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

async function getBackendOwnerUserId(): Promise<string> {
  try {
    const client = getSupabaseClient();
    const { data } = await client.auth.getUser();
    return data.user?.id ?? LOCAL_BACKEND_OWNER_USER_ID;
  } catch {
    return LOCAL_BACKEND_OWNER_USER_ID;
  }
}

function mergeById<T extends { id: string }>(primary: T[], secondary: T[]): T[] {
  const map = new Map<string, T>();

  primary.forEach((item) => map.set(item.id, item));
  secondary.forEach((item) => {
    if (!map.has(item.id)) {
      map.set(item.id, item);
    }
  });

  return Array.from(map.values());
}

async function loadSavedMeetingBundles(): Promise<SavedMeetingBundle[]> {
  if (savedMeetingBundlesCache) {
    return savedMeetingBundlesCache;
  }

  try {
    const raw = await AsyncStorage.getItem(SAVED_MEETINGS_STORAGE_KEY);
    savedMeetingBundlesCache = raw ? (JSON.parse(raw) as SavedMeetingBundle[]) : [];
  } catch {
    savedMeetingBundlesCache = [];
  }

  return savedMeetingBundlesCache;
}

async function persistSavedMeetingBundles(bundles: SavedMeetingBundle[]) {
  savedMeetingBundlesCache = bundles;
  await AsyncStorage.setItem(SAVED_MEETINGS_STORAGE_KEY, JSON.stringify(bundles));
}

async function addSavedMeetingBundle(bundle: SavedMeetingBundle) {
  const existing = await loadSavedMeetingBundles();
  const nextBundles = [bundle, ...existing.filter((item) => item.meeting.id !== bundle.meeting.id)];
  await persistSavedMeetingBundles(nextBundles);
}

async function getLocalMeetings(): Promise<Meeting[]> {
  const savedBundles = await loadSavedMeetingBundles();
  const savedMeetings = savedBundles.map((bundle) => bundle.meeting);

  return mergeById(savedMeetings, seedMeetings);
}

async function getLocalMeetingBundle(meetingId: string): Promise<SavedMeetingBundle | null> {
  const savedBundles = await loadSavedMeetingBundles();
  const savedBundle = savedBundles.find((bundle) => bundle.meeting.id === meetingId);

  if (savedBundle) {
    return savedBundle;
  }

  const seedMeeting = seedMeetings.find((meeting) => meeting.id === meetingId);
  if (!seedMeeting) {
    return null;
  }

  return {
    meeting: seedMeeting,
    aiMessages: meetingId === "meeting-product-planning-q2" ? seedAiMessages : [],
  };
}

function formatMeetingDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatMeetingDuration(durationMillis: number) {
  const totalMinutes = Math.max(1, Math.round(durationMillis / 60000));
  return `${totalMinutes} min`;
}

function buildMockProcessedMeeting(recordingId: string, recordingUri: string | null, durationMillis: number): SavedMeetingBundle {
  const createdAt = new Date();
  const meetingId = recordingId.replace("rec-", "meeting-");
  const titleSuffix = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(createdAt);

  const meeting: Meeting = {
    id: meetingId,
    title: `Recorded Meeting ${titleSuffix}`,
    date: formatMeetingDate(createdAt),
    duration: formatMeetingDuration(durationMillis),
    participants: 1,
    project: "Recorded Meetings",
    audioUrl: recordingUri ?? "",
    summary:
      "This recording is using temporary mock analysis. The meeting has been saved successfully, with placeholder summary, transcript, decisions, tasks, and mindmap until the real analysis pipeline is ready.",
    keyTakeaways: [
      "Recording completed and was saved from the device.",
      "The current analysis output is mocked to keep the meeting flow usable.",
      "Summary, transcript, and tasks can be replaced later by backend processing.",
    ],
    decisions: [
      "Temporarily bypass real transcript and insight extraction.",
      "Persist the meeting immediately after recording finishes.",
    ],
    risks: [
      "The current transcript and tasks are placeholders, not AI-generated output.",
      "Owners and deadlines still need real extraction logic.",
    ],
    followUps: [
      "Replace mock processing with real upload and transcription.",
      "Map backend analysis output into summary, transcript, tasks, and chat.",
    ],
    transcript: [
      {
        id: `${meetingId}-tr-1`,
        speaker: "Recorder",
        speakerColor: "#E50914",
        timestamp: "00:00",
        text: "Recording saved successfully. Transcript is temporarily mocked while the analysis service is not connected.",
        isHighlighted: true,
      },
      {
        id: `${meetingId}-tr-2`,
        speaker: "System",
        speakerColor: "#005AAB",
        timestamp: "00:08",
        text: "You can still open the meeting summary, transcript, tasks, and chat screens for this saved meeting.",
        isHighlighted: false,
      },
    ],
    tasks: [
      {
        id: `${meetingId}-task-1`,
        title: "Connect real recording analysis pipeline",
        owner: "Product team",
        deadline: "TBD",
        status: "pending",
        sourceTimestamp: "00:00",
        meetingId,
      },
      {
        id: `${meetingId}-task-2`,
        title: "Replace mock meeting output with backend response",
        owner: "Engineering",
        deadline: "TBD",
        status: "pending",
        sourceTimestamp: "00:08",
        meetingId,
      },
    ],
    mindmap: {
      id: `${meetingId}-mindmap-root`,
      label: "Recorded Meeting",
      type: "root",
      children: [
        {
          id: `${meetingId}-mindmap-save`,
          label: "Saved audio",
          type: "topic",
          children: [],
        },
        {
          id: `${meetingId}-mindmap-mock`,
          label: "Mock analysis",
          type: "decision",
          children: [],
        },
        {
          id: `${meetingId}-mindmap-next`,
          label: "Next integration step",
          type: "task",
          children: [],
        },
      ],
    },
    status: "completed",
    tags: ["Recorded", "Mock analysis"],
  };

  return {
    meeting,
    aiMessages: [
      {
        id: `${meetingId}-msg-1`,
        role: "assistant",
        content: "This meeting is currently using mocked analysis output. The recording itself has been saved.",
        timestampReferences: ["00:00"],
      },
      {
        id: `${meetingId}-msg-2`,
        role: "assistant",
        content: "Once the backend is ready, this placeholder summary can be replaced with real transcript, decisions, and follow-ups.",
        timestampReferences: ["00:08"],
      },
    ],
  };
}

async function persistMeetingBundleToSupabase(bundle: SavedMeetingBundle) {
  const client = getSupabaseClient();
  const currentUser = await getAuthenticatedUser(client);
  const { meeting, aiMessages } = bundle;

  const { error: meetingError } = await client.from("meetings").upsert({
    id: meeting.id,
    owner_user_id: currentUser.id,
    title: meeting.title,
    date: meeting.date,
    duration: meeting.duration,
    participants: meeting.participants,
    project: meeting.project,
    audio_url: meeting.audioUrl,
    summary: meeting.summary,
    key_takeaways: meeting.keyTakeaways,
    decisions: meeting.decisions,
    risks: meeting.risks,
    follow_ups: meeting.followUps,
    status: meeting.status,
    tags: meeting.tags,
    mindmap: meeting.mindmap,
  });

  if (meetingError) {
    throw new Error(`Failed to save meeting. ${meetingError.message}`);
  }

  if (meeting.tasks.length > 0) {
    const { error: tasksError } = await client.from("tasks").upsert(
      meeting.tasks.map((task) => ({
        id: task.id,
        meeting_id: task.meetingId,
        title: task.title,
        owner: task.owner,
        deadline: task.deadline,
        status: task.status,
        source_timestamp: task.sourceTimestamp,
      })),
    );

    if (tasksError) {
      throw new Error(`Failed to save tasks. ${tasksError.message}`);
    }
  }

  if (meeting.transcript.length > 0) {
    const { error: transcriptError } = await client.from("transcript_items").upsert(
      meeting.transcript.map((item, index) => ({
        id: item.id,
        meeting_id: meeting.id,
        position: index + 1,
        speaker: item.speaker,
        speaker_color: item.speakerColor,
        timestamp: item.timestamp,
        text: item.text,
        is_highlighted: item.isHighlighted,
      })),
    );

    if (transcriptError) {
      throw new Error(`Failed to save transcript. ${transcriptError.message}`);
    }
  }

  if (aiMessages.length > 0) {
    const { error: aiMessagesError } = await client.from("ai_messages").upsert(
      aiMessages.map((message, index) => ({
        id: message.id,
        meeting_id: meeting.id,
        position: index + 1,
        role: message.role,
        content: message.content,
        timestamp_references: message.timestampReferences,
      })),
    );

    if (aiMessagesError) {
      throw new Error(`Failed to save AI messages. ${aiMessagesError.message}`);
    }
  }
}

export async function saveMockProcessedMeeting(params: {
  recordingId: string;
  recordingUri: string | null;
  durationMillis: number;
}): Promise<Meeting> {
  const meetingId = params.recordingId.replace("rec-", "meeting-");
  const existing = await getLocalMeetingBundle(meetingId);
  if (existing) {
    return existing.meeting;
  }

  const bundle = buildMockProcessedMeeting(params.recordingId, params.recordingUri, params.durationMillis);
  await addSavedMeetingBundle(bundle);

  try {
    await persistMeetingBundleToSupabase(bundle);
  } catch (error) {
    console.warn("Unable to persist mock processed meeting to Supabase, using local saved data instead.", error);
  }

  return bundle.meeting;
}

export async function saveProcessedMeeting(params: {
  recordingId: string;
  recordingUri: string | null;
  durationMillis: number;
}): Promise<Meeting> {
  if (!isMeetingApiConfigured) {
    throw new Error("Meeting API is not configured. Set EXPO_PUBLIC_MEETING_API_URL.");
  }

  if (!params.recordingUri) {
    throw new Error("Recording file URI is missing. Stop the recorder again before upload.");
  }

  const ownerUserId = await getBackendOwnerUserId();
  const createdAt = new Date();
  const title = `Recorded Meeting ${new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(createdAt)}`;
  const createResult = await createMeetingFromAudio({
    fileUri: params.recordingUri,
    fileName: `${params.recordingId}.m4a`,
    mimeType: "audio/mp4",
    title,
    ownerUserId,
    project: "Recorded Meetings",
    participants: 1,
    tags: ["Recorded", "Transcript"],
    audioUrl: params.recordingUri,
    runAnalysis: false,
  });
  const bundle = await getMeetingDetailFromApi(createResult.meeting.id);

  await addSavedMeetingBundle(bundle);
  return bundle.meeting;
}

export async function analyzeMeetingSummary(meetingId: string, lang?: string): Promise<Meeting> {
  if (!isMeetingApiConfigured) {
    throw new Error("Meeting API is not configured. Set EXPO_PUBLIC_MEETING_API_URL.");
  }

  await regenerateMeeting(meetingId, lang);
  const bundle = await waitForMeetingAnalysis(meetingId);
  await addSavedMeetingBundle(bundle);
  return bundle.meeting;
}

export async function getDashboardData(): Promise<DashboardData> {
  const localMeetings = await getLocalMeetings();

  try {
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
    const remoteMeetings = (meetingRows as MeetingRow[]).map((meeting) =>
      rowToMeeting(
        meeting,
        tasks.filter((task) => task.meetingId === meeting.id),
        [],
      ),
    );
    const meetings = mergeById(localMeetings, remoteMeetings);

    return {
      currentUser,
      meetings,
      tasks: mergeById(
        meetings.flatMap((meeting) => meeting.tasks),
        tasks,
      ),
      featuredMeeting: meetings[0] ?? EMPTY_MEETING,
    };
  } catch {
    const tasks = localMeetings.flatMap((meeting) => meeting.tasks);

    return {
      currentUser: DEFAULT_USER,
      meetings: localMeetings,
      tasks,
      featuredMeeting: localMeetings[0] ?? EMPTY_MEETING,
    };
  }
}

export async function getMeeting(meetingId: string): Promise<Meeting> {
  const localBundle = await getLocalMeetingBundle(meetingId);
  if (localBundle) {
    return localBundle.meeting;
  }

  if (isMeetingApiConfigured) {
    try {
      const bundle = await getMeetingDetailFromApi(meetingId);
      await addSavedMeetingBundle(bundle);
      return bundle.meeting;
    } catch {
      // Fall through to Supabase for older records or when the local API is offline.
    }
  }

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
  if (meetingId) {
    const localBundle = await getLocalMeetingBundle(meetingId);
    if (localBundle) {
      return localBundle.meeting.tasks;
    }

    if (isMeetingApiConfigured) {
      try {
        const bundle = await getMeetingDetailFromApi(meetingId);
        await addSavedMeetingBundle(bundle);
        return bundle.meeting.tasks;
      } catch {
        // Fall through to Supabase.
      }
    }
  } else {
    const localMeetings = await getLocalMeetings();
    return localMeetings.flatMap((meeting) => meeting.tasks);
  }

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
  const localBundle = await getLocalMeetingBundle(meetingId);
  if (localBundle) {
    return localBundle.meeting.transcript;
  }

  if (isMeetingApiConfigured) {
    try {
      const bundle = await getMeetingDetailFromApi(meetingId);
      await addSavedMeetingBundle(bundle);
      return bundle.meeting.transcript;
    } catch {
      // Fall through to Supabase.
    }
  }

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
  const localBundle = await getLocalMeetingBundle(meetingId);
  if (localBundle) {
    return localBundle.aiMessages;
  }

  if (isMeetingApiConfigured) {
    try {
      const bundle = await getMeetingDetailFromApi(meetingId);
      await addSavedMeetingBundle(bundle);
      return bundle.aiMessages;
    } catch {
      // Fall through to Supabase.
    }
  }

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

export async function sendMeetingQuestion(meetingId: string, question: string): Promise<AIMessage[]> {
  const trimmedQuestion = question.trim();
  if (!trimmedQuestion) {
    return getAIChatMessages(meetingId);
  }

  if (isMeetingApiConfigured) {
    try {
      const ownerUserId = await getBackendOwnerUserId();
      await askMeetingQuestion({ meetingId, ownerUserId, question: trimmedQuestion });
      const bundle = await getMeetingDetailFromApi(meetingId);
      await addSavedMeetingBundle(bundle);
      return bundle.aiMessages;
    } catch {
      // Seed/local meetings do not exist in the backend; keep demo chat usable.
    }
  }

  const localBundle = await getLocalMeetingBundle(meetingId);
  if (!localBundle) {
    throw new Error("Meeting API is not configured and this meeting is not available locally.");
  }

  const fallbackMessages: AIMessage[] = [
    ...localBundle.aiMessages,
    {
      id: `msg-${Date.now()}-user`,
      role: "user",
      content: trimmedQuestion,
      timestampReferences: [],
    },
    {
      id: `msg-${Date.now()}-assistant`,
      role: "assistant",
      content: "The Meeting API is not configured, so live AI chat is unavailable for this local meeting.",
      timestampReferences: [],
    },
  ];
  await addSavedMeetingBundle({ meeting: localBundle.meeting, aiMessages: fallbackMessages });
  return fallbackMessages;
}
