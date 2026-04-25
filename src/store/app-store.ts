import { create } from "zustand";

type AppState = {
  hasCompletedOnboarding: boolean;
  isRecording: boolean;
  activeMeetingId: string | null;
  completeOnboarding: () => void;
  startRecording: () => void;
  stopRecording: () => void;
  setActiveMeeting: (meetingId: string | null) => void;
};

export const useAppStore = create<AppState>((set) => ({
  hasCompletedOnboarding: false,
  isRecording: false,
  activeMeetingId: null,
  completeOnboarding: () => set({ hasCompletedOnboarding: true }),
  startRecording: () => set({ isRecording: true }),
  stopRecording: () => set({ isRecording: false }),
  setActiveMeeting: (meetingId) => set({ activeMeetingId: meetingId }),
}));
