import { router } from "expo-router";
import type { Href } from "expo-router";
import { LockKeyhole, Mic } from "lucide-react-native";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { EntryPrimaryButton } from "@/components/launch/EntryPrimaryButton";
import { AppScreen } from "@/components/ui/AppScreen";
import { colors, radius, shadows } from "@/constants/tokens";
import { openAppSettings, requestMicrophonePermission } from "@/lib/microphone-permission";
import { useAppStore } from "@/store/app-store";
import { useAuthStore } from "@/store/auth-store";

export default function MicrophonePermissionRoute() {
  const { t } = useTranslation();
  const grantMicrophonePermission = useAppStore((state) => state.grantMicrophonePermission);
  const isAuthReady = useAuthStore((state) => state.isReady);
  const session = useAuthStore((state) => state.session);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [canAskAgain, setCanAskAgain] = useState(true);

  const handlePermission = async () => {
    if (isAuthReady && !session) { router.replace("/login" as Href); return; }
    setIsLoading(true);
    try {
      const result = await requestMicrophonePermission();
      if (result.granted) { grantMicrophonePermission(); router.replace("/(tabs)/home"); return; }
      setCanAskAgain(result.canAskAgain);
      setFeedback(result.message ?? t("microphone_permission.permission_denied"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppScreen className="bg-[#FFF7F5]" scroll={false} contentClassName="justify-center px-6 pb-12">
      <View className="gap-6 bg-white px-5 py-7" style={{ borderRadius: radius.xl + 4, ...shadows.card }}>
        <View className="items-center gap-5">
          <View className="items-center justify-center border border-[#F2B3B0] bg-[#FFF1F0]" style={{ width: 76, height: 76, borderRadius: 38 }}>
            <Mic color={colors.primary} size={28} strokeWidth={2.6} />
          </View>
          <Text className="text-center text-[17px] font-medium leading-7" style={{ color: colors.text }}>
            {t("microphone_permission.mic_needed")}
          </Text>
          <View className="w-full flex-row items-center gap-3 bg-[#FFF4F2] px-4 py-3" style={{ borderRadius: radius.lg }}>
            <LockKeyhole color={colors.primary} size={15} strokeWidth={2.5} />
            <Text className="flex-1 text-center text-[12px] leading-[18px]" style={{ color: "#8F4F4A" }}>
              {t("microphone_permission.private_encrypted")}
            </Text>
          </View>
          {feedback ? (
            <Text className="text-center text-[13px] leading-5" style={{ color: canAskAgain ? "#9A3412" : colors.primary }}>
              {feedback}
            </Text>
          ) : null}
        </View>
        <View className="gap-3">
          <EntryPrimaryButton disabled={isLoading} onPress={canAskAgain ? handlePermission : openAppSettings}>
            {isLoading ? t("microphone_permission.requesting") : canAskAgain ? t("microphone_permission.allow_mic") : t("microphone_permission.open_settings")}
          </EntryPrimaryButton>
          <Pressable accessibilityRole="button" className="items-center justify-center py-2" onPress={() => router.replace("/(tabs)/home")}>
            <Text className="text-[13px]" style={{ color: colors.secondaryText }}>{t("microphone_permission.not_right_now")}</Text>
          </Pressable>
        </View>
      </View>
    </AppScreen>
  );
}
