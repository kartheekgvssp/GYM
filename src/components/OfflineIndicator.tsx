import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed top-2 left-4 right-4 z-50 max-w-sm mx-auto flex items-center justify-center gap-2 rounded-2xl bg-[#FF5500] px-3.5 py-2 text-xs font-bold text-black shadow-xl shadow-black/80 animate-in slide-in-from-top-2">
      <WifiOff className="w-4 h-4 stroke-[2.5]" />
      <span>Offline Gym Mode — Cached workouts available.</span>
    </div>
  );
};
