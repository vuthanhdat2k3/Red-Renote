import { ClipboardList } from "lucide-react-native";
import { Text, View } from "react-native";

import { AppHeader } from "@/components/shell/AppHeader";
import { AppScreen } from "@/components/ui/AppScreen";
import { Card } from "@/components/ui/Card";

export default function TasksRoute() {
  return (
    <AppScreen>
      <AppHeader title="Tasks" subtitle="Meeting follow-ups" />
      <Card className="gap-4">
        <View className="h-12 w-12 items-center justify-center rounded-2xl bg-red-50">
          <ClipboardList color="#E50914" size={24} strokeWidth={2.4} />
        </View>
        <View className="gap-2">
          <Text className="text-[20px] font-bold text-app-text">Tasks shell</Text>
          <Text className="text-base leading-6 text-app-muted">
            This tab will host owners, deadlines, source timestamps, and AI-generated follow-ups.
          </Text>
        </View>
      </Card>
    </AppScreen>
  );
}
