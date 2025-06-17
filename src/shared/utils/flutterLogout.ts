// Helper for calling Flutter logout function to clear FCM token

declare global {
  interface Window {
    flutter_inappwebview?: {
      callHandler: (
        handlerName: string,
        ...args: unknown[]
      ) => Promise<unknown>;
    };
    flutterLogoutResult?: (result: {
      success: boolean;
      message?: string;
      error?: string;
    }) => void;
  }
}

export interface FlutterLogoutResult {
  success: boolean;
  message?: string;
  error?: string;
}

export function callFlutterLogout(): Promise<FlutterLogoutResult> {
  return new Promise((resolve, reject) => {
    // Check if we're in Flutter WebView
    if (typeof window === "undefined" || !window.flutter_inappwebview) {
      console.warn("Flutter WebView not available, skipping FCM token cleanup");
      resolve({ success: true, message: "Not in Flutter WebView" });
      return;
    }

    // Set up result callback
    window.flutterLogoutResult = (result: FlutterLogoutResult) => {
      console.log("Flutter logout result:", result);
      delete window.flutterLogoutResult;

      if (result.success) {
        resolve(result);
      } else {
        reject(new Error(result.error || "Unknown error"));
      }
    };

    // Call Flutter logout handler
    window.flutter_inappwebview
      .callHandler("logout")
      .then(() => {
        console.log("Flutter logout handler called successfully");

        // Set timeout in case Flutter doesn't respond
        setTimeout(() => {
          if (window.flutterLogoutResult) {
            delete window.flutterLogoutResult;
            resolve({ success: true, message: "Timeout - assuming success" });
          }
        }, 5000);
      })
      .catch((error) => {
        console.error("Error calling Flutter logout:", error);
        delete window.flutterLogoutResult;
        reject(error);
      });
  });
}
