import React, { useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

const PwaUpdater: React.FC = () => {
  // Periodically check for updates in the background (e.g. Vercel deployments)
  useRegisterSW({
    onRegistered(r) {
      if (r) {
        // Check for updates every 15 minutes
        setInterval(() => {
          r.update();
        }, 15 * 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.error('SW registration error', error);
    }
  });

  useEffect(() => {
    let refreshing = false;

    const handleControllerChange = () => {
      if (refreshing) return;

      // Safe reload mechanism to prevent interrupting user flow
      if (document.visibilityState === 'visible') {
        // Wait until the user switches tabs or backgrounds the app before reloading
        const onVisibilityChange = () => {
          if (document.visibilityState === 'hidden') {
            refreshing = true;
            window.location.reload();
          }
        };
        document.addEventListener('visibilitychange', onVisibilityChange);
      } else {
        refreshing = true;
        window.location.reload();
      }
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
    }

    return () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
      }
    };
  }, []);

  return null;
};

export default PwaUpdater;
