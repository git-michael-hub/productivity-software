import { useEffect } from 'react';

export function useDevTools() {
  useEffect(() => {
    // Only run in development and client-side
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      // Disable React DevTools debugger
      const disableDevTools = () => {
        // @ts-ignore
        if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
          // @ts-ignore
          const devTools = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
          
          // Replace the inject function
          devTools.inject = function () {};
          
          // Disable known debugging triggers
          devTools.on = function () {};
          devTools.emit = function () {};
          
          // Clear any existing hooks
          devTools.cleanup = function () {};
          devTools.checkDCE = function () {};
          
          // Set supported to false to prevent initialization
          devTools.supported = false;
        }
      };

      disableDevTools();
    }
  }, []);
} 