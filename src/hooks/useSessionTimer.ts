import { useState, useEffect, useCallback } from 'react';

export const useSessionTimer = (startTime: Date | null, isActive: boolean) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startTime || !isActive) {
      setElapsed(0);
      return;
    }

    const start = new Date(startTime).getTime();
    
    const updateElapsed = () => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);

    return () => clearInterval(interval);
  }, [startTime, isActive]);

  const formatTime = useCallback((seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    elapsed,
    formatted: formatTime(elapsed),
  };
};
