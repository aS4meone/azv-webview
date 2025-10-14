/**
 * Utility to send access token to React Native WebView
 * This is critical for push notifications to work
 */

declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
  }
}

/**
 * Checks if the app is running inside React Native WebView
 */
export function isReactNativeWebView(): boolean {
  return typeof window !== "undefined" && !!window.ReactNativeWebView;
}

/**
 * Sends access token to React Native WebView
 * React Native will use this token to authenticate FCM token save request
 * 
 * @param accessToken - The JWT access token from authentication
 */
export function sendAccessTokenToNative(accessToken: string): void {
  if (!isReactNativeWebView()) {
    console.log('[sendAccessTokenToNative] Not in React Native WebView, skipping');
    return;
  }

  try {
    const message = JSON.stringify({
      action: 'accessToken',
      data: accessToken
    });

    window.ReactNativeWebView!.postMessage(message);
    console.log('[sendAccessTokenToNative] ✅ Access token sent to React Native');
  } catch (error) {
    console.error('[sendAccessTokenToNative] ❌ Error sending access token:', error);
  }
}

/**
 * Sends logout notification to React Native
 * This will clear the FCM token from the device
 */
export function sendLogoutToNative(): void {
  if (!isReactNativeWebView()) {
    console.log('[sendLogoutToNative] Not in React Native WebView, skipping');
    return;
  }

  try {
    const message = JSON.stringify({
      action: 'logout',
      data: null
    });

    window.ReactNativeWebView!.postMessage(message);
    console.log('[sendLogoutToNative] ✅ Logout notification sent to React Native');
  } catch (error) {
    console.error('[sendLogoutToNative] ❌ Error sending logout:', error);
  }
}

