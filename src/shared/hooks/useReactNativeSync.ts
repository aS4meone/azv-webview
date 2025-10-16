/**
 * React hook to sync authentication state with React Native WebView
 * This ensures push notifications work by sending access token to native app
 */

import { useEffect } from 'react';
import { getAccessToken } from '@/shared/utils/tokenStorage';
import { sendAccessTokenToNative, isReactNativeWebView } from '@/shared/utils/sendAccessTokenToNative';

/**
 * Syncs access token with React Native WebView on mount and when token changes
 * This is critical for push notifications to work properly
 */
export function useReactNativeSync() {
  useEffect(() => {
    // Only run in React Native WebView
    if (!isReactNativeWebView()) {
      return;
    }

    // Send access token if user is already authenticated
    const accessToken = getAccessToken();
    if (accessToken) {
      console.log('[useReactNativeSync] Sending existing access token to React Native');
      sendAccessTokenToNative(accessToken);
    }
  }, []); // Run only once on mount
}


