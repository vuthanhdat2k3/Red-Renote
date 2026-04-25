import type { PropsWithChildren } from "react";
import { useEffect } from "react";

import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/auth-store";

export function AuthProvider({ children }: PropsWithChildren) {
  const markReady = useAuthStore((state) => state.markReady);
  const setSession = useAuthStore((state) => state.setSession);

  useEffect(() => {
    if (!supabase) {
      markReady();
      return;
    }

    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) {
        return;
      }

      setSession(data.session);
      markReady();
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      markReady();
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [markReady, setSession]);

  return children;
}
