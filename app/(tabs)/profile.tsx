import { router, type Href } from "expo-router";
import { LogOut, Settings, ShieldCheck, UserRound } from "lucide-react-native";
import { useState } from "react";
import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { AppScreen } from "@/components/ui/AppScreen";
import { AppButton } from "@/components/ui/Button";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { PressableScale } from "@/components/ui/PressableScale";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { colors } from "@/constants/tokens";
import { useDashboardData } from "@/hooks/useMeetingData";
import { useAuthStore } from "@/store/auth-store";
import { useAppStore } from "@/store/app-store";
import { cn } from "@/lib/cn";

export default function ProfileRoute() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);
  const { meetings } = useDashboardData();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const appLanguage = useAppStore((s) => s.appLanguage);
  const setAppLanguage = useAppStore((s) => s.setAppLanguage);
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
    <AppScreen contentClassName="gap-8 pt-4">
      <View className="absolute top-0 right-0 h-64 w-64 rounded-full bg-red-100 opacity-20 -mr-20 -mt-20 blur-3xl" />
      
      <View className="px-6 gap-6">
        <View className="flex-row items-center justify-between">
          <View className="h-10 w-10 items-center justify-center rounded-full bg-red-50 border border-red-100">
            <UserRound color={colors.primary} size={18} strokeWidth={2.5} />
          </View>
          <PressableScale accessibilityLabel="Open settings" scaleTo={0.92}>
            <View className="h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm border border-app-border">
              <Settings color={colors.text} size={18} strokeWidth={2.5} />
            </View>
          </PressableScale>
        </View>

        <View className="flex-row items-center gap-5">
          <View className="h-20 w-20 items-center justify-center rounded-[28px] bg-brand-primary/10 border border-brand-primary/20">
            <Text className="text-[32px] font-bold text-brand-primary">{fullName.charAt(0)}</Text>
          </View>
          <View className="flex-1 gap-1">
            <Text className="text-[28px] font-extrabold tracking-tight text-app-text">{fullName}</Text>
            <Text className="text-[15px] font-medium text-app-muted">{email}</Text>
          </View>
        </View>

        <View className="flex-row gap-3">
          <View className="flex-1 bg-white rounded-2xl p-4 border border-app-border shadow-sm">
            <Text className="text-[20px] font-extrabold text-app-text">{meetings.length}</Text>
            <Text className="text-[11px] font-bold text-app-muted uppercase tracking-widest mt-1">{t("profile.sessions")}</Text>
          </View>
          <View className="flex-1 bg-white rounded-2xl p-4 border border-app-border shadow-sm">
            <Text className="text-[20px] font-extrabold text-app-text">Business</Text>
            <Text className="text-[11px] font-bold text-app-muted uppercase tracking-widest mt-1">{t("profile.plan")}</Text>
          </View>
        </View>
      </View>

      <View className="px-6 gap-4 pb-10">
        <SectionTitle title={t("profile.app_language")} />
        <LanguageSelector value={appLanguage} onChange={setAppLanguage} />

        <SectionTitle title={t("profile.account_security")} />
        <View className="gap-3">
          <View className="flex-row items-center gap-4 p-4 rounded-3xl bg-white border border-app-border shadow-sm">
            <View className={cn("h-10 w-10 items-center justify-center rounded-2xl", emailConfirmed ? "bg-emerald-50" : "bg-amber-50")}>
              <ShieldCheck color={emailConfirmed ? colors.success : colors.warning} size={20} strokeWidth={2.5} />
            </View>
            <View className="flex-1">
              <Text className="text-[15px] font-bold text-app-text">{emailConfirmed ? t("profile.verified") : t("profile.verify_email")}</Text>
              <Text className="text-[13px] text-app-muted">{emailConfirmed ? t("profile.secure_synced") : t("profile.action_required")}</Text>
            </View>
          </View>
        </View>
        
        <View className="mt-4">
           {feedback ? (
            <Text className="text-[13px] leading-5 mb-4 text-brand-primary font-medium">
              {feedback}
            </Text>
          ) : null}
          
          <AppButton
            accessibilityLabel="Sign out"
            icon={LogOut}
            loading={isSigningOut}
            onPress={handleSignOut}
            variant="secondary"
            className="border-red-100 bg-red-50/50"
            textClassName="text-brand-primary"
          >
            {t("profile.sign_out")}
          </AppButton>
        </View>
      </View>
    </AppScreen>
  );
}
