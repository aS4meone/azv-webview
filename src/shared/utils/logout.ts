// Centralized logout utility that handles both Flutter FCM token clearing and local token clearing

import { clearTokens } from "./tokenStorage";
import { callFlutterLogout } from "./flutterLogout";
import { sendLogoutToNative } from "./sendAccessTokenToNative";

export interface LogoutOptions {
  redirectTo?: string;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Performs a complete logout process:
 * 1. Clears FCM token from Firebase via Flutter
 * 2. Clears local tokens from localStorage
 */
export async function performLogout(
  options: LogoutOptions = {}
): Promise<void> {
  const { onComplete, onError } = options;

  try {
    console.log("Starting logout process...");

    // Step 1: Notify React Native WebView about logout (for push notifications)
    try {
      sendLogoutToNative();
      console.log("React Native notified about logout");
    } catch (error) {
      console.error("Error notifying React Native:", error);
      // Continue with logout even if notification fails
    }

    // Step 2: Clear FCM token via Flutter
    try {
      await callFlutterLogout();
      console.log("FCM token cleared successfully");
    } catch (error) {
      console.error("Error clearing FCM token:", error);
      // Continue with logout even if FCM clearing fails
    }

    // Step 3: Clear local tokens
    clearTokens();
    console.log("Local tokens cleared");

    console.log("Logout process completed successfully");
    onComplete?.();
  } catch (error) {
    console.error("Error during logout process:", error);
    const logoutError =
      error instanceof Error ? error : new Error("Logout failed");
    onError?.(logoutError);
    throw logoutError;
  }
}

/**
 * Quick logout without callbacks - useful for simple cases
 */
export async function quickLogout(): Promise<void> {
  return performLogout();
}
