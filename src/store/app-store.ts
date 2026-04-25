import { create } from "zustand";

type AppState = {
  hasSeenSplash: boolean;
  hasCompletedOnboarding: boolean;
  hasMicrophonePermission: boolean;
  isRecording: boolean;
  activeRecordingId: string | null;
  activeMeetingId: string | null;
  markSplashSeen: () => void;
  completeOnboarding: () => void;
  grantMicrophonePermission: () => void;
  startRecording: (recordingId: string) => void;
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
  activeMeetingId: null,
  markSplashSeen: () => set({ hasSeenSplash: true }),
  completeOnboarding: () => set({ hasCompletedOnboarding: true }),
  grantMicrophonePermission: () => set({ hasMicrophonePermission: true }),
  startRecording: (recordingId) => set({ activeRecordingId: recordingId, isRecording: true }),
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
