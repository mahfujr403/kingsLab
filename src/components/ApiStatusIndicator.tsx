import { useEffect, useState } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { config } from '../lib/config';

/**
 * Simple API status indicator - shows if backend is reachable
 * Only shows when there's a connection issue
 */
export function ApiStatusIndicator() {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkApiStatus = async () => {
    try {
      setIsChecking(true);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      // Try a simple HEAD request to the API
      const response = await fetch(config.apiBaseUrl.replace('/api', '/'), {
        method: 'HEAD',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      setIsOnline(true);
    } catch {
      setIsOnline(false);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    // Check on mount
    checkApiStatus();
    
    // Check every 30 seconds
    const interval = setInterval(checkApiStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Don't show anything while checking initially
  if (isOnline === null) return null;
  
  // Don't show anything if online
  if (isOnline) return null;

  // Show warning if offline
  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg px-4 py-2 shadow-lg flex items-center gap-3">
        <WifiOff className="h-5 w-5 text-red-600 dark:text-red-400 animate-pulse" />
        <div className="text-sm">
          <div className="font-semibold text-red-900 dark:text-red-200">
            Backend Disconnected
          </div>
          <div className="text-red-700 dark:text-red-400 text-xs">
            Cannot reach {config.apiBaseUrl}. Using demo data.
          </div>
        </div>
        <button
          onClick={checkApiStatus}
          disabled={isChecking}
          className="text-xs bg-red-100 dark:bg-red-900/40 hover:bg-red-200 dark:hover:bg-red-900/60 text-red-800 dark:text-red-200 px-3 py-1 rounded border border-red-300 dark:border-red-700 transition-colors disabled:opacity-50"
        >
          {isChecking ? 'Checking...' : 'Retry'}
        </button>
      </div>
    </div>
  );
}
