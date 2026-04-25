import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { Text, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { AppScreen } from "@/components/ui/AppScreen";

export default function NotFoundRoute() {
  return (
    <AppScreen scroll={false} contentClassName="items-center justify-center gap-5">
      <View className="items-center gap-2">
        <Text className="text-[28px] font-bold text-app-text">Page not found</Text>
        <Text className="text-center text-base text-app-muted">This Red Renote screen is not available yet.</Text>
      </View>
      <Button icon={ArrowLeft} onPress={() => router.replace("/(tabs)")}>
        Back home
      </Button>
    </AppScreen>
  );
}
