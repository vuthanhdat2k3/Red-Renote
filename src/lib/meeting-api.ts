import { Platform } from "react-native";

import type { AIMessage, Meeting, MindmapNode, Task, TranscriptItem } from "@/types/meeting";

type ApiMeetingResponse = {
  id: string;
  title: string;
  status: Meeting["status"];
  summary?: string;
  key_takeaways?: string[];
  decisions?: string[];
  risks?: string[];
  follow_ups?: string[];
  tags?: string[];
  mindmap?: MindmapNode;
};

type ApiTaskResponse = {
  id: string;
  title: string;
  owner: string;
  deadline: string;
  status: Task["status"];
  source_timestamp: string;
  meeting_id: string;
};

type ApiTranscriptItemResponse = {
  id: string;
  speaker: string;
  speaker_color: string;
  timestamp: string;
  text: string;
  is_highlighted: boolean;
};

type ApiAIMessageResponse = {
  id: string;
  role: AIMessage["role"];
  content: string;
  timestamp_references: string[];
};

type ApiMeetingDetailResponse = ApiMeetingResponse & {
  date: string;
  duration: string;
  participants: number;
  project: string;
  audio_url: string;
  tasks: ApiTaskResponse[];
  transcript: ApiTranscriptItemResponse[];
  ai_messages: ApiAIMessageResponse[];
};

export type CreateMeetingFromTranscriptInput = {
  title: string;
  ownerUserId: string;
  transcript: string;
  project?: string;
  participants?: number;
  tags?: string[];
  audioUrl?: string;
  runAnalysis?: boolean;
  segments?: {
    start: number;
    end: number;
    text: string;
    speaker?: string;
  }[];
};

export type CreateMeetingResult = {
  meeting: ApiMeetingResponse;
  llmJobId: string | null;
};

const meetingApiUrl = process.env.EXPO_PUBLIC_MEETING_API_URL;
const meetingApiKey = process.env.EXPO_PUBLIC_MEETING_API_KEY;

export const isMeetingApiConfigured = Boolean(meetingApiUrl);

function getMeetingApiUrl(): string {
  if (!meetingApiUrl) {
    throw new Error("Meeting API is not configured. Set EXPO_PUBLIC_MEETING_API_URL.");
  }

  return meetingApiUrl.replace(/\/$/, "");
}

function getHeaders(extra?: HeadersInit): HeadersInit {
  return {
    "Content-Type": "application/json",
    ...(meetingApiKey ? { Authorization: `Bearer ${meetingApiKey}` } : {}),
    ...extra,
  };
}

function mapCreateResponse(data: { meeting: ApiMeetingResponse; llm_job_id?: string | null }): CreateMeetingResult {
  return {
    meeting: data.meeting,
    llmJobId: data.llm_job_id ?? null,
  };
}

function mapTask(data: ApiTaskResponse): Task {
  return {
    id: data.id,
    title: data.title,
    owner: data.owner,
    deadline: data.deadline,
    status: data.status,
    sourceTimestamp: data.source_timestamp,
    meetingId: data.meeting_id,
  };
}

function mapTranscriptItem(data: ApiTranscriptItemResponse): TranscriptItem {
  return {
    id: data.id,
    speaker: data.speaker,
    speakerColor: data.speaker_color,
    timestamp: data.timestamp,
    text: data.text,
    isHighlighted: data.is_highlighted,
  };
}

function mapAIMessage(data: ApiAIMessageResponse): AIMessage {
  return {
    id: data.id,
    role: data.role,
    content: data.content,
    timestampReferences: data.timestamp_references,
  };
}

export function mapMeetingDetail(data: ApiMeetingDetailResponse): Meeting {
  return {
    id: data.id,
    title: data.title,
    date: data.date,
    duration: data.duration,
    participants: data.participants,
    project: data.project,
    audioUrl: data.audio_url,
    summary: data.summary ?? "",
    keyTakeaways: data.key_takeaways ?? [],
    decisions: data.decisions ?? [],
    risks: data.risks ?? [],
    followUps: data.follow_ups ?? [],
    transcript: (data.transcript ?? []).map(mapTranscriptItem),
    tasks: (data.tasks ?? []).map(mapTask),
    mindmap: data.mindmap ?? { id: data.id, label: data.title, type: "root", children: [] },
    status: data.status,
    tags: data.tags ?? [],
  };
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const detail = await response.text();
    let apiError: string | null = null;
    try {
      const payload = JSON.parse(detail) as { detail?: unknown };
      if (typeof payload.detail === "string") {
        apiError = payload.detail;
      }
    } catch {
      // Response may be plain text instead of JSON.
    }
    throw new Error(apiError ?? (detail || `Meeting API request failed with ${response.status}`));
  }

  return response.json() as Promise<T>;
}

