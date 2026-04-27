import type { LucideIcon } from "lucide-react-native";
import { BookOpen, ClipboardList, Home, Mic, UserRound } from "lucide-react-native";

export type TabRoute = {
  name: "home" | "record" | "knowledge" | "tasks" | "profile";
  titleKey: string;
  icon: LucideIcon;
};

export const tabRoutes: TabRoute[] = [
  { name: "home", titleKey: "home.title", icon: Home },
  { name: "knowledge", titleKey: "knowledge.title", icon: BookOpen },
  { name: "record", titleKey: "record.title", icon: Mic },
  { name: "tasks", titleKey: "tasks.title", icon: ClipboardList },
  { name: "profile", titleKey: "profile.title", icon: UserRound },
];
