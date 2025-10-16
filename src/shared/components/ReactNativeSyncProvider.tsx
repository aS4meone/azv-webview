'use client';

/**
 * Client-side provider to sync authentication state with React Native WebView
 * This component ensures push notifications work by sending access token to native app
 */

import { useReactNativeSync } from '@/shared/hooks/useReactNativeSync';

export function ReactNativeSyncProvider({ children }: { children: React.ReactNode }) {
  // Initialize React Native sync
  useReactNativeSync();
  
  return <>{children}</>;
}


