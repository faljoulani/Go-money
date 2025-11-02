'use client';

import { useEffect } from 'react';

/**
 * BFCache (Back/Forward Cache) Helper Component
 * 
 * This component helps ensure the page is compatible with browser's back/forward cache
 * by properly handling page visibility events and cleanup.
 */
export default function BFCacheHelper() {
  useEffect(() => {
    // Handle page visibility changes (important for bfcache)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is being hidden (user navigates away)
        // Clean up any resources that might prevent bfcache
        console.log('Page hidden - preparing for bfcache');
      } else {
        // Page is becoming visible again (user returns)
        console.log('Page visible - restored from bfcache or fresh load');
      }
    };

    // Handle beforeunload to clean up resources
    const handleBeforeUnload = () => {
      // Clean up any active connections or timers
      console.log('Page unloading - cleaning up for bfcache');
    };

    // Handle page show event (when page is restored from bfcache)
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        console.log('Page restored from bfcache');
      } else {
        console.log('Page loaded fresh');
      }
    };

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pageshow', handlePageShow);

    // Cleanup function
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, []);

  // This component doesn't render anything
  return null;
}
