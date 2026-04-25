import { requestRecordingPermissionsAsync } from "expo-audio";
import { Linking, PermissionsAndroid, Platform } from "react-native";

type PermissionResult = {
  granted: boolean;
  canAskAgain: boolean;
  message?: string;
};

type ExpoPermissionResponse = {
  granted?: boolean;
  status?: string;
  canAskAgain?: boolean;
};

function normalizeExpoResponse(response: ExpoPermissionResponse): PermissionResult {
  const granted = response.granted === true || response.status === "granted";
  const canAskAgain = response.canAskAgain ?? response.status !== "denied";

  return {
    granted,
    canAskAgain,
    message: granted
      ? undefined
      : canAskAgain
        ? "Microphone access is required to record meetings. You can try the request again."
        : "Microphone access is blocked. Open settings to enable it for Red Renote.",
  };
}

async function requestViaExpoModules(): Promise<PermissionResult | null> {
  try {
    return normalizeExpoResponse(await requestRecordingPermissionsAsync());
  } catch (error) {
    if (Platform.OS !== "android") {
      throw error;
    }

    return null;
  }
}

export async function requestMicrophonePermission(): Promise<PermissionResult> {
  const expoResult = await requestViaExpoModules();
  if (expoResult) {
    return expoResult;
  }

  if (Platform.OS === "android") {
    const alreadyGranted = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    );

    if (alreadyGranted) {
      return { granted: true, canAskAgain: true };
    }

    const response = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    );

    if (response === PermissionsAndroid.RESULTS.GRANTED) {
      return { granted: true, canAskAgain: true };
    }

    if (response === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
      return {
        granted: false,
        canAskAgain: false,
        message: "Microphone access is blocked. Open settings to enable it for Red Renote.",
      };
    }

    return {
      granted: false,
      canAskAgain: true,
      message: "Microphone access is required to record meetings. You can try the request again.",
    };
  }

  return {
    granted: false,
    canAskAgain: false,
    message:
      "No Expo audio permission module is installed in this build. Add expo-audio or expo-av to request microphone access on this platform.",
  };
}

export async function openAppSettings() {
  await Linking.openSettings();
}
