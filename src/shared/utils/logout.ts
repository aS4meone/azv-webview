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
 * 3. Clears mechanic tracking data
 */
export async function performLogout(
  options: LogoutOptions = {}
): Promise<void> {
  const { onComplete, onError } = options;

  try {
    console.log("🚪 [LOGOUT] Starting logout process...");

    // Step 1: Notify React Native WebView about logout (for push notifications)
    try {
      console.log("📱 [LOGOUT] Notifying React Native about logout");
      sendLogoutToNative();
      console.log("✅ [LOGOUT] React Native notified about logout");
    } catch (error) {
      console.error("❌ [LOGOUT] Error notifying React Native:", error);
      // Continue with logout even if notification fails
    }

    // Step 2: Clear FCM token via Flutter
    try {
      console.log("🔥 [LOGOUT] Clearing FCM token via Flutter");
      await callFlutterLogout();
      console.log("✅ [LOGOUT] FCM token cleared successfully");
    } catch (error) {
      console.error("❌ [LOGOUT] Error clearing FCM token:", error);
      // Continue with logout even if FCM clearing fails
    }

    // Step 3: Clear local tokens
    console.log("🔑 [LOGOUT] Clearing local tokens");
    clearTokens();
    console.log("✅ [LOGOUT] Local tokens cleared");

    // Step 4: Clear mechanic tracking data
    try {
      if (typeof window !== "undefined") {
        console.log("🔧 [LOGOUT] Clearing mechanic tracking data");
        localStorage.removeItem("tracking_car_id");
        console.log("✅ [LOGOUT] Mechanic tracking data cleared");
      }
    } catch (error) {
      console.error("❌ [LOGOUT] Error clearing tracking data:", error);
      // Continue with logout even if tracking clear fails
    }

    console.log("✅ [LOGOUT] Logout process completed successfully");
    onComplete?.();
  } catch (error) {
    console.error("❌ [LOGOUT] Error during logout process:", error);
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
