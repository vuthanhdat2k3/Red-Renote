import { BookOpen } from "lucide-react-native";
import { Text, View } from "react-native";

import { AppHeader } from "@/components/shell/AppHeader";
import { AppScreen } from "@/components/ui/AppScreen";
import { Card } from "@/components/ui/Card";

export default function KnowledgeRoute() {
  return (
    <AppScreen>
      <AppHeader title="Knowledge" subtitle="Searchable meeting memory" />
      <Card className="items-center gap-3 py-8">
        <View className="h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
          <BookOpen color="#E50914" size={26} strokeWidth={2.3} />
        </View>
        <Text className="text-center text-[20px] font-bold text-app-text">Knowledge base shell</Text>
        <Text className="text-center text-base leading-6 text-app-muted">
          This route is ready for saved summaries, decisions, topics, and transcript search.
        </Text>
      </Card>
    </AppScreen>
  );
}