async function appendAudioFile(formData: FormData, input: { fileUri: string; fileName: string; mimeType?: string }) {
  const mimeType = input.mimeType ?? "audio/wav";

  if (Platform.OS === "web") {
    const audioResponse = await fetch(input.fileUri);
    const audioBlob = await audioResponse.blob();
    formData.append("file", audioBlob, input.fileName);
    return;
  }

  formData.append("file", {
    uri: input.fileUri,
    name: input.fileName,
    type: mimeType,
  } as unknown as Blob);
}

export async function getMeetingDetailFromApi(meetingId: string): Promise<{ meeting: Meeting; aiMessages: AIMessage[] }> {
  const data = await parseResponse<ApiMeetingDetailResponse>(
    await fetch(`${getMeetingApiUrl()}/meetings/${meetingId}/detail`, {
      headers: getHeaders(),
    }),
  );

  return {
    meeting: mapMeetingDetail(data),
    aiMessages: (data.ai_messages ?? []).map(mapAIMessage),
  };
}

export async function waitForMeetingAnalysis(meetingId: string, options?: { timeoutMillis?: number; intervalMillis?: number }) {
  const timeoutMillis = options?.timeoutMillis ?? 45000;
  const intervalMillis = options?.intervalMillis ?? 2500;
  const startedAt = Date.now();
  let latest = await getMeetingDetailFromApi(meetingId);

  while (latest.meeting.status !== "completed" && Date.now() - startedAt < timeoutMillis) {
    await new Promise((resolve) => setTimeout(resolve, intervalMillis));
    latest = await getMeetingDetailFromApi(meetingId);
  }

  return latest;
}

export async function createMeetingFromTranscript(input: CreateMeetingFromTranscriptInput): Promise<CreateMeetingResult> {
  const response = await fetch(`${getMeetingApiUrl()}/meetings/from-transcript`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      title: input.title,
      owner_user_id: input.ownerUserId,
      transcript: input.transcript,
      project: input.project ?? "Red Renote",
      participants: input.participants ?? 1,
      tags: input.tags ?? [],
      audio_url: input.audioUrl ?? "",
      run_analysis: input.runAnalysis ?? true,
      segments: input.segments ?? [],
    }),
  });

  return mapCreateResponse(await parseResponse(response));
}

export async function createMeetingFromAudio(input: {
  fileUri: string;
  fileName: string;
  mimeType?: string;
  title: string;
  ownerUserId: string;
  project?: string;
  participants?: number;
  tags?: string[];
  audioUrl?: string;
  runAnalysis?: boolean;
}): Promise<CreateMeetingResult> {
  const formData = new FormData();
  await appendAudioFile(formData, input);
  formData.append("title", input.title);
  formData.append("owner_user_id", input.ownerUserId);
  formData.append("project", input.project ?? "Red Renote");
  formData.append("participants", String(input.participants ?? 1));
  formData.append("tags", (input.tags ?? []).join(","));
  formData.append("audio_url", input.audioUrl ?? input.fileUri);
  formData.append("run_analysis", String(input.runAnalysis ?? true));

  const response = await fetch(`${getMeetingApiUrl()}/meetings/from-audio`, {
    method: "POST",
    headers: meetingApiKey ? { Authorization: `Bearer ${meetingApiKey}` } : undefined,
    body: formData,
  });

  return mapCreateResponse(await parseResponse(response));
}

export async function regenerateMeeting(meetingId: string, lang?: string): Promise<{ meeting_id: string; llm_job_id: string; status: string }> {
  const response = await fetch(`${getMeetingApiUrl()}/meetings/${meetingId}/regenerate`, {
    method: "POST",
    headers: getHeaders(),
    body: lang ? JSON.stringify({ language: lang }) : undefined,
  });

  return parseResponse(response);
}

export async function askMeetingQuestion(input: {
  meetingId: string;
  ownerUserId: string;
  question: string;
}): Promise<{ meeting_id: string; response: string; timestamp_references: string[] }> {
  const response = await fetch(`${getMeetingApiUrl()}/meetings/${input.meetingId}/chat`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      owner_user_id: input.ownerUserId,
      question: input.question,
    }),
  });

  return parseResponse(response);
}
