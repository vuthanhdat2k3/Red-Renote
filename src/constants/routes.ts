import type { LucideIcon } from "lucide-react-native";
import { BookOpen, ClipboardList, Home, Mic, UserRound } from "lucide-react-native";

export type TabRoute = {
  name: "home" | "record" | "knowledge" | "tasks" | "profile";
  title: string;
  icon: LucideIcon;
};

export const tabRoutes: TabRoute[] = [
  { name: "home", title: "Home", icon: Home },
  { name: "knowledge", title: "Knowledge", icon: BookOpen },
  { name: "record", title: "Record", icon: Mic },
  { name: "tasks", title: "Tasks", icon: ClipboardList },
  { name: "profile", title: "Profile", icon: UserRound },
];
