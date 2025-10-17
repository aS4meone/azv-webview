/**
 * Utility to cleanup localStorage on app initialization
 * Keeps only essential tokens and removes all other data
 */

const ESSENTIAL_KEYS = [
  'access_token',
  'refresh_token',
  'push_token',
  'fcm_token',
] as const;

/**
 * Clean up localStorage, keeping only essential authentication tokens
 * This runs on app initialization to remove stale data
 */
export function cleanupLocalStorage(): void {
  if (typeof window === 'undefined') return;

  try {
    console.log('🧹 Starting localStorage cleanup...');
    
    // Check if we have essential tokens
    const hasAccessToken = localStorage.getItem('access_token');
    const hasRefreshToken = localStorage.getItem('refresh_token');
    const hasPushToken = localStorage.getItem('push_token') || localStorage.getItem('fcm_token');
    
    console.log('🔍 Token status:', {
      hasAccessToken: !!hasAccessToken,
      hasRefreshToken: !!hasRefreshToken,
      hasPushToken: !!hasPushToken,
    });
    
    // If no essential tokens exist, clear everything
    if (!hasAccessToken && !hasRefreshToken && !hasPushToken) {
      console.log('❌ No essential tokens found, clearing all localStorage');
      localStorage.clear();
      console.log('✅ localStorage cleared completely');
      return;
    }
    
    // Otherwise, keep essential keys and remove everything else
    console.log('✅ Essential tokens found, cleaning up non-essential data');
    
    const keysToKeep = new Set(ESSENTIAL_KEYS);
    const keysToRemove: string[] = [];
    
    // Collect all keys that should be removed
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && !keysToKeep.has(key as any)) {
        keysToRemove.push(key);
      }
    }
    
    // Remove non-essential keys
    keysToRemove.forEach(key => {
      console.log(`🗑️ Removing: ${key}`);
      localStorage.removeItem(key);
    });
    
    console.log(`✅ Cleanup complete. Removed ${keysToRemove.length} items, kept ${ESSENTIAL_KEYS.length} essential tokens`);
  } catch (error) {
    console.error('❌ Error during localStorage cleanup:', error);
  }
}

/**
 * Initialize localStorage cleanup on app start
 * Should be called once when the app loads
 */
export function initLocalStorageCleanup(): void {
  if (typeof window === 'undefined') return;
  
  // Check if cleanup has already run in this session
  const sessionKey = '__localStorage_cleanup_done';
  if (sessionStorage.getItem(sessionKey)) {
    console.log('ℹ️ localStorage cleanup already done in this session');
    return;
  }
  
  cleanupLocalStorage();
  
  // Mark cleanup as done for this session
  sessionStorage.setItem(sessionKey, 'true');
}

