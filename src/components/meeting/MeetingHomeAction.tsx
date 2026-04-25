import { router } from "expo-router";
import { Home } from "lucide-react-native";

import { IconButton } from "@/components/ui/IconButton";

export function MeetingHomeAction() {
  return <IconButton icon={Home} label="Go to home" onPress={() => router.replace("/(tabs)/home")} />;
}
