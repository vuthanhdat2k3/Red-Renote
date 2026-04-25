import "react-native-gesture-handler";
import "../global.css";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AuthProvider } from "@/components/auth/AuthProvider";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="splash" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
          <Stack.Screen name="microphone-permission" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="processing/[recordingId]" />
          <Stack.Screen name="meeting/[id]/summary" />
          <Stack.Screen name="meeting/[id]/playback" />
          <Stack.Screen name="meeting/[id]/transcript" />
          <Stack.Screen name="meeting/[id]/chat" />
          <Stack.Screen name="meeting/[id]/mindmap" />
          <Stack.Screen name="meeting/[id]/tasks" />
        </Stack>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
