import { Link, router, type Href } from "expo-router";
import { CheckCircle2, UserPlus } from "lucide-react-native";
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

export default function RegisterRoute() {
  const { t } = useTranslation();
  const signUp = useAuthStore((state) => state.signUp);
  const isConfigured = useAuthStore((state) => state.isConfigured);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const canSubmit = fullName.trim().length >= 2 && email.trim().length > 0 && password.length >= 6 && !isSubmitting;

  const handleRegister = async () => {
    setFeedback(null);
    setIsSuccess(false);
    setIsSubmitting(true);
    const result = await signUp(email, password, fullName);
    setIsSubmitting(false);
    if (result.error) { setFeedback(result.error); return; }
    if (result.needsEmailConfirmation) { setIsSuccess(true); setFeedback(t("auth.check_email_confirm")); return; }
    router.replace("/microphone-permission");
  };

  return (
    <AppScreen contentClassName="flex-grow justify-center px-5 py-8">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="gap-8">
        <View className="items-center gap-4">
          <BrandMark compact />
          <View className="gap-2">
            <Text className="text-center text-[28px] font-bold leading-9 text-app-text">{t("auth.create_account")}</Text>
            <Text className="text-center text-[15px] leading-6 text-app-muted">{t("auth.start_workspace")}</Text>
          </View>
        </View>
        <Card className="gap-5" padding="lg">
          <View className="gap-4">
            <AuthTextField autoCapitalize="words" autoComplete="name" label={t("auth.full_name")} onChangeText={setFullName} placeholder={t("auth.placeholder_name")} textContentType="name" value={fullName} />
            <AuthTextField autoComplete="email" inputMode="email" label={t("auth.email")} onChangeText={setEmail} placeholder={t("auth.placeholder_email")} textContentType="emailAddress" value={email} />
            <AuthTextField autoComplete="new-password" label={t("auth.password")} onChangeText={setPassword} placeholder={t("auth.placeholder_password_create")} secureTextEntry textContentType="newPassword" value={password} />
          </View>
          {feedback ? (
            <View className="flex-row gap-3 rounded-2xl bg-[#FFF4F2] px-4 py-3">
              {isSuccess ? <CheckCircle2 color={colors.success} size={18} strokeWidth={2.4} /> : null}
              <Text className="flex-1 text-[13px] leading-5" style={{ color: isSuccess ? colors.success : colors.primary }}>{feedback}</Text>
            </View>
          ) : null}
          <AppButton accessibilityLabel={t("auth.sign_up")} disabled={!canSubmit || !isConfigured} icon={UserPlus} loading={isSubmitting} onPress={handleRegister}>{t("auth.sign_up")}</AppButton>
        </Card>
        <View className="flex-row justify-center gap-1">
          <Text className="text-[14px] text-app-muted">{t("auth.have_account")}</Text>
          <Link accessibilityLabel={t("auth.sign_in")} className="text-[14px] font-semibold text-brand-primary" href={"/login" as Href}>{t("auth.sign_in_link")}</Link>
        </View>
      </KeyboardAvoidingView>
    </AppScreen>
  );
}
