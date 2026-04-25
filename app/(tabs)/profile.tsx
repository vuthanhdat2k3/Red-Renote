import { UserRound } from "lucide-react-native";
import { Text, View } from "react-native";

import { AppHeader } from "@/components/shell/AppHeader";
import { AppScreen } from "@/components/ui/AppScreen";
import { Card } from "@/components/ui/Card";

export default function ProfileRoute() {
  return (
    <AppScreen>
      <AppHeader title="Profile" subtitle="Account and workspace" />
      <Card className="gap-4">
        <View className="h-12 w-12 items-center justify-center rounded-2xl bg-red-50">
          <UserRound color="#E50914" size={24} strokeWidth={2.4} />
        </View>
        <View className="gap-2">
          <Text className="text-[20px] font-bold text-app-text">Profile shell</Text>
          <Text className="text-base leading-6 text-app-muted">
            Account, recording preferences, integrations, and privacy controls will live here.
          </Text>
        </View>
      </Card>
    </AppScreen>
  );
}
