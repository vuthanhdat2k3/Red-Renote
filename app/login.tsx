import { Link, router, type Href } from "expo-router";
import { LogIn, MailWarning } from "lucide-react-native";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { AuthTextField } from "@/components/auth/AuthTextField";
import { BrandMark } from "@/components/launch/BrandMark";
import { AppButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AppScreen } from "@/components/ui/AppScreen";
import { colors } from "@/constants/tokens";
import { useAuthStore } from "@/store/auth-store";

export default function LoginRoute() {
  const { t } = useTranslation();
  const signIn = useAuthStore((state) => state.signIn);
  const isConfigured = useAuthStore((state) => state.isConfigured);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const canSubmit = email.trim().length > 0 && password.length >= 6 && !isSubmitting;

  const handleLogin = async () => {
    setFeedback(null);
    setIsSubmitting(true);
    const result = await signIn(email, password);
    setIsSubmitting(false);
    if (result.error) { setFeedback(result.error); return; }
    router.replace("/(tabs)/home");
  };

  return (
    <AppScreen scroll={false} contentClassName="justify-center px-5">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="gap-8">
        <View className="items-center gap-4">
          <BrandMark compact />
          <View className="gap-2">
            <Text className="text-center text-[28px] font-bold leading-9 text-app-text">{t("auth.welcome_back")}</Text>
            <Text className="text-center text-[15px] leading-6 text-app-muted">{t("auth.sign_in_sync")}</Text>
          </View>
        </View>
        <Card className="gap-5" padding="lg">
          {!isConfigured ? (
            <View className="flex-row gap-3 rounded-2xl border border-[#FED7AA] bg-[#FFF7ED] px-4 py-3">
              <MailWarning color={colors.warning} size={18} strokeWidth={2.4} />
              <Text className="flex-1 text-[13px] leading-5" style={{ color: colors.warning }}>{t("auth.supabase_missing")}</Text>
            </View>
          ) : null}
          <View className="gap-4">
            <AuthTextField autoComplete="email" inputMode="email" label={t("auth.email")} onChangeText={setEmail} placeholder={t("auth.placeholder_email")} textContentType="emailAddress" value={email} />
            <AuthTextField autoComplete="password" label={t("auth.password")} onChangeText={setPassword} placeholder={t("auth.placeholder_password")} secureTextEntry textContentType="password" value={password} />
          </View>
          {feedback ? <Text className="text-[13px] leading-5" style={{ color: colors.primary }}>{feedback}</Text> : null}
          <AppButton accessibilityLabel={t("auth.sign_in")} disabled={!canSubmit || !isConfigured} icon={LogIn} loading={isSubmitting} onPress={handleLogin}>{t("auth.sign_in")}</AppButton>
        </Card>
        <View className="flex-row justify-center gap-1">
          <Text className="text-[14px] text-app-muted">{t("auth.no_account")}</Text>
          <Link accessibilityLabel={t("auth.sign_up")} className="text-[14px] font-semibold text-brand-primary" href={"/register" as Href}>{t("auth.create_account_link")}</Link>
        </View>
      </KeyboardAvoidingView>
    </AppScreen>
  );
}
