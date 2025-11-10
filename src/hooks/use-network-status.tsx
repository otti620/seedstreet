"use client";

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

// Extend the Navigator interface to include the 'connection' property
declare global {
  interface Navigator {
    connection?: NetworkInformation;
  }
  interface NetworkInformation extends EventTarget {
    readonly downlink?: number;
    readonly effectiveType?: '2g' | '3g' | '4g' | '5g';
    // Add other properties if needed
  }
}

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [isSlowNetwork, setIsSlowNetwork] = useState(false);
  const slowNetworkToastId = 'slow-network-toast';

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setIsSlowNetwork(false);
      toast.dismiss(slowNetworkToastId);
      toast.success("You're back online!", { id: 'online-toast', duration: 3000 });
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsSlowNetwork(true); // Assume offline means slow/no network
      toast.error("You are currently offline. Please check your internet connection.", {
        id: slowNetworkToastId,
        duration: Infinity, // Keep toast visible until online
        action: {
          label: "Dismiss",
          onClick: () => toast.dismiss(slowNetworkToastId),
        },
      });
    };

    // Initial check
    setIsOnline(navigator.onLine);
    if (!navigator.onLine) {
      handleOffline();
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Optional: Basic check for slow network (can be unreliable)
    const checkConnection = () => {
      // Use type assertion for navigator.connection
      const connection = navigator.connection as NetworkInformation | undefined;
      if (connection) {
        const { effectiveType, downlink } = connection;
        // Consider '2g', '3g' or very low downlink as slow
        if (effectiveType && ['2g', '3g'].includes(effectiveType) || (downlink !== undefined && downlink < 1)) {
          if (!isSlowNetwork && isOnline) { // Only show if online but slow, and not already showing
            setIsSlowNetwork(true);
            toast.info("Your network connection appears to be slow. This might affect performance.", {
              id: slowNetworkToastId,
              duration: 5000, // Show for 5 seconds
            });
          }
        } else {
          if (isSlowNetwork) {
            setIsSlowNetwork(false);
            toast.dismiss(slowNetworkToastId);
          }
        }
      }
    };

    // Check connection type on load and when it changes
    checkConnection();
    // Use type assertion for navigator.connection
    (navigator.connection as NetworkInformation | undefined)?.addEventListener('change', checkConnection);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      // Use type assertion for navigator.connection
      (navigator.connection as NetworkInformation | undefined)?.removeEventListener('change', checkConnection);
      toast.dismiss(slowNetworkToastId); // Dismiss on unmount
      toast.dismiss('online-toast');
    };
  }, [isOnline, isSlowNetwork]); // Dependencies to re-run effect when online/slow status changes

  return { isOnline, isSlowNetwork };
};