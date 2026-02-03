import { useState, useEffect } from 'react';
import { PinEntry } from './PinEntry';
import { GamingPosts } from './GamingPosts';
import { useGameStore } from '@/store/gameStore';

export const WorkerInterface = () => {
  const { activeSession, loadWorkers } = useGameStore();
  const [authenticated, setAuthenticated] = useState(!!activeSession);

  // Keep authenticated state in sync with activeSession
  useEffect(() => {
    setAuthenticated(!!activeSession);
  }, [activeSession]);

  if (!authenticated) {
    return (
      <PinEntry
        onSuccess={() => setAuthenticated(true)}
        onBeforePinCheck={() => loadWorkers()} // Refresh workers before check to handle new admins/workers
      />
    );
  }

  return <GamingPosts onLogout={() => setAuthenticated(false)} />;
};
