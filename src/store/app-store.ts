import { create } from "zustand";

type AppState = {
  hasSeenSplash: boolean;
  hasCompletedOnboarding: boolean;
  hasMicrophonePermission: boolean;
  isRecording: boolean;
  activeRecordingId: string | null;
  activeRecordingUri: string | null;
  activeRecordingDurationMillis: number;
  activeMeetingId: string | null;
  markSplashSeen: () => void;
  completeOnboarding: () => void;
  grantMicrophonePermission: () => void;
  startRecording: (recordingId: string) => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  finishRecording: (recordingId: string, recordingUri: string | null, durationMillis: number) => void;
  stopRecording: () => string;
  completeProcessing: (recordingId: string) => string;
  setActiveMeeting: (meetingId: string | null) => void;
};

export const useAppStore = create<AppState>((set, get) => ({
  hasSeenSplash: false,
  hasCompletedOnboarding: false,
  hasMicrophonePermission: false,
  isRecording: false,
  activeRecordingId: null,
  activeRecordingUri: null,
  activeRecordingDurationMillis: 0,
  activeMeetingId: null,
  markSplashSeen: () => set({ hasSeenSplash: true }),
  completeOnboarding: () => set({ hasCompletedOnboarding: true }),
  grantMicrophonePermission: () => set({ hasMicrophonePermission: true }),
  startRecording: (recordingId) =>
    set({
      activeRecordingDurationMillis: 0,
      activeRecordingId: recordingId,
      activeRecordingUri: null,
      isRecording: true,
    }),
  pauseRecording: () => set({ isRecording: false }),
  resumeRecording: () => set({ isRecording: true }),
  finishRecording: (recordingId, recordingUri, durationMillis) =>
    set({
      activeRecordingDurationMillis: durationMillis,
      activeRecordingId: recordingId,
      activeRecordingUri: recordingUri,
      isRecording: false,
    }),
  stopRecording: () => {
    const recordingId = get().activeRecordingId ?? `rec-${Date.now()}`;
    set({ activeRecordingId: recordingId, isRecording: false });
    return recordingId;
  },
  completeProcessing: (recordingId) => {
    const meetingId = recordingId.replace("rec-", "meeting-");
    set({ activeMeetingId: meetingId });
    return meetingId;
  },
  setActiveMeeting: (meetingId) => set({ activeMeetingId: meetingId }),
}));
