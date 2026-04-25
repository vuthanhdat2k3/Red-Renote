import { useEffect, useState } from "react";

import {
  DEFAULT_USER,
  EMPTY_MEETING,
  getAIChatMessages,
  getDashboardData,
  getMeeting,
  getMeetingTasks,
  getTranscript,
} from "@/lib/meeting-repository";
import type { AIMessage, Meeting, Task, TranscriptItem, User } from "@/types/meeting";

type DashboardData = {
  currentUser: User;
  meetings: Meeting[];
  tasks: Task[];
  featuredMeeting: Meeting;
};

export function useDashboardData() {
  const [data, setData] = useState<DashboardData>({
    currentUser: DEFAULT_USER,
    meetings: [],
    tasks: [],
    featuredMeeting: EMPTY_MEETING,
  });

  useEffect(() => {
    let isMounted = true;

    getDashboardData()
      .then((nextData) => {
        if (isMounted) {
          setData(nextData);
        }
      })
      .catch((error) => {
        console.error(error);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return data;
}

export function useMeeting(meetingId: string) {
  const [meeting, setMeeting] = useState<Meeting>(EMPTY_MEETING);

  useEffect(() => {
    let isMounted = true;

    getMeeting(meetingId)
      .then((nextMeeting) => {
        if (isMounted) {
          setMeeting(nextMeeting);
        }
      })
      .catch((error) => {
        console.error(error);
      });

    return () => {
      isMounted = false;
    };
  }, [meetingId]);

  return meeting;
}

export function useMeetingTasks(meetingId?: string) {
  const [items, setItems] = useState<Task[]>([]);

  useEffect(() => {
    let isMounted = true;

    getMeetingTasks(meetingId)
      .then((nextTasks) => {
        if (isMounted) {
          setItems(nextTasks);
        }
      })
      .catch((error) => {
        console.error(error);
      });

    return () => {
      isMounted = false;
    };
  }, [meetingId]);

  return items;
}

export function useTranscript(meetingId: string) {
  const [items, setItems] = useState<TranscriptItem[]>([]);

  useEffect(() => {
    let isMounted = true;

    getTranscript(meetingId)
      .then((nextItems) => {
        if (isMounted) {
          setItems(nextItems);
        }
      })
      .catch((error) => {
        console.error(error);
      });

    return () => {
      isMounted = false;
    };
  }, [meetingId]);

  return items;
}

export function useAIChatMessages(meetingId: string) {
  const [items, setItems] = useState<AIMessage[]>([]);

  useEffect(() => {
    let isMounted = true;

    getAIChatMessages(meetingId)
      .then((nextItems) => {
        if (isMounted) {
          setItems(nextItems);
        }
      })
      .catch((error) => {
        console.error(error);
      });

    return () => {
      isMounted = false;
    };
  }, [meetingId]);

  return items;
}
