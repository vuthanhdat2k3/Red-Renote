import { router } from "expo-router";
import { Pause, Square } from "lucide-react-native";
import { Text, View } from "react-native";

import { RecordButton } from "@/components/shell/RecordButton";
import { Button } from "@/components/ui/Button";
import { AppScreen } from "@/components/ui/AppScreen";
import { useAppStore } from "@/store/app-store";

export default function RecordingModal() {
  const stopRecording = useAppStore((state) => state.stopRecording);

  return (
    <AppScreen scroll={false} contentClassName="items-center justify-center gap-8">
      <View className="items-center gap-3">
        <Text className="text-sm font-semibold uppercase tracking-[1px] text-brand-primary">Recording</Text>
        <Text className="text-[28px] font-bold text-app-text">Listening to meeting</Text>
        <Text className="max-w-[280px] text-center text-base leading-6 text-app-muted">
          The full live recording screen will be implemented after the shell is approved.
        </Text>
      </View>
      <RecordButton />
      <View className="w-full gap-3">
        <Button icon={Pause} variant="secondary">
          Pause
        </Button>
        <Button
          icon={Square}
          onPress={() => {
            stopRecording();
            router.back();
          }}
        >
          Finish
        </Button>
      </View>
    </AppScreen>
  );
}
