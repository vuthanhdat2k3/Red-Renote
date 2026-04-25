import type { Session, User } from "@supabase/supabase-js";
import { create } from "zustand";

import { supabase } from "@/lib/supabase";

type AuthResult = {
  error?: string;
  needsEmailConfirmation?: boolean;
};

type AuthState = {
  session: Session | null;
  user: User | null;
  isReady: boolean;
  isConfigured: boolean;
  setSession: (session: Session | null) => void;
  markReady: () => void;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string, fullName: string) => Promise<AuthResult>;
  signOut: () => Promise<AuthResult>;
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  isReady: false,
  isConfigured: Boolean(supabase),
  setSession: (session) => set({ session, user: session?.user ?? null }),
  markReady: () => set({ isReady: true }),
  signIn: async (email, password) => {
    if (!supabase) {
      return { error: "Supabase is not configured. Add the project URL and anon key first." };
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (error) {
      return { error: getErrorMessage(error) };
    }
  },
  signUp: async (email, password, fullName) => {
    if (!supabase) {
      return { error: "Supabase is not configured. Add the project URL and anon key first." };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
        },
      });

      if (error) {
        return { error: error.message };
      }

      return { needsEmailConfirmation: !data.session };
    } catch (error) {
      return { error: getErrorMessage(error) };
    }
  },
  signOut: async () => {
    if (!supabase) {
      set({ session: null, user: null });
      return {};
    }

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        return { error: error.message };
      }

      set({ session: null, user: null });
      return {};
    } catch (error) {
      return { error: getErrorMessage(error) };
    }
  },
}));
