import { router } from "expo-router";
import { Text, View } from "react-native";

import { RecordButton } from "@/components/shell/RecordButton";
import { AppScreen } from "@/components/ui/AppScreen";
import { useAppStore } from "@/store/app-store";

export default function RecordRoute() {
  const startRecording = useAppStore((state) => state.startRecording);

  return (
    <AppScreen scroll={false} contentClassName="items-center justify-center gap-6">
      <View className="items-center gap-2">
        <Text className="text-[28px] font-bold text-app-text">Start recording</Text>
        <Text className="max-w-[280px] text-center text-base leading-6 text-app-muted">
          The recording workflow is mounted as a modal shell for now.
        </Text>
      </View>
      <RecordButton
        onPress={() => {
          startRecording();
          router.push("/(modals)/recording");
        }}
      />
    </AppScreen>
  );
}
