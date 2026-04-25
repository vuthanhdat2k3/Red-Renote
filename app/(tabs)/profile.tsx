import { router, type Href } from "expo-router";
import { LogOut, Mail, ShieldCheck, UserRound } from "lucide-react-native";
import { useState } from "react";
import { Text, View } from "react-native";

import { AppHeader } from "@/components/shell/AppHeader";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { colors } from "@/constants/tokens";
import { useAuthStore } from "@/store/auth-store";

export default function ProfileRoute() {
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const fullName =
    typeof user?.user_metadata?.full_name === "string" && user.user_metadata.full_name.trim()
      ? user.user_metadata.full_name
      : "Red Renote user";
  const email = user?.email ?? "No email available";
  const emailConfirmed = Boolean(user?.email_confirmed_at);

  const handleSignOut = async () => {
    setFeedback(null);
    setIsSigningOut(true);

    const result = await signOut();

    setIsSigningOut(false);

    if (result.error) {
      setFeedback(result.error);
      return;
    }

    router.replace("/login" as Href);
  };

  return (
    <AppScreen>
      <AppHeader title="Profile" subtitle="Account and workspace" />

      <Card className="gap-5" padding="lg">
        <View className="flex-row items-center gap-4">
          <View className="h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
            <UserRound color={colors.primary} size={26} strokeWidth={2.4} />
          </View>
          <View className="flex-1 gap-1">
            <Text className="text-[20px] font-bold text-app-text">{fullName}</Text>
            <Text className="text-[14px] text-app-muted">{email}</Text>
          </View>
        </View>

        <View className="gap-3">
          <View className="flex-row items-center gap-3 rounded-2xl border border-app-border bg-app-background px-4 py-3">
            <Mail color={colors.primary} size={18} strokeWidth={2.4} />
            <View className="flex-1">
              <Text className="text-[13px] font-semibold text-app-text">Email sign-in</Text>
              <Text className="text-[12px] text-app-muted">Supabase Auth session is active.</Text>
            </View>
          </View>

          <View className="flex-row items-center gap-3 rounded-2xl border border-app-border bg-app-background px-4 py-3">
            <ShieldCheck
              color={emailConfirmed ? colors.success : colors.warning}
              size={18}
              strokeWidth={2.4}
            />
            <View className="flex-1">
              <Text className="text-[13px] font-semibold text-app-text">
                {emailConfirmed ? "Email confirmed" : "Email confirmation pending"}
              </Text>
              <Text className="text-[12px] text-app-muted">
                {emailConfirmed
                  ? "Your account is ready for synced meeting data."
                  : "Confirm your email from the Supabase message when it arrives."}
              </Text>
            </View>
          </View>
        </View>

        {feedback ? (
          <Text className="text-[13px] leading-5" style={{ color: colors.primary }}>
            {feedback}
          </Text>
        ) : null}

        <AppButton
          accessibilityLabel="Sign out"
          icon={LogOut}
          loading={isSigningOut}
          onPress={handleSignOut}
          variant="danger"
        >
          Log Out
        </AppButton>
      </Card>
    </AppScreen>
  );
}
