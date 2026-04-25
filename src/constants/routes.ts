import type { LucideIcon } from "lucide-react-native";
import { BookOpen, ClipboardList, Home, Mic, UserRound } from "lucide-react-native";

export type TabRoute = {
  name: "index" | "record" | "knowledge" | "tasks" | "profile";
  title: string;
  icon: LucideIcon;
};

export const tabRoutes: TabRoute[] = [
  { name: "index", title: "Home", icon: Home },
  { name: "record", title: "Record", icon: Mic },
  { name: "knowledge", title: "Knowledge", icon: BookOpen },
  { name: "tasks", title: "Tasks", icon: ClipboardList },
  { name: "profile", title: "Profile", icon: UserRound },
];
