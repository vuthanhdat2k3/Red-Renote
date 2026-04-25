import { router } from "expo-router";
import { Mic, ShieldCheck } from "lucide-react-native";
import { Text, View } from "react-native";

import { AppButton } from "@/components/ui/Button";
import { AppScreen } from "@/components/ui/AppScreen";
import { colors } from "@/constants/tokens";
import { useAppStore } from "@/store/app-store";

export default function MicrophonePermissionRoute() {
  const grantMicrophonePermission = useAppStore((state) => state.grantMicrophonePermission);

  return (
    <AppScreen scroll={false} contentClassName="justify-between py-8">
      <View className="gap-8 pt-8">
        <View className="h-16 w-16 items-center justify-center rounded-3xl bg-brand-primary">
          <Mic color={colors.surface} size={30} strokeWidth={2.5} />
        </View>
        <View className="gap-4">
          <Text className="text-[34px] font-bold leading-[40px] text-app-text">Enable microphone access.</Text>
          <Text className="text-base leading-6 text-app-muted">
            Mock permission is used for now. The real native permission request can be added when recording is integrated.
          </Text>
        </View>
        <View className="flex-row items-center gap-3 rounded-2xl border border-app-border bg-app-surface p-4">
          <ShieldCheck color={colors.primary} size={22} strokeWidth={2.4} />
          <Text className="flex-1 text-sm leading-5 text-app-muted">Audio stays attached to your meeting workspace.</Text>
        </View>
      </View>
      <AppButton
        onPress={() => {
          grantMicrophonePermission();
          router.replace("/(tabs)/home");
        }}
      >
        Allow microphone
      </AppButton>
    </AppScreen>
  );
}
