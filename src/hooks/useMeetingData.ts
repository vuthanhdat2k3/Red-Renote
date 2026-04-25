import { useEffect, useState } from "react";

import { aiMessages, currentUser, fullMeeting, meetings, tasks, transcriptSegments } from "@/data/mock";
import {
  getAIChatMessages,
  getDashboardData,
  getMeeting,
  getMeetingTasks,
  getTranscript,
} from "@/lib/meeting-repository";
import type { AIMessage, Meeting, Task, TranscriptItem } from "@/types/meeting";

type DashboardData = {
  currentUser: typeof currentUser;
  meetings: Meeting[];
  tasks: Task[];
  featuredMeeting: Meeting;
};

export function useDashboardData() {
  const [data, setData] = useState<DashboardData>({
    currentUser,
    meetings,
    tasks,
    featuredMeeting: fullMeeting,
  });

  useEffect(() => {
    let isMounted = true;

    getDashboardData().then((nextData) => {
      if (isMounted) {
        setData(nextData);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return data;
}

export function useMeeting(meetingId: string) {
  const [meeting, setMeeting] = useState<Meeting>(fullMeeting);

  useEffect(() => {
    let isMounted = true;

    getMeeting(meetingId).then((nextMeeting) => {
      if (isMounted) {
        setMeeting(nextMeeting);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [meetingId]);

  return meeting;
}

export function useMeetingTasks(meetingId?: string) {
  const [items, setItems] = useState<Task[]>(tasks);

  useEffect(() => {
    let isMounted = true;

    getMeetingTasks(meetingId).then((nextTasks) => {
      if (isMounted) {
        setItems(nextTasks);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [meetingId]);

  return items;
}

export function useTranscript(meetingId: string) {
  const [items, setItems] = useState<TranscriptItem[]>(transcriptSegments);

  useEffect(() => {
    let isMounted = true;

    getTranscript(meetingId).then((nextItems) => {
      if (isMounted) {
        setItems(nextItems);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [meetingId]);

  return items;
}

export function useAIChatMessages(meetingId: string) {
  const [items, setItems] = useState<AIMessage[]>(aiMessages);

  useEffect(() => {
    let isMounted = true;

    getAIChatMessages(meetingId).then((nextItems) => {
      if (isMounted) {
        setItems(nextItems);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [meetingId]);

  return items;
}
